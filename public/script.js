async function processDonation(amount) {
  const response = await fetch('https://your-worker-url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: paymentToken })
  })
  const { success } = await response.json()
  if (success) {
    alert('Payment successful!');
  } else {
    alert('Payment failed. Please try again.');
  }
}

// Loading Animation
document.addEventListener('DOMContentLoaded', () => {
    const loadingOverlay = document.createElement('div');
    loadingOverlay.className = 'loading-overlay';
    loadingOverlay.innerHTML = '<div class="loading-spinner"></div>';
    document.body.appendChild(loadingOverlay);

    // Hide loading overlay after 2 seconds
    setTimeout(() => {
        loadingOverlay.style.opacity = '0';
        setTimeout(() => {
            loadingOverlay.remove();
        }, 500);
    }, 2000);
});

// Scroll to Top Button
const scrollTopButton = document.createElement('button');
scrollTopButton.className = 'scroll-top';
scrollTopButton.innerHTML = '<i class="fas fa-arrow-up"></i>';
scrollTopButton.setAttribute('aria-label', 'Scroll to top');
document.body.appendChild(scrollTopButton);

window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
        scrollTopButton.classList.add('visible');
    } else {
        scrollTopButton.classList.remove('visible');
    }
});

scrollTopButton.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Skip to Main Content Link
const skipLink = document.createElement('a');
skipLink.href = '#main-content';
skipLink.className = 'skip-link';
skipLink.textContent = 'Skip to main content';
document.body.insertBefore(skipLink, document.body.firstChild);

// Intersection Observer for Fade-in Animations
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Add fade-in animation to sections
document.querySelectorAll('.section').forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(20px)';
    section.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
    observer.observe(section);
});

// Add fade-in class
document.head.insertAdjacentHTML('beforeend', `
    <style>
        .fade-in {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
    </style>
`);

// Lazy Loading Images
document.addEventListener('DOMContentLoaded', () => {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                observer.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));
});

// Mobile Menu Toggle
const createMobileMenu = () => {
    const header = document.querySelector('header');
    const nav = header.querySelector('nav');
    const menuButton = document.createElement('button');
    menuButton.className = 'mobile-menu-button';
    menuButton.setAttribute('aria-label', 'Toggle menu');
    menuButton.innerHTML = '<i class="fas fa-bars"></i>';
    
    header.insertBefore(menuButton, nav);
    
    menuButton.addEventListener('click', () => {
        nav.classList.toggle('active');
        menuButton.innerHTML = nav.classList.contains('active') 
            ? '<i class="fas fa-times"></i>' 
            : '<i class="fas fa-bars"></i>';
    });
};

// Initialize mobile menu on small screens
if (window.innerWidth <= 768) {
    createMobileMenu();
}

// Handle window resize
window.addEventListener('resize', () => {
    if (window.innerWidth <= 768) {
        if (!document.querySelector('.mobile-menu-button')) {
            createMobileMenu();
        }
    } else {
        const menuButton = document.querySelector('.mobile-menu-button');
        if (menuButton) {
            menuButton.remove();
            nav.classList.remove('active');
        }
    }
});