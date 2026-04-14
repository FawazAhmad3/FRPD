// main.js - Application Entry Point

/**
 * DOCUMENT LOAD EVENT - Core App Initializer
 * This block natively fires when the browser finishes reading an HTML page (like index.html).
 * Linked with: Every document that imports main.js. It directs the architectural assembly of all components.
 */
document.addEventListener('DOMContentLoaded', () => {
    /**
     * 1. LOAD STATIC LAYOUT BLOCKS
     * Uses the loadComponent() function defined in `js/loadComponents.js`.
     * This injects the recurring site features (Navbar, Footer, Modals) instantly across routes.
     */
    // 1. Load Static Layout Components
    loadComponent('navbar-placeholder', '/components/navbar.html', () => {
        if (window.applyTranslations) applyTranslations();
        
        // Bind mobile menu toggle: Connects HTML element #mobile-menu-btn to #mobile-menu in navbar.html
        const mobileBtn = document.getElementById('mobile-menu-btn');
        const mobileMenu = document.getElementById('mobile-menu');
        if (mobileBtn && mobileMenu) {
            mobileBtn.addEventListener('click', () => {
                mobileMenu.classList.toggle('hidden');
            });
        }
    });

    loadComponent('footer-placeholder', '/components/footer.html', () => {
        if (window.applyTranslations) applyTranslations();
    });

    loadComponent('social-buttons-placeholder', '/components/social-buttons.html');
    loadComponent('modal-placeholder', '/components/modal.html');

    /**
     * 2. CONTEXTUAL COMPONENT LOADS
     * Because Hero banners don't belong on every page, we parse the DOM for its placeholder ID
     * and only inject `/components/hero.html` if required to avoid rendering crash loops.
     */
    // 2. Load Hero dynamically if the placeholder exists
    if (document.getElementById('hero-placeholder')) {
        loadComponent('hero-placeholder', '/components/hero.html', () => {
            if (window.applyTranslations) applyTranslations();
        });
    }

    /**
     * 3. INITIALIZE DATA INJECTION
     * Calls out to `js/dataLoader.js` initDataLoading() schema.
     * Starts the automated JSON array ingestion loop filling container arrays like Projects/Courses on specific pages.
     */
    // 3. Initialize Data Loader for dynamic content rendering
    if (typeof initDataLoading === 'function') {
        initDataLoading();
    }
});
