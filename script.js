document.addEventListener('DOMContentLoaded', function() {

    // --- Mobile Navigation Toggle ---
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('show');
        });
    }

    // --- Reporting Page - Severity Selector ---
    const severityOptions = document.querySelectorAll('.severity-option');

    if (severityOptions.length > 0) {
        severityOptions.forEach(option => {
            option.addEventListener('click', () => {
                // Remove 'active' class from all options
                severityOptions.forEach(opt => opt.classList.remove('active'));
                // Add 'active' class to the clicked option
                option.classList.add('active');
            });
        });
    }

});

