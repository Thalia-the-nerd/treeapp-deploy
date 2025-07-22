
const express = require('express');
require('dotenv').config();
const { MongoClient } = require('mongodb');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const mailgunTransport = require('nodemailer-mailgun-transport');
const crypto = require('crypto');
const QRCode = require('qrcode');

const app = express();
const port = process.env.PORT || 3000;

// Connection URL
const url = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const client = new MongoClient(url);

// Database and collection names
const dbName = 'treeApp';
const statsCollectionName = 'stats';
const usersCollectionName = 'users';

// Global variable to store the database connection
let db;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// Connect to MongoDB once when the server starts
async function connectToDb() {
  try {
    await client.connect();
    db = client.db(dbName);
    console.log('Connected successfully to MongoDB');
  } catch (err) {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  }
}

// Nodemailer transporter setup (replace with your actual email service credentials)
const auth = {
  apiKey: process.env.MAILGUN_API_KEY,
  domain: process.env.MAILGUN_DOMAIN
};

const transporter = nodemailer.createTransport(mailgunTransport(auth));

// API endpoint to get stats
app.get('/api/stats', async (req, res) => {
  try {
    const collection = db.collection(statsCollectionName);
    const stats = await collection.findOne({});
    res.json(stats);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error querying the database');
  }
});

// API endpoint for user signup
app.post('/api/signup', async (req, res) => {
    try {
        const { firstName, lastName, username, email, password } = req.body;
        const usersCollection = db.collection(usersCollectionName);

        // Check if user already exists
        const existingUser = await usersCollection.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(400).send('Username or email already exists.');
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create verification token
        const verificationToken = crypto.randomBytes(20).toString('hex');

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
            isAdmin: false
        };

        await usersCollection.insertOne(newUser);

        // Send verification email
        const verificationLink = `http://${req.headers.host}/verify.html?token=${verificationToken}`;
        const mailOptions = {
            from: '"TreePlace.App" <no-reply@treeplace.app>',
            to: email,
            subject: 'Verify Your Email for TreePlace.App',
            html: `<p>Please click the following link to verify your email address:</p><p><a href="${verificationLink}">${verificationLink}</a></p>`
        };

        // In a real app, you would uncomment this to send the email
        // await transporter.sendMail(mailOptions);

        res.status(201).send('User created. Please check your email to verify your account.');

    } catch (err) {
        console.error(err);
        res.status(500).send('Error creating user.');
    }
});

// API endpoint for email verification
app.get('/api/verify', async (req, res) => {
    try {
        const { token } = req.query;
        const usersCollection = db.collection(usersCollectionName);

        const user = await usersCollection.findOne({ verificationToken: token });

        if (!user) {
            return res.status(400).send('Invalid verification token.');
        }

        await usersCollection.updateOne({ _id: user._id }, { $set: { isVerified: true, verificationToken: null } });

        res.send('Email verified successfully. You can now log in.');

    } catch (err) {
        console.error(err);
        res.status(500).send('Error verifying email.');
    }
});

// API endpoint for user login
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const usersCollection = db.collection(usersCollectionName);

        const user = await usersCollection.findOne({ $or: [{ username: username }, { email: username }] });

        if (!user) {
            return res.status(400).send('Invalid username or password.');
        }

        if (!user.isVerified) {
            return res.status(400).send('Please verify your email before logging in.');
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).send('Invalid username or password.');
        }

        // In a real app, you would create a session or JWT here
        res.json({
            success: true,
            message: 'Login successful.',
            username: user.username,
            isAdmin: user.isAdmin
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error logging in.');
    }
});

// API endpoint for dashboard data
app.get('/api/dashboard', async (req, res) => {
    // In a real app, you would get the user ID from the session
    // and fetch their specific data.
    // For now, we'll return some dummy data.
    res.json({
        moneyDonated: 150,
        timeDonated: 12,
        locations: [
            {
                id: 1,
                name: 'Miami Beach Park',
                address: '4601 Collins Ave, Miami Beach, FL 33140',
                description: 'A beautiful coastal park with sandy soil perfect for native trees.',
                image: 'https://images.unsplash.com/photo-1511497584788-876760111969?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
            },
            {
                id: 2,
                name: 'Overtown Community Garden',
                address: '950 NW 3rd Ave, Miami, FL 33136',
                description: 'A community-driven garden in the heart of Overtown.',
                image: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
            },
            {
                id: 3,
                name: 'Little Havana Tree Corridor',
                address: 'SW 8th St, Miami, FL 33135',
                description: 'A vibrant urban corridor in Little Havana that\'s being transformed into a green oasis.',
                image: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
            }
        ]
    });
});

