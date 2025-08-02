/**
 * Electronic Devices & Circuits Module
 * Interactive learning platform for RRB Electronics preparation
 * 
 * @author RRB Electronics Team
 * @version 1.0.0
 */

class ElectronicDevicesModule {
    constructor() {
        this.progress = new Map();
        this.concepts = [];
        this.exercises = [];
        this.currentExercise = null;
        this.exerciseStats = {
            attempted: 0,
            correct: 0,
            total: 0
        };
        
        this.init();
    }
    
    /**
     * Initialize the module
     */
    async init() {
        try {
            await this.loadContent();
            this.setupInteractivity();
            this.initializeProgress();
            this.setupAccessibility();
            console.log('Electronic Devices Module initialized successfully');
        } catch (error) {
            console.error('Failed to initialize Electronic Devices Module:', error);
            this.handleError(error);
        }
    }
    
    /**
     * Load module content from JSON files
     */
    async loadContent() {
        try {
            const [conceptsResponse, exercisesResponse] = await Promise.all([
                fetch('./data/concepts.json'),
                fetch('./data/exercises.json')
            ]);
            
            if (!conceptsResponse.ok || !exercisesResponse.ok) {
                throw new Error('Failed to load content files');
            }
            
            this.concepts = await conceptsResponse.json();
            this.exercises = await exercisesResponse.json();
            
            this.renderConcepts();
            this.renderExercises();
            
        } catch (error) {
            console.error('Error loading content:', error);
            this.showContentError();
        }
    }
    
    /**
     * Render concept content
     */
    renderConcepts() {
        const conceptElements = document.querySelectorAll('[data-concept]');
        
        conceptElements.forEach(element => {
            const conceptId = element.getAttribute('data-concept');
            const concept = this.findConcept(conceptId);
            
            if (concept) {
                element.innerHTML = this.generateConceptHTML(concept);
                this.addConceptInteractivity(element, concept);
            } else {
                element.innerHTML = '<p class="error-message">Concept not found</p>';
            }
        });
    }
    
    /**
     * Find concept by ID
     */
    findConcept(conceptId) {
        for (const section of Object.values(this.concepts.sections || {})) {
            const concept = section.content?.find(c => c.id === conceptId);
            if (concept) return concept;
        }
        return null;
    }
    
    /**
     * Generate HTML for concept content
     */
    generateConceptHTML(concept) {
        let html = `<div class="concept-content-wrapper">`;
        
        if (concept.description) {
            html += `<p class="concept-description">${concept.description}</p>`;
        }
        
        if (concept.keyPoints && concept.keyPoints.length > 0) {
            html += `<div class="key-points">
                <h4>Key Points:</h4>
                <ul>
                    ${concept.keyPoints.map(point => `<li>${point}</li>`).join('')}
                </ul>
            </div>`;
        }
        
        if (concept.formula) {
            html += `<div class="formula-box">
                <h4>Formula:</h4>
                <div class="formula">${concept.formula}</div>
            </div>`;
        }
        
        if (concept.applications && concept.applications.length > 0) {
            html += `<div class="applications">
                <h4>Applications:</h4>
                <ul>
                    ${concept.applications.map(app => `<li>${app}</li>`).join('')}
                </ul>
            </div>`;
        }
        
        html += `<div class="concept-actions">
            <button class="btn btn-primary mark-complete" data-concept="${concept.id}">
                Mark as Complete
            </button>
        </div></div>`;
        
        return html;
    }
    
    /**
     * Add interactivity to concept elements
     */
    addConceptInteractivity(element, concept) {
        const completeBtn = element.querySelector('.mark-complete');
        if (completeBtn) {
            completeBtn.addEventListener('click', () => {
                this.markConceptComplete(concept.id);
                completeBtn.textContent = 'Completed ✓';
                completeBtn.disabled = true;
                completeBtn.classList.add('completed');
            });
            
            // Check if already completed
            if (this.progress.get(concept.id)) {
                completeBtn.textContent = 'Completed ✓';
                completeBtn.disabled = true;
                completeBtn.classList.add('completed');
            }
        }
    }
    
    /**
     * Render exercises
     */
    renderExercises() {
        const exercisesContainer = document.querySelector('[data-exercises-container]');
        if (!exercisesContainer) return;
        
        if (!this.exercises.exercises || this.exercises.exercises.length === 0) {
            exercisesContainer.innerHTML = '<p class="no-exercises">No exercises available yet.</p>';
            return;
        }
        
        this.exerciseStats.total = this.exercises.exercises.length;
        
        const exercisesHTML = this.exercises.exercises.map(exercise => 
            this.generateExerciseHTML(exercise)
        ).join('');
        
        exercisesContainer.innerHTML = exercisesHTML;
        this.addExerciseInteractivity();
    }
    
