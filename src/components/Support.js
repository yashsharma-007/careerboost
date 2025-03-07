import { useState } from 'react';
import { useSpring, animated } from 'react-spring';
import { FaUser, FaSignOutAlt, FaTrophy, FaBook, FaBriefcase, FaFileAlt, FaTasks, FaComments, FaUsers, FaHome, FaPaperPlane, FaQuestionCircle, FaRobot } from 'react-icons/fa';
import { GoogleGenerativeAI } from '@google/generative-ai';
import '../s.css';

const Support = ({ user, onLogout, setView }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  const fadeIn = useSpring({ from: { opacity: 0 }, to: { opacity: 1 }, config: { duration: 500 } });

  const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY || '');
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const systemPrompt = `
You are CareerBot, an AI assistant for the CareerBoost app. Your primary role is to help users with:
1. **Interview Preparation**: Provide mock interview questions, tips for answering common questions (e.g., "Tell me about yourself"), and feedback on practice answers if requested.
2. **CareerBoost App Support**: Answer questions about using the app, such as adding goals, connecting with people, downloading resumes, earning badges, or navigating features.

Keep your responses concise, friendly, and actionable. If a user asks about interview prep, offer relevant examples or advice. If they ask about the app, provide step-by-step guidance based on CareerBoost’s features. For anything else, gently steer them back to these topics or suggest they explore the app.
`;

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setChatLoading(true);
    const userMsg = { id: Date.now(), content: newMessage, isUser: true, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);

    try {
      if (!process.env.REACT_APP_GEMINI_API_KEY) throw new Error('Gemini API key not set in .env');
      const fullPrompt = `${systemPrompt}\n\nUser: ${newMessage}`;
      const result = await model.generateContent({
        contents: [{ parts: [{ text: fullPrompt }] }],
      });
      const responseText = result.response.text();
      const botMsg = { id: Date.now() + 1, content: responseText, isUser: false, timestamp: new Date().toISOString() };

      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error('Chatbot error:', error);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        content: `Oops! Something went wrong: ${error.message}. Check your API key or try again.`,
        isUser: false,
        timestamp: new Date().toISOString(),
      }]);
    }

    setNewMessage('');
    setChatLoading(false);
  };

  return (
    <div className="flex">
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
          <li onClick={() => setView('interview')}><FaComments /> Interview</li>
          <li onClick={() => setView('forum')}><FaUsers /> Forum</li>
          <li onClick={() => setView('people')}><FaUsers /> People</li>
          <li onClick={() => setView('messages')}><FaComments /> Messages</li>
          <li className="active" onClick={() => setView('support')}><FaQuestionCircle /> Support</li>
          <li onClick={onLogout}><FaSignOutAlt /> Logout</li>
        </ul>
      </div>

      <animated.div style={fadeIn} className="main-content">
        <header className="header">
          <h2>Support & Help</h2>
        </header>

        <animated.div style={fadeIn} className="support-container">
          <div className="faq-section">
            <h3>Frequently Asked Questions</h3>
            <animated.div style={fadeIn} className="faq-card">
              <h4>How do I connect with others?</h4>
              <p>Go to "People," find users, and click "Connect." Once accepted, chat via "Messages."</p>
            </animated.div>
            <animated.div style={fadeIn} className="faq-card">
              <h4>How do I earn badges?</h4>
              <p>Complete courses and tasks to earn badges displayed on your profile.</p>
            </animated.div>
            <animated.div style={fadeIn} className="faq-card">
              <h4>How do I download my resume?</h4>
              <p>Visit "Resume" and click "Download Resume (PDF)."</p>
            </animated.div>
          </div>

          <div className="chatbot-section">
            <h3><FaRobot /> Chat with CareerBot</h3>
            <animated.div style={fadeIn} className="chatbot-messages">
              {messages.length === 0 && (
                <p className="chat-welcome">Hi! I’m CareerBot, here to help with CareerBoost. Ask me anything!</p>
              )}
              {messages.map(m => (
                <animated.div key={m.id} style={fadeIn} className={`message ${m.isUser ? 'sent' : 'received'}`}>
                  <p>{m.content}</p>
                  <span>{new Date(m.timestamp).toLocaleTimeString()}</span>
                </animated.div>
              ))}
              {chatLoading && <p className="chat-loading">CareerBot is thinking...</p>}
            </animated.div>
            <form className="chatbot-form" onSubmit={handleSendMessage}>
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Ask CareerBot anything..."
                rows="3"
                disabled={chatLoading}
              />
              <button type="submit" disabled={chatLoading}><FaPaperPlane /> Send</button>
            </form>
          </div>
        </animated.div>
      </animated.div>
    </div>
  );
};

export default Support;