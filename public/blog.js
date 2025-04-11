document.addEventListener('DOMContentLoaded', function() {
    // Initialize blog functionality
    initBlog();
});

function initBlog() {
    // Handle newsletter form submission
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', handleNewsletterSubmit);
    }

    // Initialize category filters
    initCategoryFilters();

    // Load more posts when scrolling
    initInfiniteScroll();
}

function handleNewsletterSubmit(event) {
    event.preventDefault();
    const emailInput = event.target.querySelector('input[type="email"]');
    const email = emailInput.value;

    // Validate email
    if (!isValidEmail(email)) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }

    // Simulate API call to subscribe
    subscribeToNewsletter(email)
        .then(response => {
            showNotification('Thank you for subscribing to our newsletter!', 'success');
            emailInput.value = '';
        })
        .catch(error => {
            showNotification('An error occurred. Please try again later.', 'error');
        });
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function subscribeToNewsletter(email) {
    // Simulate API call
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // Simulate 90% success rate
            if (Math.random() > 0.1) {
                resolve({ success: true });
            } else {
                reject(new Error('Subscription failed'));
            }
        }, 1000);
    });
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    document.body.appendChild(notification);

    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function initCategoryFilters() {
    const categoryLinks = document.querySelectorAll('.categories a');
    categoryLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const category = event.target.textContent;
            filterPostsByCategory(category);
        });
    });
}

function filterPostsByCategory(category) {
    // Simulate filtering posts
    const posts = document.querySelectorAll('.blog-post');
    posts.forEach(post => {
        const postCategory = post.querySelector('.category').textContent;
        if (category === 'All' || postCategory === category) {
            post.style.display = 'block';
        } else {
            post.style.display = 'none';
        }
    });
}

function initInfiniteScroll() {
    let isLoading = false;
    let page = 1;

    window.addEventListener('scroll', () => {
        if (isLoading) return;

        const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
        if (scrollTop + clientHeight >= scrollHeight - 5) {
            loadMorePosts();
        }
    });
}

function loadMorePosts() {
    isLoading = true;
    page++;

    // Simulate loading more posts
    setTimeout(() => {
        // Add loading indicator
        const loadingIndicator = document.createElement('div');
        loadingIndicator.className = 'loading-indicator';
        loadingIndicator.textContent = 'Loading more posts...';
        document.querySelector('.blog-grid').appendChild(loadingIndicator);

        // Simulate API call to get more posts
        fetchMorePosts(page)
            .then(posts => {
                // Remove loading indicator
                loadingIndicator.remove();

                // Add new posts to the grid
                posts.forEach(post => {
                    const postElement = createPostElement(post);
                    document.querySelector('.blog-grid').appendChild(postElement);
                });

                isLoading = false;
            })
            .catch(error => {
                loadingIndicator.remove();
                showNotification('Error loading more posts', 'error');
                isLoading = false;
            });
    }, 1000);
}

function fetchMorePosts(page) {
    // Simulate API call
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([
                {
                    title: 'New Tree Species Discovered in Miami',
                    date: '2024-03-01',
                    category: 'Education',
                    image: 'blog/new-species.jpg',
                    excerpt: 'A new species of tree has been discovered in the Miami area...'
                },
                {
                    title: 'Tree Planting Workshop Success',
                    date: '2024-02-28',
                    category: 'Events',
                    image: 'blog/workshop.jpg',
                    excerpt: 'Our recent tree planting workshop was a great success...'
                }
            ]);
        }, 1000);
    });
}

function createPostElement(post) {
    const article = document.createElement('article');
    article.className = 'blog-post';
    article.innerHTML = `
        <div class="post-image">
            <img src="${post.image}" alt="${post.title}">
        </div>
        <div class="post-content">
            <div class="post-meta">
                <span class="date">${formatDate(post.date)}</span>
                <span class="category">${post.category}</span>
            </div>
            <h3>${post.title}</h3>
            <p>${post.excerpt}</p>
            <a href="#" class="read-more">Read More</a>
        </div>
    `;
    return article;
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
} 