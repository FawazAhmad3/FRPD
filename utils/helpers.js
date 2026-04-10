/**
 * Helper to fetch JSON data
 * @param {string} url - The URL to fetch data from
 * @returns {Promise<any>} Data object or null
 */
async function fetchJSON(url) {
    try {
        const response = await fetch(url);
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
