// pdfHandler.js
// Handles PDF previews using Modal and dynamically setting iframes.

const pdfHandler = {
    preview(url) {
        if (!url) return;

        const modal = document.getElementById('pdf-modal');
        const iframe = document.getElementById('pdf-iframe');
        const loader = document.getElementById('pdf-modal-loader');
        const downloadBtn = document.getElementById('pdf-download-btn');

        if (!modal || !iframe) {
            console.error("Modal elements not found. Make sure modal.html is loaded.");
            return;
        }

        // Reset state
        iframe.classList.add('hidden');
        loader.classList.remove('hidden');
        iframe.src = url;
        if (downloadBtn) downloadBtn.href = url;

        modal.classList.remove('hidden');

        // Use timeout to allow CSS transition to play
        requestAnimationFrame(() => {
            const content = document.getElementById('pdf-modal-content');
            content.classList.remove('scale-95', 'opacity-0');
            content.classList.add('scale-100', 'opacity-100');
        });
    },

    closeModal() {
        const modal = document.getElementById('pdf-modal');
        const content = document.getElementById('pdf-modal-content');
        if (!modal) return;

        content.classList.remove('scale-100', 'opacity-100');
        content.classList.add('scale-95', 'opacity-0');

        setTimeout(() => {
            modal.classList.add('hidden');
            document.getElementById('pdf-iframe').src = '';
        }, 300);
    }
};

window.pdfHandler = pdfHandler;
