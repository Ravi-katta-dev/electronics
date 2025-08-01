# Electronics Learning Platform - Developer Guide

## Project Overview
The RRB Electronics Learning Platform is a Progressive Web Application (PWA) designed for RRB Tech Grade 1 Signal exam preparation. Built with vanilla HTML, CSS, and JavaScript for maximum compatibility and performance.

### Technology Stack
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Architecture**: Progressive Web App (PWA)
- **Deployment**: GitHub Pages compatible
- **Service Worker**: Offline functionality
- **Storage**: LocalStorage, IndexedDB

### Project Structure
```
electronics/
├── assets/                 # Static assets (CSS, JS, images)
├── data/                   # JSON data files
├── docs/                   # Documentation
├── modules/               # Learning modules
├── tools/                 # Interactive tools
├── js/                    # Utility JavaScript files
├── manifest.json          # PWA manifest
├── sw.js                  # Service worker
├── 404.html              # Custom 404 page
└── index.html             # Main entry point
```

### Key Features
- 🎓 7 Core learning modules
- 🔧 Interactive circuit simulation tools
- 📝 Exam simulator with 500+ questions
- 📱 Progressive Web App (PWA)
- 🌐 GitHub Pages deployment
- 📊 Progress tracking
- 🎨 Responsive design with dark/light themes

## Development Setup

### Prerequisites
- Modern web browser
- Local web server (for development)
- Git for version control

### Local Development
```bash
# Clone the repository
git clone https://github.com/Ravi-katta-dev/electronics.git
cd electronics

# Start local server (choose one)
# Python 3
python -m http.server 8000

# Node.js (if you have http-server installed)
npx http-server -p 8000

# Visit http://localhost:8000
```

### File Structure Explanation
- **assets/**: Core styling and JavaScript
- **modules/**: Individual learning modules with their own HTML/CSS/JS
- **tools/**: Interactive tools (exam simulator, circuit builder, virtual lab)
- **data/**: JSON files for questions, components, formulas
- **js/utils/**: Utility functions and GitHub Pages routing

## Architecture

### Component System
The application uses a modular component-based architecture:

1. **Main Application** (`assets/js/app.js`)
   - Application state management
   - Theme handling
   - PWA functionality
   - Service worker registration

2. **Simulation Engine** (`assets/js/simulation.js`)
   - Circuit simulation algorithms
   - DC/AC/Transient analysis
   - Mathematical calculations

3. **GitHub Pages Router** (`js/utils/github-pages-router.js`)
   - Path resolution for GitHub Pages
   - 404 handling and redirects
   - Asset path management

### State Management
- Uses native JavaScript classes
- LocalStorage for persistence
- Map objects for efficient data handling
- Event-driven architecture

## Development Guidelines

### Code Style
- Use ES6+ features (classes, arrow functions, async/await)
- Follow consistent naming conventions
- Add comprehensive comments
- Use CSS custom properties for theming

### CSS Architecture
```css
/* Use CSS custom properties */
:root {
  --primary-color: #4a90e2;
  --spacing-md: 1rem;
}

/* Follow BEM methodology */
.module-card {}
.module-card__header {}
.module-card__header--active {}
```

### JavaScript Patterns
```javascript
// Use classes for complex components
class ExamSimulator {
  constructor() {
    this.init();
  }
  
  async init() {
    await this.loadData();
    this.setupEventListeners();
  }
}

// Use async/await for API calls
async loadQuestionBank() {
  try {
    const response = await fetch('./data/questions.json');
    return await response.json();
  } catch (error) {
    console.error('Failed to load questions:', error);
  }
}
```

## Building and Deployment

### GitHub Pages Deployment
The application is configured for automatic deployment to GitHub Pages:

1. Push to main branch
2. GitHub Actions builds and deploys
3. Available at: `https://ravi-katta-dev.github.io/electronics/`

### Service Worker
Handles caching and offline functionality:
- Static files cached on install
- Dynamic content cached on demand
- Automatic updates when new version deployed

### PWA Features
- Installable on mobile/desktop
- Offline functionality
- Native app-like experience
- Custom splash screen and icons

## Contributing

### Adding New Modules
1. Create module directory in `modules/`
2. Follow existing module structure
3. Update navigation in `index.html`
4. Add module to service worker cache list

### Adding Questions
1. Update `tools/exam-simulator/data/questions.json`
2. Follow existing question format
3. Include proper categorization and difficulty

### Testing
- Test on multiple browsers
- Verify PWA functionality
- Check offline capability
- Validate responsive design

## Performance Optimization

### Loading Strategy
- Critical CSS inlined
- JavaScript loaded asynchronously
- Images optimized and lazy-loaded
- Service worker for caching

### Bundle Optimization
- Minimal external dependencies
- CSS/JS minification for production
- Efficient asset loading
- Progressive enhancement

## Browser Support
- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

## Security Considerations
- CSP headers configured
- No external script dependencies
- Safe data handling
- Input validation

---

**Last Updated**: August 2025
**Version**: 1.0.0
**Maintainer**: Ravi Katta (@Ravi-katta-dev)
