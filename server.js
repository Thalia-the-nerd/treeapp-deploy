const express = require("express");
require("dotenv").config();
const { MongoClient, ObjectId } = require("mongodb");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const mailgunTransport = require("nodemailer-mailgun-transport");
const crypto = require("crypto");
const QRCode = require("qrcode");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const jwt = require("jsonwebtoken");

const app = express();
const port = process.env.PORT || 3003;

const DOCS_PASSWORD = "treeapp";

// Middleware for password protecting APIINFO.md
app.get('/APIINFO.md', (req, res, next) => {
  const password = req.query.password;

  if (password === DOCS_PASSWORD) {
    // Correct password, serve the file
    return next();
  }

  // Incorrect or no password, send a prompt
  res.status(401).send(`
    <script>
      const pass = prompt("Enter the password to view this page:");
      if (pass) {
        window.location.href = window.location.pathname + '?password=' + encodeURIComponent(pass);
      }
    </script>
  `);
});

// Connection URL
const url = process.env.MONGODB_URI || "mongodb://localhost:27017/?tls=false";
const client = new MongoClient(url);

// Database and collection names
const dbName = "treeApp";
const statsCollectionName = "stats";
const usersCollectionName = "users";
const activityCollectionName = "activity";
const sponsorsCollectionName = "sponsors";

// Global variable to store the database connection
let db;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/';
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });


// Connect to MongoDB once when the server starts
async function connectToDb() {
  try {
    await client.connect();
    db = client.db(dbName);
    console.log("Connected successfully to MongoDB");
  } catch (err) {
    console.error("Failed to connect to MongoDB", err);
    process.exit(1);
  }
}

// Nodemailer transporter setup (replace with your actual email service credentials)
const auth = {
  auth: {
    api_key: process.env.MAILGUN_API_KEY || "dummy-key",
    domain: process.env.MAILGUN_DOMAIN || "dummy-domain",
  },
};

const transporter = nodemailer.createTransport(mailgunTransport(auth));

async function logUserActivity(userId, action) {
  try {
    const activityCollection = db.collection(activityCollectionName);
    await activityCollection.insertOne({
      userId,
      action,
      timestamp: new Date(),
    });
  } catch (err) {
    console.error("Error logging user activity:", err);
  }
}

// API endpoint to get stats
app.get("/api/stats", async (req, res) => {
  try {
    const collection = db.collection(statsCollectionName);
    const stats = await collection.findOne({});
    res.json(stats);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error querying the database");
  }
});

// API endpoint for user signup
app.post("/api/signup", async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      username,
      email,
      password,
      isBusiness,
      businessName,
    } = req.body;
    const usersCollection = db.collection(usersCollectionName);

    // Check if user already exists
    const existingUser = await usersCollection.findOne({
      $or: [{ username }, { email }],
    });
    if (existingUser) {
      return res.status(400).send("Username or email already exists.");
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create verification token
    const verificationToken = crypto.randomBytes(20).toString("hex");

    // Create new user
    const newUser = {
      firstName,
      lastName,
      username,
      email,
      password: hashedPassword,
      isVerified: false,
      verificationToken,
      moneyDonated: 0,
      timeDonated: 0,
      isAdmin: false,
      isBusiness: isBusiness || false,
      businessName: isBusiness ? businessName : null,
      isSuspended: false,
      isFlagged: false,
      badges: [],
      notes: [],
      ipHistory: [],
    };

    await usersCollection.insertOne(newUser);

    // Send verification email
    const verificationLink = `http://${req.headers.host}/verify.html?token=${verificationToken}`;
    const mailOptions = {
      from: '"TreePlace.App" <no-reply@treeplace.app>',
      to: email,
      subject: "Verify Your Email for TreePlace.App",
      html: `<p>Please click the following link to verify your email address:</p><p><a href="${verificationLink}">${verificationLink}</a></p>`,
    };

    // In a real app, you would uncomment this to send the email
    // await transporter.sendMail(mailOptions);

    res
      .status(201)
      .send("User created. Please check your email to verify your account.");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error creating user.");
  }
});

