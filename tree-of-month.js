// Tree of the Month functionality
document.addEventListener('DOMContentLoaded', () => {
    const treeFeature = document.querySelector('.tree-feature');
    if (!treeFeature) return;

    // Animate tree image on scroll with parallax effect
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
                
                // Animate tree image with parallax effect
                const treeImage = treeFeature.querySelector('.tree-image img');
                if (treeImage) {
                    anime({
                        targets: treeImage,
                        translateY: [20, 0],
                        opacity: [0, 1],
                        duration: 1200,
                        easing: 'easeOutElastic(1, .5)',
                        delay: 300
                    });
                }
                
                // Animate tree info with staggered effect
                const treeInfo = treeFeature.querySelector('.tree-info');
                if (treeInfo) {
                    anime({
                        targets: treeInfo.querySelectorAll('*'),
                        translateX: [-30, 0],
                        opacity: [0, 1],
                        duration: 800,
                        delay: anime.stagger(100, {start: 500}),
                        easing: 'easeOutQuad'
                    });
                }
                
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });

    observer.observe(treeFeature);

    // Add 3D tilt effect to tree image
    const treeImageContainer = treeFeature.querySelector('.tree-image');
    if (treeImageContainer) {
        treeImageContainer.addEventListener('mousemove', (e) => {
            const rect = treeImageContainer.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;
            
            anime({
                targets: treeImageContainer,
                rotateX: rotateX,
                rotateY: rotateY,
                duration: 500,
                easing: 'easeOutQuad'
            });
        });
        
        treeImageContainer.addEventListener('mouseleave', () => {
            anime({
                targets: treeImageContainer,
                rotateX: 0,
                rotateY: 0,
                duration: 800,
                easing: 'easeOutElastic(1, .5)'
            });
        });
    }

    // Handle tree planting button click with advanced animation
    const plantButton = treeFeature.querySelector('.btn.primary');
    if (plantButton) {
        plantButton.addEventListener('click', () => {
            // Create ripple effect
            const ripple = document.createElement('div');
            ripple.className = 'ripple';
            plantButton.appendChild(ripple);
            
            // Position ripple at click point
            const rect = plantButton.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            ripple.style.width = ripple.style.height = `${size}px`;
            
            // Animate button with 3D effect
            anime({
                targets: plantButton,
                scale: [1, 1.1, 1],
                rotateX: [0, 10, 0],
                duration: 800,
                easing: 'easeOutElastic(1, .5)'
            });
            
            // Animate ripple
            anime({
                targets: ripple,
                scale: [0, 1],
                opacity: [0.8, 0],
                duration: 1000,
                easing: 'easeOutExpo',
                complete: () => ripple.remove()
            });

            // Show success notification with custom animation
            showNotification('Thank you for your interest in planting a Live Oak! We will contact you with next steps.', 'success');
        });
    }

    // Handle learn more button click with advanced animation
    const learnMoreButton = treeFeature.querySelector('.btn.secondary');
    if (learnMoreButton) {
        learnMoreButton.addEventListener('click', () => {
            // Animate button with 3D flip effect
            anime({
                targets: learnMoreButton,
                rotateY: [0, 180, 360],
                scale: [1, 1.1, 1],
                duration: 1000,
                easing: 'easeOutElastic(1, .5)'
            });

            // Show info notification with custom animation
            showNotification('Redirecting to detailed tree information...', 'info');
        });
    }

    // Add advanced hover effects to stats with 3D rotation
    const stats = treeFeature.querySelectorAll('.stat');
    stats.forEach(stat => {
        stat.addEventListener('mouseenter', () => {
            anime({
                targets: stat,
                scale: 1.05,
                rotateY: 5,
                rotateX: -5,
                boxShadow: '0 15px 30px rgba(0, 0, 0, 0.2)',
                duration: 400,
                easing: 'easeOutQuad'
            });
            
            // Animate icon within stat
            const icon = stat.querySelector('i');
            if (icon) {
                anime({
                    targets: icon,
                    rotate: [0, 360],
                    scale: [1, 1.2, 1],
                    duration: 800,
                    easing: 'easeOutElastic(1, .5)'
                });
            }
        });

        stat.addEventListener('mouseleave', () => {
            anime({
                targets: stat,
                scale: 1,
                rotateY: 0,
                rotateX: 0,
                boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)',
                duration: 400,
                easing: 'easeOutQuad'
            });
        });
    });

    // Add advanced animation to badges with staggered entrance and floating effect
    const badges = treeFeature.querySelectorAll('.badge');
    badges.forEach((badge, index) => {
        // Initial animation
        anime({
            targets: badge,
            translateX: [-50, 0],
            opacity: [0, 1],
            delay: index * 200,
            duration: 800,
            easing: 'easeOutElastic(1, .5)'
        });
        
        // Continuous floating animation
        anime({
            targets: badge,
            translateY: [0, -5, 0],
            duration: 2000 + (index * 500),
            delay: 1000 + (index * 200),
            loop: true,
            direction: 'alternate',
            easing: 'easeInOutSine'
        });
    });
    
    // Add animation to tree description list items
    const treeDescriptionItems = treeFeature.querySelectorAll('.tree-description li');
    treeDescriptionItems.forEach((item, index) => {
        anime({
            targets: item,
            translateX: [-20, 0],
            opacity: [0, 1],
            delay: 1000 + (index * 150),
            duration: 600,
            easing: 'easeOutQuad'
        });
    });
    
    // Add animation to scientific name
    const scientificName = treeFeature.querySelector('.scientific-name');
    if (scientificName) {
        anime({
            targets: scientificName,
            color: ['#ffffff', '#4CAF50', '#ffffff'],
            duration: 2000,
            delay: 800,
            loop: true,
            direction: 'alternate',
            easing: 'easeInOutSine'
        });
    }
});

// Enhanced notification system with advanced animations
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    // Animate in with 3D effect
    anime({
        targets: notification,
        translateY: [-50, 0],
        rotateX: [90, 0],
        opacity: [0, 1],
        duration: 800,
        easing: 'easeOutElastic(1, .5)'
    });

    // Add subtle floating animation while visible
    anime({
        targets: notification,
        translateY: [0, -5, 0],
        duration: 3000,
        delay: 800,
        loop: true,
        direction: 'alternate',
        easing: 'easeInOutSine'
    });

    // Remove after delay with 3D effect
    setTimeout(() => {
        anime({
            targets: notification,
            translateY: [0, 50],
            rotateX: [0, -90],
            opacity: [1, 0],
            duration: 800,
            easing: 'easeInQuad',
            complete: () => notification.remove()
        });
    }, 5000);
} 