/**
 * API Configuration Module
 * Handles all API-related settings and authentication
 */
const ApiConfig = (function() {
    // Private variables
    const apiDefaults = {
        // Default API settings
        baseUrl: 'http://localhost/modframework/public/api/',
        defaultEndpoint: 'user-management/roles',
        // Authentication token - should be obtained securely in a real app
        authToken: '23|WXqYoK6GWHFAZfiIABUoZfqylREQHbDFWKqqtZ7k22db2b8c',
        // Default request headers
        headers: {
            'Content-Type': 'application/json'
        }
    };
    
    /**
     * Builds the full API URL for a given endpoint
     * @param {string} endpoint - API endpoint path
     * @returns {string} - Full API URL
     */
    function buildApiUrl(endpoint) {
        // If the endpoint already has a full URL, use it directly
        if (endpoint.startsWith('http')) {
            return endpoint;
        }
        
        // Otherwise, combine it with the base URL
        return apiDefaults.baseUrl + endpoint;
    }
    
    /**
     * Gets the request headers including authentication
     * @returns {Object} - Headers object for fetch requests
     */
    function getRequestHeaders() {
        return {
            ...apiDefaults.headers,
            'Authorization': 'bearer ' + apiDefaults.authToken
        };
    }
    
    /**
     * Extracts non-API URL from an API URL
     * @param {string} apiUrl - API URL to convert
     * @returns {string} - Web route URL
     */
    function getWebRouteFromApi(apiUrl) {
        return apiUrl.replace('/api/', '/').split('?')[0];
    }
    
    // Public API
    return {
        getDefaultEndpoint: function() {
            return apiDefaults.defaultEndpoint;
        },
        
        buildApiUrl: buildApiUrl,
        
        getRequestHeaders: getRequestHeaders,
        
        getWebRouteFromApi: getWebRouteFromApi
    };
})();