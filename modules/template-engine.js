/**
 * Template Engine Module
 * Handles dynamic generation of grid templates
 */
const TemplateEngine = (function() {
    /**
     * Generate detail template based on data structure and configuration
     * @param {Array} data - Data records
     * @param {Object} config - Grid configuration
     * @param {Object} childTablesConfig - Child tables configuration
     */
    function generateDetailTemplate(data, config, childTablesConfig) {
        // Remove existing template if any
        $("#detailTemplate").remove();
        
        // Using the first record to analyze the structure
        var sampleRecord = data && data.length > 0 ? data[0] : null;
        
        if (!sampleRecord) {
            console.warn("No sample record available to generate detail template");
            return;
        }
        
        // Find child tables
        var childTables = {};
        var infoFields = [];
        
        // Extract child tables and info fields from the sample record
        for (var key in sampleRecord) {
            if (Array.isArray(sampleRecord[key])) {
                childTables[key] = sampleRecord[key];
            } else if (typeof sampleRecord[key] !== 'object' || sampleRecord[key] === null) {
                // Basic info fields (non-object)
                infoFields.push(key);
            }
        }
        
        
        // Generate the template HTML
        var templateHtml = '<script id="detailTemplate" type="text/x-jsrender">';
        templateHtml += '<div class="detail-container">';
        templateHtml += '<div class="info-section">';
        
        // Add info fields
        infoFields.forEach(function(field) {
            // Skip fields that are just for internal use
            if (field === 'action_column' || field === 'action_view' || 
                field === 'action_modify' || field === 'action_delete') {
                return;
            }
            
            templateHtml += '<div class="info-item">';
            templateHtml += '<span class="info-label">' + formatFieldLabel(field) + ':</span> ';
            
            // For boolean fields, use proper conditional template
            templateHtml += '{{if typeof ' + field + ' === "boolean"}}';
            templateHtml += '<span class="boolean-value {{if ' + field + '}}boolean-true{{else}}boolean-false{{/if}}">';
            templateHtml += '{{if ' + field + '}}✓{{else}}✗{{/if}}';
            templateHtml += '</span>';
            templateHtml += '{{else}}';
            templateHtml += '{{:' + field + '}}';
            templateHtml += '{{/if}}';
            templateHtml += '</div>';
        });
        
        templateHtml += '</div>';
        
        // If we have child tables, create tabs for them
        if (Object.keys(childTables).length > 0) {
            templateHtml += '<div id="detailTabs_{{:id}}" class="detail-tabs">';
            templateHtml += '<ul>';
            
            // Create tab headers
            Object.keys(childTables).forEach(function(tableName, index) {
                var displayName = formatTabName(tableName, childTablesConfig);
                templateHtml += '<li><a href="#' + tableName + 'Tab_{{:id}}">' + displayName + '</a></li>';
            });
            
            templateHtml += '</ul>';
            
            // Create tab contents
            Object.keys(childTables).forEach(function(tableName) {
                var displayName = formatTabName(tableName, childTablesConfig);
                templateHtml += '<div id="' + tableName + 'Tab_{{:id}}" class="tab-content">';
                templateHtml += '<div class="section-title">' + displayName + '</div>';
                templateHtml += '<div id="' + tableName + 'Grid_{{:id}}" class="child-grid"></div>';
                templateHtml += '</div>';
            });
            
            templateHtml += '</div>';
        }
        
        templateHtml += '</div>';
        templateHtml += '<\/script>';
        
        // Add the template to the document
        $('body').append(templateHtml);
    }
    
    /**
     * Format a field name into a readable label
     * @param {string} field - Field name
     * @returns {string} - Formatted label
     */
    function formatFieldLabel(field) {
        // Convert camelCase or snake_case to Title Case with spaces
        return field
            .replace(/_/g, ' ')
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, function(str) { return str.toUpperCase(); });
    }
    
    /**
     * Format a tab name using configurations if available
     * @param {string} tableName - Table name
     * @param {Object} configs - Child tables configuration
     * @returns {string} - Formatted tab name
     */
    function formatTabName(tableName, configs) {
        if (configs && configs[tableName] && configs[tableName].pageConfig && 
            configs[tableName].pageConfig.singularName) {
            return configs[tableName].pageConfig.pluralName;
        }
        
        // Default formatting if no config
        return formatFieldLabel(tableName);
    }
    
    // Public API
    return {
        generateDetailTemplate: generateDetailTemplate,
        formatFieldLabel: formatFieldLabel,
        formatTabName: formatTabName
    };
})();