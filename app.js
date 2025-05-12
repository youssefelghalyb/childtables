/**
 * Main Application Module 
 * Coordinates all the components of the Dynamic Multi-Tenant Grid System
 */
const App = (function() {
    // Object to store the current state
    let state = {
        data: null,
        config: null,
        childTablesConfig: null
    };
    
    /**
     * Initialize the application
     */
    function initialize() {
        // Set up UI Manager
        UiManager.initialize({
            onLoadData: handleLoadData,
            onRefresh: handleRefresh,
            onThemeChange: handleThemeChange
        });
        
        // Auto-load data if needed
        const autoLoad = true;
        if (autoLoad) {
            setTimeout(function() {
                handleLoadData(UiManager.getCurrentApiEndpoint());
            }, 500);
        }
    }
    
    /**
     * Handle loading data from an API endpoint
     * @param {string} endpoint - API endpoint to load data from
     */
    function handleLoadData(endpoint) {
        UiManager.showLoading();
        
        DataService.loadData(
            endpoint,
            function(data, config, childTablesConfig) {
                // Update state
                state.data = data;
                state.config = config;
                state.childTablesConfig = childTablesConfig;
                
                // Initialize the main grid
                GridManager.initializeMainGrid(data, config, childTablesConfig);
                
                // Hide loading indicator
                UiManager.hideLoading();
            },
            function(error) {
                UiManager.showError(error);
            }
        );
    }
    
    /**
     * Handle refreshing the grids
     */
    function handleRefresh() {
        if (state.data && state.config) {
            GridManager.refreshGrids(state.data, state.config, state.childTablesConfig);
        } else {
            UiManager.showError("No data available to refresh");
        }
    }
    
    /**
     * Handle theme changes
     * @param {string} themeName - Name of the theme to apply
     */
    function handleThemeChange(themeName) {
        ThemeManager.applyTheme(themeName, handleRefresh);
    }
    
    /**
     * View a record
     * @param {number} id - Record ID to view
     */
    function viewRecord(id) {
        const webRoute = ApiConfig.getWebRouteFromApi(UiManager.getCurrentApiEndpoint());
        window.location.href = webRoute + '/' + id;
    }
    
    /**
     * Edit a record
     * @param {number} id - Record ID to edit
     */
    function editRecord(id) {
        const webRoute = ApiConfig.getWebRouteFromApi(UiManager.getCurrentApiEndpoint());
        window.location.href = webRoute + '/edit/' + id;
    }
    
    /**
     * Delete a record
     * @param {number} id - Record ID to delete
     */
    function deleteRecord(id) {
        if (confirm("Are you sure you want to delete record with ID: " + id + "?")) {
            const apiPath = UiManager.getCurrentApiEndpoint().split('?')[0];
            
            DataService.deleteRecord(
                id,
                apiPath,
                function(response) {
                    alert("Record deleted successfully");
                    handleLoadData(UiManager.getCurrentApiEndpoint()); // Reload data
                },
                function(error) {
                    UiManager.showError(error);
                }
            );
        }
    }
    
    // Initialize the application when the document is ready
    $(document).ready(function() {
        initialize();
    });
    
    // Expose functions needed for global access (for inline onclick handlers)
    window.viewRecord = viewRecord;
    window.editRecord = editRecord;
    window.deleteRecord = deleteRecord;
    
    // Public API
    return {
        initialize: initialize,
        refreshData: handleLoadData
    };
})();