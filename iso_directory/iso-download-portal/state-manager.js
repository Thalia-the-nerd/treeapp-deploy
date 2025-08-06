
const fs = require('fs').promises;
const path = require('path');

const distrosPath = path.join(__dirname, 'distros.json');
const statusPath = path.join(__dirname, 'status.json');

// A simple mutex to prevent race conditions when writing to status.json
let isWriting = false;

const getDistros = async () => {
    const data = await fs.readFile(distrosPath, 'utf-8');
    return JSON.parse(data);
};

const getStatus = async () => {
    try {
        const data = await fs.readFile(statusPath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') return {}; // Return empty object if file doesn't exist
        throw error;
    }
};

const updateStatus = async (distroId, newDistroStatus) => {
    // Wait if another write is in progress
    while (isWriting) {
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    isWriting = true;
    try {
        const currentStatus = await getStatus();
        currentStatus[distroId] = { ...currentStatus[distroId], ...newDistroStatus };
        await fs.writeFile(statusPath, JSON.stringify(currentStatus, null, 2));
    } finally {
        isWriting = false;
    }
};

/**
 * Updates the status of a single distro by reading its ISO file info.
 * This should be run on startup and after downloads.
 */
const updateDistroStatus = async (distroId) => {
    const distros = await getDistros();
    const distro = distros.find(d => d.id === distroId);
    if (!distro) return;

    try {
        const files = await fs.readdir(distro.path);
        const isoFile = files.find(f => f.toLowerCase().endsWith('.iso'));
        if (!isoFile) {
            await updateStatus(distroId, { version: null, filename: null, size: null });
            return;
        }

        const stats = await fs.stat(path.join(distro.path, isoFile));
        const versionMatch = isoFile.match(/(\d+(\.\d+)*)/);
        
        await updateStatus(distroId, {
            version: versionMatch ? versionMatch[0] : 'unknown',
            filename: isoFile,
            size: stats.size,
        });
    } catch (error) {
        if (error.code !== 'ENOENT') {
            console.error(`Error updating status for ${distro.name}:`, error);
        }
        await updateStatus(distroId, { version: null, filename: null, size: null });
    }
};

const configPath = path.join(__dirname, 'config.json');

const getConfig = async () => {
    const data = await fs.readFile(configPath, 'utf-8');
    return JSON.parse(data);
};

const saveDistros = async (distros) => {
    await fs.writeFile(distrosPath, JSON.stringify(distros, null, 2));
};

module.exports = { getConfig, getDistros, saveDistros, getStatus, updateStatus, updateDistroStatus };
