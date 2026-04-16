/**
 * [NEWSLETTER HANDLER: newsletter.js]
 * Role: Manages frontend subscription logic for the footer newsletter form.
 * Note: Static sites require a third-party service (like Formspree or Mailchimp) to actually send emails.
 */

document.addEventListener('DOMContentLoaded', () => {
    const newsletterForm = document.getElementById('footer-newsletter-form');
    const statusMsg = document.getElementById('newsletter-status');

    if (newsletterForm) {
        newsletterForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const emailInput = newsletterForm.querySelector('input[type="email"]');
            const email = emailInput.value;

            if (!email) return;

            // UI Feedback: Loading
            const submitBtn = newsletterForm.querySelector('button');
            const originalBtnContent = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            submitBtn.disabled = true;

            try {
                // MOCK DELAY (Simulating API call)
                await new Promise(resolve => setTimeout(resolve, 1000));

                /**
                 * REAL IMPLEMENTATION TIP:
                 * To make this work, change the form action to your Formspree/Mailchimp endpoint
                 * and use fetch() to post the data here.
                 */

                // Success Feedback
                statusMsg.textContent = 'Thank you for subscribing! We will notify you of new updates.';
                statusMsg.classList.remove('hidden', 'text-red-500');
                statusMsg.classList.add('text-brand-accent');
                
                emailInput.value = ''; // Clear input
            } catch (err) {
                // Error Feedback
                statusMsg.textContent = 'Something went wrong. Please try again later.';
                statusMsg.classList.remove('hidden', 'text-brand-accent');
                statusMsg.classList.add('text-red-500');
            } finally {
                // Reset Button
                submitBtn.innerHTML = originalBtnContent;
                submitBtn.disabled = false;
            }
        });
    }
});
