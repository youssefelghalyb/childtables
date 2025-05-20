/**
 * Grid Manager with Support for Hierarchical Child Tables
 * Handles grid initialization, rendering and management of multi-level child grids
 */
const GridManager = (function () {
  // Private variables
  let gridInstances = {};

  /**
   * Initialize the main grid
   * @param {Array} data - Data for the grid
   * @param {Object} config - Grid configuration
   * @param {Object} childTableTree - Hierarchical child table configuration
   */
  function initializeMainGrid(data, config, childTableTree) {
    // Clear existing grid
    var gridObj = $("#MainGrid").data("ejGrid");
    if (gridObj) {
      gridObj.destroy();
    }

    // Map columnDefs to Syncfusion format
    var columns = ColumnMapper.mapColumnDefinitions(config.columnDefs);

    // Generate the detail template for child tables
    TemplateEngine.generateHierarchicalDetailTemplate(
      data,
      config,
      childTableTree
    );

    // Initialize grid with Syncfusion
    $("#MainGrid").ejGrid({
      dataSource: data,
      allowPaging: true,
      allowSorting: true,
      allowFiltering: true,
      filterSettings: { filterType: "excel" },
      // Fix 1: Proper configuration for edit settings
      editSettings: { 
        allowEditing: true, 
        allowDeleting: true, 
        showDeleteConfirmDialog: true,
        editMode: "normal"  // Use inlineform instead of Normal
      },
      // Fix 2: Proper toolbar configuration
      toolbarSettings: {
        showToolbar: true,
        toolbarItems: [ "edit", "delete", "update", "cancel", "search"]
      },
      // Fix 3: Add necessary event handlers for editing
      actionBegin: function(args) {
        console.log("Action Begin:", args.requestType);
        // Handle various grid actions (add, edit, delete, etc.)
        if (args.requestType === "beginedit") {
          console.log("Beginning edit for record:", args.rowData);
        } else if (args.requestType === "add") {
          console.log("Adding new record");
        } else if (args.requestType === "delete") {
          console.log("Deleting record:", args.data);
        }
      },
      actionComplete: function(args) {
        console.log("Action Complete:", args.requestType);
        // Handle completion of grid actions
        if (args.requestType === "save") {
          console.log("Saved record:", args.data);
          // Here you would typically call an API to save the data
          // DataService.saveRecord(args.data);
        } else if (args.requestType === "delete") {
          console.log("Deleted record successfully");
          // Here you would typically call an API to confirm deletion
          // DataService.deleteRecord(args.data);
        }
      },
      isResponsive: true,
      allowScrolling: false,
      allowResizing: true,
      enableColumnVirtualization: false,
      columns: columns,
      detailsTemplate: "#detailTemplate",
      detailsDataBound: function (args) {
        handleDetailsBound(args, data, childTableTree);
      },
    });

    // Store reference to the grid
    gridInstances.main = $("#MainGrid").data("ejGrid");
  }

  /**
   * Handle the details bound event when a row is expanded
   * @param {Object} args - Event arguments
   * @param {Array} allData - All grid data
   * @param {Object} childTableTree - Child tables configuration tree
   */
  function handleDetailsBound(args, allData, childTableTree) {
    var record = args.data;
    var recordId = record.id;

    console.log("Row expanded for record ID: " + recordId);

    if (!childTableTree) {
        console.warn("No child table tree available for this record");
        return;
    }

    // Get available child tables for this record
    const availableChildTables = DataService.getAvailableChildTables(record);

    console.log("Available child tables:", Object.keys(availableChildTables));

    // Initialize tabs if there are child tables
    if (Object.keys(availableChildTables).length > 0) {
      $("#detailTabs_" + recordId).ejTab({
        heightAdjustMode: "Auto",
        width: "100%",
        itemActive: function (args) {
          // When a tab is activated, load data if not already loaded
          const tabId = args.activeIndex;
          const tableName = Object.keys(availableChildTables)[tabId];

          if (tableName) {
            loadChildGridData(
              tableName,
              recordId,
              record,
              availableChildTables[tableName]
            );
          }
        },
      });

      // Load data for the first child table automatically
      const firstTableName = Object.keys(availableChildTables)[0];
      if (firstTableName) {
        loadChildGridData(
          firstTableName,
          recordId,
          record,
          availableChildTables[firstTableName]
        );
      }
    }

    // Add a small delay to adjust heights
    setTimeout(function () {
      adjustGridHeights();
    }, 300);
  }

  /**
   * Load data for a child grid
   * @param {string} tableName - Child table name
   * @param {number} parentId - Parent record ID
   * @param {Object} parentRecord - Parent record data
   * @param {Object} childConfig - Child table configuration
   */
  function loadChildGridData(tableName, parentId, parentRecord, childConfig) {
    // Check if data is already loaded (grid exists and has data)
    const gridId = tableName + "Grid_" + parentId;
    const existingGrid = $("#" + gridId).data("ejGrid");

    if (
      existingGrid &&
      existingGrid.model.dataSource &&
      existingGrid.model.dataSource.length > 0
    ) {
      // Data already loaded, no need to reload
      console.log(`Data for ${tableName} already loaded`);
      return;
    }

    // Show loading indicator for the grid
    const loaderId = tableName + "Loader_" + parentId;
    $("#" + loaderId).show();

    // Load child table data
    let knownChildTables = DataService.getChildTableTreeFor(tableName);

    DataService.loadChildTableData(tableName, parentRecord, 
      function(response, config, responseChildTableTree) {
        const effectiveChildTableTree = responseChildTableTree || knownChildTables;

        // Success callback
        console.log(`Loaded data for ${tableName}:`, response);

        // Hide the loader
        $("#" + loaderId).hide();

        // Process the child data
        const childData = response.data || [];
        const childTableConfig = response.tableConfig || {};

        // Initialize the child grid with the loaded data
        initializeChildGrid(tableName, parentId, childData, childTableConfig, effectiveChildTableTree);

      },
      function (error) {
        // Error callback
        console.error(error);

        // Hide the loader
        $("#" + loaderId).hide();

        // Show error message in the grid area
        $("#" + gridId).html(
          `<div class="grid-error">Error loading data: ${error}</div>`
        );
      }
    );
  }

  /**
   * Initialize a child grid
   * @param {string} tableName - Table name
   * @param {number} parentId - Parent record ID
   * @param {Array} data - Child table data
   * @param {Object} config - Child table configuration
   * @param {Object} childTableTree - Nested child tables configuration
   */
/**
 * Initialize a child grid with support for nested children
 * 
 * @param {string} tableName - Name of the child table
 * @param {number} parentId - ID of the parent record
 * @param {Array} data - Child table data
 * @param {Object} config - Child table configuration
 * @param {Object} passedChildTableTree - Optional child table tree passed from parent
 */
function initializeChildGrid(tableName, parentId, data, config, passedChildTableTree) {
  // Generate unique grid ID
  var gridId = tableName + "Grid_" + parentId;
  
  console.log(`Initializing child grid ${gridId} with ${data ? data.length : 0} records`);
  
  // Clear existing grid if any
  var existingGrid = $("#" + gridId).data("ejGrid");
  if (existingGrid) {
      existingGrid.destroy();
  }
  
  // Get child tables for this grid - try all possible sources
  var childTableTree = null;
  
  // 1. First try the passed child table tree
  if (passedChildTableTree && Object.keys(passedChildTableTree).length > 0) {
      childTableTree = passedChildTableTree;
      console.log(`Using passed child table tree for ${tableName} with children:`, 
          Object.keys(childTableTree));
  } 
  // 2. Then try child tables from the config
  else if (config && config.childTableTree && Object.keys(config.childTableTree).length > 0) {
      childTableTree = config.childTableTree;
      console.log(`Using config child table tree for ${tableName} with children:`, 
          Object.keys(childTableTree));
  }
  // 3. Finally try getting from the DataService
  else if (typeof DataService.getChildTableTreeFor === 'function') {
      childTableTree = DataService.getChildTableTreeFor(tableName);
      if (childTableTree) {
          console.log(`Using DataService child table tree for ${tableName} with children:`, 
              Object.keys(childTableTree));
      }
  }
  
  // Determine if this table has nested children
  var hasNestedChildren = Boolean(childTableTree && Object.keys(childTableTree).length > 0);
  console.log(`Child table ${tableName} has nested children:`, hasNestedChildren);
  
  // Map columns from configuration
  var columns = [];
  if (config && config.columnDefs) {
      console.log(`Using tableConfig for ${tableName} with ${config.columnDefs.length} columns`);
      columns = ColumnMapper.mapColumnDefinitions(config.columnDefs);
  } else {
      console.log(`Auto-generating columns for ${tableName}`);
      // Generate columns from the first data record
      if (data && data.length > 0) {
          var firstRecord = data[0];
          
          for (var key in firstRecord) {
              // Skip action columns and objects/arrays
              if (key === 'action_column' || key === 'action_view' || 
                  key === 'action_modify' || key === 'action_delete' ||
                  (typeof firstRecord[key] === 'object' && firstRecord[key] !== null && !Array.isArray(firstRecord[key])) ||
                  Array.isArray(firstRecord[key])) {
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
  
  // Create grid options
  var gridOptions = {
      dataSource: data,
      allowPaging: true,
      allowSorting: true,
      allowFiltering: true,
      filterSettings: { filterType: "excel" },
      pageSettings: { pageSize: 5 },
      isResponsive: true,
      enableAutoResize: true,
      columns: columns
  };
  
  // If has nested children, add details template and event handler
  if (hasNestedChildren) {
      // Generate the nested detail template
      TemplateEngine.generateNestedDetailTemplate(tableName, parentId, data, childTableTree);
      
      // Add template to grid options
      gridOptions.detailsTemplate = "#" + tableName + "DetailTemplate_" + parentId;
      
      // Add details data bound handler
      gridOptions.detailsDataBound = function(args) {
          handleNestedDetailsBound(args, data, childTableTree, tableName, parentId);
      };
      
      console.log(`Added nested detail template #${tableName}DetailTemplate_${parentId} to grid`);
  }
  
  // Add create event for height adjustment
  gridOptions.create = function() {
      setTimeout(function() {
          adjustGridHeights();
      }, 100);
  };
  
  // Initialize the grid
  $("#" + gridId).ejGrid(gridOptions);
  console.log(`Grid ${gridId} initialized successfully`);
  
  // Store reference to child grid
  if (!gridInstances[tableName]) {
      gridInstances[tableName] = {};
  }
  gridInstances[tableName][parentId] = $("#" + gridId).data("ejGrid");
  
  // Adjust grid heights
  setTimeout(function() {
      adjustGridHeights();
  }, 300);
}

/**
 * Handle details bound event for nested child grids
 * 
 * @param {Object} args - Event arguments
 * @param {Array} allData - All grid data
 * @param {Object} childTableTree - Child tables configuration
 * @param {string} parentTableName - Parent table name
 * @param {number} grandParentId - Grandparent record ID
 */
function handleNestedDetailsBound(args, allData, childTableTree, parentTableName, grandParentId) {
  var record = args.data;
  var recordId = record.id || record.user_id || record[Object.keys(record)[0]]; // Try to find an ID field
  
  console.log(`Nested row expanded for ${parentTableName} record ID: ${recordId}`);
  
  // Safety check
  if (!childTableTree) {
      console.warn(`No child table tree available for ${parentTableName}`);
      return;
  }
  
  console.log(`Available nested child tables:`, Object.keys(childTableTree));
  
  // Get available child tables for this record
  const availableChildTables = {};
  
  // Check each child table in the tree
  for (const tableName in childTableTree) {
      const tableConfig = childTableTree[tableName];
      
      // Ensure this record has the required relation key
      const relationKeyTo = tableConfig.relationKeyTo || 'id';
      if (record[relationKeyTo] !== undefined) {
          availableChildTables[tableName] = tableConfig;
      }
  }
  
  console.log(`Available child tables for ${parentTableName}:`, Object.keys(availableChildTables));
  
  // Initialize tabs if there are child tables
  if (Object.keys(availableChildTables).length > 0) {
      // Generate a unique ID for the nested tabs
      const nestedTabsId = `${parentTableName}_${recordId}_Tabs_${grandParentId}`;
      
      $(`#${nestedTabsId}`).ejTab({
          heightAdjustMode: "Auto",
          width: "100%",
          itemActive: function(args) {
              // When a tab is activated, load data if not already loaded
              const tabId = args.activeIndex;
              const tableName = Object.keys(availableChildTables)[tabId];
              
              if (tableName) {
                  // Generate unique IDs for nested child
                  const nestedGridId = `${tableName}Grid_${parentTableName}_${recordId}_${grandParentId}`;
                  loadNestedChildGridData(tableName, nestedGridId, record, availableChildTables[tableName]);
              }
          }
      });
      
      // Load data for the first child table automatically
      const firstTableName = Object.keys(availableChildTables)[0];
      if (firstTableName) {
          const nestedGridId = `${firstTableName}Grid_${parentTableName}_${recordId}_${grandParentId}`;
          loadNestedChildGridData(firstTableName, nestedGridId, record, availableChildTables[firstTableName]);
      }
  }
  
  // Add a small delay to adjust heights
  setTimeout(function() {
      adjustGridHeights();
  }, 300);
}


/**
 * Load data for a nested child grid
 * 
 * @param {string} tableName - Child table name
 * @param {string} gridId - Grid element ID
 * @param {Object} parentRecord - Parent record data
 * @param {Object} childConfig - Child table configuration
 */
function loadNestedChildGridData(tableName, gridId, parentRecord, childConfig) {
  // Check if data is already loaded (grid exists and has data)
  const existingGrid = $("#" + gridId).data("ejGrid");
  
  if (existingGrid && existingGrid.model.dataSource && existingGrid.model.dataSource.length > 0) {
      // Data already loaded, no need to reload
      console.log(`Data for nested ${tableName} already loaded`);
      return;
  }
  
  // Show loading indicator for the grid
  const loaderId = gridId + "_Loader";
  $("#" + loaderId).show();
  
  // Build the endpoint for the child table
  let endpoint = null;
  
  if (typeof DataService.buildChildTableEndpoint === 'function') {
      endpoint = DataService.buildChildTableEndpoint(childConfig, parentRecord);
  } else {
      // Fallback if the function doesn't exist
      if (childConfig && childConfig.route && childConfig.relationKey && parentRecord) {
          const parentId = parentRecord[childConfig.relationKey];
          if (parentId !== undefined && parentId !== null) {
              endpoint = childConfig.route + parentId;
          }
      }
  }
  
  if (!endpoint) {
      console.error(`Could not build endpoint for nested child table "${tableName}"`);
      $("#" + loaderId).hide();
      return;
  }
  
  console.log(`Loading data for nested child ${tableName} from: ${endpoint}`);
  
  // Get child tables for this nested level
  let childTableTree = null;
  if (childConfig && childConfig.childTables) {
      childTableTree = childConfig.childTables;
  } else if (typeof DataService.getChildTableTreeFor === 'function') {
      childTableTree = DataService.getChildTableTreeFor(tableName);
  }
  
  // Load child table data directly
  $.ajax({
      url: endpoint,
      method: 'GET',
      headers: ApiConfig.getRequestHeaders(),
      success: function(response) {
          // Hide the loader
          $("#" + loaderId).hide();
          
          console.log(`Received data for nested ${tableName}:`, response);
          
          // Process the child data
          const childData = response.data || [];
          const childTableConfig = response.tableConfig || {};
          
          // Get child table tree from response if available
          let responseChildTableTree = null;
          if (response.childTableTree) {
              responseChildTableTree = response.childTableTree;
          } else if (response.tableConfig && response.tableConfig.childTableTree) {
              responseChildTableTree = response.tableConfig.childTableTree;
          }
          
          // Use response child table tree if available, otherwise use the one we already have
          const effectiveChildTableTree = responseChildTableTree || childTableTree;
          
          // Initialize the nested child grid with the loaded data
          initializeNestedChildGrid(gridId, childData, childTableConfig, effectiveChildTableTree);
      },
      error: function(xhr, status, error) {
          // Error callback
          console.error(`Error loading nested child data: ${error}`);
          
          // Hide the loader
          $("#" + loaderId).hide();
          
          // Show error message in the grid area
          $("#" + gridId).html(`<div class="grid-error">Error loading data: ${error}</div>`);
      }
  });
}


/**
 * Initialize a nested child grid
 * 
 * @param {string} gridId - Grid element ID
 * @param {Array} data - Child table data
 * @param {Object} config - Child table configuration
 * @param {Object} childTableTree - Child tables configuration
 */
function initializeNestedChildGrid(gridId, data, config, childTableTree) {
  console.log(`Initializing nested child grid ${gridId} with ${data ? data.length : 0} records`);
  
  // Clear existing grid if any
  var existingGrid = $("#" + gridId).data("ejGrid");
  if (existingGrid) {
      existingGrid.destroy();
  }
  
  // Determine if this nested grid has its own nested children
  var hasNestedChildren = Boolean(childTableTree && Object.keys(childTableTree).length > 0);
  console.log(`Nested child grid ${gridId} has nested children:`, hasNestedChildren);
  
  // Map columns from configuration
  var columns = [];
  if (config && config.columnDefs) {
      columns = ColumnMapper.mapColumnDefinitions(config.columnDefs);
  } else {
      // Auto-generate columns
      if (data && data.length > 0) {
          var firstRecord = data[0];

          
          for (var key in firstRecord) {
              // Skip special fields and objects/arrays
              if (key === 'action_column' || key === 'action_view' || 
                  key === 'action_modify' || key === 'action_delete' ||
                  (typeof firstRecord[key] === 'object' && firstRecord[key] !== null && !Array.isArray(firstRecord[key])) ||
                  Array.isArray(firstRecord[key])) {
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
  
  // Create grid options
  var gridOptions = {
      dataSource: data,
      allowPaging: false,
      allowSorting: true,
      allowFiltering: true,
      filterSettings: { filterType: "excel" },
      pageSettings: { pageSize: 4 },
      isResponsive: true,
      enableAutoResize: true,
      columns: columns
  };
  
  // If has nested children, extract template ID and add handlers
  // For deeply nested grids, we'd need unique template IDs
  if (hasNestedChildren) {
      // For now, we're not supporting more than 2 levels of nesting
      // This would require more complex template handling
      console.warn("Deeply nested child grids (3+ levels) are not fully supported yet");
  }
  
  // Initialize the grid
  $("#" + gridId).ejGrid(gridOptions);
  console.log(`Nested grid ${gridId} initialized successfully`);
  
  // Adjust grid heights
  setTimeout(function() {
      adjustGridHeights();
  }, 300);
}

  /**
   * Adjust heights of all grids to fix layout issues
   */
  function adjustGridHeights() {
    // Adjust detail cells
    $(".e-detailcell").each(function () {
      var $cell = $(this);
      var $content = $cell.find(".detail-container");

      if ($content.length) {
        var contentHeight = $content.outerHeight(true);

        if (contentHeight > 0) {
          $cell.css("height", contentHeight + 20 + "px");
        }
      }
    });

    // Adjust grid content
    $(".e-gridcontent").each(function () {
      var $content = $(this);
      var $table = $content.find("table.e-table");

      if ($table.length) {
        var tableHeight = $table.height();

        if (tableHeight > 10) {
          $content.css("height", "auto");
        }
      }
    });

    // Remove fixed heights from tab content
    $(".tab-content").css("height", "auto");
  }

  /**
   * Refresh all grid instances
   */
  function refreshGrids(data, config, childTableTree) {
    if (data && config) {
      // Re-initialize the main grid
      initializeMainGrid(data, config, childTableTree);
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
    getGridInstances: getGridInstances,
  };
})();
