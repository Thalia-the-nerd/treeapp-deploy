// Payment page specific animations
document.addEventListener('DOMContentLoaded', () => {
    // Payment option selection animations
    const paymentOptions = document.querySelectorAll('.payment-option');
    const checkoutButton = document.getElementById('checkout-button');

    // Initial animations
    anime({
        targets: '.payment-container',
        translateY: [50, 0],
        opacity: [0, 1],
        duration: 1000,
        easing: 'easeOutExpo'
    });

    anime({
        targets: '.payment-option',
        translateY: [30, 0],
        opacity: [0, 1],
        duration: 800,
        delay: anime.stagger(100),
        easing: 'easeOutExpo'
    });

    // Payment option selection
    paymentOptions.forEach(option => {
        option.addEventListener('click', () => {
            // Remove selected class from all options
            paymentOptions.forEach(opt => opt.classList.remove('selected'));
            
            // Add selected class to clicked option
            option.classList.add('selected');
            
            // Animate the selection
            anime({
                targets: option,
                scale: [1, 1.02, 1],
                duration: 300,
                easing: 'easeOutElastic(1, .5)'
            });
        });
    });

    // Checkout button animation
    checkoutButton.addEventListener('click', () => {
        // Animate button
        anime({
            targets: checkoutButton,
            scale: [1, 0.95, 1],
            duration: 300,
            easing: 'easeOutElastic(1, .5)'
        });
    });
}); 