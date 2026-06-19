import { useState } from 'react';
import { QUIZ_QUESTIONS } from '../utils/constants';
import { Award, CheckCircle, AlertCircle, RefreshCw, ChevronRight, GraduationCap } from 'lucide-react';

interface QuizProps {
  onQuizCompleted: (score: number) => void;
  quizScore: number | null;
  onResetQuiz: () => void;
}

export default function Quiz({ onQuizCompleted, quizScore, onResetQuiz }: QuizProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [localScore, setLocalScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(quizScore !== null);

  const question = QUIZ_QUESTIONS[currentIdx];

  const handleOptionClick = (idx: number) => {
    if (isSubmitted) return;
    setSelectedOpt(idx);
  };

  const handleSubmit = () => {
    if (selectedOpt === null) return;
    setIsSubmitted(true);
    if (selectedOpt === question.correctAnswer) {
      setLocalScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIdx < QUIZ_QUESTIONS.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setSelectedOpt(null);
      setIsSubmitted(false);
    } else {
      const finalScore = isSubmitted && selectedOpt === question.correctAnswer 
        ? localScore + 1 
        : localScore;
      
      setQuizFinished(true);
      onQuizCompleted(finalScore);
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setSelectedOpt(null);
    setIsSubmitted(false);
    setLocalScore(0);
    setQuizFinished(false);
    onResetQuiz();
  };

  // Render final results view
  if (quizFinished) {
    const scoreVal = quizScore !== null ? quizScore : localScore;
    const isPerfect = scoreVal === QUIZ_QUESTIONS.length;

    return (
      <div 
        className="card" 
        style={{ 
          maxWidth: '600px', 
          margin: '2rem auto', 
          textAlign: 'center', 
          padding: '3rem 2rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.25rem' 
        }}
      >
        <div style={{ 
          width: '72px', 
          height: '72px', 
          borderRadius: '50%', 
          backgroundColor: isPerfect ? 'var(--primary-light)' : 'rgba(59, 130, 246, 0.1)', 
          color: isPerfect ? 'var(--primary)' : 'var(--accent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '0.5rem'
        }}>
          {isPerfect ? <GraduationCap size={36} /> : <Award size={36} />}
        </div>

        <h2 style={{ fontSize: '1.8rem', fontWeight: 700 }}>Quiz Completed!</h2>
        
        <div>
          <span style={{ fontSize: '3rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: isPerfect ? 'var(--primary)' : 'var(--text-main)' }}>
            {scoreVal}
          </span>
          <span style={{ fontSize: '1.5rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            / {QUIZ_QUESTIONS.length}
          </span>
        </div>

        <div style={{ fontSize: '1rem', color: 'var(--text-muted)', lineHeight: '1.6', maxWidth: '400px' }}>
          {isPerfect ? (
            <p><strong>Perfect Score! Climate Scholar unlocked! 🎓</strong> You demonstrated exemplary knowledge on environmental math and carbon emissions.</p>
          ) : scoreVal >= 3 ? (
            <p><strong>Great work! 👍</strong> You have a strong foundational understanding of carbon footprint mechanics. Try again to get 5/5 and unlock the scholar badge!</p>
          ) : (
            <p><strong>Good try!</strong> Understanding emissions takes time. Click View Scientific Sources or review the explanations to boost your score.</p>
          )}
        </div>

        <button 
          className="btn btn-primary" 
          onClick={handleRestart}
          style={{ marginTop: '1rem', gap: '0.5rem' }}
        >
          <RefreshCw size={16} />
          Retake Quiz
        </button>
      </div>
    );
  }

  return (
    <div className="card" style={{ maxWidth: '700px', margin: '1rem auto', padding: '2rem' }}>
      
      {/* Progress header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Climate Trivia Quiz
        </span>
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)', padding: '2px 8px', borderRadius: '50px', backgroundColor: 'var(--primary-light)' }}>
          Question {currentIdx + 1} of {QUIZ_QUESTIONS.length}
        </span>
      </div>

      {/* Question */}
      <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', lineHeight: '1.4' }}>
        {question.question}
      </h2>

      {/* Options List */}
      <div style={{ display: 'grid', gap: '0.75rem', marginBottom: '1.5rem' }} role="radiogroup" aria-label={question.question}>
        {question.options.map((option, idx) => {
          const isSelected = selectedOpt === idx;
          const isCorrect = idx === question.correctAnswer;
          
          let optBorder = 'var(--border)';
          let optBg = 'var(--bg-card)';
          let optColor = 'var(--text-main)';

          if (isSelected) {
            optBorder = 'var(--primary)';
            optBg = 'var(--primary-light)';
          }

          if (isSubmitted) {
            if (isCorrect) {
              optBorder = '#10b981'; // Green
              optBg = 'rgba(16, 185, 129, 0.15)';
              optColor = '#047857';
            } else if (isSelected) {
              optBorder = '#ef4444'; // Red
              optBg = 'rgba(239, 68, 68, 0.15)';
              optColor = '#b91c1c';
            }
          }

          return (
            <button
              key={idx}
              role="radio"
              aria-checked={isSelected}
              disabled={isSubmitted}
              onClick={() => handleOptionClick(idx)}
              style={{
                textAlign: 'left',
                padding: '1rem',
                borderRadius: 'var(--radius-sm)',
                border: `1px solid ${optBorder}`,
                backgroundColor: optBg,
                color: optColor,
                fontWeight: isSelected || (isSubmitted && isCorrect) ? 600 : 400,
                cursor: isSubmitted ? 'default' : 'pointer',
                transition: 'all 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
                fontSize: '0.925rem'
              }}
            >
              <span>{option}</span>
              {isSubmitted && isCorrect && <CheckCircle size={18} style={{ color: '#10b981', flexShrink: 0 }} />}
              {isSubmitted && isSelected && !isCorrect && <AlertCircle size={18} style={{ color: '#ef4444', flexShrink: 0 }} />}
            </button>
          );
        })}
      </div>

      {/* Explanation Banner */}
      {isSubmitted && (
        <div style={{ 
          padding: '1.25rem', 
          backgroundColor: 'var(--bg-app)', 
          borderRadius: 'var(--radius-sm)', 
          borderLeft: '4px solid var(--primary)',
          marginBottom: '1.5rem',
          fontSize: '0.875rem',
          lineHeight: '1.5',
          animation: 'fadeIn 0.3s ease'
        }}>
          <h4 style={{ fontWeight: 700, marginBottom: '0.25rem', color: 'var(--text-main)' }}>
            {selectedOpt === question.correctAnswer ? 'Correct! 🎉' : 'Incorrect'}
          </h4>
          <p style={{ color: 'var(--text-muted)' }}>{question.explanation}</p>
        </div>
      )}

      {/* Action Footer */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        {!isSubmitted ? (
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={selectedOpt === null}
            style={{ opacity: selectedOpt === null ? 0.5 : 1 }}
          >
            Submit Answer
          </button>
        ) : (
          <button
            className="btn btn-primary"
            onClick={handleNext}
            style={{ gap: '0.25rem' }}
          >
            {currentIdx === QUIZ_QUESTIONS.length - 1 ? 'Finish Quiz' : 'Next Question'}
            <ChevronRight size={16} />
          </button>
        )}
      </div>

    </div>
  );
}
