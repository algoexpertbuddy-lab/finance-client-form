// Application state
const app = {
    currentPage: 'formPage',
    formData: {},
    isSubmitting: false
};

// DOM elements
const elements = {
    // Pages
    formPage: document.getElementById('formPage'),
    termsPage: document.getElementById('termsPage'),
    
    // Form elements
    form: document.getElementById('registrationForm'),
    fullName: document.getElementById('fullName'),
    mobileNumber: document.getElementById('mobileNumber'),
    emailId: document.getElementById('emailId'),
    tradingviewId: document.getElementById('tradingviewId'), // ADD THIS LINE
    termsCheckbox: document.getElementById('termsCheckbox'),
    submitBtn: document.getElementById('submitBtn'),
    
    // Navigation elements
    termsLink: document.getElementById('termsLink'),
    backToForm: document.getElementById('backToForm'),
    backToFormBottom: document.getElementById('backToFormBottom'),
    
    // UI elements
    successMessage: document.getElementById('successMessage'),
    loadingSpinner: document.querySelector('.loading-spinner'),
    btnText: document.querySelector('.btn-text'),
    
    // Error elements
    fullNameError: document.getElementById('fullNameError'),
    mobileNumberError: document.getElementById('mobileNumberError'),
    emailIdError: document.getElementById('emailIdError'),
    tradingviewIdError: document.getElementById('tradingviewIdError'), // ADD THIS LINE

    termsError: document.getElementById('termsError')
};

// Validation patterns - Fixed mobile number validation
const validation = {
    name: /^[a-zA-Z\s]{2,50}$/,
    mobile: /^[6-9][0-9]{9}$/,  // More flexible pattern for Indian mobile numbers
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    tradingview: /^[a-zA-Z0-9_]{3,30}$/ // ADD THIS LINE - alphanumeric and underscore, 3-20 chars

};

// Validation messages
const messages = {
    fullName: {
        empty: 'Full name is required',
        invalid: 'Please enter a valid name (2-50 characters, letters only)'
    },
    mobileNumber: {
        empty: 'Mobile number is required',
        invalid: 'Please enter a valid 10-digit Indian mobile number'
    },
    emailId: {
        empty: 'Email ID is required',
        invalid: 'Please enter a valid email address'
    },
    tradingviewId: { // ADD THIS BLOCK
        empty: 'TradingView ID is required',
        invalid: 'Please enter a valid TradingView username (3-20 characters, letters, numbers, underscore only)'
    },
    terms: {
        required: 'You must accept the terms and conditions to proceed'
    }
};

// Initialize the application
function initApp() {
    setupEventListeners();
    checkFormValidity();
    loadSavedData();
}

// Setup all event listeners
function setupEventListeners() {
    // Navigation events
    elements.termsLink.addEventListener('click', (e) => {
        e.preventDefault();
        showPage('termsPage');
    });
    
    elements.backToForm.addEventListener('click', () => {
        showPage('formPage');
    });
    
    elements.backToFormBottom.addEventListener('click', () => {
        showPage('formPage');
    });
    
    // Form validation events
    elements.fullName.addEventListener('input', () => validateField('fullName'));
    elements.fullName.addEventListener('blur', () => validateField('fullName'));
    
    elements.mobileNumber.addEventListener('input', () => {
        formatMobileNumber();
        validateField('mobileNumber');
    });
    elements.mobileNumber.addEventListener('blur', () => validateField('mobileNumber'));
    
    elements.emailId.addEventListener('input', () => validateField('emailId'));
    elements.emailId.addEventListener('blur', () => validateField('emailId'));

    // Add this line in the setupEventListeners function:
    elements.tradingviewId.addEventListener('input', () => validateField('tradingviewId'));
    elements.tradingviewId.addEventListener('blur', () => validateField('tradingviewId'));

    
    elements.termsCheckbox.addEventListener('change', () => {
        validateField('terms');
        checkFormValidity();
    });
    
    // Form submission
    elements.form.addEventListener('submit', handleFormSubmit);
    
    // Real-time form validity checking
    elements.form.addEventListener('input', checkFormValidity);
    elements.form.addEventListener('change', checkFormValidity);
    
    // Save form data on input
    elements.form.addEventListener('input', saveFormData);
}

// Page navigation
function showPage(pageId) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Show selected page
    document.getElementById(pageId).classList.add('active');
    app.currentPage = pageId;
    
    // Scroll to top
    window.scrollTo(0, 0);
}

// Format mobile number input - Improved formatting
// Only allow digits, no prefix, and restrict to 10 digits
function formatMobileNumber() {
    let value = elements.mobileNumber.value.replace(/\D/g, ''); // Remove non-digits
    if (value.length > 10) {
        value = value.substring(0, 10); // Limit to 10 digits
    }
    elements.mobileNumber.value = value; // No prefix or space formatting
}


