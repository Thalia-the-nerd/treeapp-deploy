// Main script for TreePlace.App
document.addEventListener("DOMContentLoaded", () => {
  // Initialize dark mode toggle
  const darkModeToggle = document.getElementById("dark-mode-toggle");
  const body = document.body;

  const enableDarkMode = () => {
    body.classList.add("dark-mode");
    localStorage.setItem("darkMode", "enabled");
    const icon = darkModeToggle.querySelector("i");
    if (icon) {
      icon.classList.remove("fa-moon");
      icon.classList.add("fa-sun");
    }
  };

  const disableDarkMode = () => {
    body.classList.remove("dark-mode");
    localStorage.setItem("darkMode", "disabled");
    const icon = darkModeToggle.querySelector("i");
    if (icon) {
      icon.classList.remove("fa-sun");
      icon.classList.add("fa-moon");
    }
  };

  if (localStorage.getItem("darkMode") === "enabled") {
    enableDarkMode();
  }

  if (darkModeToggle) {
    darkModeToggle.addEventListener("click", () => {
      if (localStorage.getItem("darkMode") !== "enabled") {
        enableDarkMode();
      } else {
        disableDarkMode();
      }
    });
  }

  // Initialize language selector
  const languageSelect = document.getElementById("language-select");
  if (languageSelect) {
    const translations = {
      en: {
        home: "Home",
        about: "About",
        locations: "Locations",
        contact: "Contact",
        // Add more translations as needed
      },
      es: {
        home: "Inicio",
        about: "Acerca de",
        locations: "Ubicaciones",
        contact: "Contacto",
        // Add more translations as needed
      },
    };

    function updateLanguage(lang) {
      document.querySelectorAll("[data-translate]").forEach((element) => {
        const key = element.getAttribute("data-translate");
        if (translations[lang] && translations[lang][key]) {
          element.textContent = translations[lang][key];
        }
      });
      // Store language preference
      localStorage.setItem("preferred-language", lang);
    }

    languageSelect.addEventListener("change", () => {
      const selectedLanguage = languageSelect.value;
      updateLanguage(selectedLanguage);
    });

    // Load saved language preference
    const savedLanguage = localStorage.getItem("preferred-language");
    if (savedLanguage && translations[savedLanguage]) {
      languageSelect.value = savedLanguage;
      updateLanguage(savedLanguage);
    }
  }

  // Function to fetch and update stats
  async function updateStats() {
    try {
      const response = await fetch("/api/stats");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const stats = await response.json();

      let totalTrees = 0;
      if (stats && typeof stats === "object") {
        // If stats is an object, calculate totalTrees
        totalTrees = Object.values(stats).reduce((acc, val) => {
          if (typeof val === "number") {
            return acc + val;
          }
          return acc;
        }, 0);
      } else {
        // Fallback for older data format
        totalTrees = stats || 0;
      }

      // Update total trees planted
      stats.total_trees_planted = totalTrees;

      // Calculate derived stats
      stats.total_co2_reduction_tons = Math.round(totalTrees * 0.022); // 22kg CO2 per tree per year = 0.022 tons
      stats.total_water_saved_gallons = totalTrees * 100; // 100 gallons per tree per year

      // Update tree counter
      const treeCounter = document.getElementById("tree-counter");
      if (treeCounter) {
        const numberElement = treeCounter.querySelector(".number");
        if (numberElement) {
          numberElement.textContent = totalTrees;
        }
      }

      // Update stats in the impact section
      const treeCount = document.getElementById("tree-count");
      const co2Reduction = document.getElementById("co2-reduction");
      const waterSaved = document.getElementById("water-saved");

      if (treeCount) treeCount.textContent = totalTrees;
      if (co2Reduction)
        co2Reduction.textContent = stats.total_co2_reduction_tons;
      if (waterSaved) waterSaved.textContent = stats.total_water_saved_gallons;

      // Update location stats if they exist
      const locationStats = document.querySelectorAll(".location-stat");
      locationStats.forEach((stat) => {
        const locationName = stat.getAttribute("data-location");
        if (locationName && stats[locationName]) {
          const numberElement = stat.querySelector(".number");
          if (numberElement) {
            numberElement.textContent = stats[locationName];
          }
        }
      });
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  }

  // Update stats when the page loads
  updateStats();

  // Update stats every 5 minutes
  setInterval(updateStats, 5 * 60 * 1000);

  // Initialize tree calculator
  const treeCalculator = document.getElementById("tree-calculator");
  if (treeCalculator) {
    const calculateButton = treeCalculator.querySelector(".btn");
    const results = treeCalculator.querySelector(".results");
    const co2Element = results.querySelector(".co2");
    const waterElement = results.querySelector(".water");

    if (calculateButton && results && co2Element && waterElement) {
      calculateButton.addEventListener("click", () => {
        const input = treeCalculator.querySelector("input");
        if (input && input.value) {
          const treeCount = parseInt(input.value);
          if (isNaN(treeCount) || treeCount < 0) {
            showNotification(
              "Please enter a valid positive number of trees",
              "error",
            );
            return;
          }
          const co2Amount = treeCount * 22; // kg per year
          const waterAmount = treeCount * 100; // gallons per year

          results.style.display = "block";

          anime({
            targets: co2Element,
            innerHTML: [0, co2Amount],
            round: 1,
            duration: 1500,
            easing: "easeOutExpo",
          });

          anime({
            targets: waterElement,
            innerHTML: [0, waterAmount],
            round: 1,
            duration: 1500,
            easing: "easeOutExpo",
          });
        }
      });
    }
  }

  // Initialize parallax effects
  const parallaxElements = document.querySelectorAll(".parallax");
  if (parallaxElements.length > 0) {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;

      parallaxElements.forEach((element) => {
        const speed = parseFloat(element.getAttribute("data-speed") || 0.5);
        const yPos = -(scrollPosition * speed);
        element.style.transform = `translateY(${yPos}px)`;
      });
    };

    window.addEventListener("scroll", handleScroll);

    // Cleanup function
    const cleanup = () => {
      window.removeEventListener("scroll", handleScroll);
    };

    // Clean up on page unload
    window.addEventListener("unload", cleanup);
  }

  // Mobile Menu Functionality
  const hamburgerMenu = document.getElementById("hamburger-menu");
  const mainNav = document.getElementById("main-nav");
  const header = document.querySelector("header");
  const body = document.body;
  let lastScrollTop = 0;
  let isScrolling = false;

  if (hamburgerMenu && mainNav) {
    const toggleMenu = (show) => {
      mainNav.classList.toggle("active", show);
      hamburgerMenu.classList.toggle("active", show);
      body.classList.toggle("menu-open", show);

      // Toggle between hamburger and close icon
      const icon = hamburgerMenu.querySelector("i");
      if (icon) {
        icon.classList.toggle("fa-bars", !show);
        icon.classList.toggle("fa-times", show);
      }
    };

    hamburgerMenu.addEventListener("click", () => {
      toggleMenu(!mainNav.classList.contains("active"));
    });

    // Close menu when clicking outside
    document.addEventListener("click", (event) => {
      if (
        !mainNav.contains(event.target) &&
        !hamburgerMenu.contains(event.target) &&
        mainNav.classList.contains("active")
      ) {
        toggleMenu(false);
      }
    });

    // Close menu when clicking a link
    mainNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        toggleMenu(false);
      });
    });

    // Handle scroll behavior
    window.addEventListener("scroll", () => {
      if (!isScrolling) {
        window.requestAnimationFrame(() => {
          const scrollTop =
            window.pageYOffset || document.documentElement.scrollTop;

          // Don't hide header if menu is open
          if (!mainNav.classList.contains("active")) {
            if (scrollTop > lastScrollTop && scrollTop > 100) {
              // Scrolling down
              header.classList.add("nav-hidden");
            } else {
              // Scrolling up
              header.classList.remove("nav-hidden");
            }
          }

          lastScrollTop = scrollTop;
          isScrolling = false;
        });
      }
      isScrolling = true;
    });

    // Close menu on window resize
    window.addEventListener("resize", () => {
      if (window.innerWidth > 768) {
        toggleMenu(false);
      }
    });

    // Handle keyboard navigation
    hamburgerMenu.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        toggleMenu(!mainNav.classList.contains("active"));
      }
    });

    // Close menu with Escape key
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && mainNav.classList.contains("active")) {
        toggleMenu(false);
      }
    });
  }

  // Process steps animation
  const animateOnScroll = () => {
    const elements = document.querySelectorAll(".animate-on-scroll");

    elements.forEach((element) => {
      const elementPosition = element.getBoundingClientRect().top;
      const windowHeight = window.innerHeight;

      if (elementPosition < windowHeight - 100) {
        element.classList.add("is-visible");
      }
    });
  };

  window.addEventListener("scroll", animateOnScroll);
  animateOnScroll(); // Trigger on load
});

