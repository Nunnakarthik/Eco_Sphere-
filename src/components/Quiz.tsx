import { useState } from 'react';
import { QUIZ_QUESTIONS } from '../utils/constants';
import { Award, CheckCircle, AlertCircle, RefreshCw, ChevronRight, GraduationCap, Flame, Star } from 'lucide-react';

interface QuizProps {
  onQuizCompleted: (score: number) => void;
  quizScore: number | null;
  onResetQuiz: () => void;
  quizAttemptedToday: boolean;
  streak: number;
  points: number;
}

function selectRandomQuestions(pool: typeof QUIZ_QUESTIONS, count: number): typeof QUIZ_QUESTIONS {
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export default function Quiz({ onQuizCompleted, quizScore, onResetQuiz, quizAttemptedToday, streak, points }: QuizProps) {
  const [activeQuestions, setActiveQuestions] = useState(() => {
    return selectRandomQuestions(QUIZ_QUESTIONS, 1);
  });
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [localScore, setLocalScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(quizScore !== null);

  const question = activeQuestions[currentIdx];

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
    if (currentIdx < activeQuestions.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setSelectedOpt(null);
      setIsSubmitted(false);
    } else {
      setQuizFinished(true);
      onQuizCompleted(localScore);
    }
  };

  const handleRestart = () => {
    setActiveQuestions(selectRandomQuestions(QUIZ_QUESTIONS, 1));
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
    const isPerfect = scoreVal === activeQuestions.length;

    return (
      <div 
        className="card" 
        style={{ 
          maxWidth: '750px', 
          margin: '2rem auto', 
          padding: '2.5rem',
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: '2.5rem',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {/* Left Side: Results Info */}
        <div style={{ flex: '1 1 350px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem', textAlign: 'center' }}>
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

          <h2 style={{ fontSize: '1.8rem', fontWeight: 700, margin: 0 }}>Quiz Completed!</h2>
          
          <div>
            <span style={{ fontSize: '3.5rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: isPerfect ? 'var(--primary)' : 'var(--text-main)', lineHeight: 1 }}>
              {scoreVal}
            </span>
            <span style={{ fontSize: '1.5rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              / {activeQuestions.length}
            </span>
          </div>

          {/* Perfect styling for the message block */}
          <div style={{
            padding: '1.25rem',
            backgroundColor: isPerfect ? 'var(--primary-light)' : 'rgba(59, 130, 246, 0.05)',
            border: isPerfect ? '1px solid var(--primary)' : '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-main)',
            fontSize: '0.925rem',
            lineHeight: '1.5',
            fontWeight: 500,
            textAlign: 'left',
            boxShadow: 'var(--shadow-sm)',
            width: '100%',
            maxWidth: '440px',
            animation: 'fadeIn 0.3s ease'
          }}>
            {isPerfect ? (
              <span style={{ display: 'block' }}>
                <strong style={{ color: 'var(--primary)', display: 'block', fontSize: '1.05rem', marginBottom: '0.35rem' }}>
                  🎓 Perfect Score! +1 Eco Point earned!
                </strong>
                You completed today's quiz task successfully and extended your active daily streak! 🔥
              </span>
            ) : (
              <span style={{ display: 'block' }}>
                <strong style={{ color: 'var(--accent)', display: 'block', fontSize: '1.05rem', marginBottom: '0.35rem' }}>
                  📝 Quiz Task Completed!
                </strong>
                You extended your active daily streak! 🔥 Score 1/1 on future quizzes to earn exactly 1 Eco Point and unlock grandmaster achievements.
              </span>
            )}
          </div>

          {quizAttemptedToday ? (
            <div style={{
              marginTop: '0.5rem',
              padding: '0.625rem 1.25rem',
              backgroundColor: 'var(--primary-light)',
              color: 'var(--primary)',
              borderRadius: 'var(--radius-sm)',
              fontWeight: 600,
              fontSize: '0.9rem',
              border: '1px solid var(--primary)',
              width: '100%',
              maxWidth: '440px'
            }}>
              🏆 Daily Task Completed! Come back tomorrow.
            </div>
          ) : (
            <button 
              className="btn btn-primary" 
              onClick={handleRestart}
              style={{ marginTop: '0.5rem', gap: '0.5rem', width: '100%', maxWidth: '440px' }}
            >
              <RefreshCw size={16} />
              Retake Quiz
            </button>
          )}
        </div>

        {/* Right Side: Aside Profile Stats Panel */}
        <div style={{ 
          flex: '1 1 220px', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '1.5rem',
          backgroundColor: 'var(--bg-app)',
          padding: '1.75rem 1.5rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-sm)',
          alignSelf: 'stretch',
          justifyContent: 'center'
        }}>
          <h3 style={{ 
            fontSize: '0.85rem', 
            fontWeight: 700, 
            borderBottom: '1px solid var(--border)', 
            paddingBottom: '0.5rem', 
            margin: 0, 
            textAlign: 'center', 
            color: 'var(--text-muted)', 
            textTransform: 'uppercase', 
            letterSpacing: '0.5px' 
          }}>
            Your Profile Stats
          </h3>
          
          {/* Streak Stat */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', color: '#f59e0b', marginBottom: '0.35rem' }}>
              <div className="streak-active-glow" style={{ borderRadius: '50%', backgroundColor: 'rgba(245,158,11,0.1)', padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Flame size={28} fill="#f59e0b" />
              </div>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>{streak}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.25px' }}>Daily Streak</div>
          </div>

          {/* Points Stat */}
          <div style={{ textAlign: 'center', borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'center', color: 'var(--primary)', marginBottom: '0.35rem' }}>
              <div style={{ borderRadius: '50%', backgroundColor: 'var(--primary-light)', padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Star size={28} fill="var(--primary)" />
              </div>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>{points}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.25px' }}>Quiz Points</div>
          </div>
        </div>
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
          Question {currentIdx + 1} of {activeQuestions.length}
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
              className="quiz-option-btn"
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
            {currentIdx === activeQuestions.length - 1 ? 'Finish Quiz' : 'Next Question'}
            <ChevronRight size={16} />
          </button>
        )}
      </div>

    </div>
  );
}
