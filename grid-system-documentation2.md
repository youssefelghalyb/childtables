# Dynamic Multi-Tenant Grid System Documentation

## Table of Contents

1. [Overview](#overview)
2. [File Structure](#file-structure)
3. [Core Files](#core-files)
   - [index.html](#indexhtml)
   - [grid-system.css](#grid-systemcss)
   - [app.js](#appjs)
4. [Configuration Modules](#configuration-modules)
   - [api-config.js](#api-configjs)
5. [Functional Modules](#functional-modules)
   - [ui-manager.js](#ui-managerjs)
   - [theme-manager.js](#theme-managerjs)
   - [data-service.js](#data-servicejs)
   - [template-engine.js](#template-enginejs)
   - [column-mapper.js](#column-mapperjs)
   - [grid-manager.js](#grid-managerjs)
6. [Common Modifications](#common-modifications)
7. [Troubleshooting](#troubleshooting)

## Overview

The Dynamic Multi-Tenant Grid System is a modular application that displays and manages data in a customizable grid format. It supports:

- Loading data from any API endpoint
- Main grid with detailed expand views
- Child tables with sub-grids
- Themeable appearance
- Dynamic column mapping based on API responses
- Permission-based actions

The system is built using jQuery and Syncfusion's Grid component, structured in a modular pattern for maintainability and extensibility.

## File Structure

```
/
├── index.html                      # Main HTML page
├── grid-system.css                 # Core CSS styles
├── config/
│   └── api-config.js               # API configuration
├── modules/
│   ├── ui-manager.js               # UI interactions
│   ├── theme-manager.js            # Theme handling
│   ├── data-service.js             # Data fetching
│   ├── template-engine.js          # Template generation
│   ├── column-mapper.js            # Column definition mapping
│   └── grid-manager.js             # Grid initialization
└── app.js                          # Main application
```

## Core Files

### index.html

**Purpose**: Main entry point for the application that loads all necessary dependencies and provides the DOM structure.

**Key Components**:
- Main container structure
- API controls
- Theme selector
- Grid containers
- Script and style references

**Modification Scenarios**:
- **Add new UI elements**: Edit the HTML inside the `tenant-container` div
- **Change default API endpoint**: Modify the value attribute of the `apiEndpoint` input
- **Add new themes**: Add new options to the `themeSelector` select element
- **Add third-party libraries**: Include additional script or CSS references in the head section

### grid-system.css

**Purpose**: Contains all styling for the application, organized into sections for different UI components.

**Key Sections**:
- Main container styles
- Detail view styles
- Grid overrides
- Custom renderers
- Theme styles

**Modification Scenarios**:
- **Change container layout**: Modify the `.tenant-container` and related classes
- **Customize detail view**: Edit the `.detail-container` and `.info-section` styles
- **Modify boolean indicators**: Update the `.boolean-true` and `.boolean-false` classes
- **Add new themes**: Add new theme classes at the bottom (e.g., `.theme-red`)

### app.js

**Purpose**: Main application module that coordinates all other modules and handles the application lifecycle.

**Key Functions**:
- `initialize()`: Sets up the application
- `handleLoadData()`: Processes API data loading
- `handleRefresh()`: Refreshes grid displays
- `handleThemeChange()`: Applies theme changes
- `viewRecord()`, `editRecord()`, `deleteRecord()`: Action handlers

**Modification Scenarios**:
- **Change auto-load behavior**: Modify the `autoLoad` value and timeout
- **Add new global event handlers**: Define and wire them in the `initialize()` function
- **Modify record actions**: Update the `viewRecord()`, `editRecord()`, or `deleteRecord()` functions
- **Add new application-level features**: Add new methods and expose them through the return object

## Configuration Modules

### api-config.js

**Purpose**: Manages API-related settings including endpoints, authentication, and request formatting.

**Key Components**:
- `apiDefaults`: Default API settings
- `buildApiUrl()`: Creates full API URLs
- `getRequestHeaders()`: Provides authentication headers
- `getWebRouteFromApi()`: Converts API routes to web routes

**Modification Scenarios**:
- **Change base API URL**: Update the `baseUrl` in `apiDefaults`
- **Modify authentication**: Change the `authToken` value or authentication method
- **Add custom headers**: Add to the `headers` object in `apiDefaults`
- **Change API path structure**: Modify the `getWebRouteFromApi()` function

## Functional Modules

### ui-manager.js

**Purpose**: Handles user interface elements and interactions, including events and UI state.

**Key Functions**:
- `initialize()`: Sets up UI components and event handlers
- `setupEventHandlers()`: Attaches event listeners to UI elements
- `showLoading()`, `hideLoading()`: Controls loading indicator
- `showError()`: Displays error messages

**Modification Scenarios**:
- **Add new UI controls**: Update the `selectors` object and handle them in `setupEventHandlers()`
- **Modify loading behavior**: Change the implementation of `showLoading()` and `hideLoading()`
- **Enhance error handling**: Improve the `showError()` function with better error UI
- **Add form validation**: Create new functions to validate user inputs

### theme-manager.js

**Purpose**: Manages theme application and switching throughout the application.

**Key Functions**:
- `applyTheme()`: Applies a theme to the application
- `getCurrentTheme()`: Returns the currently active theme

**Modification Scenarios**:
- **Add new themes**: Create the CSS classes in the stylesheet, then use them in `applyTheme()`
- **Change theme application logic**: Modify the `applyTheme()` function
- **Add theme persistence**: Extend the module to save theme preferences to localStorage

### data-service.js

**Purpose**: Handles data fetching, processing, and state management for the application.

**Key Functions**:
- `loadData()`: Fetches data from an API endpoint
- `processResponse()`: Processes the API response
- `deleteRecord()`: Handles record deletion
- `getCurrentState()`: Returns the current data state

**Modification Scenarios**:
- **Change data processing logic**: Modify the `processResponse()` function
- **Add data transformation**: Extend `processResponse()` to transform data before storing
- **Add data export**: Create a new function to export data to CSV or Excel
- **Implement caching**: Add cache mechanisms to `loadData()` to reduce API calls

### template-engine.js

**Purpose**: Generates dynamic HTML templates for grids and detail views based on data structure.

**Key Functions**:
- `generateDetailTemplate()`: Creates the detail view template
- `formatFieldLabel()`: Formats field names into readable labels
- `formatTabName()`: Formats tab names using configuration

**Modification Scenarios**:
- **Change detail view layout**: Modify the HTML generation in `generateDetailTemplate()`
- **Add custom field formatting**: Extend the `formatFieldLabel()` function
- **Add custom field rendering**: Add new template types for specific data types
- **Modify tab appearance**: Update the tab HTML generation in `generateDetailTemplate()`

### column-mapper.js

**Purpose**: Maps column definitions from the API format to the grid component format.

**Key Functions**:
- `mapColumnDefinitions()`: Converts API column definitions to grid columns
- `generateValueGetterTemplate()`: Creates templates for relationship fields

**Modification Scenarios**:
- **Add new column types**: Add handling for new column types in `mapColumnDefinitions()`
- **Modify action column handling**: Update the actions renderer section
- **Add custom renderers**: Add new renderer types and their template generation
- **Change relationship display**: Modify `generateValueGetterTemplate()` logic

### grid-manager.js

**Purpose**: Manages grid initialization, configuration, and interactions including child grids.

**Key Functions**:
- `initializeMainGrid()`: Sets up the main data grid
- `handleDetailsBound()`: Processes row expansion events
- `initializeChildGrid()`: Creates child grids in detail views
- `adjustGridHeights()`: Fixes layout issues with grids
- `refreshGrids()`: Refreshes all grid instances

**Modification Scenarios**:
- **Change grid configuration**: Modify the grid options in `initializeMainGrid()`
- **Alter detail row behavior**: Update the `handleDetailsBound()` function
- **Customize child grids**: Change options in `initializeChildGrid()`
- **Improve layout adjustments**: Enhance the `adjustGridHeights()` function
- **Add grid export or import**: Add new functions to handle these features

## Common Modifications

### Adding a New Field Renderer

To add a custom renderer for specific field types:

1. **Update column-mapper.js**:
   ```javascript
   // In mapColumnDefinitions()
   if (colDef.cellRenderer === "myCustomRenderer") {
       column.template = '<div class="custom-renderer">{{:' + colDef.field + '}}</div>';
   }
   ```

2. **Add CSS in grid-system.css**:
   ```css
   .custom-renderer {
       /* Your custom styling */
   }
   ```

### Changing API Authentication

To update the authentication method:

1. **Modify api-config.js**:
   ```javascript
   function getRequestHeaders() {
       return {
           ...apiDefaults.headers,
           'Authorization': 'Bearer ' + getToken() // Use a function to get the token
       };
   }
   
   function getToken() {
       // Get token from localStorage or another source
       return localStorage.getItem('auth_token') || apiDefaults.authToken;
   }
   ```

### Adding a New Theme

To add a new theme option:

1. **Update index.html**:
   ```html
   <select id="themeSelector">
       <!-- Add new option -->
       <option value="red">Red Theme</option>
   </select>
   ```

2. **Add CSS in grid-system.css**:
   ```css
   .theme-red .e-grid .e-headercell {
       background-color: #ffebee;
   }
   /* Additional theme styles */
   ```

### Adding Export Functionality

To add grid export capabilities:

1. **Update grid-manager.js** with a new export function:
   ```javascript
   function exportToExcel(gridId) {
       const grid = $("#" + gridId).data("ejGrid");
       if (grid) {
           grid.exportToExcel("GridData.xlsx");
       }
   }
   
   // Add to return object
   return {
       // existing methods
       exportToExcel: exportToExcel
   };
   ```

2. **Add a button in index.html**:
   ```html
   <button id="exportBtn">Export to Excel</button>
   ```

3. **Wire it in ui-manager.js**:
   ```javascript
   $("#exportBtn").on('click', function() {
       if (config && config.onExport) {
           config.onExport();
       }
   });
   ```

4. **Handle it in app.js**:
   ```javascript
   function handleExport() {
       GridManager.exportToExcel("MainGrid");
   }
   
   // Add to UI initialization
   UiManager.initialize({
       // existing handlers
       onExport: handleExport
   });
   ```

## Troubleshooting

### Grid Not Showing Data

Check the following:

1. Verify the API endpoint is correct and accessible
2. Check browser console for JavaScript errors
3. Ensure data has the expected structure (look at console.log output)
4. Verify that column definitions match the data properties

### Child Tables Not Expanding

Common issues:

1. Check the relationship names in the data structure
2. Verify that the child table data is an array
3. Look for console errors when expanding rows
4. Make sure the detail template is being generated correctly

### Incorrect Action Permissions

If actions aren't respecting permissions:

1. Verify the action_column HTML is coming correctly from the API
2. Check that the column-mapper.js is using {{{:action_column}}} (triple braces)
3. Confirm the API is sending the correct permission flags