// Tree Counter and Stats Animation
function updateTreeStats() {
  const treeCount = document.getElementById("tree-count");
  const co2Reduction = document.getElementById("co2-reduction");
  const waterSaved = document.getElementById("water-saved");

  // Updated values to reflect 0 trees planted
  const stats = {
    trees: 0,
    co2Tons: 0,
    waterGallons: 0,
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
  if(treeCount) {
    animateValue(treeCount, 0, stats.trees, 2000);
  }
  if(co2Reduction) {
    animateValue(co2Reduction, 0, stats.co2Tons, 2000);
  }
  if(waterSaved) {
    animateValue(waterSaved, 0, stats.waterGallons, 2000);
  }
}

// Initialize stats when the page loads
document.addEventListener("DOMContentLoaded", () => {
  updateTreeStats();
});

// Update stats when the counter section comes into view
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        updateTreeStats();
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.5 },
);

const counterSection = document.getElementById("tree-counter-section");
if (counterSection) {
  observer.observe(counterSection);
}

// --- animations.js ---
// Animations for TreePlace.App
document.addEventListener("DOMContentLoaded", () => {
  // Tree Counter Animation
  const treeCounter = document.getElementById("tree-counter");
  if (treeCounter) {
    const numberElement = treeCounter.querySelector(".number");
    if (numberElement) {
      numberElement.textContent = "0";
    }
  }

  // Tree Counter Animation for How It Works page
  const treeCounterHowItWorks = document.getElementById(
    "tree-counter-how-it-works",
  );
  if (treeCounterHowItWorks) {
    const numberElement = treeCounterHowItWorks.querySelector(".number");
    if (numberElement) {
      numberElement.textContent = "0";
    }
  }

  // Process Steps Animation
  const animateOnScroll = () => {
    const elements = document.querySelectorAll(".animate-on-scroll");

    elements.forEach((element) => {
      const elementPosition = element.getBoundingClientRect().top;
      const windowHeight = window.innerHeight;

      if (elementPosition < windowHeight - 100) {
        element.classList.add("visible");
      }
    });
  };

  // Run animation on page load and scroll
  window.addEventListener("load", animateOnScroll);
  window.addEventListener("scroll", animateOnScroll);

  // Animate feature cards
  const featureCards = document.querySelectorAll(".feature-card");
  featureCards.forEach((card, index) => {
    // Add staggered entrance animation
    anime({
      targets: card,
      translateY: [50, 0],
      translateZ: 0,
      opacity: [0, 1],
      delay: index * 200,
      duration: 800,
      easing: "easeOutQuad",
    });

    // Add hover animation
    card.addEventListener("mouseenter", () => {
      anime({
        targets: card,
        translateY: -10,
        boxShadow: "0 15px 30px rgba(0, 0, 0, 0.1)",
        duration: 300,
        easing: "easeOutQuad",
      });
    });

    card.addEventListener("mouseleave", () => {
      anime({
        targets: card,
        translateY: 0,
        boxShadow: "0 5px 15px rgba(0, 0, 0, 0.05)",
        duration: 300,
        easing: "easeOutQuad",
      });
    });
  });

  // Animate team members
  const teamMembers = document.querySelectorAll(".team-member");
  teamMembers.forEach((member, index) => {
    // Add staggered entrance animation
    anime({
      targets: member,
      translateX: [-50, 0],
      translateZ: 0,
      opacity: [0, 1],
      delay: index * 300,
      duration: 1000,
      easing: "easeOutElastic(1, .5)",
    });

    // Add hover animation for photos
    const photo = member.querySelector(".team-photo");
    if (photo) {
      member.addEventListener("mouseenter", () => {
        anime({
          targets: photo,
          scale: 1.05,
          duration: 400,
          easing: "easeOutQuad",
        });
      });

      member.addEventListener("mouseleave", () => {
        anime({
          targets: photo,
          scale: 1,
          duration: 400,
          easing: "easeOutQuad",
        });
      });
    }
  });

  // Animate steps in Get Involved section
  const steps = document.querySelectorAll(".step");
  steps.forEach((step, index) => {
    // Add staggered entrance animation
    anime({
      targets: step,
      translateY: [30, 0],
      translateZ: 0,
      opacity: [0, 1],
      delay: index * 200,
      duration: 800,
      easing: "easeOutQuad",
    });

    // Add icon animation
    const icon = step.querySelector("i");
    if (icon) {
      step.addEventListener("mouseenter", () => {
        anime({
          targets: icon,
          rotate: [0, 360],
          scale: [1, 1.2, 1],
          duration: 800,
          easing: "easeOutElastic(1, .5)",
        });
      });
    }
  });

  // Animate buttons in Get Involved section
  const getInvolvedButtons = document.querySelectorAll(
    ".get-involved-buttons .btn",
  );
  getInvolvedButtons.forEach((button, index) => {
    // Add staggered entrance animation
    anime({
      targets: button,
      translateY: [20, 0],
      translateZ: 0,
      opacity: [0, 1],
      delay: 1000 + index * 150,
      duration: 600,
      easing: "easeOutQuad",
    });
  });

  // Tree Stories Animation
  const animateStories = () => {
    const storyCards = document.querySelectorAll(".story-card");

    storyCards.forEach((card, index) => {
      anime({
        targets: card,
        opacity: [0, 1],
        translateY: [20, 0],
        translateZ: 0,
        delay: index * 200,
        duration: 800,
        easing: "easeOutQuad",
      });
    });
  };

  // Urban Heat Impact Animation
  const animateHeatImpact = () => {
    const impactCards = document.querySelectorAll(".impact-card");

    impactCards.forEach((card, index) => {
      anime({
        targets: card,
        opacity: [0, 1],
        translateY: [20, 0],
        translateZ: 0,
        delay: index * 200,
        duration: 800,
        easing: "easeOutQuad",
      });
    });
  };

  // Wildlife Connection Animation
  const animateWildlife = () => {
    const wildlifeCards = document.querySelectorAll(".wildlife-card");

    wildlifeCards.forEach((card, index) => {
      anime({
        targets: card,
        opacity: [0, 1],
        translateY: [20, 0],
        translateZ: 0,
        delay: index * 200,
        duration: 800,
        easing: "easeOutQuad",
      });
    });
  };

  // Run animations when sections come into view
  const observerOptions = {
    threshold: 0.2,
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        if (entry.target.classList.contains("tree-stories-section")) {
          animateStories();
        } else if (entry.target.classList.contains("heat-impact-section")) {
          animateHeatImpact();
        } else if (entry.target.classList.contains("wildlife-section")) {
          animateWildlife();
        }
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observe new sections
  document
    .querySelectorAll(
      ".tree-stories-section, .heat-impact-section, .wildlife-section",
    )
    .forEach((section) => {
      observer.observe(section);
    });
});

// --- interactive.js ---
// Interactive Features Functionality
document.addEventListener("DOMContentLoaded", () => {
  // Newsletter Form
  const newsletterForm = document.getElementById("newsletter-form");
  if (newsletterForm) {
    newsletterForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = newsletterForm.querySelector('input[type="email"]').value;

      try {
        // Here you would typically send this to your backend
        console.log("Newsletter subscription:", email);
        showNotification("Thank you for subscribing!", "success");
        newsletterForm.reset();
      } catch (error) {
        showNotification("Error subscribing. Please try again.", "error");
      }
    });
  }

  // Tree Counter Animation
  const treeCounter = document.getElementById("tree-counter");
  if (treeCounter) {
    const numberElement = treeCounter.querySelector(".number");
    if (numberElement) {
      numberElement.textContent = "0";
    }
  }

  // Tree Calculator
  const treeCalculator = document.getElementById("tree-calculator");
  if (treeCalculator) {
    const calculateBtn = treeCalculator.querySelector("button");
    const results = treeCalculator.querySelector(".results");

    calculateBtn.addEventListener("click", () => {
      const treeCount = parseInt(treeCalculator.querySelector("input").value);
      if (treeCount > 0) {
        const co2Absorption = treeCount * 22; // kg per year
        const waterFiltered = treeCount * 1000; // gallons per year

        results.style.display = "block";
        results.querySelector(".co2").textContent = co2Absorption;
        results.querySelector(".water").textContent = waterFiltered;

        // Animate the results
        anime({
          targets: results.querySelectorAll("span"),
          opacity: [0, 1],
          translateY: [20, 0],
          duration: 800,
          delay: anime.stagger(100),
          easing: "easeOutExpo",
        });
      }
    });
  }

  // Gallery Preview
  const galleryPreview = document.getElementById("gallery-preview");
  if (galleryPreview) {
    const galleryGrid = galleryPreview.querySelector(".gallery-grid");

    // Sample gallery items (replace with your actual data)
    const sampleImages = [
      { src: "tree1.jpg", alt: "Tree Planting Event 1" },
      { src: "tree2.jpg", alt: "Tree Planting Event 2" },
      { src: "tree3.jpg", alt: "Tree Planting Event 3" },
      { src: "tree4.jpg", alt: "Tree Planting Event 4" },
      { src: "tree5.jpg", alt: "Tree Planting Event 5" },
      { src: "tree6.jpg", alt: "Tree Planting Event 6" },
    ];

    sampleImages.forEach((image) => {
      const img = document.createElement("img");
      img.src = image.src;
      img.alt = image.alt;
      img.onerror = () => {
        img.src = "placeholder.jpg"; // Fallback image
        img.alt = "Image not available";
      };
      galleryGrid.appendChild(img);
    });
  }

  // Testimonials Slider
  const testimonials = document.getElementById("testimonials");
  if (testimonials) {
    const slider = testimonials.querySelector(".testimonial-slider");

    // Sample testimonials (replace with your actual data)
    const sampleTestimonials = [
      {
        text: "Planting trees with TreePlace.App was an amazing experience. The community is so welcoming and passionate about making Miami greener!",
        author: "Sarah Johnson",
      },
      {
        text: "I've never felt more connected to my community than when participating in tree planting events. It's truly making a difference.",
        author: "Michael Rodriguez",
      },
      {
        text: "The impact we're making is visible every day. My neighborhood is becoming more beautiful and sustainable thanks to TreePlace.App.",
        author: "Lisa Chen",
      },
    ];

    let currentTestimonial = 0;
    let testimonialInterval;

    function showTestimonial(index) {
      const testimonial = sampleTestimonials[index];
      slider.innerHTML = ""; // Clear the slider
      const testimonialElement = document.createElement("div");
      testimonialElement.classList.add("testimonial");
      testimonialElement.innerHTML = `
        <p>${testimonial.text}</p>
        <div class="author">- ${testimonial.author}</div>
      `;
      slider.appendChild(testimonialElement);

      // Animate the testimonial
      anime({
        targets: slider.querySelector(".testimonial"),
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 800,
        easing: "easeOutExpo",
      });
    }

    // Show first testimonial
    showTestimonial(currentTestimonial);

    // Auto-rotate testimonials
    testimonialInterval = setInterval(() => {
      currentTestimonial = (currentTestimonial + 1) % sampleTestimonials.length;
      showTestimonial(currentTestimonial);
    }, 5000);

    // Cleanup function
    const cleanup = () => {
      if (testimonialInterval) {
        clearInterval(testimonialInterval);
      }
    };

    // Clean up on page unload
    window.addEventListener("unload", cleanup);
  }
});