// Middleware to check for admin users
function isAdmin(req, res, next) {
    // In a real app, you would get the user from the session and check their role
    // For now, we'll assume a user is an admin if they have a specific header
    if (req.headers['x-admin'] === 'true') {
        next();
    } else {
        res.status(403).send('Forbidden');
    }
}

// Admin panel route
app.get('/admin', (req, res) => {
    res.sendFile(__dirname + '/admin.html');
});

// API endpoint to get all users
app.get('/api/users', async (req, res) => {
    try {
        const usersCollection = db.collection(usersCollectionName);
        const users = await usersCollection.find({}).toArray();
        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error querying the database');
    }
});

// API endpoint to update a user
app.put('/api/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { timeDonated, moneyDonated, isAdmin } = req.body;
        const usersCollection = db.collection(usersCollectionName);
        const { ObjectId } = require('mongodb');

        await usersCollection.updateOne({ _id: new ObjectId(id) }, {
            $set: {
                timeDonated: parseInt(timeDonated, 10),
                moneyDonated: parseInt(moneyDonated, 10),
                isAdmin: isAdmin
            }
        });
        res.status(200).send('User updated successfully');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error updating user');
    }
});

// API endpoint to get all events
app.get('/api/events', async (req, res) => {
    try {
        const eventsCollection = db.collection('events');
        const events = await eventsCollection.find({}).toArray();
        res.json(events);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error querying the database');
    }
});

// API endpoint to create an event
app.post('/api/events', async (req, res) => {
    try {
        const { name, date, location } = req.body;
        const eventsCollection = db.collection('events');
        const token = crypto.randomBytes(20).toString('hex');
        await eventsCollection.insertOne({ name, date, location, token, attendance: [] });
        res.status(201).send('Event created successfully');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error creating event');
    }
});

// API endpoint to delete an event
app.delete('/api/events/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const eventsCollection = db.collection('events');
        const { ObjectId } = require('mongodb');
        await eventsCollection.deleteOne({ _id: new ObjectId(id) });
        res.status(200).send('Event deleted successfully');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error deleting event');
    }
});

// API endpoint to generate QR code for an event
app.get('/api/events/:id/qr-code', async (req, res) => {
    try {
        const { id } = req.params;
        const eventsCollection = db.collection('events');
        const { ObjectId } = require('mongodb');
        const event = await eventsCollection.findOne({ _id: new ObjectId(id) });

        if (!event) {
            return res.status(404).send('Event not found');
        }

        const checkInUrl = `http://${req.headers.host}/check-in.html?eventId=${event._id}`;
        const checkOutUrl = `http://${req.headers.host}/check-out.html?eventId=${event._id}`;

        const qrCodeData = {
            checkInUrl,
            checkOutUrl
        };

        const qrCode = await QRCode.toDataURL(JSON.stringify(qrCodeData));
        res.json({ qrCodeUrl: qrCode });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error generating QR code');
    }
});

// API endpoint for user check-in
app.post('/api/check-in', async (req, res) => {
    try {
        const { eventId, username } = req.body;
        const eventsCollection = db.collection('events');
        const usersCollection = db.collection(usersCollectionName);
        const { ObjectId } = require('mongodb');

        const user = await usersCollection.findOne({ username });
        if (!user) {
            return res.status(404).send('User not found');
        }

        const event = await eventsCollection.findOne({ _id: new ObjectId(eventId) });
        if (!event) {
            return res.status(404).send('Event not found');
        }

        const existingAttendance = event.attendance.find(a => a.userId.equals(user._id));
        if (existingAttendance && existingAttendance.checkIn) {
            return res.status(400).send('User already checked in');
        }

        if (existingAttendance) {
            await eventsCollection.updateOne(
                { _id: new ObjectId(eventId), 'attendance.userId': user._id },
                { $set: { 'attendance.$.checkIn': new Date() } }
            );
        } else {
            await eventsCollection.updateOne(
                { _id: new ObjectId(eventId) },
                { $push: { attendance: { userId: user._id, username: user.username, checkIn: new Date() } } }
            );
        }

        res.status(200).send('Check-in successful');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error checking in');
    }
});

