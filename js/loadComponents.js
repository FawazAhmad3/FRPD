/**
 * Dynamically loads an HTML component into a specified container.
 * @param {string} placeholderId - The ID of the element to load the component into
 * @param {string} componentPath - The path to the HTML component file
 * @param {function} callback - Optional callback after loading
 */
async function loadComponent(placeholderId, componentPath, callback) {
    const container = document.getElementById(placeholderId);
    if (!container) {
        console.warn(`Container #${placeholderId} not found.`);
        return;
    }
    try {
        const response = await fetch(componentPath);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const html = await response.text();
        container.innerHTML = html;
        if (callback) callback();
    } catch (error) {
        console.error(`Error loading component ${componentPath}:`, error);
    }
}