// API endpoint for email verification
app.get("/api/verify", async (req, res) => {
  try {
    const { token } = req.query;
    const usersCollection = db.collection(usersCollectionName);

    const user = await usersCollection.findOne({ verificationToken: token });

    if (!user) {
      return res.status(400).send("Invalid verification token.");
    }

    await usersCollection.updateOne(
      { _id: user._id },
      { $set: { isVerified: true, verificationToken: null } },
    );

    res.send("Email verified successfully. You can now log in.");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error verifying email.");
  }
});

// API endpoint for user login
app.post("/api/login", async (req, res) => {
  try {
    const { username, password, isBusiness } = req.body;
    const usersCollection = db.collection(usersCollectionName);

    const user = await usersCollection.findOne({
      $or: [{ username: username }, { email: username }],
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid username or password." });
    }

    if (!user.isVerified) {
      return res
        .status(400)
        .json({ success: false, message: "Please verify your email before logging in." });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid username or password." });
    }

    if (isBusiness && !user.isBusiness) {
      return res.status(403).json({ success: false, message: "You are not a business user." });
    }

    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    await usersCollection.updateOne({ _id: user._id }, { $push: { ipHistory: { ip, timestamp: new Date() } } });
    await logUserActivity(user._id, "login");

    // In a real app, you would create a session or JWT here
    const token = jwt.sign(
      { userId: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET || "your_default_secret",
      { expiresIn: "1h" }
    );

    res.json({
      success: true,
      message: "Login successful.",
      token: token,
      username: user.username,
      isAdmin: user.isAdmin,
      isBusiness: user.isBusiness,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error logging in." });
  }
});

app.post("/api/logout", async (req, res) => {
  try {
    const { username } = req.body;
    const usersCollection = db.collection(usersCollectionName);
    const user = await usersCollection.findOne({ username });

    if (user) {
      await logUserActivity(user._id, "logout");
    }

    res.json({ success: true, message: "Logout successful." });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error logging out.");
  }
});

// API endpoint for user-specific dashboard data
app.get("/api/user/dashboard", async (req, res) => {
  const { username } = req.query;
  if (!username) {
    return res.status(400).send("Username is required.");
  }

  try {
    const usersCollection = db.collection(usersCollectionName);
    const user = await usersCollection.findOne({ username });

    if (!user) {
      return res.status(404).send("User not found.");
    }

    const eventsCollection = db.collection("events");
    const upcomingEvents = await eventsCollection
      .find({ date: { $gt: new Date().toISOString() } })
      .sort({ date: 1 })
      .limit(1)
      .toArray();
    const nextEvent = upcomingEvents.length > 0 ? upcomingEvents[0] : null;

    // Static location data as a fallback
    const staticLocations = [
      {
        id: 1,
        name: "Miami Beach Park",
        address: "4601 Collins Ave, Miami Beach, FL 33140",
        description:
          "A beautiful coastal park with sandy soil perfect for native trees.",
        image:
          "https://images.unsplash.com/photo-1511497584788-876760111969?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      },
      {
        id: 2,
        name: "Overtown Community Garden",
        address: "950 NW 3rd Ave, Miami, FL 33136",
        description: "A community-driven garden in the heart of Overtown.",
        image:
          "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      },
      {
        id: 3,
        name: "Little Havana Tree Corridor",
        address: "SW 8th St, Miami, FL 33135",
        description:
          "A vibrant urban corridor in Little Havana that's being transformed into a green oasis.",
        image:
          "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      },
    ];

    let eventDetails = null;
    if (nextEvent) {
      const locationDetails = staticLocations.find(
        (l) => l.name === nextEvent.location,
      );
      eventDetails = {
        ...nextEvent,
        ...locationDetails,
      };
    }

    res.json({
      moneyDonated: user.moneyDonated || 0,
      timeDonated: user.timeDonated || 0,
      nextEvent: eventDetails,
      businessName: user.businessName,
      badges: user.badges || [],
    });
  } catch (err) {
    console.error("Error fetching user dashboard data:", err);
    res.status(500).send("Error fetching user data.");
  }
});

// --- Rewards and Notifications ---
const rewards = [
  { name: "T-Shirt", type: "money", threshold: 150 },
  { name: "T-Shirt", type: "time", threshold: 50 },
  { name: "Mug", type: "money", threshold: 300 },
  { name: "Mug", type: "time", threshold: 100 },
  { name: "Tote Bag", type: "money", threshold: 500 },
  { name: "Tote Bag", type: "time", threshold: 200 },
  { name: "Engraved Plaque", type: "money", threshold: 1000 },
  { name: "Engraved Plaque", type: "time", threshold: 500 },
];

async function checkAndCreateRewardNotifications(userId, oldStats, newStats) {
  const notificationsCollection = db.collection("notifications");
  const user = await db
    .collection(usersCollectionName)
    .findOne({ _id: userId });

  if (!user) return;

  const earnedRewards = user.earnedRewards || [];

  for (const reward of rewards) {
    const key = reward.type === "money" ? "moneyDonated" : "timeDonated";
    const oldVal = oldStats[key] || 0;
    const newVal = newStats[key] || 0;

    // Check if milestone was crossed and this specific reward hasn't been earned
    if (oldVal < reward.threshold && newVal >= reward.threshold) {
      const rewardId = `${reward.name}-${reward.type}`;
      if (!earnedRewards.includes(rewardId)) {
        const notification = {
          userId,
          username: user.username,
          message: `${user.username} has earned a ${reward.name} for donating ${reward.threshold} ${reward.type === "money" ? "dollars" : "hours"}!`,
          reward: reward,
          timestamp: new Date(),
          read: false,
        };
        await notificationsCollection.insertOne(notification);
        await db
          .collection(usersCollectionName)
          .updateOne({ _id: userId }, { $push: { earnedRewards: rewardId } });
      }
    }
  }
}

// API endpoint to get notifications
app.get("/api/notifications", async (req, res) => {
  try {
    const notifications = await db
      .collection("notifications")
      .find({})
      .sort({ timestamp: -1 })
      .toArray();
    res.json(notifications);
  } catch (err) {
    console.error("Error fetching notifications:", err);
    res.status(500).send("Error fetching notifications.");
  }
});

// Middleware to check for admin users
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).send("Unauthorized: No token provided.");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_default_secret");
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).send("Unauthorized: Invalid token.");
  }
};

const isAdmin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403).send("Forbidden: Requires admin privileges.");
  }
};

