# Tools Directory - Developer Guide

## Overview
Interactive tools for hands-on learning and exam preparation. Each tool provides specialized functionality for different aspects of electronics education.

## Tools Structure
```
tools/
├── exam-simulator/
│   ├── index.html
│   ├── css/
│   │   └── exam-styles.css
│   ├── js/
│   │   └── exam-engine.js
│   └── data/
│       └── questions.json
├── circuit-builder/
│   ├── index.html
│   ├── css/
│   ├── js/
│   └── components/
├── virtual-lab/
│   ├── index.html
│   ├── instruments/
│   └── experiments/
└── shared/
    ├── components.js
    └── utils.js
```

## Available Tools

### 1. Exam Simulator ✅
**Purpose**: CBT-style exam practice with comprehensive question bank

**Features**:
- 500+ RRB-pattern questions
- Timed exam sessions (90 minutes)
- Negative marking system
- Module-wise practice
- Performance analytics
- Bookmark difficult questions

**Technical Implementation**:
```javascript
class ExamSimulator {
    constructor() {
        this.questionBank = null;
        this.examState = {
            currentQuestion: 0,
            answers: new Map(),
            timeRemaining: 0,
            examType: null
        };
        this.examSettings = {
            timeLimit: 90,
            negativeMarking: true,
            questionsPerExam: 100
        };
    }
}
```

### 2. Circuit Builder 🚧
**Purpose**: Interactive circuit design and simulation

**Planned Features**:
- Drag-and-drop component placement
- Real-time circuit simulation
- Component library (resistors, capacitors, ICs)
- Circuit analysis tools
- Save/load circuits
- Export schematics

**Component System**:
```javascript
class CircuitBuilder {
    constructor() {
        this.canvas = null;
        this.components = new Map();
        this.connections = [];
        this.simulationEngine = new SimulationEngine();
    }
    
    addComponent(type, position) {
        // Add component to circuit
    }
    
    simulateCircuit() {
        // Run circuit simulation
    }
}
```

### 3. Virtual Lab 🚧
**Purpose**: Virtual laboratory experiments

**Planned Features**:
- Virtual instruments (oscilloscope, multimeter, function generator)
- Guided experiments
- Data collection and analysis
- Lab report generation
- Equipment tutorials

**Instrument Framework**:
```javascript
class VirtualInstrument {
    constructor(type) {
        this.type = type;
        this.isCalibrated = false;
        this.measurements = [];
    }
    
    measure(signal) {
        // Perform measurement
    }
    
    calibrate() {
        // Instrument calibration
    }
}
```

## Development Framework

### Shared Components
Common functionality across all tools:

```javascript
// tools/shared/components.js
class ToolBase {
    constructor(toolName) {
        this.toolName = toolName;
        this.isInitialized = false;
        this.eventHandlers = new Map();
    }
    
    init() {
        this.setupEventListeners();
        this.loadSettings();
        this.isInitialized = true;
    }
    
    setupEventListeners() {
        // Common event handling
    }
    
    saveProgress() {
        // Save tool-specific progress
    }
}
```

### Utility Functions
```javascript
// tools/shared/utils.js
const ToolUtils = {
    generateId() {
        return Math.random().toString(36).substr(2, 9);
    },
    
    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    },
    
    validateAnswer(userAnswer, correctAnswer) {
        // Answer validation logic
    }
};
```

## Tool Development Guidelines

### Creating New Tools

1. **Tool Structure**:
```
new-tool/
├── index.html           # Main tool interface
├── css/
│   └── tool-styles.css  # Tool-specific styles
├── js/
│   └── tool-engine.js   # Core functionality
├── data/               # Tool data files
└── assets/             # Tool-specific assets
```

2. **Base Template**:
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Tool Name - RRB Electronics</title>
    <link rel="stylesheet" href="../../assets/css/main.css">
    <link rel="stylesheet" href="css/tool-styles.css">
</head>
<body>
    <div class="tool-container">
        <!-- Tool interface -->
    </div>
    <script src="../shared/utils.js"></script>
    <script src="js/tool-engine.js"></script>
</body>
</html>
```

3. **JavaScript Structure**:
```javascript
class NewTool extends ToolBase {
    constructor() {
        super('new-tool');
        this.toolSpecificData = new Map();
        this.init();
    }
    
    init() {
        super.init();
        this.setupToolSpecificFeatures();
    }
    
    setupToolSpecificFeatures() {
        // Tool-specific initialization
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new NewTool();
});
```

### Performance Considerations

1. **Lazy Loading**: Load components only when needed
2. **Memory Management**: Clean up unused objects
3. **Animation Optimization**: Use requestAnimationFrame
4. **Data Caching**: Cache frequently accessed data

### User Experience

1. **Responsive Design**: Works on all screen sizes
2. **Keyboard Navigation**: Full keyboard accessibility
3. **Loading States**: Show progress for long operations
4. **Error Handling**: Graceful error recovery

## Exam Simulator Deep Dive

### Question Bank Structure
```json
{
  "metadata": {
    "version": "1.0",
    "totalQuestions": 500,
    "lastUpdated": "2025-08-01"
  },
  "modules": {
    "digital-logic": {
      "name": "Digital Logic",
      "questions": [
        {
          "id": "dl001",
          "question": "What is the output of an AND gate with inputs 1 and 0?",
          "options": ["0", "1", "undefined", "depends on gate"],
          "correct": 0,
          "explanation": "AND gate outputs 1 only when both inputs are 1",
          "difficulty": "easy",
          "tags": ["basic-gates", "and-gate"]
        }
      ]
    }
  }
}
```

### Exam Flow
1. **Setup**: Select exam type and modules
2. **Instructions**: Display exam rules and interface guide
3. **Exam Session**: Timed question presentation
4. **Review**: Question review and flag management
5. **Submit**: Final submission with confirmation
6. **Results**: Detailed performance analysis

### Analytics and Reporting
- Question-wise performance
- Time analysis per question
- Module-wise scores
- Difficulty-based analysis
- Progress tracking over time

## Integration Guidelines

### Main App Integration
Tools communicate with the main application:

```javascript
// Send progress updates
window.parent.postMessage({
    type: 'tool-progress',
    tool: 'exam-simulator',
    data: {
        questionsCompleted: 50,
        score: 75,
        timeSpent: 3600
    }
}, '*');
```

### Service Worker Integration
Tools are cached for offline use:

```javascript
// Add tool files to service worker cache
const TOOL_FILES = [
    './tools/exam-simulator/index.html',
    './tools/exam-simulator/css/exam-styles.css',
    './tools/exam-simulator/js/exam-engine.js',
    './tools/exam-simulator/data/questions.json'
];
```

---

**Last Updated**: August 2025
**Maintainer**: Ravi Katta (@Ravi-katta-dev)
