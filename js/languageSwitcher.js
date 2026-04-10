/**
 * Language switcher functionality
 */

const DEFAULT_LANG = 'en';
const SUPPORTED_LANGS = ['en', 'ar', 'fr', 'zh', 'de'];

let currentLang = localStorage.getItem('language') || DEFAULT_LANG;
if (!SUPPORTED_LANGS.includes(currentLang)) currentLang = DEFAULT_LANG;

let translations = {};

async function loadTranslations(lang) {
    const data = await fetchJSON(`/locales/${lang}.json`);
    if (data) {
        translations = data;
        applyTranslations();
        document.documentElement.lang = lang;
        if (lang === 'ar') {
            document.documentElement.dir = 'rtl';
        } else {
            document.documentElement.dir = 'ltr';
        }
    }
}

function applyTranslations(targetNode = document) {
    const elements = targetNode.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[key]) {
            el.innerHTML = translations[key];
        }
    });
}

function changeLanguage(newLang) {
    if (SUPPORTED_LANGS.includes(newLang)) {
        currentLang = newLang;
        localStorage.setItem('language', currentLang);
        loadTranslations(currentLang);

        // Custom event for other scripts (e.g. dynamic reload)
        document.dispatchEvent(new CustomEvent('languageChanged', { detail: newLang }));
    }
}

// Initial Load
document.addEventListener("DOMContentLoaded", () => {
    loadTranslations(currentLang);
});

// Expose translation applicator globally so dynamically loaded HTML can be translated immediately
window.applyTranslations = applyTranslations;
window.changeLanguage = changeLanguage;
window.currentLang = currentLang;
