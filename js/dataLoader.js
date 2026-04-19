// dataLoader.js
// Handles consuming flat static JSON databases and visually converting them recursively into Card HTML interfaces.
// Linked heavily against: `components/card-*.html` templates and `/data/*.json` schemas.

/**
 * GLOBALLY BOUND PATH REGISTRY
 * Lists out the explicit locations to the database files to avoid re-writing URLs on functions.
 */
const DATA_PATHS = {
    home: '/data/home',
    researchWing: '/data/research-wing',
    events: '/data/events',
    capacityBuilding: '/data/capacity-building',
    policyAdvisory: '/data/policy-advisory',
    mandate: '/data/mandate',
    governance: '/data/governance',
    contact: '/data/contact'
};

/**
 * Loads data and array maps it to a specific HTML Component file, injecting it into a container.
 */
async function loadAndRenderCards(dataPath, containerId, templatePath, filterKey = null, filterValue = null) {
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

        // Filter data if criteria provided
        let filteredData = data;
        if (filterKey && filterValue) {
            filteredData = data.filter(item => {
                // Support case-insensitive matching
                return String(item[filterKey] || '').toLowerCase() === String(filterValue).toLowerCase();
            });
        }

        // Iterate over the parsed JSON array dynamically 
        filteredData.forEach(item => {
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
 * Renders a component using provided data (object).
 */
async function renderComponent(containerId, templatePath, data) {
    const container = document.getElementById(containerId);
    if (!container) return;

    try {
        const finalPath = typeof getRelativePath === 'function' ? getRelativePath(templatePath) : templatePath;
        const res = await fetch(finalPath);
        if (!res.ok) throw new Error(`Template load failed for ${templatePath}`);
        
        let templateHtml = await res.text();
        let htmlContent = templateHtml;

            for (const key in data) {
                const regex = new RegExp(`{{${key}}}`, 'g');
                htmlContent = htmlContent.replace(regex, data[key] || '');
            }

            htmlContent = htmlContent.replace(/{{.*?}}/g, '');
            container.innerHTML = htmlContent;

            // Force script execution
            const scripts = container.querySelectorAll('script');
            scripts.forEach(oldScript => {
                const newScript = document.createElement('script');
                Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
                newScript.appendChild(document.createTextNode(oldScript.innerHTML));
                oldScript.parentNode.replaceChild(newScript, oldScript);
            });

            if (window.applyTranslations) window.applyTranslations(container);
    } catch (e) {
        console.error(`Error in renderComponent for ${templatePath}:`, e);
    }
}

/**
 * Renders a list of items into a container using a template.
 */
async function renderList(containerId, templatePath, items) {
    const container = document.getElementById(containerId);
    if (!container || !items || !Array.isArray(items)) return;

    const finalPath = typeof getRelativePath === 'function' ? getRelativePath(templatePath) : templatePath;
    const res = await fetch(finalPath);
    if (!res.ok) return;
    const templateHtml = await res.text();

    let htmlContent = '';
    items.forEach(item => {
        let card = templateHtml;
        for (const key in item) {
            const regex = new RegExp(`{{${key}}}`, 'g');
            card = card.replace(regex, item[key] || '');
        }
        htmlContent += card;
    });

    container.innerHTML = htmlContent;
}

/**
 * GLOBAL DISPATCHER INVOKER
 * Fired instantly from `main.js` upon completion of the basic layout components.
 * Configured explicitly linking logical specific arrays into defined matching front-end containers mapped across any site page.
 */
// Global invocation - called specifically in various pages
window.initDataLoading = function () {
    const lang = window.currentLang || 'en';
    const homeDataPath = `${DATA_PATHS.home}-${lang}.json`;

    fetchJSON(homeDataPath)
        .then(data => {
            if (!data) return;

            // Render sections using consolidated data
            if (data.about) renderComponent('section-about-placeholder', '/components/section-about.html', data.about);
            if (data.stats) renderComponent('section-stats-placeholder', '/components/section-stats.html', data.stats);
            if (data.featuredResearch) renderComponent('section-featured-research-placeholder', '/components/section-featured-research.html', data.featuredResearch);
            if (data.trainingHeader) renderComponent('section-training-header-placeholder', '/components/section-training-header.html', data.trainingHeader);
            
            // Note: insightsHeader was deleted previously but we keep the logic ready if added back to JSON
            if (data.insightsHeader) renderComponent('section-insights-header-placeholder', '/components/section-insights-header.html', data.insightsHeader);

            // Fetch full research data and load modal for featured research interaction
            if (data.featuredResearch) {
                const researchPath = `${DATA_PATHS.researchWing}-${lang}.json`;
                fetchJSON(researchPath).then(resData => {
                    allResearchData = resData || [];
                });
                
                const modalPlaceholder = document.getElementById('research-modal-placeholder');
                if (modalPlaceholder) {
                    const modalPath = typeof getRelativePath === 'function' ? getRelativePath('/components/modal-research.html') : '/components/modal-research.html';
                    fetch(modalPath).then(res => {
                        if (res.ok) res.text().then(html => modalPlaceholder.innerHTML = html);
                    });
                }
            }
        })
        .catch(console.error);
}

// ===========================================
// [RESEARCH WING SPECIALIZED LOGIC]
// ===========================================

let allResearchData = [];
let currentCategory = 'All';
let currentType = 'All';

/**
 * Initializes the Research Wing page data and interactions.
 */
window.initResearchWing = async function() {
    const lang = window.currentLang || 'en';
    const researchDataPath = `${DATA_PATHS.researchWing}-${lang}.json`;

    // 1. Load the Modal Component once
    const modalPlaceholder = document.getElementById('research-modal-placeholder');
    if (modalPlaceholder) {
        const modalPath = typeof getRelativePath === 'function' ? getRelativePath('/components/modal-research.html') : '/components/modal-research.html';
        const modalRes = await fetch(modalPath);
        if (modalRes.ok) modalPlaceholder.innerHTML = await modalRes.text();
    }

    // 2. Fetch and Store Data
    allResearchData = await fetchJSON(researchDataPath);
    if (!allResearchData) return;

    // 3. Initial Render
    window.renderResearchCards();
};

/**
 * Filters data and re-renders the grid.
 */
window.filterByCategory = function(category) {
    currentCategory = category;
    
    // Update active UI state
    document.querySelectorAll('.category-btn').forEach(btn => {
        const btnText = btn.innerText.trim().toLowerCase();
        const searchCat = category.toLowerCase();
        const isActive = (searchCat === 'all' && btnText === 'all fields') || (btnText === searchCat);
        
        if (isActive) {
            btn.classList.add('bg-brand-accent', 'text-white', 'border-brand-accent', 'shadow-md');
            btn.classList.remove('bg-white', 'text-brand-dark', 'border-gray-200');
        } else {
            btn.classList.remove('bg-brand-accent', 'text-white', 'border-brand-accent', 'shadow-md');
            btn.classList.add('bg-white', 'text-brand-dark', 'border-gray-200');
        }
    });

    window.renderResearchCards();
};

window.filterByType = function(type) {
    currentType = type;

    // Update active UI state
    document.querySelectorAll('.type-btn').forEach(btn => {
        const btnText = btn.innerText.trim().toLowerCase();
        const searchType = type.toLowerCase();
        
        // Match logic: Exact match or special "all types" case
        const isActive = (searchType === 'all' && btnText === 'all types') || 
                        (btnText === searchType) ||
                        (searchType !== 'all' && btnText.includes(searchType.split(' ')[0]));
        
        if (isActive) {
            btn.classList.add('text-brand-accent', 'border-brand-accent', 'border-b-2');
            btn.classList.remove('text-brand-dark/50', 'border-transparent');
        } else {
            btn.classList.remove('text-brand-accent', 'border-brand-accent', 'border-b-2');
            btn.classList.add('text-brand-dark/50', 'border-transparent');
        }
    });

    window.renderResearchCards();
};

/**
 * Renders research cards based on current filters.
 */
window.renderResearchCards = async function() {
    const container = document.getElementById('research-wing-container');
    if (!container) return;

    const filtered = allResearchData.filter(item => {
        const catMatch = currentCategory === 'All' || item.category === currentCategory;
        const typeMatch = currentType === 'All' || item.type === currentType;
        return catMatch && typeMatch;
    });

    if (filtered.length === 0) {
        container.innerHTML = `<div class="col-span-full py-20 text-center text-gray-400">No research articles found for the selected filters.</div>`;
        return;
    }

    const templatePath = typeof getRelativePath === 'function' ? getRelativePath('/components/card-research.html') : '/components/card-research.html';
    const templateRes = await fetch(templatePath);
    if (!templateRes.ok) return;
    const templateHtml = await templateRes.text();

    let htmlContent = '';
    filtered.forEach(item => {
        let card = templateHtml;
        for (const key in item) {
            const regex = new RegExp(`{{${key}}}`, 'g');
            card = card.replace(regex, item[key] || '');
        }
        htmlContent += card;
    });

    container.innerHTML = htmlContent;
};

/**
 * Handles Modal Data Binding and Visibility
 */
window.openResearchModal = function(id) {
    const item = allResearchData.find(r => r.id === id);
    if (!item) return;

    const modal = document.getElementById('research-modal');
    if (!modal) return;

    // Data Binding
    document.getElementById('modal-category').innerText = item.category;
    document.getElementById('modal-type').innerText = item.type;
    document.getElementById('modal-article-title').innerText = item.articleTitle || item.title;
    document.getElementById('modal-date').innerText = item.date;
    document.getElementById('modal-team').innerText = item.team;
    document.getElementById('modal-details').innerText = item.details;

    // PDF Preview
    const previewFrame = document.getElementById('modal-pdf-preview');
    const placeholder = document.getElementById('modal-preview-placeholder');
    if (item.previewUrl) {
        previewFrame.src = item.previewUrl;
        previewFrame.classList.remove('hidden');
        placeholder.classList.add('hidden');
    } else {
        previewFrame.src = "";
        previewFrame.classList.add('hidden');
        placeholder.classList.remove('hidden');
    }

    // Buttons
    document.getElementById('modal-preview-btn').href = item.previewUrl || '#';
    document.getElementById('modal-download-btn').href = item.downloadUrl || '#';

    // Show Modal
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.style.overflow = 'hidden'; // Prevent scroll
};

window.closeResearchModal = function() {
    const modal = document.getElementById('research-modal');
    if (!modal) return;

    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.body.style.overflow = ''; // Restore scroll
    
    // Stop iframe content
    document.getElementById('modal-pdf-preview').src = "";
};

// ===========================================
// [ABOUT US: MANDATE & GOVERNANCE]
// ===========================================

window.initMandatePage = async function() {
    const lang = window.currentLang || 'en';
    const dataPath = `${DATA_PATHS.mandate}-${lang}.json`;

    const data = await fetchJSON(dataPath);
    if (!data || !data.mandate) return;

    renderComponent('section-mandate-placeholder', '/components/section-mandate.html', data.mandate);
};

window.initGovernancePage = async function() {
    const lang = window.currentLang || 'en';
    const dataPath = `${DATA_PATHS.governance}-${lang}.json`;

    const data = await fetchJSON(dataPath);
    if (!data || !data.governance) return;

    // Header Content
    document.getElementById('board-title').innerText = data.governance.boardTitle;
    document.getElementById('board-summary').innerText = data.governance.boardSummary;
    document.getElementById('team-title').innerText = data.governance.teamTitle;
    document.getElementById('team-summary').innerText = data.governance.teamSummary;

    // Render Lists
    renderList('board-grid-placeholder', '/components/card-member.html', data.governance.board);
    renderList('team-container', '/components/card-member.html', data.governance.team);
};

window.initContactPage = async function() {
    const lang = window.currentLang || 'en';
    const dataPath = `${DATA_PATHS.contact}-${lang}.json`;

    const data = await fetchJSON(dataPath);
    if (!data) return;

    // Header Content
    if (data.hero) {
        if (document.getElementById('contact-hero-title')) document.getElementById('contact-hero-title').innerText = data.hero.title;
        if (document.getElementById('contact-hero-description')) document.getElementById('contact-hero-description').innerText = data.hero.description;
    }

    // Contact Section
    await renderComponent('contact-section-placeholder', '/components/section-contact.html', data.details);

    // Update individual fields after rendering (if using IDs inside the template)
    if (data.details) {
        if (document.getElementById('contact-phone')) document.getElementById('contact-phone').innerText = data.details.phone;
        if (document.getElementById('contact-email')) document.getElementById('contact-email').innerText = data.details.email;
        if (document.getElementById('contact-address')) document.getElementById('contact-address').innerText = data.details.address;
        if (document.getElementById('contact-hours')) document.getElementById('contact-hours').innerText = data.details.workHours;
    }

    // Map Update
    if (data.map && data.map.embedUrl) {
        const mapFrame = document.getElementById('contact-map');
        if (mapFrame) mapFrame.src = data.map.embedUrl;
    }

    // New: Departmental Contacts
    if (data.departments) {
        renderList('departments-grid', '/components/card-department.html', data.departments);
    }
};

// ===========================================
// [WORKSHOPS & EVENTS SPECIALIZED LOGIC]
// ===========================================

let allEventsData = [];
let currentEventFilter = 'All';
let isStatusFilter = false;

/**
 * Initializes the Events Page.
 */
window.initEventsPage = async function() {
    const lang = window.currentLang || 'en';
    const eventsDataPath = `${DATA_PATHS.events}.json`;

    // Fetch Unified Data
    const data = await fetchJSON(eventsDataPath);
    if (!data) return;

    // Extract language-specific array
    allEventsData = data[lang] || data['en'] || [];

    // Initial Render
    window.renderEventCards();
};

/**
 * Filters events by type or status.
 */
window.filterEvents = function(filter, isStatus = false) {
    currentEventFilter = filter;
    isStatusFilter = isStatus;

    // Update active UI state
    document.querySelectorAll('.event-filter-btn').forEach(btn => {
        const btnText = btn.innerText.trim();
        const isActive = (filter === 'All' && btnText.includes('All')) || 
                        (btnText.includes(filter));
        
        if (isActive) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    window.renderEventCards();
};

/**
 * Renders event cards based on current filter.
 */
window.renderEventCards = async function() {
    const container = document.getElementById('events-grid-container');
    if (!container) return;

    const filtered = allEventsData.filter(item => {
        if (currentEventFilter === 'All') return true;
        if (isStatusFilter) return item.status === currentEventFilter;
        return item.type === currentEventFilter;
    });

    if (filtered.length === 0) {
        container.innerHTML = `<div class="col-span-full py-20 text-center text-gray-400">No events found for the selected category.</div>`;
        return;
    }

    const templatePath = typeof getRelativePath === 'function' ? getRelativePath('/components/card-event.html') : '/components/card-event.html';
    const templateRes = await fetch(templatePath);
    if (!templateRes.ok) return;
    const templateHtml = await templateRes.text();

    let htmlContent = '';
    filtered.forEach(item => {
        let card = templateHtml;
        for (const key in item) {
            const regex = new RegExp(`{{${key}}}`, 'g');
            card = card.replace(regex, item[key] || '');
        }
        htmlContent += card;
    });

    container.innerHTML = htmlContent;
};

// ===========================================
// [CAPACITY BUILDING SPECIALIZED LOGIC]
// ===========================================

/**
 * Initializes the Capacity Building page.
 */
window.initCapacityBuildingPage = async function() {
    const lang = window.currentLang || 'en';
    const dataPath = `${DATA_PATHS.capacityBuilding}.json`;

    const data = await fetchJSON(dataPath);
    if (!data || !data[lang]) return;

    const pageData = data[lang];

    // 1. Hero Content
    if (pageData.hero) {
        if (document.getElementById('hero-title')) document.getElementById('hero-title').innerText = pageData.hero.title;
        if (document.getElementById('hero-description')) document.getElementById('hero-description').innerText = pageData.hero.description;
    }

    // 2. Render Categories
    const container = document.getElementById('capacity-building-container');
    if (!container || !pageData.categories) return;

    // Load templates
    const [sectionRes, cardRes] = await Promise.all([
        fetch(typeof getRelativePath === 'function' ? getRelativePath('/components/section-program-category.html') : '/components/section-program-category.html'),
        fetch(typeof getRelativePath === 'function' ? getRelativePath('/components/card-program.html') : '/components/card-program.html')
    ]);

    if (!sectionRes.ok || !cardRes.ok) return;
    const sectionTemplate = await sectionRes.text();
    const cardTemplate = await cardRes.text();

    let finalHtml = '';

    pageData.categories.forEach(cat => {
        // Build the programs list HTML
        let programListHtml = '';
        cat.programs.forEach(prog => {
            let pCard = cardTemplate;
            for (const k in prog) {
                const r = new RegExp(`{{${k}}}`, 'g');
                pCard = pCard.replace(r, prog[k] || '');
            }
            programListHtml += pCard;
        });

        // Build the section HTML
        let sectionHtml = sectionTemplate;
        for (const k in cat) {
            if (k === 'programs') continue;
            const r = new RegExp(`{{${k}}}`, 'g');
            sectionHtml = sectionHtml.replace(r, cat[k] || '');
        }
        sectionHtml = sectionHtml.replace(/{{programListHtml}}/g, programListHtml);
        
        finalHtml += sectionHtml;
    });

    container.innerHTML = finalHtml;

    // Apply translations
    if (window.applyTranslations) window.applyTranslations(container);
};

// ===========================================
// [POLICY & ADVISORY SPECIALIZED LOGIC]
// ===========================================

/**
 * Initializes the Policy & Advisory Services page.
 */
window.initPolicyAdvisoryPage = async function() {
    const lang = window.currentLang || 'en';
    const dataPath = `${DATA_PATHS.policyAdvisory}.json`;

    const data = await fetchJSON(dataPath);
    if (!data || !data[lang]) return;

    const pageData = data[lang];

    // 1. Hero Content
    if (pageData.hero) {
        if (document.getElementById('hero-title')) document.getElementById('hero-title').innerText = pageData.hero.title;
        if (document.getElementById('hero-description')) document.getElementById('hero-description').innerText = pageData.hero.description;
    }

    // 2. Render Categories
    const container = document.getElementById('policy-advisory-container');
    if (!container || !pageData.categories) return;

    // Load templates (reusing program card templates)
    const [sectionRes, cardRes] = await Promise.all([
        fetch(typeof getRelativePath === 'function' ? getRelativePath('/components/section-program-category.html') : '/components/section-program-category.html'),
        fetch(typeof getRelativePath === 'function' ? getRelativePath('/components/card-program.html') : '/components/card-program.html')
    ]);

    if (!sectionRes.ok || !cardRes.ok) return;
    const sectionTemplate = await sectionRes.text();
    const cardTemplate = await cardRes.text();

    let finalHtml = '';

    pageData.categories.forEach(cat => {
        // Build the programs list HTML
        let programListHtml = '';
        if (cat.programs) {
            cat.programs.forEach(prog => {
                let pCard = cardTemplate;
                for (const k in prog) {
                    const r = new RegExp(`{{${k}}}`, 'g');
                    pCard = pCard.replace(r, prog[k] || '');
                }
                programListHtml += pCard;
            });
        }

        // Build the section HTML
        let sectionHtml = sectionTemplate;
        for (const k in cat) {
            if (k === 'programs') continue;
            const r = new RegExp(`{{${k}}}`, 'g');
            sectionHtml = sectionHtml.replace(r, cat[k] || '');
        }
        
        // Custom override for grid ID to avoid conflicts if multiple sections exist
        sectionHtml = sectionHtml.replace(/programs-grid-{{id}}/g, `advisory-grid-${cat.id}`);
        sectionHtml = sectionHtml.replace(/{{programListHtml}}/g, programListHtml);
        
        finalHtml += sectionHtml;
    });

    container.innerHTML = finalHtml;

    // Apply translations
    if (window.applyTranslations) window.applyTranslations(container);
};

