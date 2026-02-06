// ============================================
// CompositeursGPT — Theme Management
// ============================================

// Initialize theme on page load
function initTheme() {
    // Check for saved theme preference or default to 'light'
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);

    // Update toggle button state
    updateThemeToggleUI();
}

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    updateThemeToggleUI();
}

function updateThemeToggleUI() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const themeToggle = document.getElementById('themeToggle');

    if (themeToggle) {
        themeToggle.classList.toggle('dark', currentTheme === 'dark');
        themeToggle.setAttribute('aria-label',
            currentTheme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'
        );
    }
}

// Initialize theme as soon as possible (before DOMContentLoaded)
initTheme();
