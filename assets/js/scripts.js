// Professional JavaScript for Android Internals Website
// Enhanced with modern features and smooth interactions

document.addEventListener('DOMContentLoaded', function() {
  console.log('=== ANDROID INTERNALS WEBSITE LOADED ===');
  console.log('JavaScript is running successfully!');
  
  // ===== MOBILE MENU FUNCTIONALITY =====
  const mobileMenuToggle = document.getElementById('mobileMenuToggle');
  const mobileNavLinks = document.getElementById('navLinks');
  
  if (mobileMenuToggle && mobileNavLinks) {
    // Initialize accessibility attributes
    mobileMenuToggle.setAttribute('aria-controls', 'navLinks');
    mobileMenuToggle.setAttribute('aria-expanded', 'false');
    mobileNavLinks.setAttribute('aria-hidden', 'true');

    mobileMenuToggle.addEventListener('click', function() {
      mobileMenuToggle.classList.toggle('active');
      mobileNavLinks.classList.toggle('active');
      const isOpen = mobileNavLinks.classList.contains('active');
      document.body.style.overflow = isOpen ? 'hidden' : '';
      mobileMenuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      mobileNavLinks.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
    });
    
    // Close menu when clicking on a link
    const mobileNavLinkElements = mobileNavLinks.querySelectorAll('.nav-link');
    mobileNavLinkElements.forEach(link => {
      link.addEventListener('click', function() {
        mobileMenuToggle.classList.remove('active');
        mobileNavLinks.classList.remove('active');
        document.body.style.overflow = '';
        mobileMenuToggle.setAttribute('aria-expanded', 'false');
        mobileNavLinks.setAttribute('aria-hidden', 'true');
      });
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
      if (!mobileMenuToggle.contains(e.target) && !mobileNavLinks.contains(e.target)) {
        mobileMenuToggle.classList.remove('active');
        mobileNavLinks.classList.remove('active');
        document.body.style.overflow = '';
        mobileMenuToggle.setAttribute('aria-expanded', 'false');
        mobileNavLinks.setAttribute('aria-hidden', 'true');
      }
    });

    // Close menu on Escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && mobileNavLinks.classList.contains('active')) {
        mobileMenuToggle.classList.remove('active');
        mobileNavLinks.classList.remove('active');
        document.body.style.overflow = '';
        mobileMenuToggle.setAttribute('aria-expanded', 'false');
        mobileNavLinks.setAttribute('aria-hidden', 'true');
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

  // Make entire blog cards clickable (navigate to inner link)
  document.querySelectorAll('.blog-card').forEach(card => {
    const anchor = card.querySelector('a[href]');
    if (anchor) {
      card.style.cursor = 'pointer';
      card.addEventListener('click', function(e) {
        // Avoid double-handling if actual anchor clicked
        if (e.target.closest('a')) return;
        window.location.href = anchor.getAttribute('href');
      });
    }
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
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      navigator.serviceWorker.register('/assets/sw.js')
        .then(function(registration) {
          console.log('ServiceWorker registration successful with scope: ', registration.scope);
        })
        .catch(function(err) {
          console.log('ServiceWorker registration failed: ', err);
        });
    });
  }
  
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
  
  if (typeof emailjs !== 'undefined') {
    console.log('EmailJS object:', emailjs);
    console.log('EmailJS config:', window.EMAILJS_CONFIG);
    
    // Ensure EmailJS is initialized
    if (window.EMAILJS_CONFIG && window.EMAILJS_CONFIG.publicKey) {
      emailjs.init(window.EMAILJS_CONFIG.publicKey);
      console.log('EmailJS initialized with key:', window.EMAILJS_CONFIG.publicKey);
    } else {
      console.error('EmailJS config missing or invalid');
    }
  } else {
    console.error('EmailJS library not loaded');
  }
  
  // Test notification system
  console.log('Testing notification system...');
  setTimeout(() => {
            toast.success('Forms Ready', 'Contact and newsletter forms are now functional!');
  }, 2000);
  
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
      
      // If EmailJS not configured, show friendly message and exit
      if (!window.EMAILJS_CONFIG || !window.EMAILJS_CONFIG.serviceId || !window.EMAILJS_CONFIG.newsletterTemplate || typeof emailjs === 'undefined') {
        toast.info('Subscription Saved', 'Thanks! We\'ll notify you once email is enabled.');
        newsletterForm.reset();
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        return;
      }

      // Send email using EmailJS - template parameters matching EmailJS template
      const templateParams = {
        to_email: 'info@hemangpandhi.com',
        to_name: 'Hemang Pandhi',
        from_name: 'Newsletter Subscriber',
        from_email: email,
        message: `New newsletter subscription from: ${email}\n\nThis user wants to receive updates when new articles are published.`,
        subject: 'New Newsletter Subscription - Android Internals',
        reply_to: email,
        // Additional parameters that EmailJS might expect
        email: email,
        name: 'Newsletter Subscriber',
        recipient_email: 'info@hemangpandhi.com',
        recipient_name: 'Hemang Pandhi'
      };
      
      // Send notification email to you
      console.log('Sending newsletter EmailJS with template params:', templateParams);
      console.log('Service ID:', window.EMAILJS_CONFIG.serviceId);
      console.log('Template ID:', window.EMAILJS_CONFIG.newsletterTemplate);
      console.log('To Email:', templateParams.to_email);
      console.log('From Email:', templateParams.from_email);
      
      if (!window.EMAILJS_CONFIG.serviceId || !window.EMAILJS_CONFIG.newsletterTemplate) {
        console.error('EmailJS configuration missing');
        toast.error('Configuration Error', 'Email service not properly configured. Please try again later.');
        return;
      }
      
      // Create a promise with timeout
      const emailPromise = emailjs.send(window.EMAILJS_CONFIG.serviceId, window.EMAILJS_CONFIG.newsletterTemplate, templateParams);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('EmailJS timeout')), 10000)
      );
      
      Promise.race([emailPromise, timeoutPromise])
        .then(function(response) {
          console.log('Newsletter subscription email sent:', response);
          
          // Success - EmailJS worked, so subscription is successful
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
          
          if (error.message === 'EmailJS timeout') {
            toast.error('Subscription Timeout', 'The request took too long. Please try again later.');
          } else if (error.status === 0) {
            toast.error('Network Error', 'Please check your internet connection and try again.');
          } else if (error.status === 403) {
            toast.error('Access Denied', 'Email service temporarily unavailable. Please try again later.');
          } else if (error.status === 422) {
            console.error('EmailJS template parameter error:', error.text);
            toast.error('Template Error', 'Email template configuration issue. Please contact support.');
          } else {
            toast.error('Subscription Failed', 'Please try again later or contact us for assistance.');
          }
        })
        .finally(function() {
          // Reset button state
          submitBtn.textContent = originalText;
          submitBtn.disabled = false;
        });
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
  
  // DEV BUILD badge (temporary)
  try {
    const badge = document.createElement('div');
    badge.className = 'dev-badge';
    const ts = new Date().toISOString().replace('T',' ').substring(0,16);
    badge.textContent = `DEV BUILD • ${ts}`;
    document.body.appendChild(badge);
  } catch (e) {
    console.warn('Dev badge injection failed', e);
  }
  
}); 