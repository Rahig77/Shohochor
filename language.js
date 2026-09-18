/* ==========================================================================
   Shohochor App - Language & Translation Engine (language.js)
   Features: Seamless EN/BN switching, Screen Reader Aria-label logic,
             and Global Translation Helper for dynamic content.
   ========================================================================== */

const translations = {
    en: {
        "btn-lang": "বাংলা",
        "app-name": "SHOHOCHOR",
        "welcome": "Welcome!",
        "dashboard-title": "Dashboard",
        "menu-profile": "Profile",
        "menu-notifications": "Notifications",
        "menu-notices": "Notice Board",
        "menu-feed": "Feed",
        "menu-request": "Request for Help",
        "menu-ec": "Executive Committee",
        "menu-adv-panel": "Advisor Panel",
        "menu-admin": "Admin Manager",
        "menu-contact": "Contact Us",
        "menu-about": "About Us",
        "menu-report": "Report",
        
        "tab-login": "Login",
        "tab-register": "Registration",
        "label-name": "Full Name:",
        "label-email": "Email Address:",
        "label-phone": "Phone Number:",
        "label-password": "Password:",
        "label-new-password": "New Password (8-12 characters):",
        "label-confirm-password": "Confirm New Password:",
        "btn-forgot-pass": "Forgot Password?",
        "btn-login-submit": "Login",
        "btn-register-submit": "Register",
        "text-or": "OR",
        "desc-pwd-rules": "Password must be between 8 and 12 characters long.",
        
        "legend-gender": "Gender:",
        "gender-male": "Male",
        "gender-female": "Female",
        "legend-user-type": "Join As:",
        "role-general": "General Member",
        "role-volunteer": "Volunteer",
        "role-advisor": "Advisor",
        "text-terms": "I accept the Terms and Conditions",
        
        "onboard-title": "Complete Your Profile",
        "onboard-desc": "Please provide the missing information to continue.",
        "btn-save-continue": "Save & Continue",
        
        "btn-back": "< Go Back",
        "profile-title": "Profile",
        "lbl-name": "Name:",
        "lbl-email": "Email:",
        "lbl-phone": "Phone:",
        "lbl-gender": "Gender:",
        "lbl-type": "User Type:",
        "lbl-dept": "Department:",
        "lbl-session": "Session:",
        "lbl-id-roll": "ID/Roll:",
        "lbl-year-sem": "Year/Semester:",
        "radio-year": "Year",
        "radio-sem": "Semester",
        "btn-settings": "Settings",
        "btn-save": "Save Profile Changes",
        "btn-logout": "Logout",
        
        "notif-title": "Notifications",
        "feed-title": "Feed",
        "filter-all": "All",
        "filter-scribe": "Scribe Req",
        "filter-record": "Recording Req",
        "filter-gen": "General Req",
        "filter-approval": "Approvals",
        
        "notices-title": "Notice Board",
        "btn-write-notice": "+ Write New Notice",
        "lbl-notice-title": "Title:",
        "lbl-notice-desc": "Details:",
        "btn-notice-publish": "Publish Notice",
        
        "req-menu-title": "Request for Help",
        "req-btn-scribe": "Scribe Request",
        "req-btn-reading": "Recording Request",
        "req-btn-general": "General Request",
        "req-btn-yours": "Your Current Requests",
        
        "req-title-scribe": "Scribe Request",
        "legend-exam-type": "Exam Type:",
        "exam-ct": "Class Test",
        "exam-main": "Main Exam",
        "legend-date": "Select Date:",
        "legend-time": "Enter Time:",
        "lbl-duration": "Exam Duration (Hours):",
        "btn-send-req": "Send Request",
        
        "req-title-record": "Recording Request",
        "legend-material": "Material Type:",
        "mat-hard": "Hard Copy",
        "mat-soft": "Soft Copy",
        "lbl-pages": "Number of Pages:",
        
        "req-title-general": "General Request",
        "lbl-gen-desc": "How can we help? (Max 1000 chars):",
        
        "req-title-yours": "Your Current Requests",
        
        "admin-title": "Admin Manager",
        "admin-sub-list": "Admin List",
        "btn-view-users": "View Users",
        "btn-add-admin": "Add New Admin",
        "admin-view-users": "All Users",
        "admin-add-title": "Select User to Make Admin",

        // Dynamic strings for database.js (Ready for future use)
        "dyn-dept": "Dept:",
        "dyn-date-time": "Date & Time:",
        "dyn-details": "Details:",
        "dyn-accept": "Accept",
        "dyn-message": "Message",
        "dyn-call": "Call",
        "dyn-your-req": "Your Request",
        "dyn-approval": "Your request was accepted!",
        "dyn-accepted-by": "Accepted By:",
        "dyn-delete": "Delete Request"
    },
    bn: {
        "btn-lang": "English",
        "app-name": "সহচর",
        "welcome": "স্বাগতম!",
        "dashboard-title": "ড্যাশবোর্ড",
        "menu-profile": "প্রোফাইল",
        "menu-notifications": "নোটিফিকেশন",
        "menu-notices": "নোটিস বোর্ড",
        "menu-feed": "ফিড",
        "menu-request": "সাহায্যের আবেদন",
        "menu-ec": "কার্যকরী পরিষদ",
        "menu-adv-panel": "উপদেষ্টা প্যানেল",
        "menu-admin": "এডমিন ম্যানেজার",
        "menu-contact": "যোগাযোগ",
        "menu-about": "আমাদের সম্পর্কে",
        "menu-report": "রিপোর্ট করুন",
        
        "tab-login": "লগইন",
        "tab-register": "রেজিস্ট্রেশন",
        "label-name": "সম্পূর্ণ নাম:",
        "label-email": "ইমেইল ঠিকানা:",
        "label-phone": "ফোন নম্বর:",
        "label-password": "পাসওয়ার্ড:",
        "label-new-password": "নতুন পাসওয়ার্ড (৮-১২ অক্ষর):",
        "label-confirm-password": "পাসওয়ার্ড নিশ্চিত করুন:",
        "btn-forgot-pass": "পাসওয়ার্ড ভুলে গেছেন?",
        "btn-login-submit": "লগইন করুন",
        "btn-register-submit": "রেজিস্টার করুন",
        "text-or": "অথবা",
        "desc-pwd-rules": "পাসওয়ার্ড অবশ্যই ৮ থেকে ১২ অক্ষরের হতে হবে।",
        
        "legend-gender": "লিঙ্গ:",
        "gender-male": "পুরুষ",
        "gender-female": "নারী",
        "legend-user-type": "যুক্ত হোন হিসেবে:",
        "role-general": "সাধারণ সদস্য",
        "role-volunteer": "ভলান্টিয়ার",
        "role-advisor": "উপদেষ্টা",
        "text-terms": "আমি শর্তাবলীর সাথে একমত",
        
        "onboard-title": "প্রোফাইল সম্পূর্ণ করুন",
        "onboard-desc": "চালিয়ে যেতে দয়া করে প্রয়োজনীয় তথ্য প্রদান করুন।",
        "btn-save-continue": "সেভ করুন এবং চালিয়ে যান",
        
        "btn-back": "< ফিরে যান",
        "profile-title": "প্রোফাইল",
        "lbl-name": "নাম:",
        "lbl-email": "ইমেইল:",
        "lbl-phone": "ফোন:",
        "lbl-gender": "লিঙ্গ:",
        "lbl-type": "ইউজার টাইপ:",
        "lbl-dept": "বিভাগ:",
        "lbl-session": "সেশন:",
        "lbl-id-roll": "আইডি/রোল:",
        "lbl-year-sem": "বর্ষ/সেমিস্টার:",
        "radio-year": "বর্ষ",
        "radio-sem": "সেমিস্টার",
        "btn-settings": "সেটিংস",
        "btn-save": "প্রোফাইল সেভ করুন",
        "btn-logout": "লগআউট",
        
        "notif-title": "নোটিফিকেশনসমূহ",
        "feed-title": "ফিড",
        "filter-all": "সকল",
        "filter-scribe": "শ্রুতিলেখক আবেদন",
        "filter-record": "রেকর্ডিং আবেদন",
        "filter-gen": "সাধারণ আবেদন",
        "filter-approval": "অনুমোদনসমূহ",
        
        "notices-title": "নোটিস বোর্ড",
        "btn-write-notice": "+ নতুন নোটিস লিখুন",
        "lbl-notice-title": "শিরোনাম:",
        "lbl-notice-desc": "বিস্তারিত:",
        "btn-notice-publish": "নোটিস প্রকাশ করুন",
        
        "req-menu-title": "সাহায্যের আবেদন",
        "req-btn-scribe": "শ্রুতিলেখকের আবেদন",
        "req-btn-reading": "রেকর্ডিংয়ের আবেদন",
        "req-btn-general": "সাধারণ আবেদন",
        "req-btn-yours": "আপনার বর্তমান আবেদনগুলো",
        
        "req-title-scribe": "শ্রুতিলেখকের আবেদন",
        "legend-exam-type": "পরীক্ষার ধরন:",
        "exam-ct": "ক্লাস টেস্ট",
        "exam-main": "প্রধান পরীক্ষা",
        "legend-date": "তারিখ নির্বাচন করুন:",
        "legend-time": "সময় দিন:",
        "lbl-duration": "পরীক্ষার সময়কাল (ঘন্টা):",
        "btn-send-req": "আবেদন পাঠান",
        
        "req-title-record": "রেকর্ডিংয়ের আবেদন",
        "legend-material": "ম্যাটেরিয়ালের ধরন:",
        "mat-hard": "হার্ড কপি",
        "mat-soft": "সফট কপি",
        "lbl-pages": "পৃষ্ঠার সংখ্যা:",
        
        "req-title-general": "সাধারণ আবেদন",
        "lbl-gen-desc": "আমরা কীভাবে সাহায্য করতে পারি? (সর্বোচ্চ ১০০০ অক্ষর):",
        
        "req-title-yours": "আপনার বর্তমান আবেদনগুলো",
        
        "admin-title": "এডমিন ম্যানেজার",
        "admin-sub-list": "এডমিন তালিকা",
        "btn-view-users": "সকল ব্যবহারকারী",
        "btn-add-admin": "নতুন এডমিন যুক্ত করুন",
        "admin-view-users": "সকল ব্যবহারকারী",
        "admin-add-title": "এডমিন করার জন্য ব্যবহারকারী নির্বাচন করুন",

        // Dynamic strings for database.js (Ready for future use)
        "dyn-dept": "বিভাগ:",
        "dyn-date-time": "তারিখ ও সময়:",
        "dyn-details": "বিস্তারিত:",
        "dyn-accept": "গ্রহণ করুন",
        "dyn-message": "মেসেজ",
        "dyn-call": "কল করুন",
        "dyn-your-req": "আপনার আবেদন",
        "dyn-approval": "আপনার আবেদনটি গৃহীত হয়েছে!",
        "dyn-accepted-by": "গ্রহণ করেছেন:",
        "dyn-delete": "আবেদন মুছুন"
    }
};

