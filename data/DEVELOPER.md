# Data Directory - Developer Guide

## Overview
Contains structured data files in JSON format that power the educational content, questions, and interactive features of the platform.

## Structure
```
data/
├── questions/
│   ├── digital-logic.json      # Digital logic questions
│   ├── electronics.json       # Electronics questions
│   └── microcontroller.json   # Microcontroller questions
├── circuits/
│   ├── basic-circuits.json    # Basic circuit definitions
│   └── advanced-circuits.json # Complex circuit examples
├── components/
│   ├── passive.json           # Resistors, capacitors, inductors
│   ├── active.json            # Transistors, diodes, ICs
│   └── digital.json           # Logic gates, flip-flops
├── formulas/
│   ├── ohms-law.json          # Basic electrical formulas
│   ├── ac-analysis.json       # AC circuit formulas
│   └── digital-logic.json     # Boolean algebra formulas
└── content/
    ├── modules.json           # Module metadata
    └── syllabus.json          # RRB syllabus mapping
```

## Data Formats

### Question Format
```json
{
  "id": "dl001",
  "module": "digital-logic",
  "topic": "logic-gates",
  "question": "What is the output of an AND gate with inputs 1 and 0?",
  "options": [
    "0",
    "1", 
    "undefined",
    "depends on the gate type"
  ],
  "correct": 0,
  "explanation": "An AND gate outputs 1 only when ALL inputs are 1. Since one input is 0, the output is 0.",
  "difficulty": "easy",
  "tags": ["basic-gates", "and-gate", "truth-table"],
  "marks": 1,
  "negativeMarks": 0.25,
  "timeEstimate": 30,
  "lastUpdated": "2025-08-01",
  "source": "RRB 2023 Pattern"
}
```

### Component Format
```json
{
  "id": "res001",
  "type": "resistor",
  "name": "Carbon Film Resistor",
  "symbol": "assets/images/components/resistor.svg",
  "properties": {
    "resistance": {
      "min": 1,
      "max": 10000000,
      "unit": "ohm",
      "tolerance": [1, 2, 5, 10]
    },
    "power": {
      "values": [0.125, 0.25, 0.5, 1, 2, 5],
      "unit": "watt"
    }
  },
  "connections": 2,
  "category": "passive",
  "description": "Basic resistor for current limiting and voltage division",
  "simulation": {
    "model": "linear",
    "equation": "V = I * R"
  }
}
```

### Circuit Format
```json
{
  "id": "circuit001",
  "name": "Voltage Divider",
  "description": "Basic voltage divider circuit using two resistors",
  "components": [
    {
      "id": "R1",
      "type": "resistor",
      "value": 1000,
      "position": {"x": 100, "y": 100}
    },
    {
      "id": "R2", 
      "type": "resistor",
      "value": 2000,
      "position": {"x": 100, "y": 200}
    },
    {
      "id": "V1",
      "type": "voltage_source",
      "value": 9,
      "position": {"x": 50, "y": 150}
    }
  ],
  "connections": [
    {"from": "V1.positive", "to": "R1.terminal1"},
    {"from": "R1.terminal2", "to": "R2.terminal1"},
    {"from": "R2.terminal2", "to": "V1.negative"}
  ],
  "analysis": {
    "type": "dc",
    "expectedResults": {
      "Vout": 6,
      "I": 0.003
    }
  }
}
```

### Formula Format
```json
{
  "id": "ohms_law",
  "name": "Ohm's Law",
  "category": "basic",
  "formulas": [
    {
      "name": "Voltage",
      "formula": "V = I × R",
      "variables": {
        "V": {"name": "Voltage", "unit": "volt"},
        "I": {"name": "Current", "unit": "ampere"}, 
        "R": {"name": "Resistance", "unit": "ohm"}
      },
      "description": "Voltage equals current times resistance"
    },
    {
      "name": "Current", 
      "formula": "I = V / R",
      "variables": {
        "I": {"name": "Current", "unit": "ampere"},
        "V": {"name": "Voltage", "unit": "volt"},
        "R": {"name": "Resistance", "unit": "ohm"}
      },
      "description": "Current equals voltage divided by resistance"
    }
  ],
  "examples": [
    {
      "given": {"V": 12, "R": 4},
      "find": "I",
      "solution": "I = V/R = 12/4 = 3A"
    }
  ]
}
```

## Data Management

### Adding New Questions
1. **Format Validation**: Follow exact JSON schema
2. **Content Review**: Technical accuracy check
3. **Difficulty Assignment**: Proper difficulty classification
4. **Tag Assignment**: Relevant topic tags

### Question Guidelines
- **Clear Language**: Unambiguous question text
- **Balanced Options**: Reasonable distractors
- **Accurate Answers**: Verified correct answers
- **Helpful Explanations**: Educational explanations

### Data Validation
```javascript
// Example validation function
function validateQuestion(question) {
    const required = ['id', 'question', 'options', 'correct', 'explanation'];
    
    for (const field of required) {
        if (!question[field]) {
            throw new Error(`Missing required field: ${field}`);
        }
    }
    
    if (question.options.length < 2) {
        throw new Error('Question must have at least 2 options');
    }
    
    if (question.correct >= question.options.length) {
        throw new Error('Correct answer index out of range');
    }
    
    return true;
}
```

## Content Creation Guidelines

### Question Writing
1. **Clarity**: Questions should be clear and unambiguous
2. **Relevance**: Align with RRB syllabus
3. **Difficulty**: Appropriate for exam level
4. **Variety**: Mix of conceptual and numerical questions

### Component Definitions
1. **Accuracy**: Correct technical specifications
2. **Completeness**: All relevant properties included
3. **Simulation**: Mathematical models for simulation
4. **Visual**: Proper symbol references

### Circuit Examples
1. **Educational Value**: Demonstrate key concepts
2. **Complexity**: Appropriate for learning level
3. **Analysis**: Include expected results
4. **Simulation**: Compatible with simulation engine

## Data Loading and Caching

### Loading Strategy
```javascript
class DataLoader {
    static async loadQuestions(module) {
        try {
            const response = await fetch(`./data/questions/${module}.json`);
            const questions = await response.json();
            
            // Cache in localStorage
            localStorage.setItem(`questions_${module}`, JSON.stringify(questions));
            
            return questions;
        } catch (error) {
            console.error('Failed to load questions:', error);
            
            // Fallback to cached data
            const cached = localStorage.getItem(`questions_${module}`);
            return cached ? JSON.parse(cached) : null;
        }
    }
}
```

### Performance Optimization
- Load data on demand
- Cache frequently accessed data
- Compress large datasets
- Use efficient data structures

## Data Integrity

### Version Control
- Track changes to question banks
- Maintain question history
- Review process for updates
- Backup critical data

### Quality Assurance
- Automated validation scripts
- Peer review process
- Regular content audits
- User feedback integration

---

**Last Updated**: August 2025
**Maintainer**: Ravi Katta (@Ravi-katta-dev)
