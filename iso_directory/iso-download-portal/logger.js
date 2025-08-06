const fs = require('fs').promises;
const path = require('path');

const logFilePath = path.join(__dirname, 'events.log');

const logEvent = async (level, message, data) => {
    const timestamp = new Date().toISOString();
    const logEntry = { timestamp, level, message, ...data };
    const logLine = JSON.stringify(logEntry) + '\n';

    try {
        await fs.appendFile(logFilePath, logLine);
    } catch (error) {
        console.error('Failed to write to log file:', error);
    }
};

const info = (message, data = {}) => logEvent('INFO', message, data);
const warn = (message, data = {}) => logEvent('WARN', message, data);
const error = (message, data = {}) => logEvent('ERROR', message, data);

const getLogs = async () => {
    try {
        const data = await fs.readFile(logFilePath, 'utf-8');
        return data.split('\n').filter(Boolean).map(JSON.parse);
    } catch (error) {
        if (error.code === 'ENOENT') return [];
        throw error;
    }
};

module.exports = { info, warn, error, getLogs };