let currentLanguage = "en"; // Default Language

// Global Translation Helper for dynamic content
window.t = function(key) {
    return translations[currentLanguage][key] || key;
};

document.addEventListener('DOMContentLoaded', () => {
    const langToggleBtn = document.getElementById('btn-language-toggle');

    function applyLanguage(lang) {
        // Update Static HTML Elements
        document.querySelectorAll('[data-key]').forEach(element => {
            const key = element.getAttribute('data-key');
            if (translations[lang] && translations[lang][key]) {
                if (element.tagName === "INPUT" && element.type === "button") {
                    element.value = translations[lang][key];
                } else {
                    element.textContent = translations[lang][key];
                }
            }
        });
        
        // DeepSeek Bug Fix: Update Screen Reader 'aria-label' dynamically
        if (langToggleBtn) {
            const ariaText = lang === 'bn' ? 'Change Language to English' : 'Change Language to Bengali';
            langToggleBtn.setAttribute('aria-label', ariaText);
        }
        
        // Update HTML tag for overall web accessibility
        document.documentElement.lang = lang; 

        // Announce change to screen readers
        if(window.announce) {
            window.announce(lang === 'bn' ? "ভাষা বাংলায় পরিবর্তন করা হয়েছে" : "Language changed to English");
        }
    }

    // Toggle button click event
    if (langToggleBtn) {
        langToggleBtn.addEventListener('click', () => {
            currentLanguage = currentLanguage === "en" ? "bn" : "en";
            applyLanguage(currentLanguage);
            
            // Dispatch a custom event in case database.js needs to refresh its feed text
            document.dispatchEvent(new Event('languageChanged')); 
        });
    }

    // Initialize with English on load
    applyLanguage(currentLanguage);
});