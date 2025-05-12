/**
 * Theme Manager Module
 * Handles theme selection and application
 */
const ThemeManager = (function() {
    // Private variables
    let currentTheme = "default";
    const mainContainerSelector = "#mainContainer";
    
    /**
     * Apply a theme to the grid container
     * @param {string} themeName - Theme name to apply
     * @param {Function} refreshCallback - Optional callback to refresh grids after theme change
     */
    function applyTheme(themeName, refreshCallback) {
        // Store the current theme
        currentTheme = themeName;
        
        // Remove existing theme classes
        $(mainContainerSelector).removeClass(function(index, className) {
            return (className.match(/(^|\s)theme-\S+/g) || []).join(' ');
        });
        
        // Add the new theme class if not default
        if (currentTheme !== "default") {
            $(mainContainerSelector).addClass("theme-" + currentTheme);
        }
        
        // If a refresh callback is provided, call it to refresh grids
        if (typeof refreshCallback === 'function') {
            refreshCallback();
        }
    }
    
    /**
     * Get the current theme
     * @returns {string} - Current theme name
     */
    function getCurrentTheme() {
        return currentTheme;
    }
    
    // Public API
    return {
        applyTheme: applyTheme,
        getCurrentTheme: getCurrentTheme
    };
})();