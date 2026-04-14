/**
 * LANGUAGE SWITCHER CORE ENGINE
 * Hooks into the standard DOM to replace static text elements with localized translations 
 * provided through independent dictionary mappings (e.g. /locales/en.json).
 * Operates off the `[data-i18n]` html attribute found inside various components (Mainly internal navbar links).
 */

const DEFAULT_LANG = 'en';
const SUPPORTED_LANGS = ['en', 'ar', 'fr', 'zh', 'de'];

let currentLang = localStorage.getItem('language') || DEFAULT_LANG;
if (!SUPPORTED_LANGS.includes(currentLang)) currentLang = DEFAULT_LANG;

let translations = {};

/**
 * Fetch loop querying the direct schema to pull the right object list.
 * Automatically aligns HTML native dir attributes enabling right-to-left UI switching organically when AR layout selected.
 */
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

/**
 * Translation Application Loop
 * Finds absolute specific elements tagged explicitly via `data-i18n="xyz_tag"` globally, 
 * pushing the matched JSON index string payload over its textual format.
 */
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
