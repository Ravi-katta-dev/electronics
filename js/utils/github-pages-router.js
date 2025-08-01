/**
 * GitHub Pages Router - Handles base path detection and SPA routing for GitHub Pages deployment
 * Fixes 404 errors by detecting the deployment base path and routing accordingly
 */

class GitHubPagesRouter {
  constructor() {
    this.basePath = this.detectBasePath();
    this.isGitHubPages = this.isDeployedOnGitHubPages();
    console.log('GitHub Pages Router initialized:', { basePath: this.basePath, isGitHubPages: this.isGitHubPages });
  }

  /**
   * Detect the base path for GitHub Pages deployment
   * GitHub Pages serves repos at /{username}/{repository}/ for project pages
   */
  detectBasePath() {
    const hostname = window.location.hostname;
    const pathname = window.location.pathname;

    // For GitHub Pages project sites (username.github.io/repository)
    if (hostname.includes('github.io') && pathname !== '/') {
      const pathParts = pathname.split('/').filter(part => part.length > 0);
      if (pathParts.length > 0) {
        return '/' + pathParts[0];
      }
    }

    // For custom domains or local development
    return '';
  }

  /**
   * Check if currently deployed on GitHub Pages
   */
  isDeployedOnGitHubPages() {
    return window.location.hostname.includes('github.io') || 
           window.location.hostname.includes('github.com');
  }

  /**
   * Convert absolute path to correct path for current deployment
   */
  resolvePath(path) {
    // If path is already absolute with protocol, return as-is
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }

    // If path starts with /, prepend base path
    if (path.startsWith('/')) {
      return this.basePath + path;
    }

    // If relative path, return as-is
    return path;
  }

  /**
   * Navigate to a path with proper base path handling
   */
  navigateTo(path) {
    const resolvedPath = this.resolvePath(path);
    window.location.href = resolvedPath;
  }

  /**
   * Update all links on the page to use correct base paths
   */
  updatePageLinks() {
    // Update navigation links
    document.querySelectorAll('a[href^="/"]').forEach(link => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('/') && !href.startsWith(this.basePath)) {
        link.setAttribute('href', this.resolvePath(href));
      }
    });

    // Update form actions
    document.querySelectorAll('form[action^="/"]').forEach(form => {
      const action = form.getAttribute('action');
      if (action && action.startsWith('/') && !action.startsWith(this.basePath)) {
        form.setAttribute('action', this.resolvePath(action));
      }
    });

    // Update manifest links
    const manifestLink = document.querySelector('link[rel="manifest"]');
    if (manifestLink) {
      const href = manifestLink.getAttribute('href');
      if (href && href.startsWith('/') && !href.startsWith(this.basePath)) {
        manifestLink.setAttribute('href', this.resolvePath(href));
      }
    }

    // Update service worker registration
    if ('serviceWorker' in navigator && this.basePath) {
      // Update service worker scope
      navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(registration => {
          if (registration.scope.endsWith('/') && !registration.scope.includes(this.basePath)) {
            // Re-register with correct scope
            registration.unregister().then(() => {
              navigator.serviceWorker.register(this.resolvePath('/sw.js'), {
                scope: this.resolvePath('/')
              });
            });
          }
        });
      });
    }
  }

  /**
   * Handle client-side routing for SPA
   */
  handleSPARoute(path) {
    const targetPath = this.resolvePath(path);
    
    // Check if target exists, otherwise redirect to 404
    fetch(targetPath, { method: 'HEAD' })
      .then(response => {
        if (response.ok) {
          window.location.href = targetPath;
        } else {
          this.handle404(path);
        }
      })
      .catch(() => {
        this.handle404(path);
      });
  }

  /**
   * Handle 404 errors with fallback routing
   */
  handle404(originalPath) {
    console.log('404 handling for path:', originalPath);
    
    // Try to route to main application
    const fallbacks = [
      '/',
      '/index.html',
      this.basePath + '/',
      this.basePath + '/index.html'
    ];

    for (const fallback of fallbacks) {
      if (fallback !== originalPath) {
        fetch(fallback, { method: 'HEAD' })
          .then(response => {
            if (response.ok) {
              window.location.href = fallback + '#' + originalPath;
              return;
            }
          })
          .catch(() => {});
      }
    }
  }

  /**
   * Update asset paths (CSS, JS, images) for GitHub Pages
   */
  updateAssetPaths() {
    // Update CSS links
    document.querySelectorAll('link[rel="stylesheet"][href^="/"]').forEach(link => {
      const href = link.getAttribute('href');
      if (href && !href.startsWith(this.basePath)) {
        link.setAttribute('href', this.resolvePath(href));
      }
    });

    // Update script sources
    document.querySelectorAll('script[src^="/"]').forEach(script => {
      const src = script.getAttribute('src');
      if (src && !src.startsWith(this.basePath)) {
        script.setAttribute('src', this.resolvePath(src));
      }
    });

    // Update image sources
    document.querySelectorAll('img[src^="/"]').forEach(img => {
      const src = img.getAttribute('src');
      if (src && !src.startsWith(this.basePath)) {
        img.setAttribute('src', this.resolvePath(src));
      }
    });
  }

  /**
   * Check and fix current page path
   */
  checkCurrentPath() {
    const currentPath = window.location.pathname;
    const expectedPath = this.resolvePath(currentPath.replace(this.basePath, ''));
    
    if (currentPath !== expectedPath && this.basePath) {
      console.log('Redirecting from', currentPath, 'to', expectedPath);
      window.location.href = expectedPath;
    }
  }

  /**
   * Initialize router on page load
   */
  init() {
    // Update all paths on the page
    this.updatePageLinks();
    this.updateAssetPaths();
    
    // Handle hash-based routing for SPA fallback
    window.addEventListener('hashchange', () => {
      const hash = window.location.hash.substring(1);
      if (hash) {
        this.handleSPARoute(hash);
      }
    });

    // Check hash on initial load
    const initialHash = window.location.hash.substring(1);
    if (initialHash && initialHash !== window.location.pathname) {
      this.handleSPARoute(initialHash);
    }

    console.log('GitHub Pages Router initialized for base path:', this.basePath);
  }
}

// Create global router instance
window.githubPagesRouter = new GitHubPagesRouter();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.githubPagesRouter.init();
  });
} else {
  window.githubPagesRouter.init();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GitHubPagesRouter;
}