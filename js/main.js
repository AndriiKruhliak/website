/**
 * main.js — Scroll animations, navigation, gallery behavior, and carousel
 * Ancient Oaks of Chubynske exhibition
 */

document.addEventListener('DOMContentLoaded', async () => {
  // --- Initialize i18n ---
  await I18n.init();

  // --- Navigation scroll behavior ---
  const nav = document.querySelector('.nav');
  const heroSection = document.querySelector('.hero');

  const handleNavScroll = () => {
    const scrollY = window.scrollY;
    nav.classList.toggle('scrolled', scrollY > 80);
  };

  window.addEventListener('scroll', handleNavScroll, { passive: true });
  handleNavScroll();

  // --- Mobile hamburger menu ---
  const hamburger = document.querySelector('.nav__hamburger');
  const navLinks = document.querySelector('.nav__links');

  if (hamburger) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      navLinks.classList.toggle('open');
      document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
    });

    // Close menu on link click
    navLinks.querySelectorAll('.nav__link').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        navLinks.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  // --- Language switcher ---
  document.querySelectorAll('.nav__lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const lang = btn.getAttribute('data-lang');
      I18n.switchTo(lang);

      // Close mobile menu if open
      if (hamburger) {
        hamburger.classList.remove('open');
        navLinks.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  });

  // --- Smooth scroll for nav links ---
  document.querySelectorAll('.nav__link[data-section]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('data-section');
      const target = document.getElementById(targetId);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // --- Scroll-reveal animation (Intersection Observer) ---
  const revealElements = document.querySelectorAll('.reveal, .gallery__item, .gallery__phrase');

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          // Once visible, stop observing for performance
          revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -60px 0px'
    }
  );

  revealElements.forEach(el => revealObserver.observe(el));

  // --- Hero parallax (subtle) ---
  const heroImage = document.querySelector('.hero__image img');
  if (heroImage && heroSection) {
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          const heroHeight = heroSection.offsetHeight;
          if (scrollY < heroHeight) {
            const translate = scrollY * 0.3;
            heroImage.style.transform = `translateY(${translate}px) scale(1.05)`;
          }
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  // --- Scroll indicator hide on scroll ---
  const scrollIndicator = document.querySelector('.hero__scroll');
  if (scrollIndicator) {
    window.addEventListener('scroll', () => {
      scrollIndicator.style.opacity = window.scrollY > 100 ? '0' : '';
    }, { passive: true });
  }

  // --- Image lazy-load fade-in effect ---
  const lazyImages = document.querySelectorAll('.gallery__photo img, .landscape__photo img, .chubynskyi__photo img');
  lazyImages.forEach(img => {
    img.style.opacity = '0';
    img.style.transition = 'opacity 0.8s ease';

    if (img.complete) {
      img.style.opacity = '1';
    } else {
      img.addEventListener('load', () => {
        img.style.opacity = '1';
      });
      img.addEventListener('error', () => {
        img.style.opacity = '0.5';
      });
    }
  });
});
