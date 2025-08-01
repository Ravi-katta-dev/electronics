// Exam Engine - RRB Test Simulation and Question Management
// This module handles exam simulation, question banks, and performance tracking

class ExamEngine {
  constructor() {
    this.questionBank = new Map();
    this.currentExam = null;
    this.examState = {
      currentQuestion: 0,
      answers: new Map(),
      timeRemaining: 0,
      startTime: null,
      endTime: null
    };
    this.examSettings = {
      timeLimit: 90, // minutes
      negativeMarking: true,
      negativeMarkingRatio: 0.25, // 1/4 marks deducted
      questionsPerExam: 100,
      passingPercentage: 60
    };
    
    this.init();
  }
  
  init() {
    console.log('Exam Engine initialized');
    this.loadQuestionBank();
    this.setupExamInterface();
  }
  
  loadQuestionBank() {
    // Load questions for all modules
    this.questionBank.set('digital-logic', this.getDigitalLogicQuestions());
    this.questionBank.set('electronic-devices', this.getElectronicDevicesQuestions());
    this.questionBank.set('microcontroller', this.getMicrocontrollerQuestions());
    this.questionBank.set('measurements', this.getMeasurementsQuestions());
    this.questionBank.set('measuring-systems', this.getMeasuringSystemsQuestions());
    this.questionBank.set('transducers', this.getTransducersQuestions());
    this.questionBank.set('display-tech', this.getDisplayTechQuestions());
    
    console.log(`Loaded ${this.getTotalQuestions()} questions across all modules`);
  }
  
  getTotalQuestions() {
    let total = 0;
    this.questionBank.forEach(questions => {
      total += questions.length;
    });
    return total;
  }
  
  setupExamInterface() {
    // Setup exam UI components
    console.log('Setting up exam interface');
  }
  
  startExam(examType = 'full', modules = null) {
    // Start a new exam session
    this.examState.startTime = Date.now();
    this.examState.timeRemaining = this.examSettings.timeLimit * 60; // Convert to seconds
    this.examState.currentQuestion = 0;
    this.examState.answers.clear();
    
    // Generate question set
    if (examType === 'full') {
      this.currentExam = this.generateFullExam();
    } else if (examType === 'module' && modules) {
      this.currentExam = this.generateModuleExam(modules);
    } else if (examType === 'practice') {
      this.currentExam = this.generatePracticeExam();
    }
    
    console.log(`Starting ${examType} exam with ${this.currentExam.length} questions`);
    this.startTimer();
    
    return {
      examId: Date.now(),
      questionCount: this.currentExam.length,
      timeLimit: this.examSettings.timeLimit,
      negativeMarking: this.examSettings.negativeMarking
    };
  }
  
  generateFullExam() {
    // Generate full RRB-style exam with weighted questions from all modules
    const questions = [];
    const weights = {
      'digital-logic': 15, // 15% weightage
      'electronic-devices': 20,
      'microcontroller': 18,
      'measurements': 16,
      'measuring-systems': 12,
      'transducers': 14,
      'display-tech': 10
    };
    
    Object.entries(weights).forEach(([module, weight]) => {
      const moduleQuestions = this.questionBank.get(module) || [];
      const questionCount = Math.round((weight / 100) * this.examSettings.questionsPerExam);
      const selectedQuestions = this.selectRandomQuestions(moduleQuestions, questionCount);
      questions.push(...selectedQuestions);
    });
    
    return this.shuffleArray(questions);
  }
  
  generateModuleExam(modules) {
    // Generate exam for specific modules
    const questions = [];
    modules.forEach(module => {
      const moduleQuestions = this.questionBank.get(module) || [];
      questions.push(...moduleQuestions);
    });
    
    return this.shuffleArray(questions).slice(0, 50); // Limit to 50 questions for module exams
  }
  
