// Interactive Features Functionality
document.addEventListener('DOMContentLoaded', () => {
    // Newsletter Form
    const newsletterForm = document.getElementById('newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = newsletterForm.querySelector('input[type="email"]').value;
            
            try {
                // Here you would typically send this to your backend
                console.log('Newsletter subscription:', email);
                showNotification('Thank you for subscribing!', 'success');
                newsletterForm.reset();
            } catch (error) {
                showNotification('Error subscribing. Please try again.', 'error');
            }
        });
    }

    // Tree Counter Animation
    const treeCounter = document.getElementById('tree-counter');
    if (treeCounter) {
        const targetTrees = 10000; // Your target number
        const currentTrees = 0000; // Current number (this would come from your backend)
        
        anime({
            targets: treeCounter.querySelector('.number'),
            innerHTML: [0, currentTrees],
            round: 1,
            duration: 2000,
            easing: 'easeOutExpo',
            update: function(anim) {
                treeCounter.querySelector('.number').textContent = anim.animations[0].currentValue;
            }
        });
    }

    // Tree Calculator
    const treeCalculator = document.getElementById('tree-calculator');
    if (treeCalculator) {
        const calculateBtn = treeCalculator.querySelector('button');
        const results = treeCalculator.querySelector('.results');
        
        calculateBtn.addEventListener('click', () => {
            const treeCount = parseInt(treeCalculator.querySelector('input').value);
            if (treeCount > 0) {
                const co2Absorption = treeCount * 22; // kg per year
                const waterFiltered = treeCount * 1000; // gallons per year
                
                results.style.display = 'block';
                results.querySelector('.co2').textContent = co2Absorption;
                results.querySelector('.water').textContent = waterFiltered;
                
                // Animate the results
                anime({
                    targets: results.querySelectorAll('span'),
                    opacity: [0, 1],
                    translateY: [20, 0],
                    duration: 800,
                    delay: anime.stagger(100),
                    easing: 'easeOutExpo'
                });
            }
        });
    }

    // Gallery Preview
    const galleryPreview = document.getElementById('gallery-preview');
    if (galleryPreview) {
        const galleryGrid = galleryPreview.querySelector('.gallery-grid');
        
        // Sample gallery items (replace with your actual data)
        const sampleImages = [
            { src: 'tree1.jpg', alt: 'Tree Planting Event 1' },
            { src: 'tree2.jpg', alt: 'Tree Planting Event 2' },
            { src: 'tree3.jpg', alt: 'Tree Planting Event 3' },
            { src: 'tree4.jpg', alt: 'Tree Planting Event 4' },
            { src: 'tree5.jpg', alt: 'Tree Planting Event 5' },
            { src: 'tree6.jpg', alt: 'Tree Planting Event 6' }
        ];
        
        sampleImages.forEach(image => {
            const img = document.createElement('img');
            img.src = image.src;
            img.alt = image.alt;
            galleryGrid.appendChild(img);
        });
    }

    // Testimonials Slider
    const testimonials = document.getElementById('testimonials');
    if (testimonials) {
        const slider = testimonials.querySelector('.testimonial-slider');
        
        // Sample testimonials (replace with your actual data)
        const sampleTestimonials = [
            {
                text: "Planting trees with TreePlace.App was an amazing experience. The community is so welcoming and passionate about making Miami greener!",
                author: "Sarah Johnson"
            },
            {
                text: "I've never felt more connected to my community than when participating in tree planting events. It's truly making a difference.",
                author: "Michael Rodriguez"
            },
            {
                text: "The impact we're making is visible every day. My neighborhood is becoming more beautiful and sustainable thanks to TreePlace.App.",
                author: "Lisa Chen"
            }
        ];
        
        let currentTestimonial = 0;
        
        function showTestimonial(index) {
            const testimonial = sampleTestimonials[index];
            slider.innerHTML = `
                <div class="testimonial">
                    <p>${testimonial.text}</p>
                    <div class="author">- ${testimonial.author}</div>
                </div>
            `;
            
            // Animate the testimonial
            anime({
                targets: slider.querySelector('.testimonial'),
                opacity: [0, 1],
                translateY: [20, 0],
                duration: 800,
                easing: 'easeOutExpo'
            });
        }
        
        // Show first testimonial
        showTestimonial(currentTestimonial);
        
        // Auto-rotate testimonials
        setInterval(() => {
            currentTestimonial = (currentTestimonial + 1) % sampleTestimonials.length;
            showTestimonial(currentTestimonial);
        }, 5000);
    }
});

// Notification System
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Add show class after a small delay to trigger animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
} 