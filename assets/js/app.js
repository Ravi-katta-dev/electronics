// RRB Electronics Learning Platform - Main Application JavaScript

// Application state management
class AppState {
  constructor() {
    this.modules = new Map();
    this.progress = new Map();
    this.settings = new Map();
    this.currentModule = null;
    this.theme = localStorage.getItem('theme') || 'light';
    this.isOffline = !navigator.onLine;
    
    this.init();
  }
  
  init() {
    this.loadProgress();
    this.loadSettings();
    this.initServiceWorker();
    this.initEventListeners();
    this.initPWA();
    this.applyTheme();
    this.updateLastAccess();
  }
  
  // Service Worker initialization with GitHub Pages support
  async initServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        // Detect base path for GitHub Pages
        const basePath = window.githubPagesRouter ? window.githubPagesRouter.basePath : '';
        const swPath = basePath ? `${basePath}/sw.js` : './sw.js';
        const scope = basePath ? `${basePath}/` : './';
        
        const registration = await navigator.serviceWorker.register(swPath, { scope });
        console.log('ServiceWorker registered:', registration.scope);
        
        // Handle updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              this.showUpdateAvailable();
            }
          });
        });
      } catch (error) {
        console.error('ServiceWorker registration failed:', error);
      }
    }
  }
  
  // PWA installation
  initPWA() {
    let deferredPrompt;
    const installButton = document.querySelector('.install-app');
    
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      if (installButton) {
        installButton.style.display = 'block';
      }
    });
    
    if (installButton) {
      installButton.addEventListener('click', async () => {
        if (deferredPrompt) {
          deferredPrompt.prompt();
          const { outcome } = await deferredPrompt.userChoice;
          console.log(`User response to install prompt: ${outcome}`);
          deferredPrompt = null;
          installButton.style.display = 'none';
        }
      });
    }
  }
  
  // Event listeners
  initEventListeners() {
    // Theme toggle
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => this.toggleTheme());
    }
    
    // Navigation toggle for mobile
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    if (navToggle && navLinks) {
      navToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
      });
    }
    
    // Online/offline status
    window.addEventListener('online', () => {
      this.isOffline = false;
      this.showNotification('Connection restored', 'success');
      this.syncOfflineData();
    });
    
    window.addEventListener('offline', () => {
      this.isOffline = true;
      this.showNotification('Working offline', 'info');
    });
    
    // Scroll effects
    window.addEventListener('scroll', this.handleScroll.bind(this));
    
    // Keyboard navigation
    document.addEventListener('keydown', this.handleKeyNavigation.bind(this));
  }
  
  // Theme management
  applyTheme() {
    document.documentElement.setAttribute('data-theme', this.theme);
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
      themeToggle.textContent = this.theme === 'dark' ? '☀️' : '🌙';
    }
  }
  
  toggleTheme() {
    this.theme = this.theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', this.theme);
    this.applyTheme();
    this.showNotification(`${this.theme} theme activated`, 'info');
  }
  
  // Progress management
  loadProgress() {
    const savedProgress = localStorage.getItem('moduleProgress');
    if (savedProgress) {
      try {
        const progressData = JSON.parse(savedProgress);
        this.progress = new Map(Object.entries(progressData));
        this.updateProgressDisplay();
      } catch (error) {
        console.error('Error loading progress:', error);
      }
    }
  }
  
  saveProgress() {
    const progressObj = Object.fromEntries(this.progress);
    localStorage.setItem('moduleProgress', JSON.stringify(progressObj));
    
    // Background sync if offline
    if (this.isOffline && 'serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        return registration.sync.register('progress-sync');
      });
    }
  }
  
  updateModuleProgress(moduleId, progress) {
    this.progress.set(moduleId, {
      completed: progress.completed || 0,
      questionsAttempted: progress.questionsAttempted || 0,
      timeSpent: (this.progress.get(moduleId)?.timeSpent || 0) + (progress.timeSpent || 0),
      lastAccessed: Date.now()
    });
    
    this.saveProgress();
    this.updateProgressDisplay();
    this.updateModuleCard(moduleId);
  }
  
  updateProgressDisplay() {
    const totalModules = 7;
    const completedModules = Array.from(this.progress.values())
      .filter(p => p.completed >= 100).length;
    
    const overallProgress = Math.round((completedModules / totalModules) * 100);
    
    // Update circular progress
    const progressElement = document.querySelector('[data-progress]');
    if (progressElement) {
      this.updateCircularProgress(progressElement, overallProgress);
    }
    
    // Update stats
    this.updateElement('#completed-modules', `${completedModules}/${totalModules}`);
    this.updateElement('#questions-attempted', this.getTotalQuestionsAttempted());
    this.updateElement('#study-hours', this.getTotalStudyHours());
  }
  
  updateCircularProgress(element, progress) {
    const circle = element.querySelector('.progress-circle');
    const text = element.querySelector('.progress-text');
    
    if (circle && text) {
      const angle = (progress / 100) * 360;
      circle.style.background = `conic-gradient(var(--primary-color) ${angle}deg, var(--bg-secondary) ${angle}deg)`;
      text.textContent = `${progress}%`;
    }
  }
  
  updateModuleCard(moduleId) {
    const moduleCard = document.querySelector(`[data-module="${moduleId}"]`);
    if (moduleCard) {
      const progressData = this.progress.get(moduleId);
      if (progressData) {
        const progressFill = moduleCard.querySelector('.progress-fill');
        const progressText = moduleCard.querySelector('.progress-text');
        
        if (progressFill && progressText) {
          progressFill.style.width = `${progressData.completed}%`;
          progressText.textContent = `${Math.round(progressData.completed)}% Complete`;
        }
      }
    }
  }
  
  getTotalQuestionsAttempted() {
    let total = 0;
    this.progress.forEach(data => {
      total += data.questionsAttempted || 0;
    });
    return `${total}/500+`;
  }
  
  getTotalStudyHours() {
    let totalMinutes = 0;
    this.progress.forEach(data => {
      totalMinutes += data.timeSpent || 0;
    });
    const hours = Math.floor(totalMinutes / 60);
    return `${hours}h`;
  }
  
  // Settings management
  loadSettings() {
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
      try {
        const settingsData = JSON.parse(savedSettings);
        this.settings = new Map(Object.entries(settingsData));
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    }
  }
  
  saveSettings() {
    const settingsObj = Object.fromEntries(this.settings);
    localStorage.setItem('appSettings', JSON.stringify(settingsObj));
  }
  
  // Utility functions
  updateElement(selector, content) {
    const element = document.querySelector(selector);
    if (element) {
      element.textContent = content;
    }
  }
  
  updateLastAccess() {
    const lastUpdated = document.getElementById('last-updated');
    if (lastUpdated) {
      lastUpdated.textContent = new Date().toLocaleDateString();
    }
  }
  
  // Notification system
  showNotification(message, type = 'info', duration = 3000) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Style the notification
    Object.assign(notification.style, {
      position: 'fixed',
      top: '20px',
      right: '20px',
      padding: 'var(--spacing-md)',
      borderRadius: 'var(--border-radius-md)',
      color: 'white',
      fontWeight: '600',
      zIndex: '10000',
      opacity: '0',
      transform: 'translateX(100%)',
      transition: 'all 0.3s ease-in-out'
    });
    
    // Set background color based on type
    const colors = {
      success: 'var(--success-color)',
      error: 'var(--danger-color)',
      warning: 'var(--warning-color)',
      info: 'var(--info-color)'
    };
    notification.style.backgroundColor = colors[type] || colors.info;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
      notification.style.opacity = '1';
      notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove notification
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, duration);
  }
  
  showUpdateAvailable() {
    const updateBanner = document.createElement('div');
    updateBanner.innerHTML = `
      <div style="background: var(--primary-color); color: white; padding: var(--spacing-md); text-align: center; position: fixed; top: 0; left: 0; right: 0; z-index: 10001;">
        <span>A new version is available!</span>
        <button onclick="window.location.reload()" style="margin-left: var(--spacing-md); padding: var(--spacing-xs) var(--spacing-md); background: white; color: var(--primary-color); border: none; border-radius: var(--border-radius-sm); font-weight: 600; cursor: pointer;">
          Update Now
        </button>
      </div>
    `;
    document.body.appendChild(updateBanner);
  }
  
  // Scroll handling
  handleScroll() {
    const header = document.querySelector('.main-header');
    if (header) {
      if (window.scrollY > 100) {
        header.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
        header.style.backdropFilter = 'blur(10px)';
      } else {
        header.style.backgroundColor = 'var(--bg-primary)';
        header.style.backdropFilter = 'none';
      }
    }
  }
  
  // Keyboard navigation
  handleKeyNavigation(event) {
    if (event.altKey && event.key >= '1' && event.key <= '7') {
      event.preventDefault();
      const moduleNumber = parseInt(event.key);
      const modules = ['digital-logic', 'electronic-devices', 'microcontroller', 'measurements', 'measuring-systems', 'transducers', 'display-tech'];
      if (modules[moduleNumber - 1]) {
        this.openModule(modules[moduleNumber - 1]);
      }
    }
    
    if (event.key === 'Escape') {
      this.closeModals();
    }
  }
  
  closeModals() {
    const modals = document.querySelectorAll('.modal, .overlay');
    modals.forEach(modal => {
      modal.style.display = 'none';
    });
  }
  
  // Data synchronization
  async syncOfflineData() {
    if (!this.isOffline && 'serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        await registration.sync.register('progress-sync');
        await registration.sync.register('bookmarks-sync');
        console.log('Background sync registered');
      } catch (error) {
        console.error('Background sync failed:', error);
      }
    }
  }
}

