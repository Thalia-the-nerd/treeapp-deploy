

const fs = require('fs').promises;
const path = require('path');
const cron = require('node-cron');
const axios = require('axios');
const { exec } = require('child_process');
const createTorrent = require('create-torrent');
const Transmission = require('transmission');
const { getConfig, getDistros, getStatus, updateStatus } = require('./state-manager');
const logger = require('./logger');

const downloadScriptPath = '/home/thalia/iso_directory/download_isos.sh';

// --- Torrenting Logic ---

const createAndSeedTorrent = async (distroVersion, isoFilename) => {
    const config = await getConfig();
    const isoPath = path.join(distroVersion.path, isoFilename);
    const torrentPath = `${isoPath}.torrent`;

    logger.info('Creating torrent file.', { iso: isoPath });

    try {
        const torrent = await new Promise((resolve, reject) => {
            createTorrent(isoPath, (err, torrent) => {
                if (err) return reject(err);
                resolve(torrent);
            });
        });
        await fs.writeFile(torrentPath, torrent);

        const transmission = new Transmission(config.transmission);
        await new Promise((resolve, reject) => {
            transmission.add(torrentPath, (err, result) => {
                if (err) return reject(err);
                logger.info('Torrent added to Transmission.', { name: result.name });
                resolve(result);
            });
        });
        await updateStatus(distroVersion.id, { torrent: true });
    } catch (error) {
        logger.error('Failed to create or seed torrent.', { error: error.message });
        await updateStatus(distroVersion.id, { torrent: false });
    }
};

// --- Download & Update Logic ---

const triggerDownload = (distroVersion, url, filename) => {
    logger.info('Triggering download.', { name: distroVersion.name, url });
    const command = `bash ${downloadScriptPath} "${url}" "${distroVersion.path}" "${filename}"`;

    exec(command, async (error, stdout, stderr) => {
        logger.error('Download script failed.', { name: distroVersion.name, error: stderr });
            return;
        }
        logger.info('Download script finished.', { name: distroVersion.name });
        
        await cleanupOldFiles(distroVersion, filename);
        await updateDistroStatus(distroVersion.id);
        await createAndSeedTorrent(distroVersion, filename);
    });
};

const cleanupOldFiles = async (distroVersion, newIsoFilename) => {
    try {
        const files = await fs.readdir(distroVersion.path);
        for (const file of files) {
            // Delete old ISOs and their corresponding .torrent files
            if (file !== newIsoFilename && (file.endsWith('.iso') || file.endsWith('.iso.torrent'))) {
                logger.info('Deleting old file.', { name: distroVersion.name, file });
                await fs.unlink(path.join(distroVersion.path, file));
            }
        }
    } catch (error) {
        logger.error('File cleanup failed.', { name: distroVersion.name, error: error.message });
    }
};

// ... (Checker implementations remain largely the same) ...

// --- Core Update Logic ---

const checkDistroVersion = async (distro, version) => {
    // ... (Logic to check a single version) ...
};

const scheduleChecks = () => {
    // ... (Scheduling logic remains the same) ...
};

module.exports = { scheduleChecks, checkDistroVersion };
