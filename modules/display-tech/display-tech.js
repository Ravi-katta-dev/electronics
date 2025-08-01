// Display Technology Module JavaScript

class DisplayTechModule {
  constructor() {
    this.currentQuestionIndex = 0;
    this.questions = [];
    this.userAnswers = [];
    this.startTime = Date.now();
    this.practiceTimer = null;
    this.currentPracticeSet = null;
    this.multiplexInterval = null;
    this.lcdCursorRow = 0;
    this.lcdCursorCol = 0;
    this.lcdCursorVisible = false;
    this.conceptsData = null;
    this.exercisesData = null;
    
    this.sectionProgress = {
      basics: false,
      ledDisplays: false,
      lcdTechnology: false,
      driverCircuits: false,
      interfaceProtocols: false,
      simulators: false,
      practice: false
    };
    
    this.sevenSegmentPatterns = {
      0: ['a', 'b', 'c', 'd', 'e', 'f'],
      1: ['b', 'c'],
      2: ['a', 'b', 'g', 'e', 'd'],
      3: ['a', 'b', 'g', 'c', 'd'],
      4: ['f', 'g', 'b', 'c'],
      5: ['a', 'f', 'g', 'c', 'd'],
      6: ['a', 'f', 'g', 'e', 'd', 'c'],
      7: ['a', 'b', 'c'],
      8: ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
      9: ['a', 'b', 'c', 'd', 'f', 'g']
    };
    
    this.init();
  }
  
  async init() {
    try {
      await this.loadData();
      this.setupEventListeners();
      this.initSectionNavigation();
      this.startProgressTracking();
      this.calculateResistor(); // Initialize calculator
      this.updateBCDDecoder(); // Initialize BCD decoder
      console.log('Display Technology Module initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Display Technology Module:', error);
      this.showError('Failed to load module data. Please refresh the page.');
    }
  }
  
  async loadData() {
    try {
      const [conceptsResponse, exercisesResponse] = await Promise.all([
        fetch('./data/concepts.json'),
        fetch('./data/exercises.json')
      ]);
      
      if (!conceptsResponse.ok || !exercisesResponse.ok) {
        throw new Error('Failed to fetch data files');
      }
      
      this.conceptsData = await conceptsResponse.json();
      this.exercisesData = await exercisesResponse.json();
      
      console.log('Data loaded successfully');
    } catch (error) {
      console.error('Error loading data:', error);
      // Fallback error handling
      this.showError('Unable to load module content. Please check your connection and try again.');
    }
  }
  