// Module management functions with GitHub Pages support
function openModule(moduleId) {
  const startTime = Date.now();
  app.currentModule = moduleId;
  
  // Track module access
  app.updateModuleProgress(moduleId, {
    timeSpent: 0,
    lastAccessed: Date.now()
  });
  
  // Navigate to module with proper base path
  const basePath = window.githubPagesRouter ? window.githubPagesRouter.basePath : '';
  const modulePath = basePath ? `${basePath}/modules/${moduleId}/index.html` : `./modules/${moduleId}/index.html`;
  window.location.href = modulePath;
}

function showModulePreview(moduleId) {
  const moduleData = getModuleData(moduleId);
  showModal('Module Preview', `
    <div class="module-preview">
      <h3>${moduleData.title}</h3>
      <p>${moduleData.description}</p>
      <div class="preview-stats">
        <div class="stat">
          <strong>Topics:</strong> ${moduleData.topics}
        </div>
        <div class="stat">
          <strong>Duration:</strong> ${moduleData.duration}
        </div>
        <div class="stat">
          <strong>Difficulty:</strong> ${moduleData.difficulty}
        </div>
      </div>
      <div class="preview-actions">
        <button class="btn-primary" onclick="openModule('${moduleId}')">Start Module</button>
        <button class="btn-secondary" onclick="closeModal()">Close</button>
      </div>
    </div>
  `);
}

