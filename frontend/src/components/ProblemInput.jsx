// frontend/src/components/ProblemInput.jsx
import React, { useState } from 'react';

const ProblemInput = ({ onSubmit, isLoading }) => {
  const [problemText, setProblemText] = useState('');
  
  const examples = [
    "A ball is thrown straight up with a speed of 10 m/s",
    "A 2 kg ball is dropped from a height of 20 meters",
    "A projectile is launched at 30 degrees with initial velocity 15 m/s",
    "A 5 kg object falls from 50 meters with air resistance"
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (problemText.trim()) {
      onSubmit(problemText);
    }
  };

  const handleExampleClick = (example) => {
    setProblemText(example);
  };

  return (
    <div className="problem-input">
      <h2>Enter Physics Problem</h2>
      
      <form onSubmit={handleSubmit}>
        <textarea
          value={problemText}
          onChange={(e) => setProblemText(e.target.value)}
          placeholder="Describe a physics problem (e.g., 'A ball is thrown upward at 10 m/s')"
          rows={4}
          disabled={isLoading}
        />
        
        <button type="submit" disabled={isLoading || !problemText.trim()}>
          {isLoading ? 'Creating Simulation...' : 'Create Simulation'}
        </button>
      </form>

      <div className="examples">
        <h3>Example Problems:</h3>
        {examples.map((example, index) => (
          <button
            key={index}
            className="example-btn"
            onClick={() => handleExampleClick(example)}
            disabled={isLoading}
          >
            {example}
          </button>
        ))}
      </div>
      
      <style jsx>{`
        .problem-input {
          background: var(--card-bg);
          padding: 24px;
          border-radius: 8px;
          box-shadow: var(--shadow-md);
          margin-bottom: 20px;
          animation: fadeIn 0.3s ease-in;
        }

        h2 {
          margin-top: 0;
          color: var(--text-primary);
          font-size: 18px;
        }

        form {
          margin-bottom: 20px;
        }

        textarea {
          width: 100%;
          padding: 12px;
          font-size: 14px;
          border: 2px solid var(--input-border);
          border-radius: 6px;
          font-family: inherit;
          resize: vertical;
          margin-bottom: 12px;
          background: var(--input-bg);
          color: var(--text-primary);
        }

        textarea:focus {
          outline: none;
          border-color: var(--accent-color);
        }

        button[type="submit"] {
          width: 100%;
          padding: 12px 24px;
          font-size: 14px;
          font-weight: 600;
          color: white;
          background: var(--accent-color);
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
        }

        button[type="submit"]:hover:not(:disabled) {
          background: var(--accent-hover);
          transform: translateY(-1px);
          box-shadow: var(--shadow-md);
        }

        button[type="submit"]:disabled {
          background: var(--text-muted);
          cursor: not-allowed;
          transform: none;
        }

        .examples {
          padding-top: 16px;
          border-top: 1px solid var(--border-light);
        }

        .examples h3 {
          font-size: 13px;
          color: var(--text-secondary);
          margin-bottom: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .example-btn {
          display: block;
          width: 100%;
          padding: 10px 12px;
          margin-bottom: 8px;
          font-size: 13px;
          text-align: left;
          background: var(--bg-tertiary);
          color: var(--text-primary);
          border: 1px solid var(--border-color);
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .example-btn:hover:not(:disabled) {
          background: var(--bg-hover);
          border-color: var(--accent-color);
          transform: translateX(4px);
        }

        .example-btn:disabled {
          cursor: not-allowed;
          opacity: 0.6;
        }
      `}</style>

    </div>
  );
};

export default ProblemInput;
