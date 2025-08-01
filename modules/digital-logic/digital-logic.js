// Digital Logic Gates Module JavaScript

class DigitalLogicModule {
  constructor() {
    this.currentQuestionIndex = 0;
    this.questions = [];
    this.userAnswers = [];
    this.startTime = Date.now();
    this.sectionProgress = {
      basics: false,
      gates: false,
      truthTables: false,
      boolean: false,
      circuitBuilder: false,
      practice: false
    };
    
    this.init();
  }
  
  init() {
    this.loadQuestions();
    this.generateTruthTable();
    this.updateProgress();
    this.initSectionNavigation();
    this.startProgressTracking();
  }
  
  // Progress tracking
  startProgressTracking() {
    // Track time spent in module
    setInterval(() => {
      const timeSpent = Math.floor((Date.now() - this.startTime) / 60000); // minutes
      if (window.app) {
        window.app.updateModuleProgress('digital-logic', {
          timeSpent: timeSpent
        });
      }
    }, 60000); // Every minute
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
    
    const progressTexts = document.querySelectorAll('.progress-text');
    progressTexts.forEach(el => {
      el.textContent = `${progress}%`;
    });
    
    const footerProgress = document.getElementById('footer-progress');
    if (footerProgress) {
      footerProgress.textContent = `${progress}%`;
    }
    
    // Show complete button if all sections are done
    if (progress === 100) {
      const completeBtn = document.getElementById('complete-btn');
      if (completeBtn) {
        completeBtn.style.display = 'block';
      }
    }
    
    // Update app state
    if (window.app) {
      window.app.updateModuleProgress('digital-logic', {
        completed: progress,
        questionsAttempted: this.userAnswers.length
      });
    }
  }
  
  markSectionComplete(section) {
    this.sectionProgress[section] = true;
    this.updateProgress();
  }
  
