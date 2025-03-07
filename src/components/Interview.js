import { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { useSpring, animated } from 'react-spring';
import { FaUser, FaSignOutAlt, FaTrophy, FaBook, FaBriefcase, FaFileAlt, FaTasks, FaComments, FaUsers, FaHome, FaQuestionCircle, FaMicrophone, FaClock, FaHistory, FaStar } from 'react-icons/fa';
import { GoogleGenerativeAI } from '@google/generative-ai';
import '../global.css';
import '../sidebar.css';
import '../main.css';
import '../stylei.css';


const Interview = ({ user, onLogout, setView }) => {
  const [mockQuestion, setMockQuestion] = useState('');
  const [userAnswer, setUserAnswer] = useState('');
  const [realTimeFeedback, setRealTimeFeedback] = useState('');
  const [domain, setDomain] = useState('Software Engineering');
  const [simulatorActive, setSimulatorActive] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const [timer, setTimer] = useState(0); // Seconds
  const [questionHistory, setQuestionHistory] = useState([]);
  const [difficulty, setDifficulty] = useState('');
  const [interviewerMessage, setInterviewerMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [mockLoading, setMockLoading] = useState(false);
  const feedbackTimeoutRef = useRef(null);
  const askedQuestionsRef = useRef([]); // Track asked questions

  const fadeIn = useSpring({ from: { opacity: 0 }, to: { opacity: 1 }, config: { duration: 500 } });

  // Initialize Gemini with your API key
  const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY || '');
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  useEffect(() => {
    let interval;
    if (simulatorActive) {
      interval = setInterval(() => setTimer(prev => prev + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [simulatorActive]);

  const startMockInterview = async () => {
    setMockLoading(true);
    setSimulatorActive(true);
    setUserAnswer('');
    setRealTimeFeedback('');
    setQuestionCount(0);
    setTimer(0);
    setQuestionHistory([]);
    askedQuestionsRef.current = [];
    setInterviewerMessage(`Hi there! I’m your ${domain} interviewer. Ready for a fresh challenge?`);
    await fetchNewQuestion();
    setMockLoading(false);
  };

  const fetchNewQuestion = async () => {
    setMockLoading(true);
    try {
      const difficulties = ['Easy', 'Medium', 'Hard'];
      const randomDifficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
      const timestamp = Date.now(); // Add timestamp for uniqueness
      const prompt = `
      You are an interview coach for CareerBoost. Generate a unique, domain-specific interview question for an intermediate user in ${domain} at a ${randomDifficulty} difficulty level. Avoid repeating these questions: ${JSON.stringify(askedQuestionsRef.current)}. Ensure variety and relevance to ${domain}. Include a timestamp ${timestamp} to force uniqueness. Return in JSON format:
      {
        "question": "How would you ${domain === 'Software Engineering' ? 'refactor a legacy codebase' : 'design a customer retention strategy'} ${randomDifficulty === 'Hard' ? 'under tight deadlines' : 'for optimal performance'}?",
        "difficulty": "${randomDifficulty}"
      }
      `;
      const result = await model.generateContent({ 
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.9, // Increase creativity
          topK: 40, // Broader sampling
          topP: 0.95, // Diverse outputs
        }
      });
      const responseText = result.response.text();
      const { question, difficulty } = JSON.parse(responseText);

      // Double-check uniqueness
      if (!askedQuestionsRef.current.includes(question)) {
        setMockQuestion(question);
        setDifficulty(difficulty);
        setQuestionCount(prev => prev + 1);
        askedQuestionsRef.current.push(question);
      } else {
        await fetchNewQuestion(); // Retry if duplicate
      }
    } catch (error) {
      console.error('Mock question error:', error);
      const fallbackQuestion = `Describe a ${domain} problem you solved recently.`;
      if (!askedQuestionsRef.current.includes(fallbackQuestion)) {
        setMockQuestion(fallbackQuestion);
        setDifficulty('Medium');
        setQuestionCount(prev => prev + 1);
        askedQuestionsRef.current.push(fallbackQuestion);
      } else {
        setMockQuestion(`Tell me about your experience with ${domain} tools.`);
        setDifficulty('Easy');
        setQuestionCount(prev => prev + 1);
        askedQuestionsRef.current.push(`Tell me about your experience with ${domain} tools.`);
      }
    }
    setMockLoading(false);
  };

  const handleAnswerChange = (e) => {
    const answer = e.target.value;
    setUserAnswer(answer);

    if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
    feedbackTimeoutRef.current = setTimeout(async () => {
      if (answer.trim().length > 20) {
        try {
          const prompt = `
          You are an interview coach for CareerBoost. The user was asked: "${mockQuestion}" (${difficulty}).
          Their current answer is: "${answer}".
          Provide real-time feedback (under 100 words) on clarity, structure (e.g., STAR), and relevance to ${domain}. Return in JSON format:
          {
            "feedback": "Solid—add ${domain}-specific examples and STAR structure."
          }
          `;
          const result = await model.generateContent({ contents: [{ parts: [{ text: prompt }] }] });
          const { feedback } = JSON.parse(result.response.text());
          setRealTimeFeedback(feedback);
        } catch (error) {
          console.error('Real-time feedback error:', error);
          setRealTimeFeedback(`Good effort—link it to ${domain} with more detail!`);
        }
      } else {
        setRealTimeFeedback('');
      }
    }, 1000); // 1s debounce
  };

  const submitAnswer = async () => {
    setMockLoading(true);
    setQuestionHistory(prev => [...prev, { question: mockQuestion, answer: userAnswer, feedback: realTimeFeedback, difficulty }].slice(-5));
    setUserAnswer('');
    setRealTimeFeedback('');
    await fetchNewQuestion();
    setMockLoading(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' + secs : secs}`;
  };

  if (loading) return <div className="spinner"><div></div></div>;

  return (
    <div className="flex">
      {/* Sidebar - Unchanged */}
      <div className="sidebar">
        <h1>CareerBoost</h1>
        <ul>
          <li onClick={() => setView('dashboard')}><FaHome /> Dashboard</li>
          <li onClick={() => setView('profile')}><FaUser /> Profile</li>
          <li onClick={() => setView('jobs')}><FaBriefcase /> Jobs</li>
          <li onClick={() => setView('courses')}><FaBook /> Courses</li>
          <li onClick={() => setView('resume')}><FaFileAlt /> Resume</li>
          <li onClick={() => setView('tasks')}><FaTasks /> Tasks</li>
          <li onClick={() => setView('contests')}><FaTrophy /> Contests</li>
          <li className="active" onClick={() => setView('interview')}><FaComments /> Interview</li>
          <li onClick={() => setView('forum')}><FaUsers /> Forum</li>
          <li onClick={() => setView('people')}><FaUsers /> People</li>
          <li onClick={() => setView('messages')}><FaComments /> Messages</li>
          <li onClick={() => setView('support')}><FaQuestionCircle /> Support</li>
          <li onClick={() => setView('career-goals')}><FaBook /> Career Goals</li>
          <li onClick={onLogout}><FaSignOutAlt /> Logout</li>
        </ul>
      </div>

      {/* Main Content */}
      <animated.div style={fadeIn} className="main-content">
        <header className="header">
          <h2>Live Interview Simulator</h2>
          <p>Step into a dynamic {domain} interview!</p>
        </header>

        <div className="interview-simulator">
          {/* Controls */}
          <div className="simulator-controls">
            <div className="domain-selector">
              <label>Domain: </label>
              <select value={domain} onChange={e => setDomain(e.target.value)} disabled={simulatorActive}>
                <option value="Software Engineering">Software Engineering</option>
                <option value="Data Science">Data Science</option>
                <option value="Marketing">Marketing</option>
                <option value="Design">Design</option>
                <option value="Project Management">Project Management</option>
              </select>
            </div>
            {simulatorActive && (
              <div className="interview-stats">
                <p><FaClock /> Time: {formatTime(timer)}</p>
                <p>Questions: {questionCount}</p>
              </div>
            )}
          </div>

          {/* Simulator Panel */}
          <div className="simulator-content">
            {!simulatorActive ? (
              <div className="start-panel">
                <h3><FaMicrophone /> Your Interview Awaits</h3>
                <p>Choose your domain and dive into a real-time {domain} interview!</p>
                <button onClick={startMockInterview} disabled={mockLoading}>
                  {mockLoading ? 'Starting...' : 'Begin Interview'}
                </button>
              </div>
            ) : (
              <div className="active-panel">
                {interviewerMessage && questionCount === 1 && (
                  <animated.div style={fadeIn} className="interviewer-message">
                    <p>{interviewerMessage}</p>
                  </animated.div>
                )}
                <div className="question-header">
                  <p className="mock-question">{mockQuestion}</p>
                  <span className={`difficulty ${difficulty.toLowerCase()}`}>
                    <FaStar /> {difficulty}
                  </span>
                </div>
                <textarea
                  placeholder="Type your answer here (live feedback below)..."
                  value={userAnswer}
                  onChange={handleAnswerChange}
                  rows={6}
                  disabled={mockLoading}
                />
                {realTimeFeedback && (
                  <animated.div style={fadeIn} className="real-time-feedback">
                    <h4>Live Feedback</h4>
                    <p>{realTimeFeedback}</p>
                  </animated.div>
                )}
                <div className="action-buttons">
                  <button onClick={submitAnswer} disabled={mockLoading || !userAnswer.trim()}>
                    {mockLoading ? 'Loading...' : 'Next Question'}
                  </button>
                  <button onClick={() => setSimulatorActive(false)}>End Interview</button>
                </div>
              </div>
            )}
          </div>

          {/* History */}
          <div className="question-history">
            <h3><FaHistory /> Recent Answers (Last 5)</h3>
            {questionHistory.length ? (
              questionHistory.map((entry, idx) => (
                <animated.div key={idx} style={fadeIn} className="history-entry">
                  <p><strong>Q:</strong> {entry.question} ({entry.difficulty})</p>
                  <p><strong>A:</strong> {entry.answer.slice(0, 50)}...</p>
                  <p><strong>Feedback:</strong> {entry.feedback}</p>
                </animated.div>
              ))
            ) : (
              <p>Answer questions to build your history!</p>
            )}
          </div>
        </div>
      </animated.div>
    </div>
  );
};

export default Interview;