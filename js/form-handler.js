/**
 * KVP Spinning Mills — generic AJAX handler for Web3Forms-powered forms.
 * Works for any <form> on the site as long as it has:
 *   - a unique id
 *   - a #formAlert (or [data-form-alert]) message box inside it
 *   - a submit button to disable while sending
 *
 * Usage: wireKvpForm('kvpContactForm');
 */
function wireKvpForm(formId) {
    const form = document.getElementById(formId);
    if (!form) return;

    const alertBox = form.querySelector('[id$="formAlert"], .form-alert');
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnHTML = submitBtn ? submitBtn.innerHTML : '';

    function showAlert(message, type) {
        if (!alertBox) return;
        alertBox.style.display = 'block';
        alertBox.textContent = message;
        if (type === 'success') {
            alertBox.style.background = '#e9f9ee';
            alertBox.style.color = '#1a7a3c';
            alertBox.style.border = '1px solid #bfe8cc';
        } else {
            alertBox.style.background = '#fdeceb';
            alertBox.style.color = '#c0392b';
            alertBox.style.border = '1px solid #f5c6c1';
        }
        alertBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        // Honeypot spam check
        const honeypot = form.querySelector('input[name="botcheck"]');
        if (honeypot && honeypot.checked) {
            return;
        }

        const accessKeyField = form.querySelector('input[name="access_key"]');
        if (accessKeyField && accessKeyField.value.indexOf('PASTE_YOUR') === 0) {
            showAlert('Form is not fully configured yet — add your free Web3Forms access key to activate email sending.', 'error');
            return;
        }

        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = 'Sending...';
        }

        const formData = new FormData(form);
        const object = Object.fromEntries(formData);
        const json = JSON.stringify(object);

        fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: json
        })
            .then(async (response) => {
                let result = {};
                try { result = await response.json(); } catch (err) { /* ignore parse errors */ }

                if (response.status === 200 || result.success) {
                    showAlert("Thank you! Your request has been sent — our team will get back to you within 24 hours.", 'success');
                    form.reset();
                } else {
                    showAlert(result.message || 'Something went wrong. Please try again or email us directly.', 'error');
                }
            })
            .catch(() => {
                showAlert('Could not send your request — please check your internet connection and try again.', 'error');
            })
            .finally(() => {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnHTML;
                }
            });
    });
}