// Admin panel route
app.get("/admin", verifyToken, isAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Business dashboard route
app.get("/business-dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'business-dashboard.html'));
});

// API endpoint to get all users
app.get("/api/users", async (req, res) => {
  try {
    const { search } = req.query;
    const usersCollection = db.collection(usersCollectionName);
    let query = {};
    if (search) {
      query = {
        $or: [
          { username: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ],
      };
    }
    const users = await usersCollection.find(query).toArray();
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error querying the database");
  }
});

// API endpoint to get a single user by ID
app.get("/api/users/:id", verifyToken, isAdmin, async (req, res) => {
  console.log(`GET /api/users/${req.params.id}`);
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      console.log('Invalid ObjectId format');
      return res.status(400).send("Invalid user ID format");
    }
    const usersCollection = db.collection(usersCollectionName);
    const user = await usersCollection.findOne({ _id: new ObjectId(id) });
    if (!user) {
      console.log('User not found');
      return res.status(404).send("User not found");
    }
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error querying the database");
  }
});

// API endpoint to get user activity
app.get("/api/users/:id/activity", verifyToken, isAdmin, async (req, res) => {
  console.log(`GET /api/users/${req.params.id}/activity`);
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      console.log('Invalid ObjectId format for activity');
      return res.status(400).send("Invalid user ID format");
    }
    const activityCollection = db.collection(activityCollectionName);
    const activity = await activityCollection.find({ userId: new ObjectId(id) }).sort({ timestamp: -1 }).toArray();
    res.json(activity);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error querying the database");
  }
});