    /**
     * Generate HTML for exercise
     */
    generateExerciseHTML(exercise) {
        return `
            <div class="exercise-card" data-exercise="${exercise.id}" data-category="${exercise.category}">
                <div class="exercise-header">
                    <h4 class="exercise-title">${exercise.question}</h4>
                    <span class="exercise-category">${exercise.category}</span>
                </div>
                <div class="exercise-options">
                    ${exercise.options.map((option, index) => `
                        <label class="option-label">
                            <input type="radio" name="exercise-${exercise.id}" value="${index}" />
                            <span class="option-text">${option}</span>
                        </label>
                    `).join('')}
                </div>
                <div class="exercise-actions">
                    <button class="btn btn-primary submit-answer" data-exercise="${exercise.id}">
                        Submit Answer
                    </button>
                </div>
                <div class="exercise-result" style="display: none;"></div>
            </div>
        `;
    }
    
    /**
     * Add interactivity to exercises
     */
    addExerciseInteractivity() {
        // Submit answer buttons
        document.querySelectorAll('.submit-answer').forEach(button => {
            button.addEventListener('click', (e) => {
                const exerciseId = e.target.getAttribute('data-exercise');
                this.submitAnswer(exerciseId);
            });
        });
        
        // Exercise filters
        document.querySelectorAll('.filter-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const filter = e.target.getAttribute('data-filter');
                this.filterExercises(filter);
                
                // Update active filter
                document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
            });
        });
    }
    
    /**
     * Submit exercise answer
     */
    submitAnswer(exerciseId) {
        const exercise = this.exercises.exercises.find(ex => ex.id === exerciseId);
        if (!exercise) return;
        
        const exerciseCard = document.querySelector(`[data-exercise="${exerciseId}"]`);
        const selectedOption = exerciseCard.querySelector('input[type="radio"]:checked');
        
        if (!selectedOption) {
            this.showNotification('Please select an answer', 'warning');
            return;
        }
        
        const selectedIndex = parseInt(selectedOption.value);
        const isCorrect = selectedIndex === exercise.correctAnswer;
        
        this.exerciseStats.attempted++;
        if (isCorrect) {
            this.exerciseStats.correct++;
        }
        
        this.showExerciseResult(exerciseCard, exercise, selectedIndex, isCorrect);
        this.updateExerciseStats();
        this.updateProgress();
    }
    
    /**
     * Show exercise result
     */
    showExerciseResult(exerciseCard, exercise, selectedIndex, isCorrect) {
        const resultElement = exerciseCard.querySelector('.exercise-result');
        const submitButton = exerciseCard.querySelector('.submit-answer');
        
        resultElement.innerHTML = `
            <div class="result-content ${isCorrect ? 'correct' : 'incorrect'}">
                <div class="result-header">
                    <span class="result-icon">${isCorrect ? '✓' : '✗'}</span>
                    <span class="result-text">${isCorrect ? 'Correct!' : 'Incorrect'}</span>
                </div>
                ${exercise.explanation ? `<p class="explanation">${exercise.explanation}</p>` : ''}
                ${!isCorrect ? `<p class="correct-answer">Correct answer: ${exercise.options[exercise.correctAnswer]}</p>` : ''}
            </div>
        `;
        
        resultElement.style.display = 'block';
        submitButton.disabled = true;
        submitButton.textContent = isCorrect ? 'Correct ✓' : 'Incorrect ✗';
        
        // Disable all radio buttons
        exerciseCard.querySelectorAll('input[type="radio"]').forEach(radio => {
            radio.disabled = true;
        });
    }
    
    /**
     * Filter exercises by category
     */
    filterExercises(filter) {
        const exerciseCards = document.querySelectorAll('.exercise-card');
        
        exerciseCards.forEach(card => {
            const category = card.getAttribute('data-category');
            if (filter === 'all' || category === filter) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }
    
    /**
     * Update exercise statistics
     */
    updateExerciseStats() {
        const accuracy = this.exerciseStats.attempted > 0 
            ? Math.round((this.exerciseStats.correct / this.exerciseStats.attempted) * 100)
            : 0;
        
        document.querySelector('[data-stat="attempted"]').textContent = this.exerciseStats.attempted;
        document.querySelector('[data-stat="correct"]').textContent = this.exerciseStats.correct;
        document.querySelector('[data-stat="accuracy"]').textContent = `${accuracy}%`;
        
        // Show summary if exercises attempted
        if (this.exerciseStats.attempted > 0) {
            document.querySelector('.exercise-summary').style.display = 'block';
        }
    }
    
    /**
     * Setup interactive demos
     */
    setupInteractivity() {
        // Demo launch buttons
        document.querySelectorAll('[data-demo]').forEach(demoElement => {
            const button = demoElement.querySelector('.btn');
            if (button) {
                button.addEventListener('click', () => {
                    const demoType = demoElement.getAttribute('data-demo');
                    this.launchDemo(demoType);
                });
            }
        });
        
        // Smooth scrolling for navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
    }
    
    /**
     * Launch interactive demo
     */
    launchDemo(demoType) {
        // Placeholder for demo implementations
        switch (demoType) {
            case 'diode-iv':
                this.showNotification('IV Curve demo will be implemented soon!', 'info');
                break;
            case 'bjt-config':
                this.showNotification('BJT Configuration demo will be implemented soon!', 'info');
                break;
            case 'opamp-sim':
                this.showNotification('Op-Amp Simulator will be implemented soon!', 'info');
                break;
            default:
                this.showNotification('Demo not available', 'warning');
        }
    }
    
    /**
     * Initialize progress tracking
     */
    initializeProgress() {
        // Load saved progress
        const savedProgress = localStorage.getItem('electronic-devices-progress');
        if (savedProgress) {
            try {
                const progressData = JSON.parse(savedProgress);
                this.progress = new Map(progressData.concepts || []);
                this.exerciseStats = { ...this.exerciseStats, ...progressData.exercises };
            } catch (error) {
                console.error('Error loading saved progress:', error);
            }
        }
        
        this.updateProgress();
    }
    
    /**
     * Mark concept as complete
     */
    markConceptComplete(conceptId) {
        this.progress.set(conceptId, {
            completed: true,
            timestamp: new Date().toISOString()
        });
        
        this.saveProgress();
        this.updateProgress();
        this.showNotification('Concept marked as complete!', 'success');
    }
    
    /**
     * Update progress display
     */
    updateProgress() {
        const totalConcepts = this.getTotalConcepts();
        const completedConcepts = this.progress.size;
        const progressPercentage = totalConcepts > 0 ? Math.round((completedConcepts / totalConcepts) * 100) : 0;
        
        // Update progress bar
        const progressFill = document.querySelector('.progress-fill');
        const progressText = document.querySelector('.progress-text');
        
        if (progressFill && progressText) {
            progressFill.style.width = `${progressPercentage}%`;
            progressText.textContent = `${progressPercentage}%`;
        }
        
        // Update page title with progress
        document.title = `Electronic Devices & Circuits (${progressPercentage}%) - RRB Electronics`;
    }
    
    /**
     * Get total number of concepts
     */
    getTotalConcepts() {
        let total = 0;
        for (const section of Object.values(this.concepts.sections || {})) {
            total += section.content?.length || 0;
        }
        return total;
    }
    
    /**
     * Save progress to localStorage
     */
    saveProgress() {
        const progressData = {
            concepts: Array.from(this.progress.entries()),
            exercises: this.exerciseStats,
            lastAccessed: new Date().toISOString()
        };
        
        localStorage.setItem('electronic-devices-progress', JSON.stringify(progressData));
    }
    
    /**
     * Setup accessibility features
     */
    setupAccessibility() {
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            // Alt + N for navigation
            if (e.altKey && e.key === 'n') {
                const firstNavLink = document.querySelector('.nav-link');
                if (firstNavLink) firstNavLink.focus();
            }
            
            // Alt + E for exercises
            if (e.altKey && e.key === 'e') {
                const exercisesSection = document.getElementById('exercises');
                if (exercisesSection) exercisesSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
        
        // Focus management for modals and interactive elements
        this.setupFocusManagement();
        
        // Screen reader announcements
        this.setupScreenReaderSupport();
    }
    
    /**
     * Setup focus management
     */
    setupFocusManagement() {
        // Trap focus in modal dialogs
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                // Implementation for focus trapping would go here
            }
        });
    }
    
    /**
     * Setup screen reader support
     */
    setupScreenReaderSupport() {
        // Add aria-live region for announcements
        const announcer = document.createElement('div');
        announcer.setAttribute('aria-live', 'polite');
        announcer.setAttribute('aria-atomic', 'true');
        announcer.className = 'sr-only';
        announcer.style.cssText = 'position: absolute; left: -10000px; width: 1px; height: 1px; overflow: hidden;';
        document.body.appendChild(announcer);
        
        this.announcer = announcer;
    }
    
    /**
     * Announce message to screen readers
     */
    announce(message) {
        if (this.announcer) {
            this.announcer.textContent = message;
        }
    }
    
    /**
     * Show notification
     */
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span class="notification-message">${message}</span>
            <button class="notification-close" aria-label="Close notification">&times;</button>
        `;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);
        
        // Close button functionality
        notification.querySelector('.notification-close').addEventListener('click', () => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        });
        
        // Announce to screen readers
        this.announce(message);
    }
    
    /**
     * Handle content loading errors
     */
    showContentError() {
        const placeholders = document.querySelectorAll('.loading-placeholder');
        placeholders.forEach(placeholder => {
            placeholder.innerHTML = `
                <div class="error-content">
                    <p class="error-message">Failed to load content</p>
                    <button class="btn btn-primary retry-btn">Retry</button>
                </div>
            `;
            
            const retryBtn = placeholder.querySelector('.retry-btn');
            if (retryBtn) {
                retryBtn.addEventListener('click', () => {
                    placeholder.innerHTML = 'Loading content...';
                    this.loadContent();
                });
            }
        });
    }
    
    /**
     * Handle general errors
     */
    handleError(error) {
        console.error('Module Error:', error);
        this.showNotification('An error occurred. Please refresh the page.', 'error');
    }
}

// Initialize module when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Check if module container exists
    if (document.querySelector('.module-container')) {
        window.electronicDevicesModule = new ElectronicDevicesModule();
    }
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ElectronicDevicesModule;
}