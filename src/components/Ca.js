import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useSpring, animated } from 'react-spring';
import { FaUser, FaSignOutAlt, FaTrophy, FaBook, FaBriefcase, FaFileAlt, FaTasks, FaComments, FaUsers, FaHome, FaQuestionCircle, FaBullseye, FaPlus } from 'react-icons/fa';
import '../styles.css';

const CareerGoals = ({ user, onLogout, setView }) => {
  const [goals, setGoals] = useState([]);
  const [newGoal, setNewGoal] = useState({ title: '', description: '', target_date: '' });
  const [loading, setLoading] = useState(true);

  const fadeIn = useSpring({ from: { opacity: 0 }, to: { opacity: 1 }, config: { duration: 500 } });

  useEffect(() => {
    const fetchGoals = async () => {
      const { data, error } = await supabase.from('career_goals').select('*').eq('user_id', user.id).order('target_date');
      if (error) console.error('Error fetching goals:', error);
      else setGoals(data || []);
      setLoading(false);
    };
    fetchGoals();

    const goalsSubscription = supabase
      .channel('career_goals')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'career_goals', filter: `user_id=eq.${user.id}` }, payload => {
        if (payload.eventType === 'INSERT') setGoals(prev => [...prev, payload.new]);
        if (payload.eventType === 'UPDATE') setGoals(prev => prev.map(g => g.id === payload.new.id ? payload.new : g));
        if (payload.eventType === 'DELETE') setGoals(prev => prev.filter(g => g.id !== payload.old.id));
      })
      .subscribe();

    return () => supabase.removeChannel(goalsSubscription);
  }, [user]);

  const handleAddGoal = async (e) => {
    e.preventDefault();
    if (!newGoal.title || !newGoal.target_date) return;

    const { data, error } = await supabase.from('career_goals').insert({
      user_id: user.id,
      title: newGoal.title,
      description: newGoal.description,
      target_date: newGoal.target_date,
      progress: 0,
    }).select().single();

    if (error) console.error('Error adding goal:', error);
    else setNewGoal({ title: '', description: '', target_date: '' });
  };

  const updateProgress = async (goalId, progress) => {
    const { error } = await supabase.from('career_goals').update({ progress, updated_at: new Date().toISOString() }).eq('id', goalId);
    if (error) console.error('Error updating progress:', error);
  };

  if (loading) return <div className="spinner"><div></div></div>;

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
          <li onClick={() => setView('support')}><FaQuestionCircle /> Support</li>
          <li className="active" onClick={() => setView('career-goals')}><FaBullseye /> Career Goals</li>
          <li onClick={onLogout}><FaSignOutAlt /> Logout</li>
        </ul>
      </div>

      <animated.div style={fadeIn} className="main-content">
        <header className="header">
          <h2>Your Career Goals</h2>
        </header>

        <div className="goals-container">
          <form className="add-goal-form" onSubmit={handleAddGoal}>
            <input
              type="text"
              placeholder="Goal Title (e.g., Get Promoted)"
              value={newGoal.title}
              onChange={e => setNewGoal({ ...newGoal, title: e.target.value })}
            />
            <textarea
              placeholder="Description (optional)"
              value={newGoal.description}
              onChange={e => setNewGoal({ ...newGoal, description: e.target.value })}
            />
            <input
              type="date"
              value={newGoal.target_date}
              onChange={e => setNewGoal({ ...newGoal, target_date: e.target.value })}
            />
            <button type="submit"><FaPlus /> Add Goal</button>
          </form>

          <div className="goal-list">
            {goals.map(goal => (
              <animated.div key={goal.id} style={fadeIn} className="goal-card">
                <h4>{goal.title}</h4>
                <p>{goal.description || 'No description'}</p>
                <p>Target: {new Date(goal.target_date).toLocaleDateString()}</p>
                <div className="progress-bar">
                  <div style={{ width: `${goal.progress}%` }}></div>
                </div>
                <p>{goal.progress}% Complete</p>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={goal.progress}
                  onChange={e => updateProgress(goal.id, parseInt(e.target.value))}
                />
              </animated.div>
            ))}
          </div>
        </div>
      </animated.div>
    </div>
  );
};

export default CareerGoals;