  // Section navigation
  initSectionNavigation() {
    const sections = document.querySelectorAll('.module-section');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Intersection Observer for auto-highlighting active section
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.id;
          navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${sectionId}`) {
              link.classList.add('active');
            }
          });
        }
      });
    }, { threshold: 0.6 });
    
    sections.forEach(section => observer.observe(section));
    
    // Mark section as viewed when scrolled into view
    const viewObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const sectionName = entry.target.id;
          setTimeout(() => {
            this.markSectionComplete(sectionName);
          }, 3000); // Mark as complete after 3 seconds of viewing
        }
      });
    }, { threshold: 0.8 });
    
    sections.forEach(section => viewObserver.observe(section));
  }
  
  // Practice questions
  loadQuestions() {
    this.questions = [
      {
        question: "What is the output of an AND gate when both inputs are HIGH?",
        options: ["LOW", "HIGH", "Undefined", "Depends on voltage"],
        correct: 1,
        explanation: "An AND gate outputs HIGH (1) only when ALL inputs are HIGH (1)."
      },
      {
        question: "Which gate produces the complement of its input?",
        options: ["AND gate", "OR gate", "NOT gate", "XOR gate"],
        correct: 2,
        explanation: "A NOT gate (inverter) produces the complement or opposite of its input."
      },
      {
        question: "In binary, what is the decimal equivalent of 1011?",
        options: ["9", "11", "13", "15"],
        correct: 1,
        explanation: "1011₂ = 1×8 + 0×4 + 1×2 + 1×1 = 8 + 0 + 2 + 1 = 11₁₀"
      },
      {
        question: "What is the Boolean expression for a NAND gate?",
        options: ["Y = A · B", "Y = A + B", "Y = (A · B)'", "Y = (A + B)'"],
        correct: 2,
        explanation: "NAND gate is NOT-AND, so Y = (A · B)' or Y = A̅·B̅"
      },
      {
        question: "How many combinations are possible with 3 binary inputs?",
        options: ["6", "8", "9", "12"],
        correct: 1,
        explanation: "With n binary inputs, there are 2ⁿ combinations. For 3 inputs: 2³ = 8"
      },
      {
        question: "What type of gate is represented by Y = A + B?",
        options: ["AND gate", "OR gate", "NAND gate", "NOR gate"],
        correct: 1,
        explanation: "The Boolean expression Y = A + B represents an OR gate."
      },
      {
        question: "In a truth table, how many rows are needed for 2 inputs?",
        options: ["2", "3", "4", "8"],
        correct: 2,
        explanation: "For n inputs, a truth table needs 2ⁿ rows. For 2 inputs: 2² = 4 rows"
      },
      {
        question: "What is the output of OR gate when both inputs are LOW?",
        options: ["LOW", "HIGH", "Undefined", "Floating"],
        correct: 0,
        explanation: "An OR gate outputs LOW (0) only when ALL inputs are LOW (0)."
      },
      {
        question: "Which number system is primarily used in digital electronics?",
        options: ["Decimal", "Binary", "Hexadecimal", "Octal"],
        correct: 1,
        explanation: "Binary (base-2) is the primary number system in digital electronics."
      },
      {
        question: "What does the bubble in a logic gate symbol represent?",
        options: ["Input", "Output", "Inversion", "Power supply"],
        correct: 2,
        explanation: "A bubble (small circle) in logic gate symbols represents inversion (NOT operation)."
      }
    ];
    
    this.userAnswers = new Array(this.questions.length).fill(null);
    this.displayQuestion();
  }
  
  displayQuestion() {
    const questionCard = document.getElementById('current-question');
    const question = this.questions[this.currentQuestionIndex];
    
    if (!question) return;
    
    questionCard.innerHTML = `
      <div class="question-header">
        <span class="question-number">Question ${this.currentQuestionIndex + 1}</span>
        <span class="question-difficulty">⭐ Medium</span>
      </div>
      <div class="question-content">
        <h3>${question.question}</h3>
        <div class="options-container">
          ${question.options.map((option, index) => `
            <label class="option-label">
              <input type="radio" name="question-${this.currentQuestionIndex}" value="${index}" 
                     ${this.userAnswers[this.currentQuestionIndex] === index ? 'checked' : ''}
                     onchange="digitalLogic.selectAnswer(${index})">
              <span class="option-text">${String.fromCharCode(65 + index)}. ${option}</span>
            </label>
          `).join('')}
        </div>
        ${this.userAnswers[this.currentQuestionIndex] !== null ? `
          <div class="answer-feedback ${this.userAnswers[this.currentQuestionIndex] === question.correct ? 'correct' : 'incorrect'}">
            <strong>${this.userAnswers[this.currentQuestionIndex] === question.correct ? '✓ Correct!' : '✗ Incorrect'}</strong>
            <p>${question.explanation}</p>
          </div>
        ` : ''}
      </div>
    `;
    
    // Update question counter
    const counter = document.getElementById('question-counter');
    if (counter) {
      counter.textContent = `Question ${this.currentQuestionIndex + 1} of ${this.questions.length}`;
    }
  }
  
  selectAnswer(answerIndex) {
    this.userAnswers[this.currentQuestionIndex] = answerIndex;
    this.displayQuestion();
    this.updatePracticeProgress();
  }
  
  updatePracticeProgress() {
    const answeredQuestions = this.userAnswers.filter(answer => answer !== null).length;
    if (answeredQuestions === this.questions.length) {
      this.markSectionComplete('practice');
      this.showPracticeResults();
    }
  }
  
  showPracticeResults() {
    const resultsDiv = document.getElementById('practice-results');
    const questionCard = document.getElementById('current-question');
    
    const correctAnswers = this.userAnswers.filter((answer, index) => 
      answer === this.questions[index].correct
    ).length;
    
    const percentage = Math.round((correctAnswers / this.questions.length) * 100);
    
    document.getElementById('correct-answers').textContent = correctAnswers;
    document.getElementById('total-questions').textContent = this.questions.length;
    document.getElementById('percentage-score').textContent = `${percentage}%`;
    
    questionCard.style.display = 'none';
    resultsDiv.style.display = 'block';
    
    // Update app progress
    if (window.app) {
      window.app.updateModuleProgress('digital-logic', {
        questionsAttempted: this.questions.length,
        correctAnswers: correctAnswers,
        practiceCompleted: true
      });
    }
  }
}

// Interactive demonstrations
function convertBinary() {
  const binaryInput = document.getElementById('binary-input').value;
  const resultDiv = document.getElementById('binary-result');
  const binaryDigits = document.getElementById('binary-digits');
  
  // Validate binary input
  if (!/^[01]+$/.test(binaryInput)) {
    resultDiv.innerHTML = '<span style="color: var(--danger-color);">Please enter only 0s and 1s</span>';
    return;
  }
  
  if (binaryInput.length > 8) {
    resultDiv.innerHTML = '<span style="color: var(--danger-color);">Maximum 8 digits allowed</span>';
    return;
  }
  
  // Convert to decimal
  let decimal = 0;
  const binary = binaryInput.padStart(8, '0');
  
  for (let i = 0; i < binary.length; i++) {
    const bit = parseInt(binary[i]);
    const power = 7 - i;
    decimal += bit * Math.pow(2, power);
  }
  
  resultDiv.innerHTML = `
    <strong>${binaryInput}₂ = ${decimal}₁₀</strong><br>
    <small>Calculation: ${binary.split('').map((bit, i) => 
      bit === '1' ? `${bit}×${Math.pow(2, 7-i)}` : ''
    ).filter(Boolean).join(' + ')} = ${decimal}</small>
  `;
  
  // Update binary digits display
  const digitElements = binaryDigits.querySelectorAll('.binary-digit');
  digitElements.forEach((el, i) => {
    el.textContent = binary[i];
    el.style.backgroundColor = binary[i] === '1' ? 'var(--success-color)' : 'var(--bg-secondary)';
    el.style.color = binary[i] === '1' ? 'white' : 'var(--text-primary)';
  });
}

// Logic gate simulators
function updateAndGate() {
  const a = parseInt(document.getElementById('and-a').value);
  const b = parseInt(document.getElementById('and-b').value);
  const output = a && b ? 1 : 0;
  
  document.getElementById('and-output').innerHTML = `
    Output Y = ${output}<br>
    <small>${a} AND ${b} = ${output}</small>
  `;
  document.getElementById('and-output').style.backgroundColor = 
    output ? 'var(--success-color)' : 'var(--bg-secondary)';
}

function updateOrGate() {
  const a = parseInt(document.getElementById('or-a').value);
  const b = parseInt(document.getElementById('or-b').value);
  const output = a || b ? 1 : 0;
  
  document.getElementById('or-output').innerHTML = `
    Output Y = ${output}<br>
    <small>${a} OR ${b} = ${output}</small>
  `;
  document.getElementById('or-output').style.backgroundColor = 
    output ? 'var(--success-color)' : 'var(--bg-secondary)';
}

function updateNotGate() {
  const a = parseInt(document.getElementById('not-a').value);
  const output = a ? 0 : 1;
  
  document.getElementById('not-output').innerHTML = `
    Output Y = ${output}<br>
    <small>NOT ${a} = ${output}</small>
  `;
  document.getElementById('not-output').style.backgroundColor = 
    output ? 'var(--success-color)' : 'var(--bg-secondary)';
}

// Truth table generator
function generateTruthTable() {
  const gateType = document.getElementById('gate-selector').value;
  const display = document.getElementById('truth-table-display');
  
  const truthTables = {
    and: {
      inputs: ['A', 'B'],
      rows: [
        [0, 0, 0],
        [0, 1, 0],
        [1, 0, 0],
        [1, 1, 1]
      ],
      formula: 'Y = A · B'
    },
    or: {
      inputs: ['A', 'B'],
      rows: [
        [0, 0, 0],
        [0, 1, 1],
        [1, 0, 1],
        [1, 1, 1]
      ],
      formula: 'Y = A + B'
    },
    not: {
      inputs: ['A'],
      rows: [
        [0, 1],
        [1, 0]
      ],
      formula: 'Y = Ā'
    },
    nand: {
      inputs: ['A', 'B'],
      rows: [
        [0, 0, 1],
        [0, 1, 1],
        [1, 0, 1],
        [1, 1, 0]
      ],
      formula: 'Y = (A · B)̄'
    },
    nor: {
      inputs: ['A', 'B'],
      rows: [
        [0, 0, 1],
        [0, 1, 0],
        [1, 0, 0],
        [1, 1, 0]
      ],
      formula: 'Y = (A + B)̄'
    },
    xor: {
      inputs: ['A', 'B'],
      rows: [
        [0, 0, 0],
        [0, 1, 1],
        [1, 0, 1],
        [1, 1, 0]
      ],
      formula: 'Y = A ⊕ B'
    },
    xnor: {
      inputs: ['A', 'B'],
      rows: [
        [0, 0, 1],
        [0, 1, 0],
        [1, 0, 0],
        [1, 1, 1]
      ],
      formula: 'Y = A ⊙ B'
    }
  };
  
  const table = truthTables[gateType];
  
  let html = `
    <div class="formula-box">${table.formula}</div>
    <table class="truth-table">
      <thead>
        <tr>
          ${table.inputs.map(input => `<th>${input}</th>`).join('')}
          <th>Y</th>
        </tr>
      </thead>
      <tbody>
        ${table.rows.map(row => `
          <tr>
            ${row.map((value, index) => `
              <td class="${index === row.length - 1 ? (value ? 'high' : 'low') : ''}">${value}</td>
            `).join('')}
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
  
  display.innerHTML = html;
}

// Navigation functions
function nextQuestion() {
  if (digitalLogic.currentQuestionIndex < digitalLogic.questions.length - 1) {
    digitalLogic.currentQuestionIndex++;
    digitalLogic.displayQuestion();
  }
}

function previousQuestion() {
  if (digitalLogic.currentQuestionIndex > 0) {
    digitalLogic.currentQuestionIndex--;
    digitalLogic.displayQuestion();
  }
}

function restartPractice() {
  digitalLogic.currentQuestionIndex = 0;
  digitalLogic.userAnswers = new Array(digitalLogic.questions.length).fill(null);
  
  document.getElementById('practice-results').style.display = 'none';
  document.getElementById('current-question').style.display = 'block';
  
  digitalLogic.displayQuestion();
}

function markModuleComplete() {
  if (window.app) {
    window.app.updateModuleProgress('digital-logic', {
      completed: 100,
      moduleCompleted: true,
      completedAt: Date.now()
    });
    window.app.showNotification('Module 1 completed successfully!', 'success');
  }
  
  // Show completion modal
  showCompletionModal();
}

function showCompletionModal() {
  const modal = document.createElement('div');
  modal.className = 'completion-modal';
  modal.innerHTML = `
    <div class="completion-content">
      <div class="completion-icon">🎉</div>
      <h2>Module 1 Complete!</h2>
      <p>Congratulations! You've successfully completed Digital Logic Gates.</p>
      <div class="completion-stats">
        <div class="stat">
          <span class="stat-value">${digitalLogic.userAnswers.filter((answer, index) => 
            answer === digitalLogic.questions[index].correct
          ).length}</span>
          <span class="stat-label">Questions Correct</span>
        </div>
        <div class="stat">
          <span class="stat-value">${Math.floor((Date.now() - digitalLogic.startTime) / 60000)}</span>
          <span class="stat-label">Minutes Spent</span>
        </div>
      </div>
      <div class="completion-actions">
        <button class="btn-primary" onclick="nextModule()">Continue to Module 2</button>
        <button class="btn-secondary" onclick="goToHome()">Back to Home</button>
      </div>
    </div>
  `;
  
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
  
  document.body.appendChild(modal);
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
}

// Module navigation
function goToHome() {
  window.location.href = '../../index.html';
}

function nextModule() {
  window.location.href = '../electronic-devices/index.html';
}

function previousModule() {
  // This is module 1, so go back to home
  goToHome();
}

function openCircuitBuilder() {
  window.location.href = '../../tools/circuit-builder/index.html';
}

// Initialize module
let digitalLogic;
document.addEventListener('DOMContentLoaded', () => {
  digitalLogic = new DigitalLogicModule();
  
  // Initialize interactive elements
  updateAndGate();
  updateOrGate();
  updateNotGate();
  
  console.log('Digital Logic module initialized');
});