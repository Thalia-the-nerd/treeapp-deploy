// Settings Management
class SettingsManager {
    constructor() {
        this.settings = this.loadSettings();
        this.initializeSettings();
        this.setupEventListeners();
    }

    loadSettings() {
        const defaultSettings = {
            theme: 'system',
            fontSize: 'medium',
            animations: true,
            highContrast: false,
            reducedMotion: false,
            screenReader: false,
            emailNotifications: true,
            eventReminders: true,
            newsletter: false,
            locationTracking: true,
            dataCollection: true,
            analytics: true,
            // New settings
            language: 'en',
            region: 'us',
            dateFormat: 'mm/dd/yyyy',
            contentFilter: 'all',
            autoPlay: false,
            imageQuality: 'high',
            cacheControl: 'auto',
            debugMode: false,
            performanceMode: false
        };

        try {
            const savedSettings = localStorage.getItem('userSettings');
            return savedSettings ? { ...defaultSettings, ...JSON.parse(savedSettings) } : defaultSettings;
        } catch (error) {
            console.error('Error loading settings:', error);
            return defaultSettings;
        }
    }

    saveSettings() {
        try {
            localStorage.setItem('userSettings', JSON.stringify(this.settings));
            this.applySettings();
        } catch (error) {
            console.error('Error saving settings:', error);
        }
    }

    applySettings() {
        // Existing settings
        document.documentElement.setAttribute('data-theme', this.settings.theme);
        document.documentElement.style.fontSize = this.getFontSizeValue(this.settings.fontSize);
        document.documentElement.classList.toggle('reduced-motion', !this.settings.animations);
        document.documentElement.classList.toggle('high-contrast', this.settings.highContrast);
        this.applyScreenReaderSettings();

        // New settings
        this.applyLanguageSettings();
        this.applyContentSettings();
        this.applyAdvancedSettings();

        // Update UI elements
        this.updateUIElements();
    }

    getFontSizeValue(size) {
        const sizes = {
            small: '14px',
            medium: '16px',
            large: '18px'
        };
        return sizes[size] || sizes.medium;
    }

    applyScreenReaderSettings() {
        const elements = document.querySelectorAll('[aria-label]');
        elements.forEach(element => {
            if (this.settings.screenReader) {
                element.setAttribute('role', 'button');
                element.setAttribute('tabindex', '0');
            } else {
                element.removeAttribute('role');
                element.removeAttribute('tabindex');
            }
        });
    }

    updateUIElements() {
        // Update theme selector
        const themeSelect = document.getElementById('theme-select');
        if (themeSelect) themeSelect.value = this.settings.theme;

        // Update font size selector
        const fontSizeSelect = document.getElementById('font-size-select');
        if (fontSizeSelect) fontSizeSelect.value = this.settings.fontSize;

        // Update toggles
        Object.keys(this.settings).forEach(key => {
            const toggle = document.getElementById(`${key}-toggle`);
            if (toggle) toggle.checked = this.settings[key];
        });
    }

