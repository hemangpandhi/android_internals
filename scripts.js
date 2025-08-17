// Minimal JS for Android Internals Home Page
// Enhance animation start if needed
 
document.addEventListener('DOMContentLoaded', function() {
  // Optionally, add JS-driven animation triggers or interactivity here
  // For now, CSS handles all animations for best performance
  
  // Book Cover Modal Functionality
  const modal = document.getElementById('bookModal');
  const modalImg = document.getElementById('modalBookCover');
  const closeBtn = document.querySelector('.book-modal-close');
  const bookCovers = document.querySelectorAll('.book-cover-img');
  
  // Open modal when clicking on book cover
  bookCovers.forEach(cover => {
    cover.addEventListener('click', function() {
      const coverSrc = this.getAttribute('data-cover');
      modalImg.src = coverSrc;
      modal.style.display = 'flex';
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    });
  });
  
  // Close modal when clicking on close button
  closeBtn.addEventListener('click', function() {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto'; // Restore scrolling
  });
  
  // Close modal when clicking outside the image
  modal.addEventListener('click', function(e) {
    if (e.target === modal) {
      modal.style.display = 'none';
      document.body.style.overflow = 'auto';
    }
  });
  
  // Close modal with Escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && modal.style.display === 'flex') {
      modal.style.display = 'none';
      document.body.style.overflow = 'auto';
    }
  });
}); 