// API endpoint to update a user
app.put("/api/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { timeDonated, moneyDonated, isAdmin } = req.body;
    const usersCollection = db.collection(usersCollectionName);

    const userId = new ObjectId(id);

    const oldUser = await usersCollection.findOne({ _id: userId });

    const updateData = {
      $set: {
        isAdmin: isAdmin,
      },
    };

    const newStats = {};
    if (timeDonated !== undefined) {
      updateData.$set.timeDonated = parseInt(timeDonated, 10);
      newStats.timeDonated = updateData.$set.timeDonated;
    }
    if (moneyDonated !== undefined) {
      const moneyDonatedFloat = parseFloat(moneyDonated);
      const moneyDifference = moneyDonatedFloat - (oldUser.moneyDonated || 0);
      if (moneyDifference > 0) {
        await logUserActivity(userId, `donated ${moneyDifference.toFixed(2)}`);
      }
      updateData.$set.moneyDonated = moneyDonatedFloat;
      newStats.moneyDonated = updateData.$set.moneyDonated;
    }

    await usersCollection.updateOne({ _id: userId }, updateData);

    await checkAndCreateRewardNotifications(userId, oldUser, newStats);

    res.status(200).send("User updated successfully");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating user");
  }
});

// API endpoint to suspend a user
app.post("/api/users/:id/suspend", verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const usersCollection = db.collection(usersCollectionName);

    await usersCollection.updateOne({ _id: new ObjectId(id) }, { $set: { isSuspended: true } });
    await logUserActivity(new ObjectId(id), "Account suspended by admin");
    res.status(200).send("User suspended successfully");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error suspending user");
  }
});

// API endpoint to unsuspend a user
app.post("/api/users/:id/unsuspend", verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const usersCollection = db.collection(usersCollectionName);

    await usersCollection.updateOne({ _id: new ObjectId(id) }, { $set: { isSuspended: false } });
    await logUserActivity(new ObjectId(id), "Account unsuspended by admin");
    res.status(200).send("User unsuspended successfully");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error unsuspending user");
  }
});

// API endpoint to flag a user
app.post("/api/users/:id/flag", verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const usersCollection = db.collection(usersCollectionName);

    await usersCollection.updateOne({ _id: new ObjectId(id) }, { $set: { isFlagged: true } });
    await logUserActivity(new ObjectId(id), "Account flagged by admin");
    res.status(200).send("User flagged successfully");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error flagging user");
  }
});

// API endpoint to unflag a user
app.post("/api/users/:id/unflag", verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const usersCollection = db.collection(usersCollectionName);

    await usersCollection.updateOne({ _id: new ObjectId(id) }, { $set: { isFlagged: false } });
    await logUserActivity(new ObjectId(id), "Account unflagged by admin");
    res.status(200).send("User unflagged successfully");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error unflagging user");
  }
});

// API endpoint to manually verify a user's email
app.post("/api/users/:id/manual-verify", verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const usersCollection = db.collection(usersCollectionName);

    await usersCollection.updateOne({ _id: new ObjectId(id) }, { $set: { isVerified: true, verificationToken: null } });
    await logUserActivity(new ObjectId(id), "Email manually verified by admin");
    res.status(200).send("User email verified successfully");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error verifying user email");
  }
});

// API endpoint to send a warning to a user
app.post("/api/users/:id/send-warning", verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    const usersCollection = db.collection(usersCollectionName);

    const user = await usersCollection.findOne({ _id: new ObjectId(id) });

    if (!user) {
      return res.status(404).send("User not found");
    }

    const mailOptions = {
      from: '"TreePlace.App Admin" <no-reply@treeplace.app>',
      to: user.email,
      subject: "A Warning Regarding Your Account",
      html: `<p>You have received a warning from an administrator:</p><p>${message}</p>`,
    };

    // await transporter.sendMail(mailOptions);
    await logUserActivity(user._id, `Admin sent a warning: "${message}"`);

    res.send("Warning sent to user.");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error sending warning.");
  }
});

// API endpoint to assign a badge to a user
app.post("/api/users/:id/assign-badge", verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { badge } = req.body;
    const usersCollection = db.collection(usersCollectionName);

    await usersCollection.updateOne({ _id: new ObjectId(id) }, { $addToSet: { badges: badge } });
    await logUserActivity(new ObjectId(id), `Admin assigned badge: "${badge}"`);
    res.status(200).send("Badge assigned successfully");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error assigning badge");
  }
});

