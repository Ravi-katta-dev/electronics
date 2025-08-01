# JavaScript Utilities - Developer Guide

## Overview
Utility functions and classes that provide core functionality across the entire application, with special focus on GitHub Pages compatibility and routing.

## Structure
```
js/
├── utils/
│   ├── github-pages-router.js  # GitHub Pages routing and path resolution
│   ├── storage-utils.js        # Local storage management
│   ├── analytics.js            # User analytics and tracking
│   └── performance.js          # Performance monitoring
└── shared/
    ├── constants.js            # Application constants
    └── helpers.js              # Common helper functions
```

## Core Utilities

### GitHub Pages Router
**File**: `js/utils/github-pages-router.js`

**Purpose**: Handles path resolution and routing for GitHub Pages deployment.

**Key Features**:
- Automatic base path detection
- URL resolution for assets and pages
- 404 handling with smart redirects
- Asset path correction

**Usage**:
```javascript
class GitHubPagesRouter {
    constructor() {
        this.basePath = this.detectBasePath();
        this.init();
    }
    
    detectBasePath() {
        // Automatically detect GitHub Pages base path
        const hostname = window.location.hostname;
        if (hostname.includes('github.io')) {
            const pathParts = window.location.pathname.split('/');
            return pathParts.length > 1 ? '/' + pathParts[1] : '';
        }
        return '';
    }
    
    resolvePath(path) {
        // Resolve relative paths for GitHub Pages
        if (path.startsWith('/') && !path.startsWith(this.basePath)) {
            return this.basePath + path;
        }
        return path;
    }
}
```

### Storage Utilities
**File**: `js/utils/storage-utils.js`

**Purpose**: Centralized storage management with error handling.

```javascript
class StorageUtils {
    static setItem(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Storage error:', error);
            return false;
        }
    }
    
    static getItem(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Storage error:', error);
            return defaultValue;
        }
    }
    
    static removeItem(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Storage error:', error);
            return false;
        }
    }
}
```

## Development Guidelines

### Adding New Utilities
1. **File Naming**: Use kebab-case (`my-utility.js`)
2. **Class Structure**: Use ES6 classes with static methods when appropriate
3. **Error Handling**: Include comprehensive error handling
4. **Documentation**: Add JSDoc comments

### Example Utility Template
```javascript
/**
 * Utility for handling specific functionality
 * @class MyUtility
 */
class MyUtility {
    /**
     * Static utility method
     * @param {string} input - Input parameter
     * @returns {string} Processed output
     */
    static processInput(input) {
        try {
            // Process input
            return processedOutput;
        } catch (error) {
            console.error('MyUtility error:', error);
            return null;
        }
    }
}

// Export for use in other modules
window.MyUtility = MyUtility;
```

### Performance Considerations
- Use lazy loading for heavy utilities
- Implement caching where appropriate
- Minimize DOM operations
- Use efficient algorithms

### Browser Compatibility
- Test across all supported browsers
- Provide polyfills if needed
- Use progressive enhancement
- Handle feature detection

---

**Last Updated**: August 2025
**Maintainer**: Ravi Katta (@Ravi-katta-dev)
