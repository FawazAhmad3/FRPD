// dataLoader.js
// Responsible for dynamically loading card templates and marrying them with JSON data

const DATA_PATHS = {
    projects: '/data/projects.json',
    blogs: '/data/blogs.json',
    courses: '/data/courses.json',
    research: '/data/research.json'
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

        data.forEach(item => {
            let cardHtml = templateHtml;
            // Simple replace of {{key}} with object literal value
            for (const key in item) {
                const regex = new RegExp(`{{${key}}}`, 'g');
                cardHtml = cardHtml.replace(regex, item[key] || '');
            }
            // Cleanup missing double-braced tags that had no data mapping
            cardHtml = cardHtml.replace(/{{.*?}}/g, '');
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

// Global invocation - called specifically in various pages
window.initDataLoading = function () {
    loadAndRenderCards(DATA_PATHS.projects, 'completed-projects-container', '/components/card-project.html');
    loadAndRenderCards(DATA_PATHS.projects, 'ongoing-projects-container', '/components/card-project.html');

    loadAndRenderCards(DATA_PATHS.blogs, 'latest-blogs-container', '/components/card-blog.html');
    loadAndRenderCards(DATA_PATHS.blogs, 'all-blogs-container', '/components/card-blog.html');

    loadAndRenderCards(DATA_PATHS.courses, 'featured-courses-container', '/components/card-course.html');
    loadAndRenderCards(DATA_PATHS.courses, 'all-courses-container', '/components/card-course.html');
}