// API endpoint to add a note to a user
app.post("/api/users/:id/add-note", verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { note } = req.body;
    const usersCollection = db.collection(usersCollectionName);

    const noteObject = {
      note,
      date: new Date(),
      // In a real app, you'd get the admin's username from the session
      admin: "admin",
    };
    await usersCollection.updateOne({ _id: new ObjectId(id) }, { $push: { notes: noteObject } });
    await logUserActivity(new ObjectId(id), `Admin added note: "${note}"`);
    res.status(200).send("Note added successfully");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error adding note");
  }
});

// API endpoint to change a user's username
app.put("/api/users/:id/change-username", verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { username } = req.body;
    const usersCollection = db.collection(usersCollectionName);

    // Check if new username is already taken
    const existingUser = await usersCollection.findOne({ username });
    if (existingUser) {
      return res.status(400).send("Username already exists.");
    }


    await usersCollection.updateOne({ _id: new ObjectId(id) }, { $set: { username: username } });
    await logUserActivity(new ObjectId(id), `Username changed to: "${username}"`);
    res.status(200).send("Username changed successfully");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error changing username");
  }
});

// API endpoint to change a user's email
app.put("/api/users/:id/change-email", verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.body;
    const usersCollection = db.collection(usersCollectionName);

    // Check if new email is already taken
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return res.status(400).send("Email already exists.");
    }


    await usersCollection.updateOne({ _id: new ObjectId(id) }, { $set: { email: email } });
    await logUserActivity(new ObjectId(id), `Email changed to: "${email}"`);
    res.status(200).send("Email changed successfully");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error changing email");
  }
});

// API endpoint to anonymize a user
app.post("/api/users/:id/anonymize", verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const usersCollection = db.collection(usersCollectionName);

    const anonymizedData = {
      username: `anonymized_${id}`,
      email: `anonymized_${id}@example.com`,
      firstName: "Anonymous",
      lastName: "User",
      password: crypto.randomBytes(20).toString("hex"),
      isVerified: false,
      verificationToken: null,
      resetToken: null,
      resetTokenExpiry: null,
      ipHistory: [],
    };
    await usersCollection.updateOne({ _id: new ObjectId(id) }, { $set: anonymizedData });
    await logUserActivity(new ObjectId(id), "Account anonymized by admin");
    res.status(200).send("User anonymized successfully");
  } catch (err) {
      console.error(err);
    res.status(500).send("Error anonymizing user");
  }
});

// API endpoint to delete a user
app.get("/api/users/:id/export", verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const usersCollection = db.collection(usersCollectionName);

    const user = await usersCollection.findOne({ _id: new ObjectId(id) });
    if (!user) {
      return res.status(404).send("User not found");
    }
    const activityCollection = db.collection(activityCollectionName);
    const activity = await activityCollection.find({ userId: new ObjectId(id) }).toArray();
    const dataToExport = {
      user,
      activity,
    };
    res.json(dataToExport);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error exporting user data");
  }
});

// API endpoint to delete a user
app.delete("/api/users/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const usersCollection = db.collection(usersCollectionName);

    await usersCollection.deleteOne({ _id: new ObjectId(id) });
    // Also delete their activity
    const activityCollection = db.collection(activityCollectionName);
    await activityCollection.deleteMany({ userId: new ObjectId(id) });
    res.status(200).send("User deleted successfully");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting user");
  }
});

// API endpoint to get all events
app.get("/api/events", async (req, res) => {
  try {
    const eventsCollection = db.collection("events");
    const events = await eventsCollection.find({}).toArray();
    res.json(events);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error querying the database");
  }
});

// API endpoint to create an event
app.post("/api/events", verifyToken, isAdmin, async (req, res) => {
  try {
    const { name, date, location } = req.body;
    const eventsCollection = db.collection("events");
    const token = crypto.randomBytes(20).toString("hex");
    await eventsCollection.insertOne({
      name,
      date,
      location,
      token,
      attendance: [],
    });
    res.status(201).send("Event created successfully");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error creating event");
  }
});

