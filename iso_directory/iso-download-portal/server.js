const express = require('express');
const basicAuth = require('express-basic-auth');
const bodyParser = require('body-parser');
const path = require('path');
const rateLimit = require('express-rate-limit');
const { getDistros, saveDistros, getStatus, updateStatus, updateDistroStatus, getConfig } = require('./state-manager');

app.post('/api/distros', adminAuth, async (req, res) => {
    try {
        await saveDistros(req.body);
        logger.info('Distro configuration updated by admin.');
        res.status(200).send('Configuration saved successfully.');
    } catch (error) {
        logger.error('Failed to save distro configuration.', { error: error.message });
        res.status(500).send('Failed to save configuration.');
    }
});
const { scheduleChecks, checkDistroVersion } = require('./update-checker');
const logger = require('./logger');

const app = express();
const PORT = 1299;
const HOST = '0.0.0.0';

// --- Middleware ---
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

const downloadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // Limit each IP to 10 downloads per window
    message: 'Too many downloads from this IP, please try again after an hour.',
    standardHeaders: true,
    legacyHeaders: false,
});

const adminAuth = basicAuth({
    users: { 'thaliathenerd': '052111' },
    challenge: true,
    realm: 'ISO_PORTAL_ADMIN',
});

// --- Main Routes ---
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/admin', adminAuth, (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin.html')));
app.get('/admin/logs', adminAuth, async (req, res) => {
    const logs = await logger.getLogs();
    res.json(logs.reverse());
});

// --- API Routes ---
app.get('/api/status', async (req, res) => {
    const distros = await getDistros();
    const status = await getStatus();
    // New logic to combine nested versions
    const combined = distros.map(distro => {
        const versions = distro.versions.map(v => ({
            ...v,
            ...(status[v.id] || {}),
        }));
        return { ...distro, versions };
    });
    res.json(combined);
});

app.get('/api/download/:versionId', downloadLimiter, async (req, res) => {
    const distros = await getDistros();
    const status = await getStatus();
    let version;
    for (const distro of distros) {
        const found = distro.versions.find(v => v.id === req.params.versionId);
        if (found) {
            version = found;
            break;
        }
    }

    const versionStatus = status[req.params.versionId];
    if (!version || !versionStatus || !versionStatus.filename) {
        return res.status(404).send('File not found.');
    }

    const filePath = path.join(version.path, versionStatus.filename);
    const currentDownloads = versionStatus.downloads || 0;
    updateStatus(version.id, { downloads: currentDownloads + 1 });
    res.download(filePath);
});

app.post('/api/check/:versionId', adminAuth, async (req, res) => {
    const distros = await getDistros();
    let version;
    for (const distro of distros) {
        const found = distro.versions.find(v => v.id === req.params.versionId);
        if (found) {
            version = found;
            break;
        }
    }

    if (version) {
        await checkDistroVersion(version);
        res.status(200).send(`Check triggered for ${version.name}.`);
    } else {
        res.status(404).send('Distro version not found.');
    }
});

// --- Initialisation ---
const initialize = async () => {
    await fs.mkdir(path.join(__dirname, 'public'), { recursive: true });
    logger.info('Application starting up.');

    const distros = await getDistros();
    for (const distro of distros) {
        for (const version of distro.versions) {
            await updateDistroStatus(version.id);
        }
    }
    
    scheduleChecks();
    app.listen(PORT, HOST, () => console.log(`ISO Portal server running on http://${HOST}:${PORT}`));
};

initialize();