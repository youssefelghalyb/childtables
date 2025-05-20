/**
 * Column Mapper Module
 * Handles mapping column definitions from API format to grid format
 */
const ColumnMapper = (function() {
    /**
     * Map column definitions from API format to Syncfusion format
     * @param {Array} columnDefs - Column definitions from API
     * @returns {Array} - Syncfusion grid column definitions
     */
    function mapColumnDefinitions(columnDefs) {
        var columns = [];
        
        // Process each column definition
        columnDefs.forEach(function(colDef) {
            var column = {
                field: colDef.field,
                headerText: colDef.headerName,
                width: colDef.width || 100,
                visible: !colDef.hide,
                textAlign: "left"
            };
            
            // Set sorting if available
            if (colDef.sortable) {
                column.allowSorting = true;
            }
            
            // Set filtering if available
            if (colDef.filter) {
                column.allowFiltering = true;
            }
            
            // Handle cell renderers
            if (colDef.cellRenderer) {
                // For boolean values
                if (colDef.cellRenderer === "booleanRenderer") {
                    column.template = '<div class="boolean-value {{if ' + colDef.field + '}}boolean-true{{else}}boolean-false{{/if}}">{{if ' + colDef.field + '}}✓{{else}}✗{{/if}}</div>';
                }
                // For icon renderer
                else if (colDef.cellRenderer === "iconRenderer") {
                    column.template = '<i class="fa-solid {{:' + colDef.field + '}}"></i>';
                }
                // For actions renderer - ALWAYS use the action_column field from API
                else if (colDef.cellRenderer === "actionsRenderer") {
                    column.field = colDef.field;
                    column.headerText = colDef.headerText || 'Actions'; // Set a default header text
                    column.template = '{{{:action_column}}}';
                    column.freeze = 'left'; // Freeze to left
                    column.allowSorting = false; // Disable sorting
                    column.allowFiltering = false; // Disable filtering
                    
                    // Add it to the beginning of the columns array
                    columns.unshift(column);
                    
                    // Skip adding this column again at the end by returning early from this iteration
                    return; // This is crucial - it skips the remaining code for this column
                }
            }
            
            // Handle valueGetter (for relational fields)
            if (colDef.valueGetter) {
                column.template = generateValueGetterTemplate(colDef);
            }
            
            columns.push(column);
        });
        
        return columns;
    }
    
    /**
     * Generate template for valueGetter scenarios
     * @param {Object} colDef - Column definition with valueGetter
     * @returns {string} - JSRender template string
     */
    function generateValueGetterTemplate(colDef) {
        // Extract the relation path from valueGetter
        // Format usually: "data.table ? data.table.page_title : data.table_id"
        var template = '';
        
        // Simple extraction based on common pattern
        if (colDef.valueGetter && colDef.valueGetter.includes('.')) {
            var parts = colDef.valueGetter.split('?');
            if (parts.length > 1) {
                // We have a conditional expression
                var relationPath = parts[0].trim();
                var fieldParts = relationPath.split('.');
                
                if (fieldParts.length >= 2) {
                    var relation = fieldParts[1]; // e.g., "table"
                    
                    // Extract the field to display from the second part
                    var displayParts = parts[1].split(':');
                    var displayField = '';
                    
                    if (displayParts.length > 0) {
                        // Extract field name from something like "data.table.page_title"
                        var displayPathParts = displayParts[0].trim().split('.');
                        if (displayPathParts.length >= 3) {
                            displayField = displayPathParts[2]; // e.g., "page_title"
                        }
                    }
                    
                    if (relation && displayField) {
                        template = '{{if ' + relation + '}}' +
                            '{{:' + relation + '.' + displayField + '}}' +
                        '{{else}}' +
                            '{{:' + colDef.field + '}}' +
                        '{{/if}}';
                    }
                }
            } else {
                // Simple relation without conditional
                var parts = colDef.valueGetter.split('.');
                if (parts.length >= 2) {
                    // Format like data.relation.field
                    var relation = parts[1];
                    var field = parts[2];
                    
                    if (relation && field) {
                        template = '{{if ' + relation + '}}' +
                            '{{:' + relation + '.' + field + '}}' +
                        '{{else}}' +
                            '{{:' + colDef.field + '}}' +
                        '{{/if}}';
                    }
                }
            }
        }
        
        // If we couldn't parse it, just show the field directly
        if (!template) {
            template = '{{:' + colDef.field + '}}';
        }

        console.log("Generated template for valueGetter: ", template);
        
        return template;
    }
    
    // Public API
    return {
        mapColumnDefinitions: mapColumnDefinitions
    };
})();