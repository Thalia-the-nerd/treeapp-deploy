// Main script for TreePlace.App
document.addEventListener('DOMContentLoaded', () => {
    // Initialize dark mode toggle
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            const icon = darkModeToggle.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-moon');
                icon.classList.toggle('fa-sun');
            }
        });
    }

    // Initialize language selector
    const languageSelect = document.getElementById('language-select');
    if (languageSelect) {
        const translations = {
            'en': {
                'home': 'Home',
                'about': 'About',
                'locations': 'Locations',
                'contact': 'Contact',
                // Add more translations as needed
            },
            'es': {
                'home': 'Inicio',
                'about': 'Acerca de',
                'locations': 'Ubicaciones',
                'contact': 'Contacto',
                // Add more translations as needed
            }
        };

        function updateLanguage(lang) {
            document.querySelectorAll('[data-translate]').forEach(element => {
                const key = element.getAttribute('data-translate');
                if (translations[lang] && translations[lang][key]) {
                    element.textContent = translations[lang][key];
                }
            });
            // Store language preference
            localStorage.setItem('preferred-language', lang);
        }

        languageSelect.addEventListener('change', () => {
            const selectedLanguage = languageSelect.value;
            updateLanguage(selectedLanguage);
        });

        // Load saved language preference
        const savedLanguage = localStorage.getItem('preferred-language');
        if (savedLanguage && translations[savedLanguage]) {
            languageSelect.value = savedLanguage;
            updateLanguage(savedLanguage);
        }
    }

    // Function to fetch and update stats
    async function updateStats() {
        try {
            const response = await fetch('stats.txt');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.text();
            
            // Parse the stats file
            const stats = {};
            const lines = data.split('\n');
            let totalTrees = 0;
            let version = '1.0.0'; // Default version
            
            for (const line of lines) {
                if (line.startsWith('# Version:')) {
                    version = line.split(':')[1].trim();
                    // Update version number in all version spans
                    document.querySelectorAll('.version-number').forEach(span => {
                        span.textContent = version;
                    });
                }
                if (line.startsWith('#') || !line.trim()) continue; // Skip comments and empty lines
                const [key, value, date] = line.split('|');
                if (key && value) {
                    const numValue = parseInt(value);
                    if (!isNaN(numValue)) {
                        stats[key] = numValue;
                        
                        // Add to total if it's a location stat (not a main stat)
                        if (!key.startsWith('total_') && key !== 'date_updated') {
                            totalTrees += numValue;
                        }
                    }
                }
            }

            // Update total trees planted
            stats.total_trees_planted = totalTrees;
            
            // Calculate derived stats
            stats.total_co2_reduction_tons = Math.round(totalTrees * 0.022); // 22kg CO2 per tree per year = 0.022 tons
            stats.total_water_saved_gallons = totalTrees * 100; // 100 gallons per tree per year

            // Update tree counter
            const treeCounter = document.getElementById('tree-counter');
            if (treeCounter) {
                const numberElement = treeCounter.querySelector('.number');
                if (numberElement) {
                    numberElement.textContent = totalTrees;
                }
            }

            // Update stats in the impact section
            const treeCount = document.getElementById('tree-count');
            const co2Reduction = document.getElementById('co2-reduction');
            const waterSaved = document.getElementById('water-saved');
            
            if (treeCount) treeCount.textContent = totalTrees;
            if (co2Reduction) co2Reduction.textContent = stats.total_co2_reduction_tons;
            if (waterSaved) waterSaved.textContent = stats.total_water_saved_gallons;

            // Update location stats if they exist
            const locationStats = document.querySelectorAll('.location-stat');
            locationStats.forEach(stat => {
                const locationName = stat.getAttribute('data-location');
                if (locationName && stats[locationName]) {
                    const numberElement = stat.querySelector('.number');
                    if (numberElement) {
                        numberElement.textContent = stats[locationName];
                    }
                }
            });
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    }

    // Update stats when the page loads
    updateStats();

    // Update stats every 5 minutes
    setInterval(updateStats, 5 * 60 * 1000);

    // Initialize tree calculator
    const treeCalculator = document.getElementById('tree-calculator');
    if (treeCalculator) {
        const calculateButton = treeCalculator.querySelector('.btn');
        const results = treeCalculator.querySelector('.results');
        const co2Element = results.querySelector('.co2');
        const waterElement = results.querySelector('.water');
        
        if (calculateButton && results && co2Element && waterElement) {
            calculateButton.addEventListener('click', () => {
                const input = treeCalculator.querySelector('input');
                if (input && input.value) {
                    const treeCount = parseInt(input.value);
                    if (isNaN(treeCount) || treeCount < 0) {
                        showNotification('Please enter a valid positive number of trees', 'error');
                        return;
                    }
                    const co2Amount = treeCount * 22; // kg per year
                    const waterAmount = treeCount * 100; // gallons per year
                    
                    results.style.display = 'block';
                    
                    anime({
                        targets: co2Element,
                        innerHTML: [0, co2Amount],
                        round: 1,
                        duration: 1500,
                        easing: 'easeOutExpo'
                    });
                    
                    anime({
                        targets: waterElement,
                        innerHTML: [0, waterAmount],
                        round: 1,
                        duration: 1500,
                        easing: 'easeOutExpo'
                    });
                }
            });
        }
    }

    // Initialize parallax effects
    const parallaxElements = document.querySelectorAll('.parallax');
    if (parallaxElements.length > 0) {
        const handleScroll = () => {
            const scrollPosition = window.scrollY;
            
            parallaxElements.forEach(element => {
                const speed = parseFloat(element.getAttribute('data-speed') || 0.5);
                const yPos = -(scrollPosition * speed);
                element.style.transform = `translateY(${yPos}px)`;
            });
        };

        window.addEventListener('scroll', handleScroll);

        // Cleanup function
        const cleanup = () => {
            window.removeEventListener('scroll', handleScroll);
        };

        // Clean up on page unload
        window.addEventListener('unload', cleanup);
    }

    // Mobile Menu Functionality
    const hamburgerMenu = document.getElementById('hamburger-menu');
    const mainNav = document.getElementById('main-nav');
    const body = document.body;
    let lastScrollTop = 0;

    if (hamburgerMenu && mainNav) {
        const toggleMenu = (show) => {
            mainNav.classList.toggle('active', show);
            hamburgerMenu.classList.toggle('active', show);
            body.classList.toggle('menu-open', show);
            
            // Toggle between hamburger and close icon
            const icon = hamburgerMenu.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-bars', !show);
                icon.classList.toggle('fa-times', show);
            }
            
            // Set ARIA attributes for accessibility
            hamburgerMenu.setAttribute('aria-expanded', show);
            mainNav.setAttribute('aria-hidden', !show);
        };

        // Initialize ARIA attributes
        hamburgerMenu.setAttribute('aria-expanded', 'false');
        hamburgerMenu.setAttribute('aria-controls', 'main-nav');
        mainNav.setAttribute('aria-hidden', 'true');
        mainNav.setAttribute('role', 'navigation');
        mainNav.setAttribute('aria-label', 'Main navigation');

        hamburgerMenu.addEventListener('click', () => {
            toggleMenu(!mainNav.classList.contains('active'));
        });

        // Close menu when clicking outside
        document.addEventListener('click', (event) => {
            if (!mainNav.contains(event.target) && 
                !hamburgerMenu.contains(event.target) && 
                mainNav.classList.contains('active')) {
                toggleMenu(false);
            }
        });

        // Close menu when clicking a link
        mainNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                toggleMenu(false);
            });
        });

        // Handle scroll behavior
        window.addEventListener('scroll', () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            // Close menu if scrolling while it's open
            if (mainNav.classList.contains('active')) {
                toggleMenu(false);
            }
            
            // Hide/show menu based on scroll direction
            if (scrollTop > lastScrollTop && scrollTop > 100) {
                // Scrolling down
                mainNav.classList.add('nav-hidden');
            } else {
                // Scrolling up
                mainNav.classList.remove('nav-hidden');
            }
            
            lastScrollTop = scrollTop;
        });

        // Close menu on window resize
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                toggleMenu(false);
            }
        });
        
        // Handle keyboard navigation
        hamburgerMenu.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                toggleMenu(!mainNav.classList.contains('active'));
            }
        });
        
        // Trap focus within menu when open
        mainNav.addEventListener('keydown', (event) => {
            if (!mainNav.classList.contains('active')) return;
            
            const focusableElements = mainNav.querySelectorAll('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
            const firstFocusable = focusableElements[0];
            const lastFocusable = focusableElements[focusableElements.length - 1];
            
            if (event.key === 'Tab') {
                if (event.shiftKey) {
                    if (document.activeElement === firstFocusable) {
                        event.preventDefault();
                        lastFocusable.focus();
                    }
                } else {
                    if (document.activeElement === lastFocusable) {
                        event.preventDefault();
                        firstFocusable.focus();
                    }
                }
            }
            
            if (event.key === 'Escape') {
                toggleMenu(false);
            }
        });
    }

    // Process steps animation
    const animateOnScroll = () => {
        const elements = document.querySelectorAll('.animate-on-scroll');
        
        elements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            if (elementPosition < windowHeight - 100) {
}); 

// Tree Counter and Stats Animation
function updateTreeStats() {
    const treeCount = document.getElementById('tree-count');
    const co2Reduction = document.getElementById('co2-reduction');
    const waterSaved = document.getElementById('water-saved');
    
    // Updated values to reflect 0 trees planted
    const stats = {
        trees: 0,
        co2Tons: 0,
        waterGallons: 0
    };

    // Animate the numbers
    function animateValue(element, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const value = Math.floor(progress * (end - start) + start);
            element.textContent = value.toLocaleString();
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }

    // Start animations
    animateValue(treeCount, 0, stats.trees, 2000);
    animateValue(co2Reduction, 0, stats.co2Tons, 2000);
    animateValue(waterSaved, 0, stats.waterGallons, 2000);
}

// Initialize stats when the page loads
document.addEventListener('DOMContentLoaded', () => {
    updateTreeStats();
});

// Update stats when the counter section comes into view
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            updateTreeStats();
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

const counterSection = document.getElementById('tree-counter-section');
if (counterSection) {
    observer.observe(counterSection);
} 