import React, { useState, useMemo } from 'react';
import wildlifeQuestions from './data.json';
import { Analytics } from "@vercel/analytics/react";


export default function App() {
  const [selectedAssignment, setSelectedAssignment] = useState('1');
  const [practiceMode, setPracticeMode] = useState('one_by_one');
  const [quizState, setQuizState] = useState('setup');
  const [activeQuestions, setActiveQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);

  const questionsToPractice = useMemo(() => {
    if (selectedAssignment === 'all') {
      return wildlifeQuestions.flatMap(assignment => assignment.questions);
    }
    const assignmentData = wildlifeQuestions.find(a => a.assignmentNumber.toString() === selectedAssignment);
    return assignmentData ? assignmentData.questions : [];
  }, [selectedAssignment]);

  const shuffleArray = (array) => [...array].sort(() => Math.random() - 0.5);

  const startPractice = () => {
    let questions = [];
    if (practiceMode === 'one_by_one') {
      questions = questionsToPractice;
    } else if (practiceMode === 'shuffle_assignment') {
      questions = shuffleArray(questionsToPractice);
    }
    setActiveQuestions(questions);
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedOption(null);
    setShowAnswer(false);
    setQuizState('active');
  };

  const handleOptionSelect = (option) => {
    if (!showAnswer) setSelectedOption(option);
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null) return;
    if (selectedOption === activeQuestions[currentQuestionIndex].answer) {
      setScore(prev => prev + 1);
    }
    setShowAnswer(true);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < activeQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
      setShowAnswer(false);
    } else {
      setQuizState('finished');
    }
  };

  const resetQuiz = () => {
    setQuizState('setup');
    setSelectedAssignment('1');
    setPracticeMode('one_by_one');
  };

  const currentQuestion = activeQuestions[currentQuestionIndex];

  // --- HEADER COMPONENT ---
  const Header = () => (
    <header className="w-full bg-emerald-600 text-white py-3 shadow-md flex items-center justify-center gap-3">
      
      <h1 className="text-lg font-semibold tracking-wide">MOOC : Internet of Things</h1>
    </header>
  );

  // --- FOOTER COMPONENT ---
  const Footer = () => (
    <footer className="w-full text-center text-gray-500 text-sm py-4 border-t border-gray-200 mt-10">
      Made for practicing by <span className="font-semibold text-gray-700">Ekansh Bhushan</span>
    </footer>
  );

  // --- RENDER FUNCTIONS ---
  const renderSetupScreen = () => (
    <div className="w-full max-w-lg mx-auto p-8 bg-white rounded-2xl shadow-lg border border-gray-100">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Internet of Things Practice</h1>
        <p className="text-gray-500 mt-2">Select your assignment and practice mode to begin.</p>
      </div>
      
      <div className="space-y-6">
        <div>
          <label htmlFor="assignment" className="block text-sm font-medium text-gray-700 mb-2">Assignment</label>
          <select 
            id="assignment"
            value={selectedAssignment}
            onChange={(e) => setSelectedAssignment(e.target.value)}
            className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
          >
            {wildlifeQuestions.map(assignment => (
              <option key={assignment.assignmentNumber} value={assignment.assignmentNumber}>
                Assignment {assignment.assignmentNumber}: {assignment.topic}
              </option>
            ))}
            <option value="all">All Assignments</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Practice Mode</label>
          <div className="space-y-2">
            <button 
              onClick={() => setPracticeMode('one_by_one')}
              disabled={selectedAssignment === 'all'}
              className={`w-full text-left p-3 rounded-lg border-2 transition ${practiceMode === 'one_by_one' ? 'bg-emerald-100 border-emerald-500' : 'bg-white border-gray-200 hover:border-emerald-400'} ${selectedAssignment === 'all' ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <h3 className="font-semibold text-gray-800">One at a Time</h3>
              <p className="text-xs text-gray-500">Go through questions in their original order.</p>
            </button>
            <button 
              onClick={() => setPracticeMode('shuffle_assignment')}
              className={`w-full text-left p-3 rounded-lg border-2 transition ${practiceMode === 'shuffle_assignment' ? 'bg-emerald-100 border-emerald-500' : 'bg-white border-gray-200 hover:border-emerald-400'}`}
            >
              <h3 className="font-semibold text-gray-800">Random Shuffle</h3>
              <p className="text-xs text-gray-500">Shuffle questions from the selected assignment(s).</p>
            </button>
          </div>
        </div>

        <button 
          onClick={startPractice}
          disabled={!questionsToPractice.length}
          className="w-full bg-emerald-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-300 transition-transform transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Start Practice
        </button>
      </div>
    </div>
  );

  const renderActiveQuizScreen = () => (
    <div className="w-full max-w-2xl mx-auto p-8 bg-white rounded-2xl shadow-lg border border-gray-100">
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-gray-500">
          Question <span className="font-bold text-gray-800">{currentQuestionIndex + 1}</span> / {activeQuestions.length}
        </div>
        <div className="text-sm font-semibold bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full">
          Score: {score}
        </div>
      </div>
      
      <div className="h-1 bg-gray-200 rounded-full mb-6">
        <div 
          className="h-1 bg-emerald-500 rounded-full transition-all duration-300" 
          style={{ width: `${((currentQuestionIndex + 1) / activeQuestions.length) * 100}%` }}
        ></div>
      </div>

      <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-6">{currentQuestion.question}</h2>

      <div className="space-y-3">
        {currentQuestion.options.map((option, index) => {
          const isCorrect = option === currentQuestion.answer;
          const isSelected = option === selectedOption;

          let buttonClass = "w-full text-left p-4 rounded-lg border-2 transition-all duration-200 text-gray-700 ";
          
          if (showAnswer) {
            if (isCorrect) {
              buttonClass += "bg-green-100 border-green-500 ring-2 ring-green-400";
            } else if (isSelected && !isCorrect) {
              buttonClass += "bg-red-100 border-red-500";
            } else {
              buttonClass += "bg-gray-50 border-gray-200";
            }
          } else {
            if (isSelected) {
              buttonClass += "bg-blue-100 border-blue-500 ring-2 ring-blue-400";
            } else {
              buttonClass += "bg-white border-gray-300 hover:bg-gray-50 hover:border-blue-400";
            }
          }

          return (
            <button key={index} onClick={() => handleOptionSelect(option)} className={buttonClass} disabled={showAnswer}>
              {option}
            </button>
          );
        })}
      </div>

      <div className="mt-8 text-center">
        {showAnswer ? (
          <button 
            onClick={handleNextQuestion}
            className="w-full md:w-auto bg-emerald-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-300 transition-transform transform hover:scale-105"
          >
            {currentQuestionIndex === activeQuestions.length - 1 ? 'Finish Quiz' : 'Next Question'}
          </button>
        ) : (
          <button 
            onClick={handleSubmitAnswer}
            disabled={selectedOption === null}
            className="w-full md:w-auto bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:bg-gray-400 disabled:cursor-not-allowed transition-transform transform hover:scale-105"
          >
            Submit Answer
          </button>
        )}
      </div>
    </div>
  );

  const renderFinishedScreen = () => {
    const percentage = Math.round((score / activeQuestions.length) * 100);
    return (
      <div className="w-full max-w-lg mx-auto p-8 text-center bg-white rounded-2xl shadow-lg border border-gray-100">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Quiz Complete!</h2>
        <p className="text-gray-500 mb-6">You've finished the practice session.</p>
        
        <div className="bg-emerald-50 p-6 rounded-xl mb-8">
          <p className="text-lg text-emerald-800">Your Score</p>
          <p className="text-5xl font-extrabold text-emerald-600 my-2">{score} / {activeQuestions.length}</p>
          <p className="text-2xl font-semibold text-emerald-700">{percentage}%</p>
        </div>
        
        <button 
          onClick={resetQuiz}
          className="w-full bg-emerald-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-300 transition-transform transform hover:scale-105"
        >
          Practice Again
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 flex flex-col">
      <Header /> {/* --- Added Header --- */}
      <main className="flex-1 flex items-center justify-center p-4">
        {quizState === 'setup' && renderSetupScreen()}
        {quizState === 'active' && currentQuestion && renderActiveQuizScreen()}
        {quizState === 'finished' && renderFinishedScreen()}
      </main>
      <Footer /> {/* --- Added Footer --- */}
      <Analytics />
    </div>
  );
}
