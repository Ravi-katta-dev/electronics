# Assets Directory - Developer Guide

## Overview
The assets directory contains core styling, JavaScript, and media files for the Electronics Learning Platform.

## Structure
```
assets/
├── css/
│   ├── main.css           # Core styles and CSS variables
│   ├── components.css     # Reusable component styles
│   └── responsive.css     # Mobile-first responsive design
├── js/
│   ├── app.js            # Main application logic
│   ├── circuit-engine.js # Circuit simulation engine
│   ├── simulation.js     # Mathematical simulation
│   └── exam-engine.js    # Exam functionality
└── images/
    ├── icons/            # App icons and favicons
    ├── components/       # Electronic component images
    └── diagrams/         # Circuit diagrams
```

## CSS Architecture

### main.css
Core styles using CSS custom properties for theming:

```css
:root {
  /* Color system */
  --primary-color: #4a90e2;
  --text-primary: #2c3e50;
  --bg-primary: #ffffff;
  
  /* Spacing scale */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  
  /* Typography scale */
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
}
```

### components.css
Reusable component styles following BEM methodology:

```css
/* Module Cards */
.module-card {
  background: var(--bg-primary);
  border-radius: var(--border-radius-xl);
  box-shadow: var(--shadow-lg);
}

.module-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.module-card__progress {
  display: flex;
  flex-direction: column;
}
```

### responsive.css
Mobile-first responsive design:

```css
/* Base styles for mobile */
.modules-grid {
  grid-template-columns: 1fr;
}

/* Tablet and up */
@media (min-width: 768px) {
  .modules-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .modules-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

## JavaScript Architecture

### app.js
Main application class managing:
- Application state
- Service worker registration
- Theme management
- PWA functionality
- Event handling

Key methods:
```javascript
class AppState {
  constructor() {
    this.init();
  }
  
  async initServiceWorker() {
    // Service worker registration with GitHub Pages support
  }
  
  initPWA() {
    // PWA installation handling
  }
  
  toggleTheme() {
    // Dark/light theme switching
  }
}
```

### simulation.js
Mathematical simulation engine for circuit analysis:

```javascript
class SimulationEngine {
  dcAnalysis(circuit) {
    // DC circuit analysis using nodal analysis
  }
  
  acAnalysis(circuit, frequency) {
    // AC analysis with phasor calculations
  }
  
  transientAnalysis(circuit, timeSpan) {
    // Time-domain analysis
  }
}
```

## Development Guidelines

### Adding New Styles
1. Use CSS custom properties for all values
2. Follow mobile-first responsive design
3. Use BEM naming convention
4. Test dark theme compatibility

### JavaScript Best Practices
1. Use ES6+ classes and modules
2. Implement proper error handling
3. Use async/await for asynchronous operations
4. Add comprehensive logging

### Performance Considerations
- Optimize images for web
- Use CSS transforms for animations
- Minimize DOM manipulations
- Implement lazy loading for heavy assets

### Browser Compatibility
- Test across all supported browsers
- Use progressive enhancement
- Provide fallbacks for modern features
- Validate CSS and JavaScript

## File Naming Conventions
- Use kebab-case for files: `exam-engine.js`
- Use camelCase for JavaScript variables: `examEngine`
- Use BEM for CSS classes: `module-card__header`

## Asset Optimization
- Compress images using modern formats (WebP, AVIF)
- Minify CSS and JavaScript for production
- Use appropriate image sizes for different screen densities
- Implement proper caching headers

---

**Last Updated**: August 2025
**Maintainer**: Ravi Katta (@Ravi-katta-dev)