function getModuleData(moduleId) {
  const modules = {
    'digital-logic': {
      title: 'Digital Logic Gates',
      description: 'Master boolean algebra, truth tables, and logic gate operations.',
      topics: 12,
      duration: '6-8 hours',
      difficulty: 'Beginner'
    },
    'electronic-devices': {
      title: 'Electronic Devices & Circuits',
      description: 'Explore semiconductors, amplifiers, and circuit analysis.',
      topics: 15,
      duration: '8-10 hours',
      difficulty: 'Intermediate'
    },
    'microcontroller': {
      title: 'Microcontroller & Microprocessor',
      description: 'Learn 8085/8086 instruction sets and 8051 programming.',
      topics: 14,
      duration: '7-9 hours',
      difficulty: 'Advanced'
    },
    'measurements': {
      title: 'Electronic Measurements',
      description: 'Master measurement instruments and analysis techniques.',
      topics: 11,
      duration: '6-8 hours',
      difficulty: 'Intermediate'
    },
    'measuring-systems': {
      title: 'Measuring Systems',
      description: 'Understand standards, calibration, and statistical analysis.',
      topics: 9,
      duration: '5-7 hours',
      difficulty: 'Intermediate'
    },
    'transducers': {
      title: 'Transducers & Sensors',
      description: 'Explore sensors and signal conditioning techniques.',
      topics: 10,
      duration: '6-8 hours',
      difficulty: 'Intermediate'
    },
    'display-tech': {
      title: 'Display Technologies',
      description: 'Master LCD, LED displays and interfacing circuits.',
      topics: 8,
      duration: '4-6 hours',
      difficulty: 'Beginner'
    }
  };
  
  return modules[moduleId] || {};
}

// Tool functions with GitHub Pages support
function openTool(toolId) {
  const basePath = window.githubPagesRouter ? window.githubPagesRouter.basePath : '';
  const toolPath = basePath ? `${basePath}/tools/${toolId}/index.html` : `./tools/${toolId}/index.html`;
  window.location.href = toolPath;
}

function openExamSimulator() {
  const basePath = window.githubPagesRouter ? window.githubPagesRouter.basePath : '';
  const examPath = basePath ? `${basePath}/tools/exam-simulator/index.html` : './tools/exam-simulator/index.html';
  window.location.href = examPath;
}

// Navigation functions
function scrollToModules() {
  const modulesSection = document.getElementById('modules');
  if (modulesSection) {
    modulesSection.scrollIntoView({ behavior: 'smooth' });
  }
}

// Quick access functions
function openFormulas() {
  showModal('Formula Reference', `
    <div class="formula-reference">
      <h3>Essential Formulas</h3>
      <div class="formula-category">
        <h4>Ohm's Law</h4>
        <div class="formula">V = I × R</div>
        <div class="formula">P = V × I</div>
      </div>
      <div class="formula-category">
        <h4>AC Circuits</h4>
        <div class="formula">X<sub>L</sub> = 2πfL</div>
        <div class="formula">X<sub>C</sub> = 1/(2πfC)</div>
      </div>
      <div class="formula-category">
        <h4>Digital Logic</h4>
        <div class="formula">AND: Y = A · B</div>
        <div class="formula">OR: Y = A + B</div>
        <div class="formula">NOT: Y = Ā</div>
      </div>
    </div>
  `);
}

