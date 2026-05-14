/**
 * i18n.js — Multilingual system for the exhibition website
 * Supports: EN (default), UK, CS
 */

const I18n = {
  currentLang: 'en',
  translations: {},
  supportedLangs: ['en', 'uk', 'cs'],

  async init() {
    // Check saved preference
    const saved = localStorage.getItem('exhibition-lang');
    if (saved && this.supportedLangs.includes(saved)) {
      this.currentLang = saved;
    }

    // Preload all languages
    await Promise.all(
      this.supportedLangs.map(lang => this.loadLanguage(lang))
    );

    this.applyTranslations();
    this.updateLangButtons();
  },

  async loadLanguage(lang) {
    try {
      const response = await fetch(`./lang/${lang}.json`);
      if (!response.ok) throw new Error(`Failed to load ${lang}.json`);
      this.translations[lang] = await response.json();
    } catch (err) {
      console.warn(`Could not load language: ${lang}`, err);
      this.translations[lang] = {};
    }
  },

  switchTo(lang) {
    if (!this.supportedLangs.includes(lang)) return;
    this.currentLang = lang;
    localStorage.setItem('exhibition-lang', lang);
    this.applyTranslations();
    this.updateLangButtons();
  },

  applyTranslations() {
    const dict = this.translations[this.currentLang] || {};
    const elements = document.querySelectorAll('[data-i18n]');

    elements.forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (dict[key]) {
        el.textContent = dict[key];
      }
    });

    // Update html lang attribute
    document.documentElement.lang = this.currentLang === 'uk' ? 'uk' : 
                                     this.currentLang === 'cs' ? 'cs' : 'en';
  },

  updateLangButtons() {
    const buttons = document.querySelectorAll('.nav__lang-btn');
    buttons.forEach(btn => {
      const lang = btn.getAttribute('data-lang');
      btn.classList.toggle('active', lang === this.currentLang);
    });
  },

  t(key) {
    const dict = this.translations[this.currentLang] || {};
    return dict[key] || key;
  }
};

// Export for use
window.I18n = I18n;
