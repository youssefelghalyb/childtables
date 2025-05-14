/**
 * Enhanced Data Service Module for Hierarchical Child Tables
 * Handles data fetching and manipulation with support for nested child tables
 */
const DataService = (function () {
  // Private variables
  let currentData = null;
  let currentConfig = null;
  let childTableTree = null;

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
      method: "GET",
      headers: ApiConfig.getRequestHeaders(),
      success: function (response) {
        // Process the response
        processResponse(response, successCallback);
      },
      error: function (xhr, status, error) {
        if (typeof errorCallback === "function") {
          errorCallback("API Error: " + error);
        }
      },
    });
  }

  /**
   * Process API response data
   * @param {Object} response - API response data
   * @param {Function} callback - Callback with processed data
   */
  function processResponse(response, callback) {
    try {
      console.log("API Response:", response);

      // Store the data and configuration
      currentData = response.data.data || response.data;
      currentConfig = response.tableConfig;

      // Handle the new child table tree structure
      childTableTree =
        response.tableConfig.childTableTree || response.childTableTree || {};

      console.log("Child Table Tree:", childTableTree);

      // Call the callback with the processed data
      if (typeof callback === "function") {
        callback(currentData, currentConfig, childTableTree);
      }s
    } catch (e) {
      throw new Error("Error processing data: " + e);
    }
  }

  /**
   * Get child table tree for a specific table
   * @param {string} tableName - Table name to get child tree for
   * @returns {Object|null} - Child table tree or null
   */
/**
 * Get child table tree for a specific table
 * @param {string} tableName - Table name to get child tree for
 * @returns {Object|null} - Child table tree or null
 */