  generatePracticeExam() {
    // Generate practice exam with mixed difficulty
    const questions = [];
    this.questionBank.forEach(moduleQuestions => {
      const practiceQuestions = this.selectRandomQuestions(moduleQuestions, 5);
      questions.push(...practiceQuestions);
    });
    
    return this.shuffleArray(questions);
  }
  
  selectRandomQuestions(questions, count) {
    // Select random questions from a pool
    const shuffled = this.shuffleArray([...questions]);
    return shuffled.slice(0, Math.min(count, shuffled.length));
  }
  
  shuffleArray(array) {
    // Fisher-Yates shuffle algorithm
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
  
  submitAnswer(questionIndex, answerIndex) {
    // Submit answer for a question
    this.examState.answers.set(questionIndex, {
      answer: answerIndex,
      timestamp: Date.now()
    });
    
    console.log(`Answer submitted for question ${questionIndex + 1}: ${answerIndex}`);
  }
  
  navigateToQuestion(questionIndex) {
    // Navigate to specific question
    if (questionIndex >= 0 && questionIndex < this.currentExam.length) {
      this.examState.currentQuestion = questionIndex;
      return this.currentExam[questionIndex];
    }
    return null;
  }
  
  startTimer() {
    // Start exam timer
    this.examTimer = setInterval(() => {
      this.examState.timeRemaining--;
      
      if (this.examState.timeRemaining <= 0) {
        this.endExam('timeout');
      }
      
      // Update UI timer display
      this.updateTimerDisplay();
    }, 1000);
  }
  
  updateTimerDisplay() {
    // Update timer display in UI
    const minutes = Math.floor(this.examState.timeRemaining / 60);
    const seconds = this.examState.timeRemaining % 60;
    const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    const timerElement = document.getElementById('exam-timer');
    if (timerElement) {
      timerElement.textContent = timeString;
      
      // Warning colors
      if (this.examState.timeRemaining < 300) { // Last 5 minutes
        timerElement.style.color = 'var(--danger-color)';
      } else if (this.examState.timeRemaining < 900) { // Last 15 minutes
        timerElement.style.color = 'var(--warning-color)';
      }
    }
  }
  
  endExam(reason = 'submitted') {
    // End exam and calculate results
    this.examState.endTime = Date.now();
    clearInterval(this.examTimer);
    
    const results = this.calculateResults();
    console.log(`Exam ended (${reason}):`, results);
    
    // Save results to local storage
    this.saveExamResults(results);
    
    return results;
  }
  
  calculateResults() {
    // Calculate exam results with negative marking
    let correctAnswers = 0;
    let incorrectAnswers = 0;
    let unattempted = 0;
    let totalMarks = 0;
    
    this.currentExam.forEach((question, index) => {
      const userAnswer = this.examState.answers.get(index);
      
      if (userAnswer === undefined) {
        unattempted++;
      } else if (userAnswer.answer === question.correct) {
        correctAnswers++;
        totalMarks += 1; // 1 mark per correct answer
      } else {
        incorrectAnswers++;
        if (this.examSettings.negativeMarking) {
          totalMarks -= this.examSettings.negativeMarkingRatio;
        }
      }
    });
    
    const totalQuestions = this.currentExam.length;
    const percentage = Math.max(0, (totalMarks / totalQuestions) * 100);
    const isPassed = percentage >= this.examSettings.passingPercentage;
    
    return {
      totalQuestions,
      correctAnswers,
      incorrectAnswers,
      unattempted,
      totalMarks: Math.max(0, totalMarks),
      percentage: percentage.toFixed(2),
      isPassed,
      timeTaken: Math.floor((this.examState.endTime - this.examState.startTime) / 1000),
      moduleWiseAnalysis: this.getModuleWiseAnalysis()
    };
  }
  
  getModuleWiseAnalysis() {
    // Analyze performance module-wise
    const analysis = new Map();
    
    this.currentExam.forEach((question, index) => {
      const module = question.module;
      if (!analysis.has(module)) {
        analysis.set(module, {
          total: 0,
          correct: 0,
          incorrect: 0,
          unattempted: 0
        });
      }
      
      const moduleStats = analysis.get(module);
      moduleStats.total++;
      
      const userAnswer = this.examState.answers.get(index);
      if (userAnswer === undefined) {
        moduleStats.unattempted++;
      } else if (userAnswer.answer === question.correct) {
        moduleStats.correct++;
      } else {
        moduleStats.incorrect++;
      }
    });
    
    // Convert to percentage
    analysis.forEach((stats, module) => {
      stats.percentage = ((stats.correct / stats.total) * 100).toFixed(1);
    });
    
    return Object.fromEntries(analysis);
  }
  
  saveExamResults(results) {
    // Save exam results to local storage
    const savedResults = JSON.parse(localStorage.getItem('examResults') || '[]');
    savedResults.push({
      ...results,
      date: new Date().toISOString(),
      examId: Date.now()
    });
    
    // Keep only last 50 results
    if (savedResults.length > 50) {
      savedResults.splice(0, savedResults.length - 50);
    }
    
    localStorage.setItem('examResults', JSON.stringify(savedResults));
  }
  
  // Question bank data (simplified versions - full implementation would load from JSON files)
  getDigitalLogicQuestions() {
    return [
      {
        module: 'digital-logic',
        question: "What is the output of an AND gate when both inputs are HIGH?",
        options: ["LOW", "HIGH", "Undefined", "Depends on voltage"],
        correct: 1,
        difficulty: 'easy',
        explanation: "An AND gate outputs HIGH (1) only when ALL inputs are HIGH (1)."
      }
      // More questions would be loaded from data files
    ];
  }
  
  getElectronicDevicesQuestions() {
    return [
      {
        module: 'electronic-devices',
        question: "What is the barrier potential of a silicon diode?",
        options: ["0.3V", "0.7V", "1.2V", "1.7V"],
        correct: 1,
        difficulty: 'medium',
        explanation: "Silicon diodes have a barrier potential of approximately 0.7V."
      }
    ];
  }
  
  getMicrocontrollerQuestions() {
    return [
      {
        module: 'microcontroller',
        question: "How many bit microprocessor is 8085?",
        options: ["4-bit", "8-bit", "16-bit", "32-bit"],
        correct: 1,
        difficulty: 'easy',
        explanation: "8085 is an 8-bit microprocessor with 8-bit data bus."
      }
    ];
  }
  
  getMeasurementsQuestions() {
    return [
      {
        module: 'measurements',
        question: "Which instrument is used to measure frequency?",
        options: ["Voltmeter", "Ammeter", "Frequency counter", "Ohmmeter"],
        correct: 2,
        difficulty: 'easy',
        explanation: "Frequency counter is specifically designed to measure frequency."
      }
    ];
  }
  
  getMeasuringSystemsQuestions() {
    return [
      {
        module: 'measuring-systems',
        question: "What is the SI unit of resistance?",
        options: ["Volt", "Ampere", "Ohm", "Watt"],
        correct: 2,
        difficulty: 'easy',
        explanation: "Ohm (Ω) is the SI unit of electrical resistance."
      }
    ];
  }
  
  getTransducersQuestions() {
    return [
      {
        module: 'transducers',
        question: "A thermocouple is an example of which type of transducer?",
        options: ["Active", "Passive", "Digital", "Mechanical"],
        correct: 0,
        difficulty: 'medium',
        explanation: "Thermocouple is an active transducer as it generates its own electrical signal."
      }
    ];
  }
  
  getDisplayTechQuestions() {
    return [
      {
        module: 'display-tech',
        question: "How many segments are there in a standard 7-segment display?",
        options: ["6", "7", "8", "9"],
        correct: 1,
        difficulty: 'easy',
        explanation: "A standard 7-segment display has 7 segments labeled a through g."
      }
    ];
  }
}

// Initialize exam engine
window.ExamEngine = ExamEngine;