// API endpoint to delete an event
app.delete("/api/events/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const eventsCollection = db.collection("events");

    await eventsCollection.deleteOne({ _id: new ObjectId(id) });
    res.status(200).send("Event deleted successfully");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting event");
  }
});

// API endpoint to get all sponsors
app.get("/api/sponsors", verifyToken, isAdmin, async (req, res) => {
  try {
    const sponsorsCollection = db.collection(sponsorsCollectionName);
    const sponsors = await sponsorsCollection.find({}).toArray();
    res.json(sponsors);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error querying the database for sponsors");
  }
});

// API endpoint to add a new sponsor
app.post("/api/sponsors", verifyToken, isAdmin, async (req, res) => {
  try {
    const { name, level, logo } = req.body;
    const sponsorsCollection = db.collection(sponsorsCollectionName);
    await sponsorsCollection.insertOne({ name, level, logo, createdAt: new Date() });
    res.status(201).send("Sponsor added successfully");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error adding sponsor");
  }
});

// API endpoint to delete a sponsor
app.delete("/api/sponsors/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const sponsorsCollection = db.collection(sponsorsCollectionName);

    await sponsorsCollection.deleteOne({ _id: new ObjectId(id) });
    res.status(200).send("Sponsor deleted successfully");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting sponsor");
  }
});

// API endpoint to generate QR code for an event
app.get("/api/events/:id/qr-code", async (req, res) => {
  try {
    const { id } = req.params;
    const eventsCollection = db.collection("events");

    const event = await eventsCollection.findOne({ _id: new ObjectId(id) });

    if (!event) {
      return res.status(404).send("Event not found");
    }

    const checkInUrl = `http://${req.headers.host}/check-in.html?eventId=${event._id}`;
    const checkOutUrl = `http://${req.headers.host}/check-out.html?eventId=${event._id}`;

    const qrCodeData = {
      checkInUrl,
      checkOutUrl,
    };

    const qrCode = await QRCode.toDataURL(JSON.stringify(qrCodeData));
    res.json({ qrCodeUrl: qrCode });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error generating QR code");
  }
});

// API endpoint for user check-in
app.post("/api/check-in", async (req, res) => {
  try {
    const { eventId, username } = req.body;
    const eventsCollection = db.collection("events");
    const usersCollection = db.collection(usersCollectionName);


    const user = await usersCollection.findOne({ username });
    if (!user) {
      return res.status(404).send("User not found");
    }

    const event = await eventsCollection.findOne({
      _id: new ObjectId(eventId),
    });
    if (!event) {
      return res.status(404).send("Event not found.");
    }

    const existingAttendance = event.attendance.find((a) =>
      a.userId.equals(user._id),
    );
    if (existingAttendance && existingAttendance.checkIn) {
      return res.status(400).send("User already checked in");
    }

    if (existingAttendance) {
      await eventsCollection.updateOne(
        { _id: new ObjectId(eventId), "attendance.userId": user._id },
        { $set: { "attendance.$.checkIn": new Date() } },
      );
    } else {
      await eventsCollection.updateOne(
        { _id: new ObjectId(eventId) },
        {
          $push: {
            attendance: {
              userId: user._id,
              username: user.username,
              checkIn: new Date(),
            },
          },
        },
      );
    }

    await logUserActivity(user._id, `checked into event: ${event.name}`);

    res.status(200).send("Check-in successful");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error checking in");
  }
});

