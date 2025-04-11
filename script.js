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
        languageSelect.addEventListener('change', () => {
            const selectedLanguage = languageSelect.value;
            // In a real implementation, this would load language files
            console.log(`Language changed to: ${selectedLanguage}`);
        });
    }

    // Initialize tree counter
    const treeCounter = document.getElementById('tree-counter');
    if (treeCounter) {
        const numberElement = treeCounter.querySelector('.number');
        if (numberElement) {
            // Animate counter from 0 to 5000
            anime({
                targets: numberElement,
                innerHTML: [0, 5000],
                round: 1,
                duration: 2000,
                easing: 'easeOutExpo',
                delay: 500
            });
        }
    }

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
        window.addEventListener('scroll', () => {
            const scrollPosition = window.scrollY;
            
            parallaxElements.forEach(element => {
                const speed = parseFloat(element.getAttribute('data-speed') || 0.5);
                const yPos = -(scrollPosition * speed);
                element.style.transform = `translateY(${yPos}px)`;
            });
        });
    }
}); 