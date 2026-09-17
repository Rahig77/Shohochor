/* ==========================================================================
   Shohochor App - UI Controller & Frontend Logic (script.js)
   Description: Handles page navigation, form validation (passwords), 
                dynamic dropdowns, date pickers, and Tab Accessibility.
   ========================================================================== */

// 1. Global Screen Reader Announcer & Toast
window.announce = function(message) {
    const announcer = document.getElementById('sr-announcer');
    if (announcer) {
        announcer.textContent = '';
        setTimeout(() => {
            announcer.textContent = message;
        }, 100);
    }
};

window.showToast = function(message) {
    window.announce(message);
    const container = document.getElementById('toast-container');
    if (container) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        container.appendChild(toast);
        // trigger reflow
        void toast.offsetWidth;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
};

// 2. Global Page Navigation Function
window.navigateTo = function(targetScreenId) {
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => screen.classList.add('hidden'));
    
    const targetScreen = document.getElementById(targetScreenId);
    if (targetScreen) {
        targetScreen.classList.remove('hidden');
        window.scrollTo(0, 0); // Scroll to top
        
        // Announce new page title to screen reader
        const pageTitleElement = targetScreen.querySelector('h2') || targetScreen.querySelector('h1');
        const pageTitle = pageTitleElement ? pageTitleElement.innerText : 'New Page';
        window.announce(pageTitle + " opened");
    }
};

