// main.js - Application Entry Point

document.addEventListener('DOMContentLoaded', () => {
    // 1. Load Static Layout Components
    loadComponent('navbar-placeholder', '/components/navbar.html', () => {
        if (window.applyTranslations) applyTranslations();
        
        // Bind mobile menu toggle
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

    // 2. Load Hero dynamically if the placeholder exists
    if (document.getElementById('hero-placeholder')) {
        loadComponent('hero-placeholder', '/components/hero.html', () => {
            if (window.applyTranslations) applyTranslations();
        });
    }

    // 3. Initialize Data Loader for dynamic content rendering
    if (typeof initDataLoading === 'function') {
        initDataLoading();
    }
});