function openBookmarks() {
  const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
  const bookmarksList = bookmarks.length > 0 
    ? bookmarks.map(b => `<div class="bookmark-item">${b.title}</div>`).join('')
    : '<p>No bookmarks saved yet.</p>';
    
  showModal('Bookmarks', `
    <div class="bookmarks-container">
      <h3>Saved Bookmarks</h3>
      ${bookmarksList}
    </div>
  `);
}

function openNotes() {
  const notes = localStorage.getItem('userNotes') || '';
  showModal('Personal Notes', `
    <div class="notes-container">
      <h3>Your Study Notes</h3>
      <textarea id="user-notes" placeholder="Write your notes here..." style="width: 100%; height: 200px; padding: var(--spacing-md); border: 1px solid #ddd; border-radius: var(--border-radius-md);">${notes}</textarea>
      <div style="margin-top: var(--spacing-md);">
        <button class="btn-primary" onclick="saveNotes()">Save Notes</button>
        <button class="btn-secondary" onclick="closeModal()">Close</button>
      </div>
    </div>
  `);
}

function saveNotes() {
  const notes = document.getElementById('user-notes').value;
  localStorage.setItem('userNotes', notes);
  app.showNotification('Notes saved successfully!', 'success');
  closeModal();
}

function openCalculator() {
  showModal('Electronics Calculator', `
    <div class="calculator-container">
      <h3>Electronics Calculator</h3>
      <div class="calc-section">
        <h4>Ohm's Law Calculator</h4>
        <div class="calc-inputs">
          <label>Voltage (V):</label>
          <input type="number" id="calc-voltage" placeholder="Enter voltage">
          <label>Current (A):</label>
          <input type="number" id="calc-current" placeholder="Enter current">
          <label>Resistance (Ω):</label>
          <input type="number" id="calc-resistance" placeholder="Enter resistance">
        </div>
        <button class="btn-primary" onclick="calculateOhmsLaw()">Calculate</button>
        <div id="calc-result" class="calc-result"></div>
      </div>
    </div>
  `);
}

function calculateOhmsLaw() {
  const voltage = parseFloat(document.getElementById('calc-voltage').value);
  const current = parseFloat(document.getElementById('calc-current').value);
  const resistance = parseFloat(document.getElementById('calc-resistance').value);
  const result = document.getElementById('calc-result');
  
  let calculation = '';
  
  if (voltage && current && !resistance) {
    const r = voltage / current;
    calculation = `Resistance = ${r.toFixed(2)} Ω`;
  } else if (voltage && resistance && !current) {
    const i = voltage / resistance;
    calculation = `Current = ${i.toFixed(2)} A`;
  } else if (current && resistance && !voltage) {
    const v = current * resistance;
    calculation = `Voltage = ${v.toFixed(2)} V`;
  } else {
    calculation = 'Please enter exactly two values to calculate the third.';
  }
  
  result.innerHTML = `<div class="formula-box">${calculation}</div>`;
}

// Modal functions
function showModal(title, content) {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h2>${title}</h2>
        <button class="modal-close" onclick="closeModal()">&times;</button>
      </div>
      <div class="modal-body">
        ${content}
      </div>
    </div>
  `;
  
  // Add modal styles
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
  `;
  
  const modalContent = modal.querySelector('.modal-content');
  modalContent.style.cssText = `
    background: var(--bg-primary);
    border-radius: var(--border-radius-xl);
    padding: var(--spacing-xl);
    max-width: 600px;
    max-height: 80vh;
    overflow-y: auto;
    position: relative;
    margin: var(--spacing-lg);
  `;
  
  const modalClose = modal.querySelector('.modal-close');
  modalClose.style.cssText = `
    position: absolute;
    top: var(--spacing-md);
    right: var(--spacing-md);
    background: none;
    border: none;
    font-size: var(--font-size-2xl);
    cursor: pointer;
    color: var(--text-secondary);
  `;
  
  document.body.appendChild(modal);
  
  // Close on outside click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });
}

function closeModal() {
  const modal = document.querySelector('.modal-overlay');
  if (modal) {
    modal.remove();
  }
}

// Initialize application
let app;
document.addEventListener('DOMContentLoaded', () => {
  app = new AppState();
  
  // Add recent activity
  app.updateElement('#recent-activity', `
    <div class="activity-item">
      <span class="activity-icon">🎯</span>
      <span class="activity-text">Platform initialized successfully</span>
      <span class="activity-time">Now</span>
    </div>
  `);
  
  console.log('RRB Electronics Learning Platform initialized');
});

// Export for global access
window.RRBElectronics = {
  app: () => app,
  openModule,
  showModulePreview,
  openTool,
  openExamSimulator,
  scrollToModules,
  openFormulas,
  openBookmarks,
  openNotes,
  openCalculator
};