document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // Password Visibility Toggle
    // ==========================================
    document.querySelectorAll('.btn-toggle-password').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');
            const inputEl = document.getElementById(targetId);
            if (!inputEl) return;

            const isPassword = inputEl.type === 'password';
            inputEl.type = isPassword ? 'text' : 'password';

            // Update ARIA and text
            btn.setAttribute('aria-pressed', isPassword ? 'true' : 'false');
            btn.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');
            btn.innerText = isPassword ? 'Hide' : 'Show';

            // Announce to screen readers
            window.announce(isPassword ? 'Password is now visible' : 'Password is now hidden');
        });
    });

    // ==========================================
    // Navigation & Menu Button Controllers
    // ==========================================
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.getAttribute('data-target');
            if (target) window.navigateTo(target);
        });
    });

    // ==========================================
    // Dynamic Back Button Logic
    // ==========================================
    document.querySelectorAll('.btn-back').forEach(btn => {
        btn.addEventListener('click', function() {
            const currentScreen = this.closest('.screen');
            if (!currentScreen) return;

            // Route back based on current context
            if (currentScreen.id.startsWith('screen-request-') && currentScreen.id !== 'screen-request-menu') {
                window.navigateTo('screen-request-menu');
            } else if (currentScreen.id === 'screen-notice-details') {
                window.navigateTo('screen-notices');
            } else if (currentScreen.id.startsWith('screen-admin-')) {
                window.navigateTo('screen-admin');
            } else {
                // Default fallback
                window.navigateTo('screen-dashboard');
            }
        });
    });

    // ==========================================
    // Accessible Tab Controller (Keyboard & Screen Reader Support)
    // ==========================================
    const tabButtons = document.querySelectorAll('[role="tab"]');
    const tabPanels = document.querySelectorAll('[role="tabpanel"]');

    function activateTab(targetTab) {
        // Deactivate all tabs
        tabButtons.forEach(btn => {
            btn.setAttribute('aria-selected', 'false');
            btn.setAttribute('tabindex', '-1');
        });
        // Hide all panels
        tabPanels.forEach(panel => {
            panel.classList.add('hidden');
        });

        // Activate target tab
        targetTab.setAttribute('aria-selected', 'true');
        targetTab.setAttribute('tabindex', '0');
        const targetPanel = document.getElementById(targetTab.getAttribute('aria-controls'));
        if(targetPanel) targetPanel.classList.remove('hidden');

        // Announce to screen reader
        window.announce(targetTab.innerText + ' tab selected');
    }

    tabButtons.forEach((tab, index) => {
        // Click Support
        tab.addEventListener('click', () => {
            activateTab(tab);
        });

        // Keyboard Support (Left/Right Arrows)
        tab.addEventListener('keydown', (e) => {
            let newIndex = index;
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                newIndex = (index + 1) % tabButtons.length;
                e.preventDefault();
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                newIndex = (index - 1 + tabButtons.length) % tabButtons.length;
                e.preventDefault();
            }

            if (newIndex !== index) {
                tabButtons[newIndex].focus();
                activateTab(tabButtons[newIndex]);
            }
        });
    });

    // ==========================================
    // Form Validation and Specific Inline Errors
    // ==========================================
    function showInlineError(inputId, message) {
        const inputEl = document.getElementById(inputId);
        const errorEl = document.getElementById(inputId + '-error');
        if (inputEl && errorEl) {
            errorEl.innerText = message;
            inputEl.setAttribute('aria-invalid', 'true');
            // Append error id to existing aria-describedby if needed, or just set it
            const existingDesc = inputEl.getAttribute('aria-describedby') || '';
            const newDescId = inputId + '-error';
            if (!existingDesc.includes(newDescId)) {
                inputEl.setAttribute('aria-describedby', (existingDesc + ' ' + newDescId).trim());
            }
        }
    }

    function clearInlineError(inputId) {
        const inputEl = document.getElementById(inputId);
        const errorEl = document.getElementById(inputId + '-error');
        if (inputEl && errorEl) {
            errorEl.innerText = '';
            inputEl.removeAttribute('aria-invalid');
            // Remove error id from aria-describedby
            const existingDesc = inputEl.getAttribute('aria-describedby') || '';
            const newDescId = inputId + '-error';
            if (existingDesc.includes(newDescId)) {
                inputEl.setAttribute('aria-describedby', existingDesc.replace(newDescId, '').trim());
            }
        }
    }

    window.validateForm = function(formId) {
        const form = document.getElementById(formId);
        if (!form) return false;

        let isValid = true;
        let firstInvalidInput = null;

        form.querySelectorAll('input[required]').forEach(input => {
            clearInlineError(input.id);
            if (!input.value.trim()) {
                showInlineError(input.id, "This field cannot be left blank.");
                isValid = false;
                if (!firstInvalidInput) firstInvalidInput = input;
            } else if (!input.checkValidity()) {
                if (input.type === 'email') {
                    showInlineError(input.id, "Invalid email format.");
                } else if (input.id === 'reg-phone') {
                    showInlineError(input.id, "Phone number must be exactly 11 digits.");
                } else if (input.id === 'reg-password') {
                    showInlineError(input.id, "Password must be 8-12 characters long.");
                } else {
                    showInlineError(input.id, input.validationMessage);
                }
                isValid = false;
                if (!firstInvalidInput) firstInvalidInput = input;
            }
        });

        if (formId === 'register-form') {
            const regPassword = document.getElementById('reg-password');
            const regPasswordConfirm = document.getElementById('reg-password-confirm');
            if (regPassword && regPasswordConfirm && regPassword.value && regPasswordConfirm.value) {
                if (regPassword.value !== regPasswordConfirm.value) {
                    showInlineError('reg-password-confirm', "Passwords do not match.");
                    isValid = false;
                    if (!firstInvalidInput) firstInvalidInput = regPasswordConfirm;
                }
            }
        }

        if (!isValid && firstInvalidInput) {
            firstInvalidInput.focus();
        }

        return isValid;
    };

    // Clear errors on input
    ['login-form', 'register-form'].forEach(formId => {
        const form = document.getElementById(formId);
        if(form) {
            form.querySelectorAll('input').forEach(input => {
                input.addEventListener('input', () => clearInlineError(input.id));
            });
        }
    });

    // ==========================================
    // Toggle Notice Form Visibility
    // ==========================================
    const btnShowNoticeForm = document.getElementById('btn-show-notice-form');
    const noticeFormContainer = document.getElementById('notice-form-container');
    
    if (btnShowNoticeForm && noticeFormContainer) {
        btnShowNoticeForm.addEventListener('click', () => {
            noticeFormContainer.classList.toggle('hidden');
            const isHidden = noticeFormContainer.classList.contains('hidden');
            btnShowNoticeForm.innerText = isHidden ? "+ Write New Notice" : "- Cancel Notice";
            window.announce(isHidden ? "Notice form closed" : "Notice form opened");
        });
    }

    // ==========================================
    // Year/Semester Dynamic Dropdown Generator
    // ==========================================
    function setupYearSemesterToggle(radioName, dropdownId) {
        document.querySelectorAll(`input[name="${radioName}"]`).forEach(radio => {
            radio.addEventListener('change', (e) => {
                const dropdown = document.getElementById(dropdownId);
                if (!dropdown) return;
                
                dropdown.innerHTML = '<option value="">Choose an option</option>'; 
                
                const options = e.target.value === 'year' 
                    ? ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Masters'] 
                    : ['1st Semester', '2nd Semester', '3rd Semester', '4th Semester', '5th Semester', '6th Semester', '7th Semester', '8th Semester', 'Masters'];
                
                options.forEach(opt => {
                    const el = document.createElement('option');
                    el.value = opt; 
                    el.textContent = opt;
                    dropdown.appendChild(el);
                });
                
                window.announce(e.target.value + " selected. Choose from the dropdown below.");
            });
        });
    }

    setupYearSemesterToggle('prof_ys_toggle', 'prof-ys-dropdown');
    setupYearSemesterToggle('req_scr_ys_toggle', 'req-scr-ys-dropdown');

    // ==========================================
    // Date Picker Auto-Population Helper
    // ==========================================
    function populateDateFields(dayId, monthId, yearId) {
        const daySelect = document.getElementById(dayId);
        const monthSelect = document.getElementById(monthId);
        const yearSpan = document.getElementById(yearId);

        // Populate Days (1-31)
        if (daySelect && daySelect.options.length <= 1) {
            for (let i = 1; i <= 31; i++) {
                let opt = document.createElement('option');
                opt.value = i; opt.textContent = i;
                daySelect.appendChild(opt);
            }
        }

        // Populate Months
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        if (monthSelect && monthSelect.options.length <= 1) {
            months.forEach(m => {
                let opt = document.createElement('option');
                opt.value = m; opt.textContent = m;
                monthSelect.appendChild(opt);
            });
        }

        // Set Current Year
        if (yearSpan) {
            yearSpan.textContent = new Date().getFullYear();
        }
    }

    populateDateFields('req-scr-day', 'req-scr-month', 'req-scr-year');
    populateDateFields('req-gen-day', 'req-gen-month', 'req-gen-year');

});