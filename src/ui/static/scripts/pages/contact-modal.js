/**
 * Contact Modal - Mock "Fale Conosco" functionality
 * Frontend-only simulation without actual email sending
 */

document.addEventListener('DOMContentLoaded', () => {
    const backdrop = document.getElementById('contactModalBackdrop');
    const closeBtn = document.getElementById('contactModalClose');
    const form = document.getElementById('contactForm');
    const submitBtn = document.getElementById('contactSubmitBtn');
    const successMessage = document.getElementById('contactSuccessMessage');
    const formContainer = document.getElementById('contactFormContainer');

    // Form fields
    const nameInput = document.getElementById('contactName');
    const emailInput = document.getElementById('contactEmail');
    const subjectInput = document.getElementById('contactSubject');
    const messageInput = document.getElementById('contactMessage');

    // Error elements
    const nameError = document.getElementById('contactNameError');
    const emailError = document.getElementById('contactEmailError');
    const subjectError = document.getElementById('contactSubjectError');
    const messageError = document.getElementById('contactMessageError');
    const charCounter = document.getElementById('contactCharCounter');

    // Open modal triggers
    const openTriggers = document.querySelectorAll('[data-contact-modal]');
    openTriggers.forEach(trigger => {
        trigger.addEventListener('click', openModal);
    });

    // Close modal
    closeBtn?.addEventListener('click', closeModal);
    backdrop?.addEventListener('click', (e) => {
        if (e.target === backdrop) closeModal();
    });

    // ESC key to close
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && backdrop?.classList.contains('open')) {
            closeModal();
        }
    });

    // Character counter for message
    messageInput?.addEventListener('input', updateCharCounter);

    // Form submission
    form?.addEventListener('submit', handleSubmit);

    // Clear errors on input
    [nameInput, emailInput, subjectInput, messageInput].forEach(input => {
        input?.addEventListener('input', () => clearError(input));
    });

    function openModal() {
        backdrop?.classList.add('open');
        document.body.style.overflow = 'hidden';
        resetForm();
    }

    function closeModal() {
        backdrop?.classList.remove('open');
        document.body.style.overflow = '';
    }

    function resetForm() {
        form?.reset();
        successMessage?.classList.remove('visible');
        formContainer.style.display = 'block';
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;

        // Clear all errors
        clearAllErrors();
        updateCharCounter();
    }

    function clearAllErrors() {
        [nameError, emailError, subjectError, messageError].forEach(error => {
            error?.classList.remove('visible');
        });
        [nameInput, emailInput, subjectInput, messageInput].forEach(input => {
            input?.classList.remove('has-error');
        });
    }

    function clearError(input) {
        input?.classList.remove('has-error');
        const errorId = `${input.id}Error`;
        const errorEl = document.getElementById(errorId);
        errorEl?.classList.remove('visible');
    }

    function showError(input, errorEl, message) {
        input?.classList.add('has-error');
        if (errorEl) {
            errorEl.querySelector('span').textContent = message;
            errorEl.classList.add('visible');
        }
    }

    function updateCharCounter() {
        if (!charCounter || !messageInput) return;
        const length = messageInput.value.length;
        charCounter.textContent = `${length}/10 caracteres mínimos`;

        if (length > 0 && length < 10) {
            charCounter.classList.add('error');
        } else {
            charCounter.classList.remove('error');
        }
    }

    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function sanitizeInput(str) {
        // Treat as plain text to prevent injection attacks
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function validateForm() {
        let isValid = true;
        clearAllErrors();

        // Name validation
        const name = nameInput?.value.trim() || '';
        if (!name) {
            showError(nameInput, nameError, 'Por favor, informe seu nome.');
            isValid = false;
        }

        // Email validation with regex
        const email = emailInput?.value.trim() || '';
        if (!email) {
            showError(emailInput, emailError, 'Por favor, informe seu e-mail.');
            isValid = false;
        } else if (!validateEmail(email)) {
            showError(emailInput, emailError, 'Por favor, informe um e-mail válido.');
            isValid = false;
        }

        // Subject validation
        const subject = subjectInput?.value.trim() || '';
        if (!subject) {
            showError(subjectInput, subjectError, 'Por favor, informe o assunto.');
            isValid = false;
        }

        // Message validation (min 10 characters)
        const message = messageInput?.value.trim() || '';
        if (!message) {
            showError(messageInput, messageError, 'Por favor, escreva sua mensagem.');
            isValid = false;
        } else if (message.length < 10) {
            showError(messageInput, messageError, 'A mensagem deve ter no mínimo 10 caracteres.');
            isValid = false;
        }

        return isValid;
    }

    async function handleSubmit(e) {
        e.preventDefault();

        if (!validateForm()) return;

        // Sanitize all inputs
        const formData = {
            name: sanitizeInput(nameInput.value.trim()),
            email: sanitizeInput(emailInput.value.trim()),
            subject: sanitizeInput(subjectInput.value.trim()),
            message: sanitizeInput(messageInput.value.trim())
        };

        // Show loading state
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;

        // Mock: Simulate 1 second delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Mock success response
        console.log('Contact form submitted (mock):', formData);

        // Hide form, show success message
        formContainer.style.display = 'none';
        successMessage?.classList.add('visible');

        // Remove loading state
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;

        // Re-initialize icons for the success message
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
});