  setupEventListeners() {
    // Navigation listeners
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = e.target.getAttribute('href').substring(1);
        this.scrollToSection(target);
        this.updateNavigation(target);
      });
    });
    
    // Intersection Observer for section tracking
    const sections = document.querySelectorAll('.module-section');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.id;
          this.updateNavigation(sectionId);
          this.markSectionViewed(sectionId);
        }
      });
    }, { threshold: 0.5 });
    
    sections.forEach(section => observer.observe(section));
    
    // Initialize calculators and simulators
    this.initializeCalculators();
    this.initializeLCDSimulator();
  }
  
  initializeCalculators() {
    // Calculator input listeners
    ['supply-voltage', 'led-voltage', 'led-current'].forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        element.addEventListener('input', () => this.calculateResistor());
      }
    });
  }
  
  initializeLCDSimulator() {
    // Initialize LCD with welcome message
    setTimeout(() => {
      this.displayLCDText('Display Tech', 0, 0);
      this.displayLCDText('RRB Module 7', 1, 0);
    }, 1000);
  }
  
  // Progress tracking
  startProgressTracking() {
    setInterval(() => {
      const timeSpent = Math.floor((Date.now() - this.startTime) / 60000);
      if (window.app) {
        window.app.updateModuleProgress('display-tech', {
          timeSpent: timeSpent,
          sectionsCompleted: this.getSectionProgress()
        });
      }
    }, 60000);
  }
  
  updateProgress() {
    const completedSections = Object.values(this.sectionProgress).filter(Boolean).length;
    const totalSections = Object.keys(this.sectionProgress).length;
    const progress = Math.round((completedSections / totalSections) * 100);
    
    // Update progress bars
    const progressElements = document.querySelectorAll('.progress-fill');
    progressElements.forEach(el => {
      el.style.width = `${progress}%`;
    });
    
    const progressTexts = document.querySelectorAll('.progress-text, #footer-progress');
    progressTexts.forEach(el => {
      el.textContent = `${progress}%`;
    });
    
    // Show complete button if all sections done
    if (progress === 100) {
      const completeBtn = document.getElementById('complete-btn');
      if (completeBtn) {
        completeBtn.style.display = 'inline-block';
      }
    }
  }
  
  markSectionViewed(sectionId) {
    const sectionMap = {
      'basics': 'basics',
      'led-displays': 'ledDisplays',
      'lcd-technology': 'lcdTechnology',
      'driver-circuits': 'driverCircuits',
      'interface-protocols': 'interfaceProtocols',
      'simulators': 'simulators',
      'practice': 'practice'
    };
    
    const progressKey = sectionMap[sectionId];
    if (progressKey && !this.sectionProgress[progressKey]) {
      this.sectionProgress[progressKey] = true;
      this.updateProgress();
    }
  }
  
  // Seven Segment Display Functions
  displayDigit(digit) {
    if (digit < 0 || digit > 9) return;
    
    const display = document.getElementById('demo-display');
    if (!display) return;
    
    // Clear all segments
    this.clearDisplaySegments(display);
    
    // Activate segments for the digit
    const segments = this.sevenSegmentPatterns[digit];
    segments.forEach(seg => {
      const segment = display.querySelector(`[data-segment="${seg}"]`);
      if (segment) {
        segment.classList.add('active');
      }
    });
  }
  
  clearDisplay() {
    const display = document.getElementById('demo-display');
    if (display) {
      this.clearDisplaySegments(display);
    }
  }
  
  clearDisplaySegments(display) {
    const segments = display.querySelectorAll('.segment');
    segments.forEach(seg => seg.classList.remove('active'));
  }
  
  // BCD to 7-Segment Decoder
  updateBCDDecoder() {
    const d = parseInt(document.getElementById('bcd-d')?.value || '0');
    const c = parseInt(document.getElementById('bcd-c')?.value || '0');
    const b = parseInt(document.getElementById('bcd-b')?.value || '0');
    const a = parseInt(document.getElementById('bcd-a')?.value || '0');
    
    const decimal = d * 8 + c * 4 + b * 2 + a * 1;
    
    // Update decimal display
    const decimalEl = document.getElementById('bcd-decimal');
    if (decimalEl) {
      decimalEl.textContent = decimal;
    }
    
    // Update 7-segment display
    const bcdDisplay = document.getElementById('bcd-display');
    if (bcdDisplay && decimal <= 9) {
      this.clearDisplaySegments(bcdDisplay);
      const segments = this.sevenSegmentPatterns[decimal];
      segments.forEach(seg => {
        const segment = bcdDisplay.querySelector(`[data-segment="${seg}"]`);
        if (segment) {
          segment.classList.add('active');
        }
      });
      
      // Update active segments text
      const activeSegmentsEl = document.getElementById('active-segments');
      if (activeSegmentsEl) {
        activeSegmentsEl.textContent = segments.join('');
      }
    }
  }
  
  // Multi-digit Display Simulator
  updateMultiDigitDisplay() {
    const value = document.getElementById('display-value')?.value || '0';
    const digits = value.toString().padStart(4, '0').slice(-4);
    
    for (let i = 0; i < 4; i++) {
      const digit = parseInt(digits[i]);
      const display = document.getElementById(`sim-digit-${i}`);
      if (display) {
        this.clearDisplaySegments(display);
        const segments = this.sevenSegmentPatterns[digit];
        segments.forEach(seg => {
          const segment = display.querySelector(`[data-segment="${seg}"]`);
          if (segment) {
            segment.classList.add('active');
          }
        });
      }
    }
  }
  
  toggleCommonType() {
    const commonType = document.getElementById('common-type')?.value;
    // This would normally change the display appearance for common anode vs cathode
    // For simulation purposes, we'll just show a visual indicator
    console.log(`Switched to ${commonType} configuration`);
  }
  
  startMultiplexDemo() {
    if (this.multiplexInterval) {
      clearInterval(this.multiplexInterval);
    }
    
    let currentDigit = 0;
    const displays = ['sim-digit-0', 'sim-digit-1', 'sim-digit-2', 'sim-digit-3'];
    
    this.multiplexInterval = setInterval(() => {
      // Turn off all displays
      displays.forEach(id => {
        const display = document.getElementById(id);
        if (display) {
          display.style.opacity = '0.3';
        }
      });
      
      // Turn on current display
      const currentDisplay = document.getElementById(displays[currentDigit]);
      if (currentDisplay) {
        currentDisplay.style.opacity = '1';
      }
      
      currentDigit = (currentDigit + 1) % 4;
    }, 250); // 4Hz refresh rate
  }
  
  stopMultiplexDemo() {
    if (this.multiplexInterval) {
      clearInterval(this.multiplexInterval);
      this.multiplexInterval = null;
    }
    
    // Restore all displays
    ['sim-digit-0', 'sim-digit-1', 'sim-digit-2', 'sim-digit-3'].forEach(id => {
      const display = document.getElementById(id);
      if (display) {
        display.style.opacity = '1';
      }
    });
  }
  
  // LCD Simulator Functions
  displayLCDText(text = null, row = null, col = null) {
    const textInput = document.getElementById('lcd-text');
    const displayText = text || textInput?.value || '';
    
    if (row !== null && col !== null) {
      this.lcdCursorRow = row;
      this.lcdCursorCol = col;
    }
    
    // Clear display first if starting at 0,0
    if (this.lcdCursorRow === 0 && this.lcdCursorCol === 0) {
      this.lcdCommand('clear');
    }
    
    // Display each character
    for (let i = 0; i < displayText.length; i++) {
      if (this.lcdCursorCol >= 16) {
        this.lcdCursorRow = (this.lcdCursorRow + 1) % 2;
        this.lcdCursorCol = 0;
      }
      
      if (this.lcdCursorRow < 2) {
        const char = document.querySelector(`#lcd-row-${this.lcdCursorRow} [data-pos="${this.lcdCursorCol}"]`);
        if (char) {
          char.textContent = displayText[i];
        }
        this.lcdCursorCol++;
      }
    }
    
    this.updateLCDCursor();
    if (textInput) {
      textInput.value = '';
    }
  }
  
  lcdCommand(command) {
    switch (command) {
      case 'clear':
        document.querySelectorAll('.lcd-char').forEach(char => {
          char.textContent = ' ';
        });
        this.lcdCursorRow = 0;
        this.lcdCursorCol = 0;
        break;
        
      case 'home':
        this.lcdCursorRow = 0;
        this.lcdCursorCol = 0;
        break;
        
      case 'cursor-on':
        this.lcdCursorVisible = true;
        document.getElementById('lcd-cursor').style.display = 'block';
        break;
        
      case 'cursor-off':
        this.lcdCursorVisible = false;
        document.getElementById('lcd-cursor').style.display = 'none';
        break;
    }
    
    this.updateLCDCursor();
  }
  
  setCursorPosition() {
    const row = parseInt(document.getElementById('cursor-row')?.value || '0');
    const col = parseInt(document.getElementById('cursor-col')?.value || '0');
    
    this.lcdCursorRow = Math.min(row, 1);
    this.lcdCursorCol = Math.min(col, 15);
    this.updateLCDCursor();
  }
  
  updateLCDCursor() {
    const cursor = document.getElementById('lcd-cursor');
    if (cursor) {
      const leftPos = 24 + (this.lcdCursorCol * 22); // 24px padding + 22px per char
      const topPos = 24 + (this.lcdCursorRow * 32); // 24px padding + 32px per row
      
      cursor.style.left = `${leftPos}px`;
      cursor.style.top = `${topPos}px`;
    }
  }
  
  // Calculator Functions
  calculateResistor() {
    const supplyVoltage = parseFloat(document.getElementById('supply-voltage')?.value || '5');
    const ledVoltage = parseFloat(document.getElementById('led-voltage')?.value || '2.0');
    const ledCurrent = parseFloat(document.getElementById('led-current')?.value || '20');
    
    if (supplyVoltage <= ledVoltage) {
      this.updateCalculatorResults('Invalid', 'Invalid', 'Invalid');
      return;
    }
    
    const resistance = (supplyVoltage - ledVoltage) / (ledCurrent / 1000);
    const power = Math.pow(ledCurrent / 1000, 2) * resistance * 1000; // in mW
    const standardValue = this.findNearestStandardResistor(resistance);
    
    this.updateCalculatorResults(
      Math.round(resistance),
      Math.round(power),
      standardValue
    );
  }
  
  updateCalculatorResults(resistance, power, standardValue) {
    const resistanceEl = document.getElementById('resistance-value');
    const powerEl = document.getElementById('power-value');
    const standardEl = document.getElementById('standard-value');
    
    if (resistanceEl) resistanceEl.textContent = resistance;
    if (powerEl) powerEl.textContent = power;
    if (standardEl) standardEl.textContent = standardValue;
  }
  
  findNearestStandardResistor(value) {
    const standardValues = [
      10, 12, 15, 18, 22, 27, 33, 39, 47, 56, 68, 82,
      100, 120, 150, 180, 220, 270, 330, 390, 470, 560, 680, 820,
      1000, 1200, 1500, 1800, 2200, 2700, 3300, 3900, 4700, 5600, 6800, 8200
    ];
    
    let closest = standardValues[0];
    let minDiff = Math.abs(value - closest);
    
    for (const standard of standardValues) {
      const diff = Math.abs(value - standard);
      if (diff < minDiff) {
        minDiff = diff;
        closest = standard;
      }
    }
    
    return closest;
  }
  
  // Practice Functions
  async startPracticeSet(setId) {
    if (!this.exercisesData) {
      this.showError('Exercise data not loaded');
      return;
    }
    
    const practiceSet = this.exercisesData.practicesets.find(set => set.id === setId);
    if (!practiceSet) {
      this.showError('Practice set not found');
      return;
    }
    
    this.currentPracticeSet = practiceSet;
    this.questions = practiceSet.questions.map(qId => 
      this.exercisesData.exercises.find(ex => ex.id === qId)
    ).filter(q => q); // Remove any undefined questions
    
    this.currentQuestionIndex = 0;
    this.userAnswers = new Array(this.questions.length).fill(null);
    this.startTime = Date.now();
    
    // Hide practice selection and show question container
    document.querySelector('.practice-selection').style.display = 'none';
    document.getElementById('question-container').style.display = 'block';
    document.getElementById('practice-results').style.display = 'none';
    
    this.displayCurrentQuestion();
    this.startPracticeTimer(practiceSet.timeLimit);
  }
  
  displayCurrentQuestion() {
    if (!this.questions || this.currentQuestionIndex >= this.questions.length) return;
    
    const question = this.questions[this.currentQuestionIndex];
    const questionContent = document.getElementById('question-content');
    const questionNumber = document.getElementById('question-number');
    const currentScore = document.getElementById('current-score');
    
    if (questionNumber) {
      questionNumber.textContent = `Question ${this.currentQuestionIndex + 1} of ${this.questions.length}`;
    }
    
    if (currentScore) {
      const correctAnswers = this.userAnswers.filter((answer, index) => 
        answer !== null && this.questions[index] && answer === this.questions[index].correctAnswer
      ).length;
      currentScore.textContent = `Score: ${correctAnswers}/${this.currentQuestionIndex}`;
    }
    
    if (questionContent) {
      questionContent.innerHTML = this.renderQuestion(question);
    }
    
    // Update navigation buttons
    this.updateQuestionNavigation();
  }
  
  renderQuestion(question) {
    if (!question) return '<p>Question not found</p>';
    
    let html = `<div class="question">`;
    html += `<h4>${question.question}</h4>`;
    
    switch (question.type) {
      case 'multiple-choice':
        html += '<div class="options">';
        question.options.forEach((option, index) => {
          const isSelected = this.userAnswers[this.currentQuestionIndex] === index;
          html += `<label class="option ${isSelected ? 'selected' : ''}">
                     <input type="radio" name="answer" value="${index}" ${isSelected ? 'checked' : ''}>
                     <span class="option-text">${option}</span>
                   </label>`;
        });
        html += '</div>';
        break;
        
      case 'true-false':
        const selectedValue = this.userAnswers[this.currentQuestionIndex];
        html += '<div class="options">';
        html += `<label class="option ${selectedValue === true ? 'selected' : ''}">
                   <input type="radio" name="answer" value="true" ${selectedValue === true ? 'checked' : ''}>
                   <span class="option-text">True</span>
                 </label>`;
        html += `<label class="option ${selectedValue === false ? 'selected' : ''}">
                   <input type="radio" name="answer" value="false" ${selectedValue === false ? 'checked' : ''}>
                   <span class="option-text">False</span>
                 </label>`;
        html += '</div>';
        break;
        
      case 'calculation':
      case 'fill-in-the-blank':
        const currentAnswer = this.userAnswers[this.currentQuestionIndex] || '';
        html += `<div class="calculation-input">`;
        if (question.formula) {
          html += `<p><strong>Formula:</strong> ${question.formula}</p>`;
        }
        if (question.givens) {
          html += '<p><strong>Given:</strong></p><ul>';
          Object.entries(question.givens).forEach(([key, value]) => {
            html += `<li>${key} = ${value}</li>`;
          });
          html += '</ul>';
        }
        html += `<label for="calc-answer">Answer:</label>
                 <input type="number" id="calc-answer" value="${currentAnswer}" step="any">`;
        if (question.unit) {
          html += ` <span class="unit">${question.unit}</span>`;
        }
        html += '</div>';
        break;
    }
    
    html += '</div>';
    
    // Add event listeners after rendering
    setTimeout(() => {
      this.attachQuestionEventListeners(question);
    }, 100);
    
    return html;
  }
  
  attachQuestionEventListeners(question) {
    if (question.type === 'multiple-choice' || question.type === 'true-false') {
      document.querySelectorAll('input[name="answer"]').forEach(input => {
        input.addEventListener('change', (e) => {
          let value = e.target.value;
          if (question.type === 'multiple-choice') {
            value = parseInt(value);
          } else {
            value = value === 'true';
          }
          this.userAnswers[this.currentQuestionIndex] = value;
          
          // Update visual selection
          document.querySelectorAll('.option').forEach(opt => opt.classList.remove('selected'));
          e.target.closest('.option').classList.add('selected');
        });
      });
    } else if (question.type === 'calculation' || question.type === 'fill-in-the-blank') {
      const input = document.getElementById('calc-answer');
      if (input) {
        input.addEventListener('input', (e) => {
          this.userAnswers[this.currentQuestionIndex] = e.target.value;
        });
      }
    }
  }
  
  updateQuestionNavigation() {
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const submitBtn = document.getElementById('submit-btn');
    
    if (prevBtn) {
      prevBtn.disabled = this.currentQuestionIndex === 0;
    }
    
    if (nextBtn && submitBtn) {
      if (this.currentQuestionIndex === this.questions.length - 1) {
        nextBtn.style.display = 'none';
        submitBtn.style.display = 'inline-block';
      } else {
        nextBtn.style.display = 'inline-block';
        submitBtn.style.display = 'none';
      }
    }
  }
  
  previousQuestion() {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
      this.displayCurrentQuestion();
    }
  }
  
  nextQuestion() {
    if (this.currentQuestionIndex < this.questions.length - 1) {
      this.currentQuestionIndex++;
      this.displayCurrentQuestion();
    }
  }
  
  submitAnswer() {
    this.finishPractice();
  }
  
  startPracticeTimer(timeLimit) {
    let timeRemaining = timeLimit;
    const timerElement = document.getElementById('question-timer');
    
    this.practiceTimer = setInterval(() => {
      timeRemaining--;
      if (timerElement) {
        const minutes = Math.floor(timeRemaining / 60);
        const seconds = timeRemaining % 60;
        timerElement.textContent = `Time: ${minutes}:${seconds.toString().padStart(2, '0')}`;
      }
      
      if (timeRemaining <= 0) {
        this.finishPractice();
      }
    }, 1000);
  }
  
  finishPractice() {
    if (this.practiceTimer) {
      clearInterval(this.practiceTimer);
    }
    
    const results = this.calculateResults();
    this.displayResults(results);
    
    // Hide question container and show results
    document.getElementById('question-container').style.display = 'none';
    document.getElementById('practice-results').style.display = 'block';
  }
  
  calculateResults() {
    let correctAnswers = 0;
    const totalQuestions = this.questions.length;
    const timeSpent = Math.floor((Date.now() - this.startTime) / 1000);
    
    this.questions.forEach((question, index) => {
      const userAnswer = this.userAnswers[index];
      if (userAnswer !== null && this.isAnswerCorrect(question, userAnswer)) {
        correctAnswers++;
      }
    });
    
    const percentage = Math.round((correctAnswers / totalQuestions) * 100);
    
    return {
      correctAnswers,
      totalQuestions,
      percentage,
      timeSpent,
      passed: percentage >= (this.currentPracticeSet?.passingScore || 70)
    };
  }
  
  isAnswerCorrect(question, userAnswer) {
    switch (question.type) {
      case 'multiple-choice':
      case 'true-false':
        return userAnswer === question.correctAnswer;
        
      case 'calculation':
      case 'fill-in-the-blank':
        const numAnswer = parseFloat(userAnswer);
        const correct = parseFloat(question.correctAnswer);
        const tolerance = question.tolerance || 0;
        return Math.abs(numAnswer - correct) <= tolerance;
        
      default:
        return false;
    }
  }
  
  displayResults(results) {
    document.getElementById('correct-answers').textContent = results.correctAnswers;
    document.getElementById('total-questions').textContent = results.totalQuestions;
    document.getElementById('percentage-score').textContent = `${results.percentage}%`;
    document.getElementById('time-taken').textContent = `${results.timeSpent}s`;
    
    // Display detailed breakdown
    const breakdown = document.getElementById('results-breakdown');
    if (breakdown) {
      breakdown.innerHTML = this.generateResultsBreakdown(results);
    }
  }
  
  generateResultsBreakdown(results) {
    let html = '<h4>Detailed Results</h4>';
    
    this.questions.forEach((question, index) => {
      const userAnswer = this.userAnswers[index];
      const isCorrect = userAnswer !== null && this.isAnswerCorrect(question, userAnswer);
      
      html += `<div class="result-item ${isCorrect ? 'correct' : 'incorrect'}">`;
      html += `<div class="result-question">${index + 1}. ${question.question}</div>`;
      html += `<div class="result-answer">`;
      html += `<span class="user-answer">Your answer: ${this.formatUserAnswer(question, userAnswer)}</span>`;
      html += `<span class="correct-answer">Correct: ${this.formatCorrectAnswer(question)}</span>`;
      html += `</div>`;
      if (question.explanation) {
        html += `<div class="explanation">${question.explanation}</div>`;
      }
      html += '</div>';
    });
    
    return html;
  }
  
  formatUserAnswer(question, answer) {
    if (answer === null) return 'Not answered';
    
    switch (question.type) {
      case 'multiple-choice':
        return question.options[answer] || 'Invalid';
      case 'true-false':
        return answer ? 'True' : 'False';
      default:
        return answer.toString();
    }
  }
  
  formatCorrectAnswer(question) {
    switch (question.type) {
      case 'multiple-choice':
        return question.options[question.correctAnswer];
      case 'true-false':
        return question.correctAnswer ? 'True' : 'False';
      default:
        return question.correctAnswer + (question.unit ? ` ${question.unit}` : '');
    }
  }
  
  restartPractice() {
    if (this.currentPracticeSet) {
      this.startPracticeSet(this.currentPracticeSet.id);
    }
  }
  
  backToPracticeSets() {
    document.querySelector('.practice-selection').style.display = 'block';
    document.getElementById('question-container').style.display = 'none';
    document.getElementById('practice-results').style.display = 'none';
    
    if (this.practiceTimer) {
      clearInterval(this.practiceTimer);
    }
  }
  
  // Navigation Functions
  scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  }
  
  updateNavigation(activeSection) {
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.remove('active');
    });
    
    const activeLink = document.querySelector(`[href="#${activeSection}"]`);
    if (activeLink) {
      activeLink.classList.add('active');
    }
  }
  
  initSectionNavigation() {
    // Mark basics section as active initially
    this.updateNavigation('basics');
  }
  
  getSectionProgress() {
    return Object.values(this.sectionProgress).filter(Boolean).length;
  }
  
  // Module navigation
  goToHome() {
    window.location.href = '../../index.html';
  }
  
  previousModule() {
    window.location.href = '../transducers/index.html';
  }
  
  openExamSimulator() {
    window.location.href = '../../tools/exam-simulator/index.html';
  }
  
  openCircuitBuilder() {
    window.location.href = '../../tools/circuit-builder/index.html';
  }
  
  markModuleComplete() {
    // Mark all sections as complete
    Object.keys(this.sectionProgress).forEach(key => {
      this.sectionProgress[key] = true;
    });
    
    this.updateProgress();
    
    if (window.app) {
      window.app.updateModuleProgress('display-tech', {
        completed: true,
        completedAt: new Date().toISOString(),
        totalTimeSpent: Math.floor((Date.now() - this.startTime) / 60000)
      });
    }
    
    alert('🎉 Congratulations! You have completed the Display Technologies module!');
  }
  
  // Error handling
  showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: var(--danger-color);
      color: white;
      padding: 1rem;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      z-index: 1000;
      max-width: 300px;
    `;
    errorDiv.textContent = message;
    
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
      if (errorDiv.parentNode) {
        errorDiv.parentNode.removeChild(errorDiv);
      }
    }, 5000);
  }
}

// Global functions for HTML onclick handlers
window.displayDigit = function(digit) {
  if (window.displayTechModule) {
    window.displayTechModule.displayDigit(digit);
  }
};

window.clearDisplay = function() {
  if (window.displayTechModule) {
    window.displayTechModule.clearDisplay();
  }
};

window.updateBCDDecoder = function() {
  if (window.displayTechModule) {
    window.displayTechModule.updateBCDDecoder();
  }
};

window.updateMultiDigitDisplay = function() {
  if (window.displayTechModule) {
    window.displayTechModule.updateMultiDigitDisplay();
  }
};

window.toggleCommonType = function() {
  if (window.displayTechModule) {
    window.displayTechModule.toggleCommonType();
  }
};

window.startMultiplexDemo = function() {
  if (window.displayTechModule) {
    window.displayTechModule.startMultiplexDemo();
  }
};

window.stopMultiplexDemo = function() {
  if (window.displayTechModule) {
    window.displayTechModule.stopMultiplexDemo();
  }
};

window.displayLCDText = function() {
  if (window.displayTechModule) {
    window.displayTechModule.displayLCDText();
  }
};

window.lcdCommand = function(command) {
  if (window.displayTechModule) {
    window.displayTechModule.lcdCommand(command);
  }
};

window.setCursorPosition = function() {
  if (window.displayTechModule) {
    window.displayTechModule.setCursorPosition();
  }
};

window.calculateResistor = function() {
  if (window.displayTechModule) {
    window.displayTechModule.calculateResistor();
  }
};

window.startPracticeSet = function(setId) {
  if (window.displayTechModule) {
    window.displayTechModule.startPracticeSet(setId);
  }
};

window.previousQuestion = function() {
  if (window.displayTechModule) {
    window.displayTechModule.previousQuestion();
  }
};

window.nextQuestion = function() {
  if (window.displayTechModule) {
    window.displayTechModule.nextQuestion();
  }
};

window.submitAnswer = function() {
  if (window.displayTechModule) {
    window.displayTechModule.submitAnswer();
  }
};

window.restartPractice = function() {
  if (window.displayTechModule) {
    window.displayTechModule.restartPractice();
  }
};

window.backToPracticeSets = function() {
  if (window.displayTechModule) {
    window.displayTechModule.backToPracticeSets();
  }
};

window.goToHome = function() {
  if (window.displayTechModule) {
    window.displayTechModule.goToHome();
  }
};

window.previousModule = function() {
  if (window.displayTechModule) {
    window.displayTechModule.previousModule();
  }
};

window.openExamSimulator = function() {
  if (window.displayTechModule) {
    window.displayTechModule.openExamSimulator();
  }
};

window.openCircuitBuilder = function() {
  if (window.displayTechModule) {
    window.displayTechModule.openCircuitBuilder();
  }
};

window.markModuleComplete = function() {
  if (window.displayTechModule) {
    window.displayTechModule.markModuleComplete();
  }
};

// Initialize module when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  window.displayTechModule = new DisplayTechModule();
});