// Field validation - Fixed mobile validation logic
function validateField(fieldName) {
    const field = elements[fieldName === 'terms' ? 'termsCheckbox' : fieldName];
    const errorElement = elements[fieldName + 'Error'];
    let isValid = true;
    let message = '';
    
    switch (fieldName) {
        case 'fullName':
            const name = field.value.trim();
            if (!name) {
                isValid = false;
                message = messages.fullName.empty;
            } else if (!validation.name.test(name)) {
                isValid = false;
                message = messages.fullName.invalid;
            }
            break;
            
        case 'mobileNumber':
            const mobile = field.value.replace(/\D/g, ''); // Only digits
            if (!mobile) {
                isValid = false;
                message = messages.mobileNumber.empty;
            } else if (!/^[6-9][0-9]{9}$/.test(mobile)) {
                isValid = false;
                message = messages.mobileNumber.invalid;
            }
            break;

            
        case 'emailId':
            const email = field.value.trim();
            if (!email) {
                isValid = false;
                message = messages.emailId.empty;
            } else if (!validation.email.test(email)) {
                isValid = false;
                message = messages.emailId.invalid;
            }
            break;

        case 'tradingviewId':
            const tradingview = field.value.trim();
            if (!tradingview) {
                isValid = false;
                message = messages.tradingviewId.empty;
            } else if (!validation.tradingview.test(tradingview)) {
                isValid = false;
                message = messages.tradingviewId.invalid;
            }
            break;

            
        case 'terms':
            if (!field.checked) {
                isValid = false;
                message = messages.terms.required;
            }
            break;
    }
    
    // Update UI
    if (fieldName !== 'terms') {
        field.classList.toggle('error', !isValid && field.value);
        field.classList.toggle('success', isValid && field.value);
    }
    
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.toggle('show', !isValid && (field.value || fieldName === 'terms'));
    }
    
    return isValid;
}

// Check overall form validity
function checkFormValidity() {
    const isNameValid = elements.fullName.value.trim() ? validateField('fullName') : false;
    const isMobileValid = elements.mobileNumber.value.trim() ? validateField('mobileNumber') : false;
    const isEmailValid = elements.emailId.value.trim() ? validateField('emailId') : false;
    const isTradingViewValid = elements.tradingviewId.value.trim() ? validateField('tradingviewId') : false; // ADD THIS LINE

    const isTermsAccepted = elements.termsCheckbox.checked;
    
    const isFormValid = isNameValid && isMobileValid && isEmailValid && isTradingViewValid && isTermsAccepted; // UPDATE THIS LINE

    
    elements.submitBtn.disabled = !isFormValid || app.isSubmitting;
    
    return isFormValid;
}

// Handle form submission
async function handleFormSubmit(e) {
    e.preventDefault();
    
    if (app.isSubmitting) return;
    
    // Validate all fields one more time
    const isNameValid = validateField('fullName');
    const isMobileValid = validateField('mobileNumber');
    const isEmailValid = validateField('emailId');
    const isTradingViewValid = validateField('tradingviewId'); // ADD THIS LINE

    const isTermsAccepted = elements.termsCheckbox.checked;
    
    if (!isTermsAccepted) {
        validateField('terms');
    }
    
    const isFormValid = isNameValid && isMobileValid && isEmailValid && isTermsAccepted;
    
    if (!isFormValid) {
        return;
    }
    
    // Show loading state
    setLoadingState(true);
    
    // Collect form data
    const formData = {
        fullName: elements.fullName.value.trim(),
        mobileNumber: elements.mobileNumber.value.trim(),
        emailId: elements.emailId.value.trim(),
        tradingviewid: elements.tradingviewId.value.trim(), // ADD THIS LINE

        termsAccepted: elements.termsCheckbox.checked,
        userAgent: navigator.userAgent
    };
    
    try {
        // Submit to Google Sheets
        await submitToGoogleSheets(formData);
        
        // Show success message
        showSuccessMessage();
        
        // Clear saved data
        clearSavedData();
        
    } catch (error) {
        console.error('Submission error:', error);
        alert('There was an error submitting your registration. Please try again.');
    } finally {
        setLoadingState(false);
    }
}

// Submit data to Google Sheets
async function submitToGoogleSheets(formData) {
    // Google Apps Script Web App URL - Replace with your actual script URL
    const scriptUrl = 'https://script.google.com/macros/s/AKfycbxi_PCcPlgEvB-3VMQTifnUiMgRQqGfcXyJPvIMgqTf8r5OU-L78AbMDsI1ddfIc0WiXA/exec';
    
    // For demo purposes, we'll simulate the submission
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // Simulate success
            console.log('Form data submitted:', formData);
            
            // In a real implementation, you would use fetch:
            
            fetch(scriptUrl, {
                method: 'POST',
                mode: 'no-cors',
                cache: 'no-cache',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    resolve(data);
                } else {
                    reject(new Error(data.message || 'Submission failed'));
                }
            })
            .catch(error => reject(error));
            
            
            resolve({ success: true, message: 'Registration successful' });
        }, 2000); // Simulate network delay
    });
}

