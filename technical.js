// Technical Improvements Functionality
document.addEventListener('DOMContentLoaded', () => {
    // Dark Mode Toggle
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Check for saved theme preference or use system preference
    const currentTheme = localStorage.getItem('theme') || 
                        (prefersDarkScheme.matches ? 'dark' : 'light');
    
    if (currentTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
    
    darkModeToggle.addEventListener('click', () => {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        
        if (isDark) {
            document.documentElement.removeAttribute('data-theme');
            darkModeToggle.innerHTML = '<i class="fas fa-moon"></i>';
            localStorage.setItem('theme', 'light');
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
            localStorage.setItem('theme', 'dark');
        }
        
        // Animate the toggle
        anime({
            targets: darkModeToggle,
            rotate: [0, 360],
            duration: 500,
            easing: 'easeOutElastic(1, .5)'
        });
    });
    
    // Language Selector
    const languageSelect = document.getElementById('language-select');
    const currentLang = localStorage.getItem('language') || 'en';
    
    languageSelect.value = currentLang;
    
    languageSelect.addEventListener('change', (e) => {
        const newLang = e.target.value;
        localStorage.setItem('language', newLang);
        
        // Here you would typically load the language file and update the UI
        // For now, we'll just show a notification
        showNotification(`Language changed to ${newLang}`, 'info');
    });
    
    // Search Functionality
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    
    let searchTimeout;
    
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        
        searchTimeout = setTimeout(() => {
            const query = e.target.value.trim();
            if (query.length >= 2) {
                performSearch(query);
            }
        }, 300);
    });
    
    searchButton.addEventListener('click', () => {
        const query = searchInput.value.trim();
        if (query) {
            performSearch(query);
        }
    });
    
    function performSearch(query) {
        // Here you would typically make an API call to your backend
        // For now, we'll just show a notification
        showNotification(`Searching for: ${query}`, 'info');
        
        // Animate the search button
        anime({
            targets: searchButton,
            scale: [1, 1.2, 1],
            duration: 300,
            easing: 'easeOutElastic(1, .5)'
        });
    }
    
    // Mobile Menu Toggle
    const headerControls = document.querySelector('.header-controls');
    const menuButton = document.createElement('button');
    menuButton.className = 'menu-toggle';
    menuButton.innerHTML = '<i class="fas fa-bars"></i>';
    
    document.querySelector('header .container').insertBefore(
        menuButton,
        headerControls
    );
    
    menuButton.addEventListener('click', () => {
        headerControls.classList.toggle('mobile-visible');
        
        // Animate the menu button
        anime({
            targets: menuButton,
            rotate: [0, 90],
            duration: 300,
            easing: 'easeOutElastic(1, .5)'
        });
    });
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!headerControls.contains(e.target) && 
            !menuButton.contains(e.target) && 
            headerControls.classList.contains('mobile-visible')) {
            headerControls.classList.remove('mobile-visible');
        }
    });
}); 