function getChildTableTreeFor(tableName) {
    if (!childTableTree) {
        return null;
    }
    
    // Check if this table exists in the child table tree
    if (childTableTree[tableName]) {
        // If the table has childTables, return them
        if (childTableTree[tableName].childTables) {
            console.log(`Found child tables for ${tableName}:`, 
                Object.keys(childTableTree[tableName].childTables));
            return childTableTree[tableName].childTables;
        }
    }
    
    // Search recursively in the tree
    for (const key in childTableTree) {
        if (childTableTree[key].childTables) {
            // Recursive search for nested tables
            if (childTableTree[key].childTables[tableName]) {
                if (childTableTree[key].childTables[tableName].childTables) {
                    console.log(`Found deeply nested child tables for ${tableName}`);
                    return childTableTree[key].childTables[tableName].childTables;
                }
            }
            
            // Go one level deeper if needed
            for (const nestedKey in childTableTree[key].childTables) {
                if (childTableTree[key].childTables[nestedKey].childTables) {
                    if (nestedKey === tableName) {
                        console.log(`Found deeply nested child tables for ${tableName} at level 2`);
                        return childTableTree[key].childTables[nestedKey].childTables;
                    }
                }
            }
        }
    }
    
    console.log(`No child tables found for ${tableName}`);
    return null;
}

  /**
   * Load child table data for a specific parent record
   * @param {string} childTableName - Name of the child table
   * @param {Object} parentRecord - Parent record data
   * @param {Function} successCallback - Callback for successful data loading
   * @param {Function} errorCallback - Callback for error handling
   */
  function loadChildTableData(
    childTableName,
    parentRecord,
    successCallback,
    errorCallback
  ) {
    // Find the child table configuration
    const childConfig = findChildTableConfig(childTableName);

    if (!childConfig) {
      if (typeof errorCallback === "function") {
        errorCallback(
          `Child table configuration not found for "${childTableName}"`
        );
      }
      return;
    }

    // Build the child table endpoint
    const endpoint = buildChildTableEndpoint(childConfig, parentRecord);

    if (!endpoint) {
      if (typeof errorCallback === "function") {
        errorCallback(
          `Could not build endpoint for child table "${childTableName}"`
        );
      }
      return;
    }

    // Load the child table data
    $.ajax({
      url: endpoint,
      method: "GET",
      headers: ApiConfig.getRequestHeaders(),
      success: function (response) {
        // Before calling the callback, ensure the childTableTree is properly extracted
        const childData = response.data || [];
        const childTableConfig = response.tableConfig || {};

        // IMPORTANT: Extract the childTableTree from the response
        // It could be either directly in the response or inside tableConfig
        let responseChildTableTree = null;

        if (response.childTableTree) {
          // If directly in the response
          responseChildTableTree = response.childTableTree;
        } else if (
          response.tableConfig &&
          response.tableConfig.childTableTree
        ) {
          // If nested inside tableConfig
          responseChildTableTree = response.tableConfig.childTableTree;
        }

        // Log what we found
        console.log(
          `Child table ${childTableName} response contains child table tree:`,
          Boolean(responseChildTableTree)
        );

        if (responseChildTableTree) {
          console.log(
            `Child tables for ${childTableName}:`,
            Object.keys(responseChildTableTree)
          );
        }

        // Include the childTableTree in the success callback
        if (typeof successCallback === "function") {
          successCallback(response, childTableConfig, responseChildTableTree);
        }
      },
      error: function (xhr, status, error) {
        if (typeof errorCallback === "function") {
          errorCallback(
            `Error loading child table "${childTableName}": ${error}`
          );
        }
      },
    });
  }

  /**
   * Find child table configuration in the child table tree
   * @param {string} tableName - Name of the child table
   * @param {Object} treeNode - Current node in the tree (defaults to root)
   * @returns {Object|null} - Child table configuration or null if not found
   */
  function findChildTableConfig(tableName, treeNode = null) {
    // Start with the root node if not provided
    const node = treeNode || childTableTree;

    if (!node) {
      return null;
    }

    // Check if the current node has the table
    if (node[tableName]) {
      return node[tableName];
    }

    // Search in child nodes recursively
    for (const key in node) {
      if (node[key] && node[key].childTables) {
        const result = findChildTableConfig(tableName, node[key].childTables);
        if (result) {
          return result;
        }
      }
    }

    return null;
  }

  /**
   * Build the endpoint URL for a child table
   * @param {Object} childConfig - Child table configuration
   * @param {Object} parentRecord - Parent record data
   * @returns {string|null} - Endpoint URL or null if configuration is invalid
   */
  function buildChildTableEndpoint(childConfig, parentRecord) {
    if (
      !childConfig ||
      !childConfig.route ||
      !childConfig.relationKeyTo ||
      !parentRecord
    ) {
      return null;
    }

    // Get the parent ID value
    const parentId = parentRecord[childConfig.relationKeyTo];

    if (parentId === undefined || parentId === null) {
      return null;
    }

    // Return the full endpoint with the parent ID
    return childConfig.route + parentId;
  }

  /**
   * Get all available child tables for a record
   * @param {Object} record - The record to get child tables for
   * @returns {Object} - Available child tables with their configurations
   */
  function getAvailableChildTables(record) {
    const result = {};

    if (!childTableTree || !record) {
      return result;
    }

    // Check each child table in the tree
    for (const tableName in childTableTree) {
      const tableConfig = childTableTree[tableName];

      // Ensure this record has the required relation key
      if (
        tableConfig.relationKeyTo &&
        record[tableConfig.relationKeyTo] !== undefined
      ) {
        result[tableName] = tableConfig;
      }
    }

    return result;
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
      url: apiPath + "/delete/" + id,
      method: "DELETE",
      headers: {
        ...ApiConfig.getRequestHeaders(),
        "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content"),
      },
      success: function (response) {
        if (typeof successCallback === "function") {
          successCallback(response);
        }
      },
      error: function (xhr, status, error) {
        if (typeof errorCallback === "function") {
          errorCallback("Error deleting record: " + error);
        }
      },
    });
  }

  /**
   * Get stored data and configurations
   */
  function getCurrentState() {
    return {
      data: currentData,
      config: currentConfig,
      childTableTree: childTableTree,
    };
  }

  // Public API
  return {
    loadData: loadData,
    loadChildTableData: loadChildTableData,
    findChildTableConfig: findChildTableConfig,
    getAvailableChildTables: getAvailableChildTables,
    getChildTableTreeFor: getChildTableTreeFor,  // Add this line
    deleteRecord: deleteRecord,
    getCurrentState: getCurrentState,
  };
})();