// Set loading state
function setLoadingState(isLoading) {
    app.isSubmitting = isLoading;
    elements.submitBtn.disabled = isLoading || !checkFormValidity();
    
    if (isLoading) {
        elements.btnText.textContent = 'Submitting...';
        elements.loadingSpinner.classList.remove('hidden');
    } else {
        elements.btnText.textContent = 'Submit Registration';
        elements.loadingSpinner.classList.add('hidden');
    }
}

// Show success message
function showSuccessMessage() {
    elements.form.classList.add('hidden');
    elements.successMessage.classList.remove('hidden');
    
    // Reset form after showing success
    setTimeout(() => {
        elements.form.reset();
        elements.form.classList.remove('hidden');
        elements.successMessage.classList.add('hidden');
        
        // Clear all validation states
        document.querySelectorAll('.form-control').forEach(control => {
            control.classList.remove('error', 'success');
        });
        
        document.querySelectorAll('.error-message').forEach(error => {
            error.classList.remove('show');
        });
        
        checkFormValidity();
    }, 5000); // Show success for 5 seconds
}

// Save form data to prevent loss
function saveFormData() {
    try {
        const formData = {
            fullName: elements.fullName.value,
            mobileNumber: elements.mobileNumber.value,
            emailId: elements.emailId.value,
            tradingviewId: elements.tradingviewId.value // ADD THIS LINE

        };
        localStorage.setItem('registrationFormData', JSON.stringify(formData));
    } catch (error) {
        // LocalStorage not available or quota exceeded
        console.warn('Could not save form data:', error);
    }
}

// Load saved form data
function loadSavedData() {
    try {
        const saved = localStorage.getItem('registrationFormData');
        if (saved) {
            const formData = JSON.parse(saved);
            if (formData.fullName) elements.fullName.value = formData.fullName;
            if (formData.mobileNumber) elements.mobileNumber.value = formData.mobileNumber;
            if (formData.emailId) elements.emailId.value = formData.emailId;
            if (formData.tradingviewId) elements.tradingviewId.value = formData.tradingviewId; // ADD THIS LINE

            
            // Validate loaded data
            setTimeout(() => {
                if (elements.fullName.value) validateField('fullName');
                if (elements.mobileNumber.value) validateField('mobileNumber');
                if (elements.emailId.value) validateField('emailId');
                if (elements.tradingviewId.value) validateField('tradingviewId'); // ADD THIS LINE

                checkFormValidity();
            }, 100);
        }
    } catch (error) {
        console.warn('Could not load saved data:', error);
    }
}

// Clear saved form data
function clearSavedData() {
    try {
        localStorage.removeItem('registrationFormData');
    } catch (error) {
        console.warn('Could not clear saved data:', error);
    }
}

// Google Sheets Setup Instructions
function displayGoogleSheetsInstructions() {
    console.log(`
=== GOOGLE SHEETS INTEGRATION SETUP ===

To connect this form to Google Sheets, follow these steps:

1. Create a new Google Sheet with the following column headers in row 1:
   - Full Name
   - Mobile Number
   - Email ID
   - Terms Accepted
   - User Agent

2. Go to Google Apps Script (script.google.com)

3. Create a new project and replace the default code with:

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    
    // Open your Google Sheet by ID
    const sheet = SpreadsheetApp.openById('YOUR_SHEET_ID').getActiveSheet();
    
    // Append the data to the sheet
    sheet.appendRow([
      data.fullName,
      data.mobileNumber,
      data.emailId,
      data.termsAccepted ? 'Yes' : 'No',
      data.userAgent
    ]);
    
    return ContentService
      .createTextOutput(JSON.stringify({success: true, message: 'Data saved successfully'}))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({success: false, message: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

4. Deploy as web app:
   - Click "Deploy" > "New Deployment"
   - Choose "Web app" as type
   - Set "Execute as" to "Me"
   - Set "Who has access" to "Anyone"
   - Click "Deploy"

5. Copy the web app URL and replace 'YOUR_SCRIPT_ID' in the submitToGoogleSheets function

6. Replace 'YOUR_SHEET_ID' in the Apps Script code with your actual Google Sheet ID

7. Test the integration by submitting the form

The form will automatically save data to your Google Sheet upon submission.
    `);
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initApp();
    displayGoogleSheetsInstructions();
});

// Export for testing purposes
if (typeof window !== 'undefined') {
    window.formApp = {
        validateField,
        checkFormValidity,
        showPage,
        app
    };
}
