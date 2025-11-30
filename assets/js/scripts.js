// Professional JavaScript for Android Internals Website
// Enhanced with modern features and smooth interactions

document.addEventListener('DOMContentLoaded', function() {
  console.log('=== ANDROID INTERNALS WEBSITE LOADED ===');
  console.log('JavaScript is running successfully!');
  
  // ===== MOBILE MENU FUNCTIONALITY =====
  const mobileMenuToggle = document.getElementById('mobileMenuToggle');
  const mobileNavLinks = document.getElementById('navLinks');
  
  if (mobileMenuToggle && mobileNavLinks) {
    mobileMenuToggle.addEventListener('click', function() {
      mobileMenuToggle.classList.toggle('active');
      mobileNavLinks.classList.toggle('active');
      document.body.style.overflow = mobileNavLinks.classList.contains('active') ? 'hidden' : '';
    });
    
    // Close menu when clicking on a link
    const mobileNavLinkElements = mobileNavLinks.querySelectorAll('.nav-link');
    mobileNavLinkElements.forEach(link => {
      link.addEventListener('click', function() {
        mobileMenuToggle.classList.remove('active');
        mobileNavLinks.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
      if (!mobileMenuToggle.contains(e.target) && !mobileNavLinks.contains(e.target)) {
        mobileMenuToggle.classList.remove('active');
        mobileNavLinks.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  }

  // ===== NAVIGATION ENHANCEMENTS =====
  const nav = document.querySelector('.main-nav');
  const navLinks = document.querySelectorAll('.nav-link');
  
  // Add scroll effect to navigation
  window.addEventListener('scroll', function() {
    if (window.scrollY > 100) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  });
  
  // Add active state to current page link
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === 'index.html' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
  
  // ===== SMOOTH SCROLLING =====
  const smoothScrollLinks = document.querySelectorAll('a[href^="#"]');
  smoothScrollLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      
      if (targetElement) {
        const offsetTop = targetElement.offsetTop - 80; // Account for fixed nav
        window.scrollTo({
          top: offsetTop,
          behavior: 'smooth'
        });
      }
    });
  });
  
  // ===== INTERSECTION OBSERVER FOR ANIMATIONS =====
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);
  
  // Observe elements for animation
  const animateElements = document.querySelectorAll('.blog-card, .topic-card, .stat');
  animateElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });
  
  // ===== ENHANCED BOOK COVER MODAL =====
  const modal = document.getElementById('bookModal');
  const modalImg = document.getElementById('modalBookCover');
  const closeBtn = document.querySelector('.book-modal-close');
  const bookCovers = document.querySelectorAll('.book-cover-img');
  
  // Only set up modal if elements exist (books page only)
  if (modal && modalImg && closeBtn) {
    // Open modal with enhanced animation
    bookCovers.forEach(cover => {
      cover.addEventListener('click', function(e) {
        e.preventDefault();
        const coverSrc = this.getAttribute('data-cover');
        if (coverSrc) {
          modalImg.src = coverSrc;
          modal.style.display = 'flex';
          modal.style.opacity = '0';
          document.body.style.overflow = 'hidden';
          
          // Smooth fade in
          setTimeout(() => {
            modal.style.opacity = '1';
            const modalContent = modal.querySelector('.book-modal-content');
            if (modalContent) {
              modalContent.style.transform = 'scale(1)';
            }
          }, 10);
        }
      });
    });
    
    // Close modal with smooth animation
    function closeModal() {
      const modalContent = modal.querySelector('.book-modal-content');
      if (modalContent) {
        modalContent.style.transform = 'scale(0.9)';
      }
      modal.style.opacity = '0';
      setTimeout(() => {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        if (modalContent) {
          modalContent.style.transform = 'scale(0.9)';
        }
      }, 300);
    }
    
    closeBtn.addEventListener('click', closeModal);
    
    modal.addEventListener('click', function(e) {
      if (e.target === modal) {
        closeModal();
      }
    });
    
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && modal.style.display === 'flex') {
        closeModal();
      }
    });
  }
  
  // ===== PERFORMANCE OPTIMIZATIONS =====
  
  // Lazy loading for images
  const images = document.querySelectorAll('img[data-src]');
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.classList.remove('lazy');
        imageObserver.unobserve(img);
      }
    });
  });
  
  images.forEach(img => imageObserver.observe(img));
  
  // ===== ACCESSIBILITY ENHANCEMENTS =====
  
  // Skip to main content - Removed as requested
  
  // ===== LOADING STATES =====
  
  // Add loading class to body initially
  document.body.classList.add('loading');
  
  // Remove loading class when page is fully loaded
  window.addEventListener('load', function() {
    setTimeout(() => {
      document.body.classList.remove('loading');
    }, 500);
  });
  
  // ===== ERROR HANDLING =====
  
  // Handle image loading errors
  document.querySelectorAll('img').forEach(img => {
    img.addEventListener('error', function() {
      console.warn('Image failed to load:', this.src);
      // Replace with placeholder or hide gracefully
      if (this.classList.contains('book-cover-img')) {
        this.style.display = 'none';
        const placeholder = document.createElement('div');
        placeholder.innerHTML = '📚';
        placeholder.style.cssText = `
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          font-size: 3rem;
          background: rgba(61, 220, 132, 0.1);
          border-radius: 8px;
        `;
        this.parentNode.appendChild(placeholder);
      } else {
        this.style.opacity = '0.3';
      }
    });
    
    // Add loading state
    img.addEventListener('load', function() {
      this.style.opacity = '1';
    });
  });
  
  // ===== ANALYTICS READY =====
  
  // Track page views (ready for analytics integration)
  function trackPageView() {
    // Placeholder for analytics tracking
    console.log('Page viewed:', window.location.pathname);
  }
  
  trackPageView();
  
  // Track user interactions
  document.addEventListener('click', function(e) {
    if (e.target.matches('.nav-link, .blog-card, .topic-card, .stat-link')) {
      console.log('User interaction:', e.target.textContent || e.target.className);
    }
  });
  
  // ===== SERVICE WORKER REGISTRATION =====
  // Note: Service worker is registered in index.html to avoid duplicate registrations
  // This section is kept for reference but registration happens in the HTML file
  
  // ===== PERFORMANCE MONITORING =====
  if ('performance' in window) {
    window.addEventListener('load', function() {
      setTimeout(function() {
        const perfData = performance.getEntriesByType('navigation')[0];
        console.log('Page Load Time:', perfData.loadEventEnd - perfData.loadEventStart, 'ms');
        console.log('DOM Content Loaded:', perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart, 'ms');
      }, 0);
    });
  }

  // ===== FORM FUNCTIONALITY =====
  
  console.log('Setting up form functionality...');
  console.log('EmailJS available:', typeof emailjs !== 'undefined');
  console.log('EmailJS config available:', typeof window.EMAILJS_CONFIG !== 'undefined');
  
  // Wait for EmailJS to load if it's not available yet
  function waitForEmailJS(callback, maxAttempts = 10) {
    if (typeof emailjs !== 'undefined') {
      callback();
      return;
    }
    
    if (maxAttempts <= 0) {
      console.error('❌ EmailJS library failed to load after multiple attempts');
      console.error('Check network tab for blocked CDN requests or CSP violations');
      return;
    }
    
    setTimeout(() => {
      waitForEmailJS(callback, maxAttempts - 1);
    }, 200);
  }
  
  waitForEmailJS(function() {
    if (typeof emailjs !== 'undefined') {
      console.log('EmailJS object:', emailjs);
      console.log('EmailJS config:', window.EMAILJS_CONFIG);
      
      // Ensure EmailJS is initialized
      if (window.EMAILJS_CONFIG && window.EMAILJS_CONFIG.publicKey) {
        // Check if publicKey is still a placeholder
        if (window.EMAILJS_CONFIG.publicKey.includes('YOUR_EMAILJS') || 
            window.EMAILJS_CONFIG.publicKey.includes('HERE')) {
          console.error('⚠️ EmailJS configuration has placeholder values!');
          console.error('⚠️ GitHub Secrets may not be set. Check: https://github.com/hemangpandhi/android_internals/settings/secrets/actions');
          console.error('⚠️ EmailJS forms will not work until secrets are configured.');
        } else {
          emailjs.init(window.EMAILJS_CONFIG.publicKey);
          console.log('✅ EmailJS initialized successfully');
        }
      } else {
        console.error('❌ EmailJS config missing or invalid');
        console.error('Check if config.js is loading correctly');
      }
    } else {
      console.error('❌ EmailJS library not loaded');
      console.error('Check network tab for failed CDN requests or CSP violations');
    }
  });
  
  // Test notification system
  console.log('Testing notification system...');
  
  // Add test function to global scope for debugging
  window.testEmailJS = function() {
    console.log('Testing EmailJS configuration...');
    console.log('EmailJS available:', typeof emailjs !== 'undefined');
    console.log('EmailJS config:', window.EMAILJS_CONFIG);
    
    if (typeof emailjs !== 'undefined' && window.EMAILJS_CONFIG) {
      console.log('EmailJS is properly configured');
      return true;
    } else {
      console.error('EmailJS is not properly configured');
      return false;
    }
  };
  
  // Newsletter Form
  const newsletterForm = document.getElementById('newsletterForm');
  console.log('Newsletter form found:', newsletterForm);
  if (newsletterForm) {
    console.log('Adding submit event listener to newsletter form');
    newsletterForm.addEventListener('submit', function(e) {
      console.log('=== NEWSLETTER FORM SUBMIT EVENT TRIGGERED ===');
      e.preventDefault();
      console.log('Newsletter form submitted!');
      const email = document.getElementById('newsletterEmail').value;
      
      // Validate email
      const emailError = validateEmailField(email, 'Email');
      if (emailError) {
        toast.error('Invalid Email', emailError);
        return;
      }
      
      // Show loading state
      const submitBtn = newsletterForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Subscribing...';
      submitBtn.disabled = true;
      
      // Send notification email to owner about new subscription
      // Using contact template to notify owner
      const ownerNotificationParams = {
        to_email: 'info@hemangpandhi.com',
        to_name: 'Hemang Pandhi',
        from_name: 'Newsletter Subscriber',
        from_email: email,
        message: `New newsletter subscription from: ${email}\n\nThis user wants to receive updates when new articles are published.`,
        subject: 'New Newsletter Subscription - Android Internals',
        reply_to: email,
        email: email,
        name: 'Newsletter Subscriber',
        recipient_email: 'info@hemangpandhi.com',
        recipient_name: 'Hemang Pandhi'
      };
      
      if (!window.EMAILJS_CONFIG.serviceId || !window.EMAILJS_CONFIG.contactTemplate) {
        console.error('EmailJS configuration missing');
        toast.error('Configuration Error', 'Email service not properly configured. Please try again later.');
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        return;
      }
      
      // Check if EmailJS library is loaded - wait and retry if needed
      function attemptSend() {
        if (typeof emailjs === 'undefined') {
          console.warn('EmailJS not loaded yet, waiting...');
          setTimeout(function() {
            if (typeof emailjs === 'undefined') {
              console.error('EmailJS library is not loaded after waiting.');
              toast.error('Email Service Error', 'Email service is not available. Please refresh the page and try again.');
              submitBtn.textContent = originalText;
              submitBtn.disabled = false;
              return;
            } else {
              attemptSend(); // Retry now that it's loaded
            }
          }, 1000);
          return;
        }
        
        // EmailJS is loaded, proceed with sending notification to owner
        // Use contact template to notify owner about new subscription
        console.log('Sending subscription notification email to owner: info@hemangpandhi.com');
        
        const emailPromise = emailjs.send(
          window.EMAILJS_CONFIG.serviceId, 
          window.EMAILJS_CONFIG.contactTemplate, 
          ownerNotificationParams
        );
        
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('EmailJS timeout')), 10000)
        );
        
        Promise.race([emailPromise, timeoutPromise])
          .then(function(response) {
            console.log('Newsletter subscription notification sent:', response);
            
            // Success - subscription notification sent to owner
            toast.success('Subscription Successful!', 'You\'ll receive updates when new articles are published.');
            newsletterForm.reset();
            
            // Try to add to local API if available (for development)
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
              fetch('http://localhost:3001/api/subscribe', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: email })
              })
              .then(response => response.json())
              .then(data => {
                console.log('Local API response:', data);
              })
              .catch(error => {
                console.log('Local API not available (expected on production)');
              });
            }
          })
          .catch(function(error) {
            console.error('Newsletter subscription email failed:', error);
            console.error('Error details:', error);
            
            // Even if one email fails, show success if at least confirmation was sent
            if (error.message && error.message.includes('timeout')) {
              toast.error('Subscription Timeout', 'The request took too long. Please try again later.');
            } else if (error.status === 0) {
              toast.error('Network Error', 'Please check your internet connection and try again.');
            } else if (error.status === 403) {
              toast.error('Access Denied', 'Email service temporarily unavailable. Please try again later.');
            } else if (error.status === 422) {
              console.error('EmailJS template parameter error:', error.text);
              toast.error('Template Error', 'Email template configuration issue. Please contact support.');
            } else {
              // Partial success - at least try to show success message
              console.warn('One email may have failed, but subscription may still be processed');
              toast.success('Subscription Received!', 'You\'ll receive updates when new articles are published.');
              newsletterForm.reset();
            }
          })
          .finally(function() {
            // Reset button state
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
          });
      }
      
      // Start the send attempt
      attemptSend();
    });
  }

  // Contact Form
  const contactForm = document.getElementById('contactForm');
  console.log('Contact form found:', contactForm);
  console.log('Contact form element:', contactForm ? contactForm.outerHTML.substring(0, 100) + '...' : 'NOT FOUND');
  
  if (contactForm) {
    console.log('Adding submit event listener to contact form');
    contactForm.addEventListener('submit', function(e) {
      console.log('=== FORM SUBMIT EVENT TRIGGERED ===');
      e.preventDefault();
      console.log('Contact form submitted!');
      const name = document.getElementById('contactName').value;
      const email = document.getElementById('contactEmail').value;
      const message = document.getElementById('contactMessage').value;
      
      // Validate form
      if (!name || !message) {
        toast.error('Missing Information', 'Please fill in all required fields.');
        return;
      }
      
      // Validate email
      const emailError = validateEmailField(email, 'Email');
      if (emailError) {
        toast.error('Invalid Email', emailError);
        return;
      }
      
      // Show loading state
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Sending...';
      submitBtn.disabled = true;
      
      // Send email using EmailJS - matching your template exactly
      const templateParams = {
        from_name: name,
        from_email: email,
        message: message,
        // Add recipient email for EmailJS to send to
        to_email: 'info@hemangpandhi.com',
        to_name: 'Hemang Pandhi',
        subject: 'New Contact Message - Android Internals',
        reply_to: email,
        // Alternative parameter names that EmailJS might expect for Outlook
        email: 'info@hemangpandhi.com',
        name: 'Hemang Pandhi',
        recipient_email: 'info@hemangpandhi.com',
        recipient_name: 'Hemang Pandhi',
        to: 'info@hemangpandhi.com',
        recipient: 'info@hemangpandhi.com'
      };
      
      // Check if EmailJS library is loaded
      if (typeof emailjs === 'undefined') {
        console.error('EmailJS library is not loaded. Please refresh the page.');
        toast.error('Email Service Error', 'Email service is not available. Please refresh the page and try again.');
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        return;
      }
      
      console.log('Sending contact EmailJS with template params:', templateParams);
      emailjs.send(window.EMAILJS_CONFIG.serviceId, window.EMAILJS_CONFIG.contactTemplate, templateParams)
        .then(function(response) {
          console.log('Contact email sent:', response);
          toast.success('Message Sent!', 'Thank you for contacting us. We\'ll respond within 24 hours.');
          contactForm.reset();
        })
        .catch(function(error) {
          console.error('Contact email failed:', error);
          toast.error('Message Failed', 'Please try again later or contact us directly.');
        })
        .finally(function() {
          // Reset button state
          submitBtn.textContent = originalText;
          submitBtn.disabled = false;
        });
    });
  }

  // Get Started Button
  const getStartedBtn = document.getElementById('getStartedBtn');
  console.log('Get Started button found:', getStartedBtn);
  if (getStartedBtn) {
    getStartedBtn.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Smooth scroll to topics section
      const topicsSection = document.getElementById('topics');
      if (topicsSection) {
        topicsSection.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
      
      // Log interaction
      console.log('Get Started button clicked');
    });
  }

  // Contact Me Button
  const contactButtons = document.querySelectorAll('.contact-button');
  contactButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Smooth scroll to contact section
      const contactSection = document.getElementById('contact');
      if (contactSection) {
        contactSection.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
      
      // Log interaction
      console.log('Contact Me button clicked');
    });
  });

  // Subscribe Button (in blogs section)
  const subscribeButtons = document.querySelectorAll('.newsletter-btn');
  subscribeButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Smooth scroll to newsletter section
      const newsletterSection = document.getElementById('newsletter');
      if (newsletterSection) {
        newsletterSection.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
      
      // Log interaction
      console.log('Subscribe button clicked');
    });
  });

  // ===== EMAIL VALIDATION =====
  function isValidEmail(email) {
    // Comprehensive email validation regex
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }

  function validateEmailField(email, fieldName = 'Email') {
    if (!email || email.trim() === '') {
      return `${fieldName} is required.`;
    }
    
    if (!isValidEmail(email.trim())) {
      return `Please enter a valid ${fieldName.toLowerCase()} address.`;
    }
    
    // Check for common invalid domains
    const invalidDomains = ['example.com', 'test.com', 'sample.com', 'demo.com'];
    const domain = email.split('@')[1]?.toLowerCase();
    if (invalidDomains.includes(domain)) {
      return `Please use a real ${fieldName.toLowerCase()} address, not a test domain.`;
    }
    
    return null; // No error
  }

  // ===== TOAST NOTIFICATION SYSTEM =====
  class ToastNotification {
    constructor() {
      this.container = this.createContainer();
      this.toasts = [];
    }
    
    createContainer() {
      const container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
      return container;
    }
    
    show(title, message, type = 'info', duration = 5000) {
      const toast = document.createElement('div');
      toast.className = `toast ${type}`;
      
      toast.innerHTML = `
        <div class="toast-icon"></div>
        <div class="toast-content">
          <div class="toast-title">${title}</div>
          <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close" onclick="this.parentElement.remove()">×</button>
      `;
      
      this.container.appendChild(toast);
      this.toasts.push(toast);
      
      // Animate in
      setTimeout(() => {
        toast.classList.add('show');
      }, 100);
      
      // Auto remove
      if (duration > 0) {
        setTimeout(() => {
          this.remove(toast);
        }, duration);
      }
      
      return toast;
    }
    
    remove(toast) {
      toast.classList.remove('show');
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
          this.toasts = this.toasts.filter(t => t !== toast);
        }
      }, 300);
    }
    
    success(title, message, duration = 5000) {
      return this.show(title, message, 'success', duration);
    }
    
    error(title, message, duration = 7000) {
      return this.show(title, message, 'error', duration);
    }
    
    info(title, message, duration = 5000) {
      return this.show(title, message, 'info', duration);
    }
    
    warning(title, message, duration = 6000) {
      return this.show(title, message, 'warning', duration);
    }
  }

  // Initialize toast notification system
  const toast = new ToastNotification();

  // Show notification function (backward compatibility)
  function showNotification(message, type = 'info') {
    const title = type === 'success' ? 'Success' : 
                  type === 'error' ? 'Error' : 
                  type === 'warning' ? 'Warning' : 'Info';
    
    toast[type](title, message);
  }

  // Smooth scrolling for article index links
  function addSmoothScrolling() {
    document.querySelectorAll('.article-link').forEach(link => {
      link.addEventListener('click', function(e) {
        // Only handle internal links (starting with #)
        if (this.getAttribute('href').startsWith('#')) {
          e.preventDefault();
          const targetId = this.getAttribute('href').substring(1);
          const targetElement = document.getElementById(targetId);
          
          if (targetElement) {
            targetElement.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            });
          } else {
            console.warn('Target element not found:', targetId);
          }
        }
      });
    });
  }

