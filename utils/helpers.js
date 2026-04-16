/**
 * Normalizes absolute paths (starting with /) into relative paths based on current page depth.
 * This ensures file:// and server environments both work correctly.
 */
function getRelativePath(path) {
    if (!path || !path.startsWith('/')) return path;
    const isSubPage = window.location.pathname.includes('/pages/');
    const prefix = isSubPage ? '../' : './';
    return prefix + path.substring(1);
}

/**
 * Helper to fetch JSON data
 */
async function fetchJSON(url) {
    try {
        const finalUrl = getRelativePath(url);
        const response = await fetch(finalUrl);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error(`Error fetching JSON data from ${url}:`, error);
        return null;
    }
}

/**
 * Truncate text utility
 */
function truncateText(text, maxLength) {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

/**
 * Generate a random short id
 */
function generateId() {
    return Math.random().toString(36).substr(2, 9);
}
