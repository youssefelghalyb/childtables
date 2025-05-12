/**
 * Data Service Module
 * Handles data fetching and manipulation
 */
const DataService = (function() {
    // Private variables
    let currentData = null;
    let currentConfig = null;
    let currentChildTablesConfig = null;
    
    /**
     * Load data from the API
     * @param {string} endpoint - API endpoint URL
     * @param {Function} successCallback - Callback for successful data loading
     * @param {Function} errorCallback - Callback for error handling
     */
    function loadData(endpoint, successCallback, errorCallback) {
        // Make the API request
        $.ajax({
            url: endpoint,
            method: 'GET',
            headers: ApiConfig.getRequestHeaders(),
            success: function(response) {
                // Process the response
                processResponse(response, successCallback);
            },
            error: function(xhr, status, error) {
                if (typeof errorCallback === 'function') {
                    errorCallback("API Error: " + error);
                }
            }
        });
    }
    
    /**
     * Process API response data
     * @param {Object} response - API response data
     * @param {Function} callback - Callback with processed data
     */
    function processResponse(response, callback) {
        try {
            
            // Store the data and configuration
            currentData = response.data.data;
            currentConfig = response.tableConfig;
            currentChildTablesConfig = response.allChildTables || {};
            
            // Log child tables config for debugging
            
            // Call the callback with the processed data
            if (typeof callback === 'function') {
                callback(currentData, currentConfig, currentChildTablesConfig);
            }
        } catch (e) {
            throw new Error("Error processing data: " + e.message);
        }
    }
    
    /**
     * Delete a record
     * @param {number} id - Record ID to delete
     * @param {string} apiPath - API path for the delete operation
     * @param {Function} successCallback - Callback for successful deletion
     * @param {Function} errorCallback - Callback for error handling
     */
    function deleteRecord(id, apiPath, successCallback, errorCallback) {
        $.ajax({
            url: apiPath + '/delete/' + id,
            method: 'DELETE',
            headers: {
                ...ApiConfig.getRequestHeaders(),
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            },
            success: function(response) {
                if (typeof successCallback === 'function') {
                    successCallback(response);
                }
            },
            error: function(xhr, status, error) {
                if (typeof errorCallback === 'function') {
                    errorCallback("Error deleting record: " + error);
                }
            }
        });
    }
    
    /**
     * Get stored data and configurations
     */
    function getCurrentState() {
        return {
            data: currentData,
            config: currentConfig,
            childTablesConfig: currentChildTablesConfig
        };
    }
    
    // Public API
    return {
        loadData: loadData,
        deleteRecord: deleteRecord,
        getCurrentState: getCurrentState
    };
})();