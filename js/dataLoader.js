// dataLoader.js
// Handles consuming flat static JSON databases and visually converting them recursively into Card HTML interfaces.
// Linked heavily against: `components/card-*.html` templates and `/data/*.json` schemas.

/**
 * GLOBALLY BOUND PATH REGISTRY
 * Lists out the explicit locations to the database files to avoid re-writing URLs on functions.
 */
const DATA_PATHS = {
    projects: '/data/projects.json',
    blogs: '/data/blogs.json',
    courses: '/data/courses.json',
    research: '/data/research.json',
    events: '/data/events.json'
};

/**
 * Loads data and array maps it to a specific HTML Component file, injecting it into a container.
 */
async function loadAndRenderCards(dataPath, containerId, templatePath) {
    const container = document.getElementById(containerId);
    if (!container) return;

    try {
        const [data, templateRes] = await Promise.all([
            fetchJSON(dataPath),
            fetch(templatePath)
        ]);

        if (!data || !templateRes.ok) throw new Error(`Data or template load failed for ${containerId}`);

        const templateHtml = await templateRes.text();
        let htmlContent = '';

        // Iterate over the parsed JSON array dynamically 
        data.forEach(item => {
            let cardHtml = templateHtml;
            
            // For every Key:Value mapping inside the JSON (eg. "title": "Example"), 
            // the regex replaces strictly identical instances of {{key}} found purely within the fetched HTML.
            for (const key in item) {
                const regex = new RegExp(`{{${key}}}`, 'g');
                cardHtml = cardHtml.replace(regex, item[key] || '');
            }
            
            // Post-hook cleanup filter deletes all {{...}} structures that never got mapped in JSON, 
            // ensuring broken tag variables aren't visibly rendered to the user on empty data fields.
            cardHtml = cardHtml.replace(/{{.*?}}/g, '');
            
            // Append modified template iteration to total inner output string.
            htmlContent += cardHtml;
        });

        container.innerHTML = htmlContent;

        // Re-apply translation logic to dynamically injected node
        if (window.applyTranslations) window.applyTranslations(container);
    } catch (e) {
        console.error(e);
        container.innerHTML = `<div class="text-red-500 py-4 text-center">Failed to load dynamic content.</div>`;
    }
}

/**
 * GLOBAL DISPATCHER INVOKER
 * Fired instantly from `main.js` upon completion of the basic layout components.
 * Configured explicitly linking logical specific arrays into defined matching front-end containers mapped across any site page.
 */
// Global invocation - called specifically in various pages
window.initDataLoading = function () {
    loadAndRenderCards(DATA_PATHS.projects, 'completed-projects-container', '/components/card-project.html');
    loadAndRenderCards(DATA_PATHS.projects, 'ongoing-projects-container', '/components/card-project.html');

    loadAndRenderCards(DATA_PATHS.blogs, 'latest-blogs-container', '/components/card-blog.html');
    loadAndRenderCards(DATA_PATHS.blogs, 'all-blogs-container', '/components/card-blog.html');

    loadAndRenderCards(DATA_PATHS.courses, 'featured-courses-container', '/components/card-course.html');
    loadAndRenderCards(DATA_PATHS.courses, 'all-courses-container', '/components/card-course.html');
    
    // Load Events Data
    loadAndRenderCards(DATA_PATHS.events, 'events-container', '/components/card-event.html');
}