// API endpoint for user check-out
app.post("/api/check-out", async (req, res) => {
  try {
    const { eventId, username } = req.body;
    const eventsCollection = db.collection("events");
    const usersCollection = db.collection(usersCollectionName);


    const user = await usersCollection.findOne({ username });
    if (!user) {
      return res.status(404).send("User not found");
    }

    const event = await eventsCollection.findOne({
      _id: new ObjectId(eventId),
    });
    if (!event) {
      return res.status(404).send("Event not found");
    }

    const attendance = event.attendance.find((a) => a.userId.equals(user._id));
    if (!attendance || !attendance.checkIn) {
      return res.status(400).send("User has not checked in");
    }

    if (attendance.checkOut) {
      return res.status(400).send("User already checked out");
    }

    const checkOut = new Date();
    const hoursDonated = (checkOut - attendance.checkIn) / 1000 / 60 / 60;

    await eventsCollection.updateOne(
      { _id: new ObjectId(eventId), "attendance.userId": user._id },
      {
        $set: {
          "attendance.$.checkOut": checkOut,
          "attendance.$.hoursDonated": hoursDonated,
        },
      },
    );

    const oldUser = await usersCollection.findOne({ _id: user._id });
    await usersCollection.updateOne(
      { _id: user._id },
      { $inc: { timeDonated: hoursDonated } },
    );
    const newUser = await usersCollection.findOne({ _id: user._id });

    await checkAndCreateRewardNotifications(user._id, oldUser, newUser);

    await logUserActivity(user._id, `checked out of event: ${event.name}`);

    res.status(200).send("Check-out successful");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error checking out");
  }
});

// API endpoint for forgot password
app.post("/api/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const usersCollection = db.collection(usersCollectionName);

    const user = await usersCollection.findOne({ email });

    if (!user) {
      // Don't reveal that the user doesn't exist
      return res.send(
        "If a user with that email exists, a password reset link has been sent.",
      );
    }

    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour

    await usersCollection.updateOne(
      { _id: user._id },
      { $set: { resetToken, resetTokenExpiry } },
    );

    const resetLink = `http://${req.headers.host}/reset-password.html?token=${resetToken}`;
    const mailOptions = {
      from: '"TreePlace.App" <no-reply@treeplace.app>',
      to: email,
      subject: "Password Reset for TreePlace.App",
      html: `<p>You are receiving this because you (or someone else) have requested the reset of the password for your account.</p>
                   <p>Please click on the following link, or paste this into your browser to complete the process:</p>
                   <p><a href="${resetLink}">${resetLink}</a></p>
                   <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>`,
    };

    // await transporter.sendMail(mailOptions);

    res.send(
      "If a user with that email exists, a password reset link has been sent.",
    );
  } catch (err) {
    console.error(err);
    res.status(500).send("Error processing forgot password request.");
  }
});

// API endpoint for resetting password
app.post("/api/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body;
    const usersCollection = db.collection(usersCollectionName);

    const user = await usersCollection.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .send("Password reset token is invalid or has expired.");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await usersCollection.updateOne(
      { _id: user._id },
      {
        $set: {
          password: hashedPassword,
          resetToken: null,
          resetTokenExpiry: null,
        },
      },
    );

    res.send("Password has been reset successfully.");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error resetting password.");
  }
});

// API endpoint to trigger a password reset for a user by an admin
app.post("/api/users/:id/reset-password", verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const usersCollection = db.collection(usersCollectionName);

    const user = await usersCollection.findOne({ _id: new ObjectId(id) });

    if (!user) {
      return res.status(404).send("User not found");
    }

    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour

    await usersCollection.updateOne(
      { _id: user._id },
      { $set: { resetToken, resetTokenExpiry } },
    );

    const resetLink = `http://${req.headers.host}/reset-password.html?token=${resetToken}`;
    const mailOptions = {
      from: '"TreePlace.App" <no-reply@treeplace.app>',
      to: user.email,
      subject: "Password Reset for TreePlace.App",
      html: `<p>An administrator has triggered a password reset for your account.</p>
             <p>Please click on the following link, or paste this into your browser to complete the process:</p>
             <p><a href="${resetLink}">${resetLink}</a></p>
             <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>`,
    };

    // await transporter.sendMail(mailOptions);
    await logUserActivity(user._id, "Admin triggered password reset");

    res.send("Password reset link sent to user.");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error sending password reset link.");
  }
});



app.get('/favicon.ico', (req, res) => res.status(204));

// Start the server after connecting to the database
connectToDb().then(() => {
  app.listen(port, "0.0.0.0", () => {
    console.log(`Server listening at http://0.0.0.0:${port}`);
  });
});

// Graceful shutdown
process.on("SIGINT", async () => {
  await client.close();
  console.log("MongoDB connection closed");
  process.exit(0);
});