// Notification System
function showNotification(message, type = "info") {
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.textContent = message;

  document.body.appendChild(notification);

  // Add show class after a small delay to trigger animation
  setTimeout(() => {
    notification.classList.add("show");
  }, 10);

  // Remove notification after 3 seconds
  setTimeout(() => {
    notification.classList.remove("show");
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
}

// --- technical.js ---
// Technical Improvements Functionality
document.addEventListener("DOMContentLoaded", () => {
  // Dark Mode Toggle
  const darkModeToggle = document.getElementById("dark-mode-toggle");
  const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");

  // Check for saved theme preference or use system preference
  const currentTheme =
    localStorage.getItem("theme") ||
    (prefersDarkScheme.matches ? "dark" : "light");

  if (currentTheme === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
    darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
  }

  darkModeToggle.addEventListener("click", () => {
    const isDark =
      document.documentElement.getAttribute("data-theme") === "dark";

    if (isDark) {
      document.documentElement.removeAttribute("data-theme");
      darkModeToggle.innerHTML = '<i class="fas fa-moon"></i>';
      localStorage.setItem("theme", "light");
    } else {
      document.documentElement.setAttribute("data-theme", "dark");
      darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
      localStorage.setItem("theme", "dark");
    }

    // Animate the toggle
    anime({
      targets: darkModeToggle,
      rotate: [0, 360],
      duration: 500,
      easing: "easeOutElastic(1, .5)",
    });
  });

  // Language Selector
  const languageSelect = document.getElementById("language-select");
  if(languageSelect) {
    const currentLang = localStorage.getItem("language") || "en";

    languageSelect.value = currentLang;

    languageSelect.addEventListener("change", (e) => {
      const newLang = e.target.value;
      localStorage.setItem("language", newLang);

      // Here you would typically load the language file and update the UI
      // For now, we'll just show a notification
      showNotification(`Language changed to ${newLang}`, "info");
    });
  }


  // Search Functionality
  const searchInput = document.getElementById("search-input");
  const searchButton = document.getElementById("search-button");

  if(searchInput && searchButton) {
    let searchTimeout;

    searchInput.addEventListener("input", (e) => {
      clearTimeout(searchTimeout);

      searchTimeout = setTimeout(() => {
        const query = e.target.value.trim();
        if (query.length >= 2) {
          performSearch(query);
        }
      }, 300);
    });

    searchButton.addEventListener("click", () => {
      const query = searchInput.value.trim();
      if (query) {
        performSearch(query);
      }
    });
  }


  function performSearch(query) {
    try {
      // Here you would typically make an API call to your backend
      // For now, we'll just show a notification
      showNotification(`Searching for: ${query}`, "info");

      // Animate the search button
      anime({
        targets: searchButton,
        scale: [1, 1.2, 1],
        duration: 300,
        easing: "easeOutElastic(1, .5)",
      });
    } catch (error) {
      showNotification("An error occurred while searching.", "error");
    }
  }

  // Mobile Menu Toggle
  const headerControls = document.querySelector(".header-controls");
  const menuButton = document.createElement("button");
  menuButton.className = "menu-toggle";
  menuButton.innerHTML = '<i class="fas fa-bars"></i>';

  if(headerControls) {
    document
      .querySelector("header .container")
      .insertBefore(menuButton, headerControls);

    menuButton.addEventListener("click", () => {
      headerControls.classList.toggle("mobile-visible");

      // Animate the menu button
      anime({
        targets: menuButton,
        rotate: [0, 90],
        duration: 300,
        easing: "easeOutElastic(1, .5)",
      });
    });
  }


  // Close mobile menu when clicking outside
  document.addEventListener("click", (e) => {
    if (
      headerControls &&
      !headerControls.contains(e.target) &&
      !menuButton.contains(e.target) &&
      headerControls.classList.contains("mobile-visible")
    ) {
      headerControls.classList.remove("mobile-visible");
    }
  });
});


// Notification System
function showNotification(message, type = "info") {
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.textContent = message;

  document.body.appendChild(notification);

  // Add show class after a small delay to trigger animation
  setTimeout(() => {
    notification.classList.add("show");
  }, 10);

  // Remove notification after 3 seconds
  setTimeout(() => {
    notification.classList.remove("show");
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
}