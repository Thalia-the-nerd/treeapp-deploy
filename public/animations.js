// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Parallax scrolling effect
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const parallaxElements = document.querySelectorAll('.parallax:not(header h1)');
        
        parallaxElements.forEach(element => {
            const speed = element.dataset.speed || 0.5;
            element.style.transform = `translateY(${scrolled * speed}px)`;
        });
    });

    // Hero section animations with enhanced effects
    const heroTitle = document.querySelector('#hero h2');
    const heroSubtitle = document.querySelector('#hero p');
    
    if (heroTitle) {
        anime({
            targets: heroTitle,
            translateY: [50, 0],
            opacity: [0, 1],
            duration: 1000,
            easing: 'easeOutExpo',
            complete: () => {
                // Add a subtle floating animation after initial load
                anime({
                    targets: heroTitle,
                    translateY: ['0px', '-10px'],
                    duration: 2000,
                    direction: 'alternate',
                    loop: true,
                    easing: 'easeInOutSine'
                });
            }
        });
    }

    if (heroSubtitle) {
        anime({
            targets: heroSubtitle,
            translateY: [30, 0],
            opacity: [0, 1],
            duration: 1000,
            delay: 300,
            easing: 'easeOutExpo'
        });
    }

    // Navigation menu items animation with hover effect
    const navItems = document.querySelectorAll('nav ul li');
    anime({
        targets: navItems,
        translateX: [-20, 0],
        opacity: [0, 1],
        duration: 800,
        delay: anime.stagger(100),
        easing: 'easeOutExpo'
    });

    // Add hover effect to navigation items
    navItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            anime({
                targets: item,
                scale: 1.1,
                duration: 300,
                easing: 'easeOutElastic(1, .5)'
            });
        });
        
        item.addEventListener('mouseleave', () => {
            anime({
                targets: item,
                scale: 1,
                duration: 300,
                easing: 'easeOutElastic(1, .5)'
            });
        });
    });

    // Scroll animations for all sections with enhanced effects
    const sections = document.querySelectorAll('section');
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Animate section title with enhanced effect
                const title = entry.target.querySelector('h2');
                if (title) {
                    anime({
                        targets: title,
                        translateY: [30, 0],
                        opacity: [0, 1],
                        duration: 800,
                        easing: 'easeOutExpo',
                        complete: () => {
                            // Add subtle pulse effect after title appears
                            anime({
                                targets: title,
                                scale: [1, 1.05, 1],
                                duration: 1000,
                                easing: 'easeInOutSine'
                            });
                        }
                    });
                }

                // Animate section content with enhanced stagger effect
                const content = entry.target.querySelector('.text-box, .steps, .team');
                if (content) {
                    const elements = content.children;
                    anime({
                        targets: elements,
                        translateY: [20, 0],
                        opacity: [0, 1],
                        duration: 800,
                        delay: anime.stagger(100),
                        easing: 'easeOutExpo'
                    });
                }

                sectionObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });

    sections.forEach(section => sectionObserver.observe(section));

    // Team member cards reveal animation with enhanced hover effect
    const teamMembers = document.querySelectorAll('.team-member');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                anime({
                    targets: entry.target,
                    translateY: [50, 0],
                    opacity: [0, 1],
                    duration: 800,
                    easing: 'easeOutExpo'
                });
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });

    teamMembers.forEach(member => {
        observer.observe(member);
        
        // Add hover effect to team member cards
        member.addEventListener('mouseenter', () => {
            anime({
                targets: member,
                scale: 1.05,
                duration: 300,
                easing: 'easeOutElastic(1, .5)'
            });
        });
        
        member.addEventListener('mouseleave', () => {
            anime({
                targets: member,
                scale: 1,
                duration: 300,
                easing: 'easeOutElastic(1, .5)'
            });
        });
    });

    // Step cards stagger animation with enhanced effect
    const steps = document.querySelectorAll('.step');
    const stepsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                anime({
                    targets: steps,
                    translateY: [30, 0],
                    opacity: [0, 1],
                    duration: 800,
                    delay: anime.stagger(200),
                    easing: 'easeOutExpo'
                });
                stepsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });

    steps.forEach(step => {
        stepsObserver.observe(step);
        
        // Add hover effect to step cards
        step.addEventListener('mouseenter', () => {
            anime({
                targets: step,
                scale: 1.05,
                duration: 300,
                easing: 'easeOutElastic(1, .5)'
            });
        });
        
        step.addEventListener('mouseleave', () => {
            anime({
                targets: step,
                scale: 1,
                duration: 300,
                easing: 'easeOutElastic(1, .5)'
            });
        });
    });

    // Smooth scroll behavior for navigation links with enhanced effect
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                anime({
                    targets: document.documentElement,
                    scrollTop: target.offsetTop,
                    duration: 1000,
                    easing: 'easeInOutQuad',
                    complete: () => {
                        // Add a subtle bounce effect to the target section
                        anime({
                            targets: target,
                            translateY: ['-10px', '0px'],
                            duration: 500,
                            easing: 'easeOutElastic(1, .5)'
                        });
                    }
                });
            }
        });
    });

    // Social media icons animation with enhanced effect
    const socialIcons = document.querySelectorAll('.social-media a');
    socialIcons.forEach(icon => {
        icon.addEventListener('mouseenter', () => {
            anime({
                targets: icon,
                scale: 1.2,
                rotate: 10,
                duration: 300,
                easing: 'easeOutElastic(1, .5)'
            });
        });
        
        icon.addEventListener('mouseleave', () => {
            anime({
                targets: icon,
                scale: 1,
                rotate: 0,
                duration: 300,
                easing: 'easeOutElastic(1, .5)'
            });
        });
    });
}); 