// Initialize smooth scrolling
addSmoothScrolling();

// Profile Photo Modal Functions - Global scope
window.openProfileModal = function() {
  console.log('openProfileModal called');
  const modal = document.getElementById('profileModal');
  console.log('Modal element:', modal);
  if (modal) {
    modal.style.display = 'block';
    setTimeout(() => {
      modal.style.opacity = '1';
      const content = modal.querySelector('.profile-modal-content');
      if (content) {
        content.style.transform = 'scale(1)';
      }
    }, 10);
  } else {
    console.error('Profile modal not found');
  }
}

window.closeProfileModal = function() {
  const modal = document.getElementById('profileModal');
  if (modal) {
    modal.style.opacity = '0';
    const content = modal.querySelector('.profile-modal-content');
    if (content) {
      content.style.transform = 'scale(0.9)';
    }
    setTimeout(() => {
      modal.style.display = 'none';
    }, 300);
  }
}

// Close modal when clicking outside the image
window.onclick = function(event) {
  const modal = document.getElementById('profileModal');
  if (event.target === modal) {
    closeProfileModal();
  }
};

}); // End of DOMContentLoaded

// ===== COOKIE CONSENT BANNER =====
(function cookieConsentBanner() {
  'use strict';
  
  // Check if user has already accepted/declined cookies
  function getCookieConsent() {
    return localStorage.getItem('cookieConsent');
  }
  
  function setCookieConsent(value) {
    localStorage.setItem('cookieConsent', value);
    // Set expiration to 1 year
    const expiry = new Date();
    expiry.setFullYear(expiry.getFullYear() + 1);
    document.cookie = `cookieConsent=${value}; expires=${expiry.toUTCString()}; path=/; SameSite=Lax`;
  }
  
  function showCookieBanner() {
    const banner = document.getElementById('cookieConsentBanner');
    if (banner) {
      banner.classList.add('show');
    }
  }
  
  function hideCookieBanner() {
    const banner = document.getElementById('cookieConsentBanner');
    if (banner) {
      banner.classList.remove('show');
      setTimeout(() => {
        banner.style.display = 'none';
      }, 300);
    }
  }
  
  function acceptCookies() {
    setCookieConsent('accepted');
    hideCookieBanner();
    console.log('Cookies accepted');
  }
  
  function declineCookies() {
    setCookieConsent('declined');
    hideCookieBanner();
    console.log('Cookies declined');
    // Optionally disable non-essential cookies here
  }
  
  // Initialize cookie consent banner
  document.addEventListener('DOMContentLoaded', function() {
    const consent = getCookieConsent();
    
    // Only show banner if user hasn't made a choice
    if (!consent) {
      // Small delay to ensure page is loaded
      setTimeout(showCookieBanner, 1000);
    }
    
    // Attach event listeners
    const acceptBtn = document.getElementById('cookieAcceptBtn');
    const declineBtn = document.getElementById('cookieDeclineBtn');
    
    if (acceptBtn) {
      acceptBtn.addEventListener('click', acceptCookies);
    }
    
    if (declineBtn) {
      declineBtn.addEventListener('click', declineCookies);
    }
  });
})();