// API endpoint for user check-out
app.post('/api/check-out', async (req, res) => {
    try {
        const { eventId, username } = req.body;
        const eventsCollection = db.collection('events');
        const usersCollection = db.collection(usersCollectionName);
        const { ObjectId } = require('mongodb');

        const user = await usersCollection.findOne({ username });
        if (!user) {
            return res.status(404).send('User not found');
        }

        const event = await eventsCollection.findOne({ _id: new ObjectId(eventId) });
        if (!event) {
            return res.status(404).send('Event not found');
        }

        const attendance = event.attendance.find(a => a.userId.equals(user._id));
        if (!attendance || !attendance.checkIn) {
            return res.status(400).send('User has not checked in');
        }

        if (attendance.checkOut) {
            return res.status(400).send('User already checked out');
        }

        const checkOut = new Date();
        const hoursDonated = (checkOut - attendance.checkIn) / 1000 / 60 / 60;

        await eventsCollection.updateOne(
            { _id: new ObjectId(eventId), 'attendance.userId': user._id },
            { $set: { 'attendance.$.checkOut': checkOut, 'attendance.$.hoursDonated': hoursDonated } }
        );

        await usersCollection.updateOne(
            { _id: user._id },
            { $inc: { timeDonated: hoursDonated } }
        );

        res.status(200).send('Check-out successful');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error checking out');
    }
});


// API endpoint for forgot password
app.post('/api/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const usersCollection = db.collection(usersCollectionName);

        const user = await usersCollection.findOne({ email });

        if (!user) {
            // Don't reveal that the user doesn't exist
            return res.send('If a user with that email exists, a password reset link has been sent.');
        }

        const resetToken = crypto.randomBytes(20).toString('hex');
        const resetTokenExpiry = Date.now() + 3600000; // 1 hour

        await usersCollection.updateOne({ _id: user._id }, { $set: { resetToken, resetTokenExpiry } });

        const resetLink = `http://${req.headers.host}/reset-password.html?token=${resetToken}`;
        const mailOptions = {
            from: '"TreePlace.App" <no-reply@treeplace.app>',
            to: email,
            subject: 'Password Reset for TreePlace.App',
            html: `<p>You are receiving this because you (or someone else) have requested the reset of the password for your account.</p>
                   <p>Please click on the following link, or paste this into your browser to complete the process:</p>
                   <p><a href="${resetLink}">${resetLink}</a></p>
                   <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>`
        };

        // await transporter.sendMail(mailOptions);

        res.send('If a user with that email exists, a password reset link has been sent.');

    } catch (err) {
        console.error(err);
        res.status(500).send('Error processing forgot password request.');
    }
});

// API endpoint for resetting password
app.post('/api/reset-password', async (req, res) => {
    try {
        const { token, password } = req.body;
        const usersCollection = db.collection(usersCollectionName);

        const user = await usersCollection.findOne({
            resetToken: token,
            resetTokenExpiry: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).send('Password reset token is invalid or has expired.');
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await usersCollection.updateOne({ _id: user._id }, {
            $set: {
                password: hashedPassword,
                resetToken: null,
                resetTokenExpiry: null
            }
        });

        res.send('Password has been reset successfully.');

    } catch (err) {
        console.error(err);
        res.status(500).send('Error resetting password.');
    }
});

// Start the server after connecting to the database
connectToDb().then(() => {
  app.listen(port, '0.0.0.0', () => {
    console.log(`Server listening at http://0.0.0.0:${port}`);
  });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await client.close();
  console.log('MongoDB connection closed');
  process.exit(0);
});

