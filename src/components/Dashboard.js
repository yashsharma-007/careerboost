import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useSpring, animated } from 'react-spring';
import { VerticalTimeline, VerticalTimelineElement } from 'react-vertical-timeline-component';
import 'react-vertical-timeline-component/style.min.css';
import { FaUser, FaSignOutAlt, FaTrophy, FaBook, FaBriefcase, FaFileAlt, FaTasks, FaComments, FaUsers, FaHome, FaBell, FaCode, FaGraduationCap, FaBullseye, FaQuestionCircle, FaClipboardList, FaCheckCircle,FaFire,FaLightbulb } from 'react-icons/fa';
import { GoogleGenerativeAI } from '@google/generative-ai';
import '../global.css';
import '../sidebar.css';
import '../main.css';
import '../dashboard.css';
import '../people.css';

const Dashboard = ({ user, onLogout, setView }) => {
  const [stats, setStats] = useState({
    jobApplications: 0,
    courseCompletions: 0,
    taskProgress: 0,
    contestScore: 0,
    connectionsCount: 0,
    goalProgress: 0,
  });
  const [notifications, setNotifications] = useState([]);
  const [timelineEvents, setTimelineEvents] = useState([]);
  const [quizStep, setQuizStep] = useState(0);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [quizAnswers, setQuizAnswers] = useState([]);
  const [recommendedCourses, setRecommendedCourses] = useState([]);
  const [courses, setCourses] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [streak, setStreak] = useState(0);
  const [quickTip, setQuickTip] = useState('');
  const [loading, setLoading] = useState(true);
  const [quizLoading, setQuizLoading] = useState(false);

  const fadeIn = useSpring({ from: { opacity: 0 }, to: { opacity: 1 }, config: { duration: 500 } });

  const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY || '');
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        const { data: jobsData } = await supabase.from('jobs').select('id, title, applied, created_at').eq('user_id', user.id);
        const { data: coursesData } = await supabase.from('courses').select('id, title, category, difficulty, completed, created_at').eq('user_id', user.id);
        const { data: goalsData } = await supabase.from('goals').select('id, title, created_at').eq('user_id', user.id);
        const { data: tasksData } = await supabase.from('tasks').select('id, title, status, goal_id, created_at').eq('user_id', user.id);
        const { data: notificationsData } = await supabase.from('notifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
        const { data: activityData } = await supabase.from('user_activity').select('activity_date').eq('user_id', user.id).eq('activity_type', 'login').order('activity_date', { ascending: false });

        // Log today's login
        await supabase.from('user_activity').upsert({
          user_id: user.id,
          activity_date: new Date().toISOString().split('T')[0],
          activity_type: 'login',
        });

        // Calculate streak
        const sortedDates = activityData?.map(a => new Date(a.activity_date).toISOString().split('T')[0]).sort((a, b) => b.localeCompare(a)) || [];
        let currentStreak = 0;
        const today = new Date();
        for (let i = 0; i < sortedDates.length; i++) {
          const date = new Date(sortedDates[i]);
          const diffDays = Math.floor((today - date) / (1000 * 60 * 60 * 24));
          if (diffDays === i) currentStreak++;
          else break;
        }
        setStreak(currentStreak);

        const totalTasks = tasksData?.length || 0;
        const completedTasks = tasksData?.filter(t => t.status === 'completed').length || 0;
        const taskProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        const goalProgress = goalsData?.length > 0 ? Math.round(
          (await Promise.all(goalsData.map(async goal => {
            const goalTasks = tasksData.filter(t => t.goal_id === goal.id);
            return goalTasks.length > 0 && goalTasks.every(t => t.status === 'completed');
          })).then(results => results.filter(Boolean).length / goalsData.length)) * 100
        ) : 0;

        setStats({
          jobApplications: jobsData?.length || 0,
          courseCompletions: coursesData?.filter(c => c.completed).length || 0,
          taskProgress,
          contestScore: 0,
          connectionsCount: 0,
          goalProgress,
        });

        const events = [
          ...(coursesData?.map(course => ({
            date: new Date(course.created_at),
            title: `Completed Course: ${course.title}`,
            icon: <FaGraduationCap />,
            completed: course.completed,
          })) || []),
          ...(goalsData?.map(goal => ({
            date: new Date(goal.created_at),
            title: `Set Goal: ${goal.title}`,
            icon: <FaBullseye />,
            completed: tasksData.filter(t => t.goal_id === goal.id).every(t => t.status === 'completed'),
          })) || []),
          ...(jobsData?.map(job => ({
            date: new Date(job.created_at),
            title: `Applied for Job: ${job.title}`,
            icon: <FaBriefcase />,
            completed: job.applied,
          })) || []),
        ].sort((a, b) => a.date - b.date);

        setTimelineEvents(events);
        setNotifications(notificationsData || []);
        setCourses(coursesData || []);
        setTasks(tasksData || []);

        // Fetch quick tip from Gemini
        const tipPrompt = `Provide a short, actionable career tip for a user of the CareerBoost app. Keep it under 50 words.`;
        const tipResult = await model.generateContent({ contents: [{ parts: [{ text: tipPrompt }] }] });
        setQuickTip(tipResult.response.text());
      } catch (error) {
        console.error('Error fetching stats:', error.message);
        setQuickTip("Keep learning daily—small steps lead to big career wins!");
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    const notificationsSubscription = supabase
      .channel('notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` }, payload => {
        setNotifications(prev => [payload.new, ...prev]);
      })
      .subscribe();

    return () => supabase.removeChannel(notificationsSubscription);
  }, [user]);

  const startQuiz = async () => {
    setQuizLoading(true);
    try {
      const prompt = `
      Generate 5 unique, multiple-choice questions to assess a user's career interests, skill level, and learning preferences for personalized course recommendations in the CareerBoost app. Each question should have 3-4 clear, relevant options. Avoid duplicates and keep it career-focused. Return in JSON format:
      {
        "questions": [
          {"question": "What’s your dream career path?", "options": ["Software Developer", "Graphic Designer", "Data Analyst", "Project Manager"]},
          {"question": "How would you rate your current skills?", "options": ["Just Starting", "Some Experience", "Confident", "Expert"]},
          ...
        ]
      }
      `;
      const result = await model.generateContent({ contents: [{ parts: [{ text: prompt }] }] });
      const responseText = result.response.text();
      const quizData = JSON.parse(responseText);
      setQuizQuestions(quizData.questions);
      setQuizStep(1);
    } catch (error) {
      console.error('Quiz generation error:', error);
      setQuizQuestions([
        { question: "What’s your dream career path?", options: ["Software Developer", "Graphic Designer", "Data Analyst"] },
        { question: "How would you rate your current skills?", options: ["Just Starting", "Some Experience", "Confident"] },
        { question: "What area excites you most?", options: ["Coding", "Design", "Data"] },
        { question: "How fast do you like to learn?", options: ["Quickly", "Steadily", "At My Own Pace"] },
        { question: "What’s your next step?", options: ["Build Projects", "Learn Theory", "Get Certified"] },
      ]);
      setQuizStep(1);
    }
    setQuizLoading(false);
  };

  const handleQuizAnswer = async (answer) => {
    const newAnswers = [...quizAnswers, { question: quizQuestions[quizStep - 1].question, answer }];
    setQuizAnswers(newAnswers);

    if (quizStep < quizQuestions.length) {
      setQuizStep(prev => prev + 1);
    } else {
      setQuizLoading(true);
      try {
        const prompt = `
        You are a career advisor for the CareerBoost app. Based on these quiz answers: ${JSON.stringify(newAnswers)},
        recommend 3 specific courses tailored to the user's career path, skill level, interests, and learning preferences.
        For each recommendation, provide a title, category (e.g., Programming, Design, Data Science), difficulty (Beginner, Intermediate, Advanced), and a short reason why it fits. Use the user's existing courses (${JSON.stringify(courses.map(c => ({ title: c.title, category: c.category, difficulty: c.difficulty })))}) as a reference if possible, but suggest new courses if no exact matches exist. Return in JSON format:
        {
          "recommendations": [
            {"title": "React Basics", "category": "Programming", "difficulty": "Intermediate", "reason": "Perfect for building web skills with some experience"},
            ...
          ]
        }
        `;
        const result = await model.generateContent({ contents: [{ parts: [{ text: prompt }] }] });
        const responseText = result.response.text();
        const { recommendations } = JSON.parse(responseText);

        const finalRecommendations = recommendations.map(rec => {
          const existingCourse = courses.find(c => c.title.toLowerCase() === rec.title.toLowerCase() && !c.completed);
          return existingCourse ? { ...existingCourse, reason: rec.reason } : rec;
        }).slice(0, 3);

        setRecommendedCourses(finalRecommendations);
        setQuizStep(-1);
      } catch (error) {
        console.error('Recommendation error:', error);
        setRecommendedCourses([
          { title: "Intro to Coding", category: "Programming", difficulty: "Beginner", reason: "A great starting point for any career path" },
          { title: "Design Fundamentals", category: "Design", difficulty: "Beginner", reason: "Builds core skills for creative roles" },
          { title: "Data Analysis Basics", category: "Data Science", difficulty: "Intermediate", reason: "Good for exploring data-driven careers" },
        ]);
        setQuizStep(-1);
      }
      setQuizLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    const { error } = await supabase.from('notifications').update({ is_read: true }).eq('id', notificationId);
    if (!error) setNotifications(notifications.map(n => n.id === notificationId ? { ...n, is_read: true } : n));
  };

  if (loading) return <div className="spinner"><div></div></div>;

  return (
    <div className="flex">
      <div className="sidebar">
        <h1>CareerBoost</h1>
        <ul>
          <li className="active" onClick={() => setView('dashboard')}><FaHome /> Dashboard</li>
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
          <li onClick={() => setView('support')}><FaQuestionCircle /> Support</li>
          <li onClick={onLogout}><FaSignOutAlt /> Logout</li>
        </ul>
      </div>

      <div className="main-content">
        {/* Dynamic Welcome Banner */}
        <animated.div style={fadeIn} className="welcome-banner">
          <h2>Hey {user.email.split('@')[0]}, Boost Your Career Today!</h2>
          <p>{streak > 0 ? `You’re on a ${streak}-day streak—keep it up!` : 'Start your streak today!'}</p>
        </animated.div>

        <animated.div style={fadeIn} className="dashboard-grid">
          <div className="dashboard-section roadmap-section">
            <h3>Your Career Roadmap</h3>
            <VerticalTimeline lineColor="var(--primary)">
              {timelineEvents.map((event, index) => (
                <VerticalTimelineElement
                  key={index}
                  date={event.date.toLocaleDateString()}
                  iconStyle={{ 
                    background: event.completed ? 'var(--secondary)' : 'var(--gray)', 
                    color: '#fff' 
                  }}
                  icon={event.icon}
                  contentStyle={{ 
                    background: 'var(--gray-light)', 
                    border: '1px solid var(--gray)', 
                    boxShadow: 'var(--shadow)' 
                  }}
                  contentArrowStyle={{ 
                    borderRight: '7px solid var(--gray-light)' 
                  }}
                >
                  <h4>{event.title}</h4>
                  <p>{event.completed ? 'Completed' : 'In Progress'}</p>
                </VerticalTimelineElement>
              ))}
            </VerticalTimeline>
          </div>

          <div className="dashboard-section">
            {/* Streak Tracker */}
            <div className="streak-tracker">
              <h3><FaFire /> Your Streak</h3>
              <p>{streak} Day{streak !== 1 ? 's' : ''}</p>
              <div className="streak-bar">
                {[...Array(7)].map((_, i) => (
                  <div key={i} className={`streak-day ${i < streak ? 'active' : ''}`}></div>
                ))}
              </div>
              <p className="streak-message">{streak > 0 ? 'Keep the fire burning!' : 'Log in tomorrow to start!'}</p>
            </div>

            {/* Quick Tips */}
            <div className="quick-tip">
              <h3><FaLightbulb /> Quick Tip</h3>
              <p>{quickTip}</p>
            </div>

            {/* Mini-Progress Dashboard */}
            <div className="mini-progress">
              <h3>Your Progress Snapshot</h3>
              <div className="progress-item">
                <p>Ongoing Tasks: {tasks.filter(t => t.status !== 'completed').length}</p>
                <div className="progress-bar"><div style={{ width: `${stats.taskProgress}%` }}></div></div>
              </div>
              <div className="progress-item">
                <p>Active Courses: {courses.filter(c => !c.completed).length}</p>
                <div className="progress-bar"><div style={{ width: `${(stats.courseCompletions / (courses.length || 1)) * 100}%` }}></div></div>
              </div>
              <button onClick={() => setView('tasks')}>View Tasks</button>
              <button onClick={() => setView('courses')}>View Courses</button>
            </div>

            {/* Quiz Section */}
            <h3><FaClipboardList /> Dynamic Career Quiz</h3>
            {quizStep === 0 && (
              <animated.div style={fadeIn} className="quiz-card">
                <p>Discover courses tailored just for you—take the quiz!</p>
                <button onClick={startQuiz} disabled={quizLoading}>
                  {quizLoading ? 'Getting Ready...' : 'Start Quiz'}
                </button>
              </animated.div>
            )}
            {quizStep > 0 && quizStep <= quizQuestions.length && (
              <animated.div style={fadeIn} className="quiz-card">
                <h4>{quizQuestions[quizStep - 1].question}</h4>
                <div className="quiz-options">
                  {quizQuestions[quizStep - 1].options.map((option, idx) => (
                    <button key={idx} onClick={() => handleQuizAnswer(option)} disabled={quizLoading}>
                      {option}
                    </button>
                  ))}
                </div>
                <div className="quiz-progress">
                  <p>Step {quizStep} of {quizQuestions.length}</p>
                  <div className="progress-bar">
                    <div style={{ width: `${(quizStep / quizQuestions.length) * 100}%` }}></div>
                  </div>
                </div>
              </animated.div>
            )}
            {quizStep === -1 && (
              <animated.div style={fadeIn} className="quiz-card">
                <h4><FaCheckCircle /> Your Personalized Recommendations</h4>
                {quizLoading ? (
                  <p>Analyzing your answers...</p>
                ) : recommendedCourses.length ? (
                  recommendedCourses.map((course, idx) => (
                    <div key={idx} className="course-recommendation">
                      <div>
                        <p><strong>{course.title}</strong> ({course.difficulty} - {course.category})</p>
                        <p className="recommendation-reason">{course.reason}</p>
                      </div>
                      <button onClick={() => setView('courses')}>
                        {courses.some(c => c.title === course.title) ? 'Start Learning' : 'Explore Similar'}
                      </button>
                    </div>
                  ))
                ) : (
                  <p>Something went wrong—try again or explore Courses!</p>
                )}
                <button onClick={() => { setQuizStep(0); setQuizAnswers([]); setRecommendedCourses([]); }} disabled={quizLoading}>
                  Try Again
                </button>
              </animated.div>
            )}

            <h3>Notifications ({notifications.filter(n => !n.is_read).length})</h3>
            {notifications.length ? (
              notifications.slice(0, 5).map(n => (
                <animated.div key={n.id} style={fadeIn} className={`notification-card ${n.is_read ? 'read' : ''}`}>
                  <p>{n.content}</p>
                  {!n.is_read && <button onClick={() => markAsRead(n.id)}>Mark as Read</button>}
                </animated.div>
              ))
            ) : (
              <p>No notifications yet.</p>
            )}
          </div>
        </animated.div>
      </div>
    </div>
  );
};

export default Dashboard;