    setupEventListeners() {
        // Theme change
        const themeSelect = document.getElementById('theme-select');
        if (themeSelect) {
            themeSelect.addEventListener('change', (e) => {
                this.settings.theme = e.target.value;
                this.saveSettings();
            });
        }

        // Font size change
        const fontSizeSelect = document.getElementById('font-size-select');
        if (fontSizeSelect) {
            fontSizeSelect.addEventListener('change', (e) => {
                this.settings.fontSize = e.target.value;
                this.saveSettings();
            });
        }

        // Toggle switches
        document.querySelectorAll('.toggle-switch input').forEach(toggle => {
            toggle.addEventListener('change', (e) => {
                const setting = e.target.id.replace('-toggle', '');
                this.settings[setting] = e.target.checked;
                this.saveSettings();
            });
        });

        // Save button
        const saveButton = document.getElementById('save-settings');
        if (saveButton) {
            saveButton.addEventListener('click', () => {
                this.saveSettings();
                this.showNotification('Settings saved successfully!');
            });
        }

        // Reset button
        const resetButton = document.getElementById('reset-settings');
        if (resetButton) {
            resetButton.addEventListener('click', () => {
                if (confirm('Are you sure you want to reset all settings to default?')) {
                    this.settings = this.loadSettings();
                    this.saveSettings();
                    this.showNotification('Settings reset to default.');
                }
            });
        }
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('show');
            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => {
                    notification.remove();
                }, 300);
            }, 3000);
        }, 100);
    }

    initializeSettings() {
        this.applySettings();
    }

    applyLanguageSettings() {
        // Apply language
        document.documentElement.lang = this.settings.language;
        
        // Apply date format
        this.updateDateFormat();
        
        // Apply region-specific content
        this.updateRegionContent();
    }

    applyContentSettings() {
        // Apply content filter
        this.updateContentFilter();
        
        // Apply image quality
        this.updateImageQuality();
        
        // Apply autoplay settings
        this.updateAutoplaySettings();
    }

    applyAdvancedSettings() {
        // Apply cache control
        this.updateCacheControl();
        
        // Apply debug mode
        if (this.settings.debugMode) {
            this.enableDebugMode();
        } else {
            this.disableDebugMode();
        }
        
        // Apply performance mode
        if (this.settings.performanceMode) {
            this.enablePerformanceMode();
        } else {
            this.disablePerformanceMode();
        }
    }

    updateDateFormat() {
        // Implementation for date format updates
        const dateElements = document.querySelectorAll('[data-date]');
        dateElements.forEach(element => {
            const date = new Date(element.getAttribute('data-date'));
            element.textContent = this.formatDate(date, this.settings.dateFormat);
        });
    }

    updateRegionContent() {
        // Implementation for region-specific content updates
        const regionElements = document.querySelectorAll('[data-region]');
        regionElements.forEach(element => {
            const region = element.getAttribute('data-region');
            element.style.display = region === this.settings.region ? 'block' : 'none';
        });
    }

    updateContentFilter() {
        // Implementation for content filtering
        const contentElements = document.querySelectorAll('[data-content-level]');
        contentElements.forEach(element => {
            const contentLevel = element.getAttribute('data-content-level');
            element.style.display = this.isContentAllowed(contentLevel) ? 'block' : 'none';
        });
    }

    updateImageQuality() {
        // Implementation for image quality updates
        const images = document.querySelectorAll('img[data-quality]');
        images.forEach(img => {
            const quality = this.settings.imageQuality;
            const src = img.getAttribute(`data-${quality}`);
            if (src) {
                img.src = src;
            }
        });
    }

    updateAutoplaySettings() {
        // Implementation for autoplay settings
        const videos = document.querySelectorAll('video');
        videos.forEach(video => {
            video.autoplay = this.settings.autoPlay;
        });
    }

    updateCacheControl() {
        // Implementation for cache control
        if (this.settings.cacheControl === 'minimal') {
            this.setMinimalCache();
        } else if (this.settings.cacheControl === 'aggressive') {
            this.setAggressiveCache();
        } else {
            this.setAutomaticCache();
        }
    }

    enableDebugMode() {
        // Implementation for debug mode
        console.log('Debug mode enabled');
        // Add debug-specific functionality
    }

    disableDebugMode() {
        // Implementation for disabling debug mode
        console.log('Debug mode disabled');
        // Remove debug-specific functionality
    }

    enablePerformanceMode() {
        // Implementation for performance mode
        document.documentElement.classList.add('performance-mode');
        // Add performance optimizations
    }

    disablePerformanceMode() {
        // Implementation for disabling performance mode
        document.documentElement.classList.remove('performance-mode');
        // Remove performance optimizations
    }

    isContentAllowed(contentLevel) {
        const filterLevels = {
            'all': ['all', 'family', 'strict'],
            'family': ['all', 'family'],
            'strict': ['all']
        };
        return filterLevels[this.settings.contentFilter].includes(contentLevel);
    }

    formatDate(date, format) {
        const formats = {
            'mm/dd/yyyy': (d) => `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`,
            'dd/mm/yyyy': (d) => `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`,
            'yyyy-mm-dd': (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
        };
        return formats[format](date);
    }

    setMinimalCache() {
        // Implementation for minimal caching
        if ('caches' in window) {
            caches.keys().then(keys => {
                keys.forEach(key => {
                    if (key !== 'essential') {
                        caches.delete(key);
                    }
                });
            });
        }
    }

    setAggressiveCache() {
        // Implementation for aggressive caching
        if ('caches' in window) {
            caches.keys().then(keys => {
                keys.forEach(key => {
                    caches.delete(key);
                });
            });
        }
    }

    setAutomaticCache() {
        // Implementation for automatic caching
        // Let the browser handle caching automatically
    }
}

// Initialize settings when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const settingsManager = new SettingsManager();
}); 