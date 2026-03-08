// HostFlow Mobile Menu Toggle
(function() {
  'use strict';
  
  // Create mobile menu button
  function createMobileMenuButton() {
    const aside = document.querySelector('aside');
    if (!aside || aside.querySelector('.mobile-menu-btn')) return;
    
    const menuBtn = document.createElement('button');
    menuBtn.className = 'mobile-menu-btn';
    menuBtn.innerHTML = '☰';
    menuBtn.setAttribute('aria-label', 'Toggle menu');
    
    menuBtn.addEventListener('click', function() {
      aside.classList.toggle('nav-open');
      menuBtn.innerHTML = aside.classList.contains('nav-open') ? '✕' : '☰';
    });
    
    // Insert after logo
    const logo = aside.querySelector('a');
    if (logo) {
      logo.after(menuBtn);
    } else {
      aside.appendChild(menuBtn);
    }
  }
  
  // Close menu when clicking outside
  function closeMenuOnClickOutside() {
    document.addEventListener('click', function(e) {
      const aside = document.querySelector('aside');
      const menuBtn = document.querySelector('.mobile-menu-btn');
      
      if (!aside || !menuBtn) return;
      
      if (!aside.contains(e.target) && aside.classList.contains('nav-open')) {
        aside.classList.remove('nav-open');
        menuBtn.innerHTML = '☰';
      }
    });
  }
  
  // Close menu on window resize to desktop
  function handleResize() {
    window.addEventListener('resize', function() {
      if (window.innerWidth > 768) {
        const aside = document.querySelector('aside');
        const menuBtn = document.querySelector('.mobile-menu-btn');
        
        if (aside) {
          aside.classList.remove('nav-open');
        }
        if (menuBtn) {
          menuBtn.innerHTML = '☰';
        }
      }
    });
  }
  
  // Initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      createMobileMenuButton();
      closeMenuOnClickOutside();
      handleResize();
    });
  } else {
    createMobileMenuButton();
    closeMenuOnClickOutside();
    handleResize();
  }
})();
