/**
 * UI Manager Module
 * Handles UI components and interactions
 */
const UiManager = (function() {
    // UI element selectors
    const selectors = {
        apiEndpoint: '#apiEndpoint',
        loadDataBtn: '#loadDataBtn',
        refreshBtn: '#refreshBtn',
        themeSelector: '#themeSelector',
        loadingContainer: '#loadingContainer',
        mainGridContainer: '#mainGridContainer',
        mainGrid: '#MainGrid'
    };
    
    /**
     * Initialize UI components and event handlers
     * @param {Object} config - Configuration options
     */
    function initialize(config) {
        // Set default API endpoint
        $(selectors.apiEndpoint).val(ApiConfig.buildApiUrl(ApiConfig.getDefaultEndpoint()));
        
        // Set up event handlers
        setupEventHandlers(config);
    }
    
    /**
     * Set up event handlers for UI controls
     * @param {Object} config - Configuration with callback handlers
     */
    function setupEventHandlers(config) {
        // Load data button click
        $(selectors.loadDataBtn).on('click', function() {
            if (config && config.onLoadData) {
                config.onLoadData($(selectors.apiEndpoint).val());
            }
        });
        
        // Refresh button click
        $(selectors.refreshBtn).on('click', function() {
            if (config && config.onRefresh) {
                config.onRefresh();
            }
        });
        
        // Theme selector change
        $(selectors.themeSelector).on('change', function() {
            if (config && config.onThemeChange) {
                config.onThemeChange($(this).val());
            }
        });
        
        // Enter key press in API endpoint field
        $(selectors.apiEndpoint).on('keypress', function(e) {
            if (e.which === 13 && config && config.onLoadData) { // Enter key
                config.onLoadData($(selectors.apiEndpoint).val());
            }
        });
    }
    
    /**
     * Show loading indicator
     */
    function showLoading() {
        $(selectors.loadingContainer).show();
    }
    
    /**
     * Hide loading indicator
     */
    function hideLoading() {
        $(selectors.loadingContainer).hide();
    }
    
    /**
     * Display an error message
     * @param {string} message - Error message to display
     */
    function showError(message) {
        console.error(message);
        alert(message);
        hideLoading();
    }
    
    /**
     * Get the current API endpoint URL
     * @returns {string} - Current API endpoint
     */
    function getCurrentApiEndpoint() {
        return $(selectors.apiEndpoint).val();
    }
    
    // Public API
    return {
        initialize: initialize,
        showLoading: showLoading,
        hideLoading: hideLoading,
        showError: showError,
        getCurrentApiEndpoint: getCurrentApiEndpoint,
        selectors: selectors
    };
})();