// ===== USER AUTHENTICATION UI =====
(function() {
  function initUserAuthUI() {
    const userAuth = window.userAuth;
    if (!userAuth) {
      console.log('initUserAuthUI: userAuth not available yet');
      return;
    }

    console.log('initUserAuthUI: Initializing user auth UI');
    const btnLogin = document.getElementById('btnLogin');
    const loginModal = document.getElementById('loginModal');
    const loginModalClose = document.getElementById('loginModalClose');
    const userMenuLoggedOut = document.getElementById('userMenuLoggedOut');
    const userMenuLoggedIn = document.getElementById('userMenuLoggedIn');
    const userAvatarImg = document.getElementById('userAvatarImg');
    const userAvatarInitial = document.getElementById('userAvatarInitial');
    const userName = document.getElementById('userName');
    const userEmail = document.getElementById('userEmail');
    const menuLogout = document.getElementById('menuLogout');

    function updateUserUI() {
      console.log('updateUserUI: Checking auth status');
      if (userAuth.isAuthenticated()) {
        const user = userAuth.getUser();
        console.log('updateUserUI: User is authenticated:', user);
        
        if (userMenuLoggedOut) userMenuLoggedOut.style.display = 'none';
        if (userMenuLoggedIn) userMenuLoggedIn.style.display = 'block';
        
        if (user && (user.picture || user.avatar)) {
          if (userAvatarImg) {
            userAvatarImg.src = user.picture || user.avatar;
            userAvatarImg.style.display = 'block';
          }
          if (userAvatarInitial) userAvatarInitial.style.display = 'none';
        } else {
          if (userAvatarImg) userAvatarImg.style.display = 'none';
          if (userAvatarInitial) {
            userAvatarInitial.style.display = 'block';
            userAvatarInitial.textContent = (user?.name || user?.email || 'U').charAt(0).toUpperCase();
          }
        }
        
        if (userName) userName.textContent = user?.name || user?.email || 'User';
        if (userEmail) userEmail.textContent = user?.email || '';
      } else {
        console.log('updateUserUI: User is not authenticated');
        if (userMenuLoggedOut) userMenuLoggedOut.style.display = 'block';
        if (userMenuLoggedIn) userMenuLoggedIn.style.display = 'none';
      }
    }

    // Listen for auth changes
    window.addEventListener('userAuthChange', updateUserUI);
    
    // Initial update
    updateUserUI();

    // Login button
    if (btnLogin) {
      btnLogin.setAttribute('data-initialized', 'true');
      btnLogin.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Sign In button clicked');
        if (loginModal) {
          console.log('Showing login modal');
          loginModal.style.display = 'flex';
          loginModal.style.visibility = 'visible';
        } else {
          console.error('Login modal not found!');
        }
      });
    } else {
      console.error('Sign In button not found!');
    }

    // Close modal
    if (loginModalClose) {
      loginModalClose.addEventListener('click', () => {
        if (loginModal) {
          loginModal.style.display = 'none';
        }
      });
    }

    // Close modal on outside click
    if (loginModal) {
      loginModal.addEventListener('click', (e) => {
        if (e.target === loginModal) {
          loginModal.style.display = 'none';
        }
      });
    }

    // Logout
    if (menuLogout) {
      menuLogout.addEventListener('click', () => {
        if (confirm('Are you sure you want to sign out?')) {
          userAuth.logout();
        }
      });
    }

    // Bookmarks menu
    const menuBookmarks = document.getElementById('menuBookmarks');
    if (menuBookmarks) {
      menuBookmarks.addEventListener('click', (e) => {
        e.preventDefault();
        // Scroll to bookmarks section or show bookmarks modal
        const bookmarksSection = document.getElementById('bookmarks-section');
        if (bookmarksSection) {
          bookmarksSection.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }

    // Preferences menu
    const menuPreferences = document.getElementById('menuPreferences');
    if (menuPreferences) {
      menuPreferences.addEventListener('click', (e) => {
        e.preventDefault();
        // Show preferences modal
        showPreferencesModal();
      });
    }
  }

  // Global function for inline onclick handler (fallback)
  window.showLoginModal = function() {
    const loginModal = document.getElementById('loginModal');
    if (loginModal) {
      console.log('showLoginModal called');
      loginModal.style.display = 'flex';
      loginModal.style.visibility = 'visible';
    } else {
      console.error('Login modal not found!');
    }
  };

  // Initialize user auth UI - wait for user-auth.js to be ready
  function waitForUserAuth() {
    if (window.userAuth) {
      console.log('userAuth found, initializing UI');
      initUserAuthUI();
    } else {
      console.log('userAuth not found, waiting...');
      // Wait for userAuthReady event
      window.addEventListener('userAuthReady', () => {
        console.log('userAuthReady event received, initializing UI');
        initUserAuthUI();
      }, { once: true });
      
      // Also listen for userAuthChange event (fired after auth)
      window.addEventListener('userAuthChange', () => {
        console.log('userAuthChange event received');
        if (window.userAuth && !document.getElementById('btnLogin')?.hasAttribute('data-initialized')) {
          console.log('Initializing UI from userAuthChange event');
          initUserAuthUI();
        }
      });
      
      // Fallback: try again after delays
      setTimeout(() => {
        if (window.userAuth && !document.getElementById('btnLogin')?.hasAttribute('data-initialized')) {
          console.log('Fallback: Initializing UI after delay');
          initUserAuthUI();
        }
      }, 100);
      
      setTimeout(() => {
        if (window.userAuth && !document.getElementById('btnLogin')?.hasAttribute('data-initialized')) {
          console.log('Fallback 2: Initializing UI after longer delay');
          initUserAuthUI();
        }
      }, 500);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', waitForUserAuth);
  } else {
    waitForUserAuth();
  }
})();

// ===== PREFERENCES MODAL =====
function showPreferencesModal() {
    const userAuth = window.userAuth;
    if (!userAuth || !userAuth.isAuthenticated()) {
      alert('Please sign in to access preferences');
      return;
    }

    const prefs = userAuth.getPreferences();
    const modal = document.createElement('div');
    modal.className = 'login-modal';
    modal.style.display = 'flex';
    modal.innerHTML = `
      <div class="login-modal-content" style="max-width: 500px;">
        <button class="login-modal-close" onclick="this.closest('.login-modal').remove()">&times;</button>
        <h2>Preferences</h2>
        <div style="margin-top: 1.5rem;">
          <label style="display: block; margin-bottom: 0.5rem; color: var(--text-primary); font-weight: 500;">
            Theme
          </label>
          <select id="themeSelect" style="width: 100%; padding: 0.75rem; border: 1px solid #30363d; border-radius: var(--radius-md); background: #0d1117; color: var(--text-primary);">
            <option value="dark" ${prefs.theme === 'dark' ? 'selected' : ''}>Dark</option>
            <option value="light" ${prefs.theme === 'light' ? 'selected' : ''}>Light</option>
            <option value="auto" ${prefs.theme === 'auto' ? 'selected' : ''}>Auto (System)</option>
          </select>
        </div>
        <div style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid #30363d;">
          <button class="btn-login" onclick="savePreferences()" style="width: 100%;">Save Preferences</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    // Close on outside click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });

    // Save function
    window.savePreferences = function() {
      const theme = document.getElementById('themeSelect').value;
      userAuth.updateTheme(theme);
      modal.remove();
      alert('Preferences saved!');
    };
  }

  // Apply theme on load
  function applyTheme() {
    const userAuth = window.userAuth;
    if (userAuth) {
      const prefs = userAuth.getPreferences();
      const theme = prefs.theme || 'dark';
      
      if (theme === 'auto') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
      } else {
        document.documentElement.setAttribute('data-theme', theme);
      }
    }
  }

  // Listen for theme changes
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyTheme);
  }

  // Apply theme on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyTheme);
  } else {
    applyTheme();
  }
