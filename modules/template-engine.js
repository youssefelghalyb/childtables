/**
 * Enhanced Template Engine for Hierarchical Child Tables
 * Handles dynamic generation of grid templates with support for nested child tables
 */
const TemplateEngine = (function() {
    /**
     * Generate hierarchical detail template based on childTableTree
     * @param {Array} data - Data records
     * @param {Object} config - Grid configuration
     * @param {Object} childTableTree - Child tables configuration tree
     */
    function generateHierarchicalDetailTemplate(data, config, childTableTree) {
        // Remove existing template if any
        $("#detailTemplate").remove();
        
        // Using the first record to analyze the structure
        var sampleRecord = data && data.length > 0 ? data[0] : null;
        
        if (!sampleRecord) {
            console.warn("No sample record available to generate detail template");
            return;
        }
        
        // Get all fields that aren't objects or arrays (basic info fields)
        var infoFields = [];
        for (var key in sampleRecord) {
            if (
                (typeof sampleRecord[key] !== 'object' || sampleRecord[key] === null) &&
                !Array.isArray(sampleRecord[key])
            ) {
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
        
        // If we have child tables in the tree, create tabs for them
        if (childTableTree && Object.keys(childTableTree).length > 0) {
            templateHtml += '<div id="detailTabs_{{:id}}" class="detail-tabs">';
            templateHtml += '<ul>';
            
            // Create tab headers for each child table
            Object.keys(childTableTree).forEach(function(tableName, index) {
                const displayName = formatTabName(tableName, childTableTree);
                templateHtml += '<li><a href="#' + tableName + 'Tab_{{:id}}">' + displayName + '</a></li>';
            });
            
            templateHtml += '</ul>';
            
            // Create tab contents for each child table
            Object.keys(childTableTree).forEach(function(tableName) {
                const displayName = formatTabName(tableName, childTableTree);
                templateHtml += '<div id="' + tableName + 'Tab_{{:id}}" class="tab-content">';
                templateHtml += '<div class="section-title">' + displayName + '</div>';
                
                // Add loading indicator
                templateHtml += '<div id="' + tableName + 'Loader_{{:id}}" class="loading-indicator" style="display: none;">';
                templateHtml += '<div class="spinner"></div>';
                templateHtml += '<div>Loading data...</div>';
                templateHtml += '</div>';
                
                // Add grid container
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
     * Generate a detail template for a nested child table
     * @param {string} tableName - Parent table name
     * @param {number} parentId - Parent record ID
     * @param {Array} data - Child table data
     * @param {Object} childTableTree - Nested child tables configuration
     */
    function generateNestedDetailTemplate(tableName, parentId, data, childTableTree) {
        // Generate a unique template ID
        const templateId = `${tableName}DetailTemplate_${parentId}`;
        
        // Remove existing template if any
        $(`#${templateId}`).remove();
        
        // Using the first record to analyze the structure
        var sampleRecord = data && data.length > 0 ? data[0] : null;
        
        if (!sampleRecord) {
            console.warn(`No sample record available to generate nested detail template for ${tableName}`);
            return;
        }
        
        // Get all fields that aren't objects or arrays (basic info fields)
        var infoFields = [];
        for (var key in sampleRecord) {
            if (
                (typeof sampleRecord[key] !== 'object' || sampleRecord[key] === null) &&
                !Array.isArray(sampleRecord[key])
            ) {
                infoFields.push(key);
            }
        }
        
        // Generate the template HTML
        var templateHtml = `<script id="${templateId}" type="text/x-jsrender">`;
        templateHtml += '<div class="nested-detail-container">';
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
        
        // If we have child tables, create nested tabs for them
        if (childTableTree && Object.keys(childTableTree).length > 0) {
            // Create a unique ID for the nested tabs
            const nestedTabsId = `${tableName}_{{:id}}_Tabs_${parentId}`;
            
            templateHtml += `<div id="${nestedTabsId}" class="nested-detail-tabs">`;
            templateHtml += '<ul>';
            
            // Create tab headers for each nested child table
            Object.keys(childTableTree).forEach(function(nestedTableName, index) {
                const displayName = formatTabName(nestedTableName, childTableTree);
                const tabId = `${nestedTableName}Tab_${tableName}_{{:id}}_${parentId}`;
                templateHtml += `<li><a href="#${tabId}">${displayName}</a></li>`;
            });
            
            templateHtml += '</ul>';
            
            // Create tab contents for each nested child table
            Object.keys(childTableTree).forEach(function(nestedTableName) {
                const displayName = formatTabName(nestedTableName, childTableTree);
                const tabId = `${nestedTableName}Tab_${tableName}_{{:id}}_${parentId}`;
                const nestedGridId = `${nestedTableName}Grid_${tableName}_{{:id}}_${parentId}`;
                const loaderId = `${nestedTableName}Grid_${tableName}_{{:id}}_${parentId}_Loader`;
                
                templateHtml += `<div id="${tabId}" class="nested-tab-content">`;
                templateHtml += `<div class="section-title">${displayName}</div>`;
                
                // Add loading indicator
                templateHtml += `<div id="${loaderId}" class="loading-indicator" style="display: none;">`;
                templateHtml += '<div class="spinner"></div>';
                templateHtml += '<div>Loading data...</div>';
                templateHtml += '</div>';
                
                // Add grid container
                templateHtml += `<div id="${nestedGridId}" class="nested-child-grid"></div>`;
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
     * @param {Object} configs - Configuration object that might contain tab name info
     * @returns {string} - Formatted tab name
     */
    function formatTabName(tableName, configs) {
        // Check if we have a pageConfig with a name
        if (configs && configs[tableName] && configs[tableName].pageConfig && 
            configs[tableName].pageConfig.pluralName) {
            return configs[tableName].pageConfig.pluralName;
        }
        
        // Default formatting if no config
        return formatFieldLabel(tableName);
    }
    
    // Public API
    return {
        generateHierarchicalDetailTemplate: generateHierarchicalDetailTemplate,
        generateNestedDetailTemplate: generateNestedDetailTemplate,
        formatFieldLabel: formatFieldLabel,
        formatTabName: formatTabName
    };
})();