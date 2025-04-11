// Animations for TreePlace.App
document.addEventListener('DOMContentLoaded', () => {
    // Animate elements on scroll
    const animateOnScroll = () => {
        const elements = document.querySelectorAll('.animate-on-scroll');
        
        elements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            if (elementPosition < windowHeight - 100) {
                element.classList.add('animated');
            }
        });
    };
    
    // Run on load and scroll
    window.addEventListener('load', animateOnScroll);
    window.addEventListener('scroll', animateOnScroll);
    
    // Animate feature cards
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach((card, index) => {
        // Add staggered entrance animation
        anime({
            targets: card,
            translateY: [50, 0],
            opacity: [0, 1],
            delay: index * 200,
            duration: 800,
            easing: 'easeOutQuad'
        });
        
        // Add hover animation
        card.addEventListener('mouseenter', () => {
            anime({
                targets: card,
                translateY: -10,
                boxShadow: '0 15px 30px rgba(0, 0, 0, 0.1)',
                duration: 300,
                easing: 'easeOutQuad'
            });
        });
        
        card.addEventListener('mouseleave', () => {
            anime({
                targets: card,
                translateY: 0,
                boxShadow: '0 5px 15px rgba(0, 0, 0, 0.05)',
                duration: 300,
                easing: 'easeOutQuad'
            });
        });
    });
    
    // Animate team members
    const teamMembers = document.querySelectorAll('.team-member');
    teamMembers.forEach((member, index) => {
        // Add staggered entrance animation
        anime({
            targets: member,
            translateX: [-50, 0],
            opacity: [0, 1],
            delay: index * 300,
            duration: 1000,
            easing: 'easeOutElastic(1, .5)'
        });
        
        // Add hover animation for photos
        const photo = member.querySelector('.team-photo');
        if (photo) {
            member.addEventListener('mouseenter', () => {
                anime({
                    targets: photo,
                    scale: 1.05,
                    duration: 400,
                    easing: 'easeOutQuad'
                });
            });
            
            member.addEventListener('mouseleave', () => {
                anime({
                    targets: photo,
                    scale: 1,
                    duration: 400,
                    easing: 'easeOutQuad'
                });
            });
        }
    });
    
    // Animate steps in Get Involved section
    const steps = document.querySelectorAll('.step');
    steps.forEach((step, index) => {
        // Add staggered entrance animation
        anime({
            targets: step,
            translateY: [30, 0],
            opacity: [0, 1],
            delay: index * 200,
            duration: 800,
            easing: 'easeOutQuad'
        });
        
        // Add icon animation
        const icon = step.querySelector('i');
        if (icon) {
            step.addEventListener('mouseenter', () => {
                anime({
                    targets: icon,
                    rotate: [0, 360],
                    scale: [1, 1.2, 1],
                    duration: 800,
                    easing: 'easeOutElastic(1, .5)'
                });
            });
        }
    });
    
    // Animate buttons in Get Involved section
    const getInvolvedButtons = document.querySelectorAll('.get-involved-buttons .btn');
    getInvolvedButtons.forEach((button, index) => {
        // Add staggered entrance animation
        anime({
            targets: button,
            translateY: [20, 0],
            opacity: [0, 1],
            delay: 1000 + (index * 150),
            duration: 600,
            easing: 'easeOutQuad'
        });
    });
}); 