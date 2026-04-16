/**
 * COMPONENT INJECTOR ENGINE (loadComponent)
 * Core architectural function for the website. 
 * Fetches raw physical partial HTML files out of the `/components/` folder and structurally embeds 
 * them into standalone pages substituting `id="xyz-placeholder"` containers.
 * Linked tightly to: `main.js` which instructs it on which templates to spawn upon navigation load.
 * 
 * @param {string} placeholderId - The element ID inside your actual routed page (eg. 'navbar-placeholder' in about.html)
 * @param {string} componentPath - The absolute URL routing to the raw HTML file to fetch (eg. '/components/navbar.html')
 * @param {function} callback - Post-injection hook execution (used heavily to trigger string translation logic after DOM elements physically exist)
 */
async function loadComponent(placeholderId, componentPath, callback) {
    const container = document.getElementById(placeholderId);
    if (!container) {
        console.warn(`Container #${placeholderId} not found.`);
        return;
    }
    try {
        const finalPath = typeof getRelativePath === 'function' ? getRelativePath(componentPath) : componentPath;
        const response = await fetch(finalPath);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        let html = await response.text();
        
        // Correct asset paths relative to the current page depth (e.g. /assets/ -> ./assets/ or ../assets/)
        const isSubPage = window.location.pathname.includes('/pages/');
        const assetPrefix = isSubPage ? '../assets/' : './assets/';
        html = html.replace(/\/assets\//g, assetPrefix);

        container.innerHTML = html;

        // Force browser to evaluate inline scripts present in the fetched HTML
        const scripts = container.querySelectorAll('script');
        scripts.forEach(oldScript => {
            const newScript = document.createElement('script');
            Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
            newScript.appendChild(document.createTextNode(oldScript.innerHTML));
            oldScript.parentNode.replaceChild(newScript, oldScript);
        });

        if (callback) callback();
    } catch (error) {
        console.error(`Error loading component ${componentPath}:`, error);
    }
}
