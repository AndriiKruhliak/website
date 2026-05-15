/**
 * main.js — Scroll animations, navigation, carousel lightbox
 * Ancient Oaks of Chubynske exhibition
 */
document.addEventListener('DOMContentLoaded', async () => {
  await I18n.init();

  // --- Nav scroll ---
  const nav = document.querySelector('.nav');
  const handleNavScroll = () => nav.classList.toggle('scrolled', window.scrollY > 80);
  window.addEventListener('scroll', handleNavScroll, { passive: true });
  handleNavScroll();

  // --- Hamburger ---
  const hamburger = document.querySelector('.nav__hamburger');
  const navLinks = document.querySelector('.nav__links');
  if (hamburger) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      navLinks.classList.toggle('open');
      document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
    });
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
      I18n.switchTo(btn.getAttribute('data-lang'));
      if (hamburger) { hamburger.classList.remove('open'); navLinks.classList.remove('open'); document.body.style.overflow = ''; }
    });
  });

  // --- Smooth scroll nav ---
  document.querySelectorAll('.nav__link[data-section]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const t = document.getElementById(link.getAttribute('data-section'));
      if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // --- Scroll reveal ---
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); revealObs.unobserve(e.target); } });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
  document.querySelectorAll('.reveal, .gallery__item, .gallery__phrase').forEach(el => revealObs.observe(el));

  // --- Hero parallax ---
  const heroImg = document.querySelector('.hero__image img');
  const heroSec = document.querySelector('.hero');
  if (heroImg && heroSec) {
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) { requestAnimationFrame(() => {
        const y = window.scrollY;
        if (y < heroSec.offsetHeight) heroImg.style.transform = `translateY(${y * 0.3}px) scale(1.05)`;
        ticking = false;
      }); ticking = true; }
    }, { passive: true });
  }

  // --- Scroll indicator hide ---
  const scrollInd = document.querySelector('.hero__scroll');
  if (scrollInd) window.addEventListener('scroll', () => { scrollInd.style.opacity = window.scrollY > 100 ? '0' : ''; }, { passive: true });

  // --- Image lazy fade-in ---
  document.querySelectorAll('.landscape__photo img, .chubynskyi__photo img, .chubynskyi__khutir-photo img, .measurements__photo img, .extra-photos__photo img, .snail__photo img').forEach(img => {
    img.style.opacity = '0'; img.style.transition = 'opacity 0.8s ease';
    if (img.complete) { img.style.opacity = '1'; }
    else { img.addEventListener('load', () => { img.style.opacity = '1'; }); img.addEventListener('error', () => { img.style.opacity = '0.5'; }); }
  });

  // ============================================================
  // LIGHTBOX — for all photos (carousel, grouped, standalone)
  // ============================================================
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxClose = document.getElementById('lightbox-close');
  const lightboxPrev = document.getElementById('lightbox-prev');
  const lightboxNext = document.getElementById('lightbox-next');

  let currentLightboxImages = [];
  let currentImageIndex = 0;

  // Get unique images from a carousel section
  function getUniqueCarouselImages(carouselSection) {
    const slides = carouselSection.querySelectorAll('.scroll-gallery__slide:not(.scroll-gallery__slide--placeholder)');
    const seen = new Set();
    const images = [];
    slides.forEach(slide => {
      const img = slide.querySelector('img');
      if (img && !seen.has(img.src)) { seen.add(img.src); images.push(img.src); }
    });
    return images;
  }

  // Get images from a grouped container
  function getGroupImages(container) {
    const images = [];
    container.querySelectorAll('img').forEach(img => { images.push(img.src); });
    return images;
  }

  // Open lightbox with a set of images (or single image)
  function openLightboxWith(images, clickedSrc) {
    currentLightboxImages = images;
    currentImageIndex = currentLightboxImages.indexOf(clickedSrc);
    if (currentImageIndex === -1) currentImageIndex = 0;
    lightboxImg.src = currentLightboxImages[currentImageIndex];
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
    updateLightboxArrows();
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
    setTimeout(() => { lightboxImg.src = ''; }, 400);
  }

  function showImage(index) {
    if (currentLightboxImages.length === 0) return;
    currentImageIndex = (index + currentLightboxImages.length) % currentLightboxImages.length;
    lightboxImg.style.opacity = '0';
    lightboxImg.style.transform = 'scale(.96)';
    setTimeout(() => {
      lightboxImg.src = currentLightboxImages[currentImageIndex];
      lightboxImg.style.opacity = '1';
      lightboxImg.style.transform = 'scale(1)';
    }, 200);
    updateLightboxArrows();
  }

  function updateLightboxArrows() {
    const hasMultiple = currentLightboxImages.length > 1;
    lightboxPrev.style.display = hasMultiple ? '' : 'none';
    lightboxNext.style.display = hasMultiple ? '' : 'none';
  }

  // --- Carousel slides (grouped, with arrows) ---
  document.querySelectorAll('.scroll-gallery').forEach(carousel => {
    carousel.querySelectorAll('.scroll-gallery__slide:not(.scroll-gallery__slide--placeholder)').forEach(slide => {
      slide.addEventListener('click', () => {
        const img = slide.querySelector('img');
        if (img) openLightboxWith(getUniqueCarouselImages(carousel), img.src);
      });
    });
  });

  // --- Measurement photos (grouped, with arrows) ---
  document.querySelectorAll('.measurements__grid').forEach(grid => {
    grid.querySelectorAll('.measurements__photo').forEach(photo => {
      photo.style.cursor = 'pointer';
      photo.addEventListener('click', () => {
        const img = photo.querySelector('img');
        if (img) openLightboxWith(getGroupImages(grid), img.src);
      });
    });
  });

  // --- Extra photos (grouped, with arrows) ---
  document.querySelectorAll('.extra-photos__grid').forEach(grid => {
    grid.querySelectorAll('.extra-photos__photo').forEach(photo => {
      photo.style.cursor = 'pointer';
      photo.addEventListener('click', () => {
        const img = photo.querySelector('img');
        if (img) openLightboxWith(getGroupImages(grid), img.src);
      });
    });
  });

  // --- Standalone photos (no arrows) ---
  const standaloneSelectors = [
    '.chubynskyi__photo',
    '.chubynskyi__khutir-photo',
    '.landscape__photo',
    '.snail__photo'
  ];
  standaloneSelectors.forEach(sel => {
    document.querySelectorAll(sel).forEach(photo => {
      photo.style.cursor = 'pointer';
      photo.addEventListener('click', () => {
        const img = photo.querySelector('img');
        if (img) openLightboxWith([img.src], img.src);
      });
    });
  });

  // Lightbox controls
  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightboxPrev) lightboxPrev.addEventListener('click', () => showImage(currentImageIndex - 1));
  if (lightboxNext) lightboxNext.addEventListener('click', () => showImage(currentImageIndex + 1));

  // Close on background click
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox || e.target === lightbox.querySelector('.lightbox__content')) closeLightbox(); });

  // Keyboard nav
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') showImage(currentImageIndex - 1);
    if (e.key === 'ArrowRight') showImage(currentImageIndex + 1);
  });
});
