/**
 * Grid Manager Module
 * Handles grid initialization, rendering and management
 */
const GridManager = (function() {
    // Private variables
    let gridInstances = {};
    
    /**
     * Initialize the main grid
     * @param {Array} data - Data for the grid
     * @param {Object} config - Grid configuration
     * @param {Object} childTablesConfig - Child tables configuration
     */
    function initializeMainGrid(data, config, childTablesConfig) {
        // Clear existing grid
        var gridObj = $("#MainGrid").data("ejGrid");
        if (gridObj) {
            gridObj.destroy();
        }
        
        // Map columnDefs to Syncfusion format
        var columns = ColumnMapper.mapColumnDefinitions(config.columnDefs);
        
        // Generate the detail template for child tables
        TemplateEngine.generateDetailTemplate(data, config, childTablesConfig);
        
        // Initialize grid with Syncfusion
        $("#MainGrid").ejGrid({
            dataSource: data,
            allowPaging: true,
            allowSorting: true,
            isResponsive: true,
            allowScrolling: false,
            allowResizing: true,
            enableColumnVirtualization: false,
            columns: columns,
            detailsTemplate: "#detailTemplate",
            detailsDataBound: function(args) {
                handleDetailsBound(args, data, childTablesConfig);
            }
        });
        
        // Store reference to the grid
        gridInstances.main = $("#MainGrid").data("ejGrid");
    }
    
    /**
     * Handle the details bound event when a row is expanded
     * @param {Object} args - Event arguments
     * @param {Array} allData - All grid data
     * @param {Object} childTablesConfig - Child tables configuration
     */
    function handleDetailsBound(args, allData, childTablesConfig) {
        var record = args.data;
        var recordId = record.id;
        
        // Find child tables in the record
        var childTables = {};
        for (var key in record) {
            if (Array.isArray(record[key])) {
                childTables[key] = record[key];
            }
        }
        
        
        // Initialize tabs if there are child tables
        if (Object.keys(childTables).length > 0) {
            $("#detailTabs_" + recordId).ejTab({
                heightAdjustMode: "Auto",
                width: "100%"
            });
            
            // Initialize each child grid
            Object.keys(childTables).forEach(function(tableName) {
                var childData = childTables[tableName];
                
                // Try to find the specific configuration for this child table
                var childConfig = findChildTableConfig(tableName, childTablesConfig);
                
               
                initializeChildGrid(tableName, recordId, childData, childConfig);
            });
        }
        
        // Add a small delay to adjust heights
        setTimeout(function() {
            adjustGridHeights();
        }, 300);
    }
    
    /**
     * Find the correct configuration for a child table
     * @param {string} tableName - Table name
     * @param {Object} childTablesConfig - Child tables configuration
     * @returns {Object|null} - Table configuration if found, null otherwise
     */
    function findChildTableConfig(tableName, childTablesConfig) {
        if (!childTablesConfig) {
            return null;
        }
        
        // First try direct name match
        if (childTablesConfig[tableName]) {
            return childTablesConfig[tableName];
        }
        
        // Then try matching by relation_name
        for (var configKey in childTablesConfig) {
            if (childTablesConfig[configKey].relation_name === tableName) {
                return childTablesConfig[configKey];
            }
        }
        
        return null;
    }
    
    /**
     * Initialize a child grid
     * @param {string} tableName - Table name
     * @param {number} parentId - Parent record ID
     * @param {Array} data - Child table data
     * @param {Object} config - Child table configuration
     */
    function initializeChildGrid(tableName, parentId, data, config) {
        var gridId = tableName + "Grid_" + parentId;
        
        // Clear existing grid if any
        var existingGrid = $("#" + gridId).data("ejGrid");
        if (existingGrid) {
            existingGrid.destroy();
        }
        
        // Default columns if no config
        var columns = [];
        
        // Use config if available
        if (config && config.tableConfig && config.tableConfig.columnDefs) {
          
            columns = ColumnMapper.mapColumnDefinitions(config.tableConfig.columnDefs);
        } else {
            // Generate columns from the first data record
            if (data && data.length > 0) {
                var firstRecord = data[0];
                
                for (var key in firstRecord) {
                    // Skip action columns in auto generation and relation objects
                    if (key === 'action_column' || key === 'action_view' || 
                        key === 'action_modify' || key === 'action_delete' ||
                        (typeof firstRecord[key] === 'object' && firstRecord[key] !== null)) {
                        continue;
                    }
                    
                    // Add basic column
                    var column = {
                        field: key,
                        headerText: TemplateEngine.formatFieldLabel(key),
                        width: 100
                    };
                    
                    // Special handling for boolean values
                    if (typeof firstRecord[key] === 'boolean') {
                        column.template = '<div class="boolean-value {{if ' + key + '}}boolean-true{{else}}boolean-false{{/if}}">{{if ' + key + '}}✓{{else}}✗{{/if}}</div>';
                    }
                    
                    columns.push(column);
                }
                
                // Add action column if available
                if (firstRecord.action_column) {
                    columns.push({
                        headerText: "Actions",
                        template: '{{{:action_column}}}',
                        width: 140
                    });
                }
            }
        }
        
        // Initialize the grid
        $("#" + gridId).ejGrid({
            dataSource: data,
            allowPaging: true,
            allowSorting: true,
            allowFiltering: true,
            filterSettings: { filterType: "excel" },
            pageSettings: { pageSize: 5 },
            isResponsive: true,
            enableAutoResize: true,
            columns: columns,
            create: function() {
                setTimeout(function() {
                    adjustGridHeights();
                }, 100);
            }
        });
        
        // Store reference to child grid
        if (!gridInstances[tableName]) {
            gridInstances[tableName] = {};
        }
        gridInstances[tableName][parentId] = $("#" + gridId).data("ejGrid");
    }
    
    /**
     * Adjust heights of all grids to fix layout issues
     */
    function adjustGridHeights() {
        // Adjust detail cells
        $('.e-detailcell').each(function() {
            var $cell = $(this);
            var $content = $cell.find('.detail-container');
            
            if ($content.length) {
                var contentHeight = $content.outerHeight(true);
                
                if (contentHeight > 0) {
                    $cell.css('height', (contentHeight + 20) + 'px');
                }
            }
        });
        
        // Adjust grid content
        $('.e-gridcontent').each(function() {
            var $content = $(this);
            var $table = $content.find('table.e-table');
            
            if ($table.length) {
                var tableHeight = $table.height();
                
                if (tableHeight > 10) {
                    $content.css('height', 'auto');
                }
            }
        });
        
        // Remove fixed heights from tab content
        $('.tab-content').css('height', 'auto');
    }
    
    /**
     * Refresh all grid instances
     */
    function refreshGrids(data, config, childTablesConfig) {
        if (data && config) {
            // Re-initialize the main grid
            initializeMainGrid(data, config, childTablesConfig);
        } else {
            console.warn("Cannot refresh grids: missing data or configuration");
        }
    }
    
    /**
     * Get the current grid instances
     * @returns {Object} - Grid instances object
     */
    function getGridInstances() {
        return gridInstances;
    }
    
    // Public API
    return {
        initializeMainGrid: initializeMainGrid,
        refreshGrids: refreshGrids,
        adjustGridHeights: adjustGridHeights,
        getGridInstances: getGridInstances
    };
})();