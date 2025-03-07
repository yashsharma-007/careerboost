import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import Sidebar from './Sidebar';
import '../global.css';
import '../sidebar.css';
import '../main.css';
import '../tasks.css';

const Tasks = ({ user, onLogout, setView }) => {
  const [goals, setGoals] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [newGoal, setNewGoal] = useState({ title: '', description: '' });
  const [newTask, setNewTask] = useState({ title: '', goalId: '' });
  const [loading, setLoading] = useState(true);
  const [activeGoal, setActiveGoal] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch goals
      const { data: goalsData, error: goalsError } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id);
      if (goalsError) console.error('Goals fetch error:', goalsError);
      else setGoals(goalsData || []);

      // Fetch tasks
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id);
      if (tasksError) console.error('Tasks fetch error:', tasksError);
      else setTasks(tasksData || []);

      setLoading(false);
    };
    fetchData();
  }, [user]);

  const handleAddGoal = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('goals').insert({
      user_id: user.id,
      title: newGoal.title,
      description: newGoal.description,
    });
    if (error) {
      console.error('Goal insert error:', error);
      alert(error.message);
    } else {
      const { data } = await supabase.from('goals').select('*').eq('user_id', user.id);
      setGoals(data || []);
      setNewGoal({ title: '', description: '' });
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('tasks').insert({
      user_id: user.id,
      title: newTask.title,
      status: 'pending',
      goal_id: newTask.goalId || null,
    });
    if (error) {
      console.error('Task insert error:', error);
      alert(error.message);
    } else {
      const { data } = await supabase.from('tasks').select('*').eq('user_id', user.id);
      setTasks(data || []);
      setNewTask({ title: '', goalId: '' });
    }
  };

  const handleCompleteTask = async (taskId) => {
    const { error } = await supabase.from('tasks').update({ status: 'completed' }).eq('id', taskId);
    if (error) {
      console.error('Task update error:', error);
      alert(error.message);
    } else {
      setTasks(tasks.map(task => task.id === taskId ? { ...task, status: 'completed' } : task));
    }
  };

  const getGoalProgress = (goalId) => {
    const goalTasks = tasks.filter(task => task.goal_id === goalId);
    const total = goalTasks.length;
    const completed = goalTasks.filter(task => task.status === 'completed').length;
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  const toggleGoalExpand = (goalId) => {
    setActiveGoal(activeGoal === goalId ? null : goalId);
  };

  if (loading) return (
    <div className="loading-container">
      <div className="spinner">
        <div></div>
      </div>
      <p>Loading your career journey...</p>
    </div>
  );

  return (
    <div className="flex">
      <Sidebar currentView="tasks" setView={setView} onLogout={onLogout} />

      {/* Main Content */}
      <div className="main-content tasks-page">
        <header className="header tasks-header">
          <div className="header-content">
            <h2>Your Career Goals</h2>
            <p className="header-subtitle">Track your progress and achieve your dreams</p>
          </div>
          <div className="header-stats">
            <div className="stat-box">
              <span className="stat-number">{goals.length}</span>
              <span className="stat-label">Goals</span>
            </div>
            <div className="stat-box">
              <span className="stat-number">{tasks.length}</span>
              <span className="stat-label">Tasks</span>
            </div>
            <div className="stat-box">
              <span className="stat-number">
                {tasks.filter(task => task.status === 'completed').length}
              </span>
              <span className="stat-label">Completed</span>
            </div>
          </div>
        </header>

        <div className="tasks-dashboard">
          {/* Add Goal */}
          <div className="tasks-section add-goal-section">
            <h3>Create New Goal</h3>
            <form className="task-form goal-form" onSubmit={handleAddGoal}>
              <div className="form-group">
                <label htmlFor="goalTitle">Goal Title</label>
                <input
                  id="goalTitle"
                  type="text"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  placeholder="What do you want to achieve?"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="goalDescription">Description</label>
                <textarea
                  id="goalDescription"
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                  placeholder="Why is this goal important to you?"
                  rows="3"
                />
              </div>
              <button type="submit" className="button-primary add-goal-btn">
                <span className="btn-icon">+</span> Add Goal
              </button>
            </form>
          </div>

          {/* Goals and Tasks */}
          <div className="goals-section">
            <h3>Your Goals Journey</h3>
            {goals.length ? (
              <div className="goals-grid">
                {goals.map(goal => (
                  <div 
                    key={goal.id} 
                    className={`goal-card ${activeGoal === goal.id ? 'expanded' : ''}`}
                    onClick={() => toggleGoalExpand(goal.id)}
                  >
                    <div className="goal-header">
                      <h4>{goal.title}</h4>
                      <div className="goal-progress-indicator">
                        <span className="progress-text">{getGoalProgress(goal.id)}%</span>
                        <div className="progress-circle">
                          <svg viewBox="0 0 36 36">
                            <path
                              className="progress-circle-bg"
                              d="M18 2.0845
                                a 15.9155 15.9155 0 0 1 0 31.831
                                a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                            <path
                              className="progress-circle-fill"
                              strokeDasharray={`${getGoalProgress(goal.id)}, 100`}
                              d="M18 2.0845
                                a 15.9155 15.9155 0 0 1 0 31.831
                                a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                    <p className="goal-description">{goal.description || 'No description'}</p>
                    <div className="progress-bar">
                      <div style={{ width: `${getGoalProgress(goal.id)}%` }}></div>
                    </div>
                    
                    <div className="goal-details">
                      <h5>Tasks</h5>
                      <div className="tasks-container">
                        {tasks.filter(task => task.goal_id === goal.id).length > 0 ? (
                          tasks.filter(task => task.goal_id === goal.id).map(task => (
                            <div key={task.id} className={`task-item ${task.status === 'completed' ? 'completed' : ''}`}>
                              <div className="task-content">
                                <div className="task-checkbox">
                                  <input 
                                    type="checkbox" 
                                    checked={task.status === 'completed'} 
                                    onChange={() => task.status !== 'completed' && handleCompleteTask(task.id)}
                                    id={`task-${task.id}`}
                                  />
                                  <label htmlFor={`task-${task.id}`}></label>
                                </div>
                                <p>{task.title}</p>
                              </div>
                              {task.status !== 'completed' && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCompleteTask(task.id);
                                  }}
                                  className="complete-task-btn"
                                >
                                  Complete
                                </button>
                              )}
                            </div>
                          ))
                        ) : (
                          <p className="no-tasks-message">No tasks yet. Add your first task below!</p>
                        )}
                      </div>
                      
                      <form 
                        className="task-form inline-task-form" 
                        onSubmit={(e) => {
                          e.stopPropagation();
                          handleAddTask(e);
                        }}
                      >
                        <input
                          type="text"
                          value={newTask.goalId === goal.id ? newTask.title : ''}
                          onChange={(e) => {
                            e.stopPropagation();
                            setNewTask({ title: e.target.value, goalId: goal.id });
                          }}
                          onClick={(e) => e.stopPropagation()}
                          placeholder="Add a new task"
                          required
                        />
                        <button 
                          type="submit" 
                          className="add-task-btn"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Add
                        </button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">🎯</div>
                <h4>No goals set yet</h4>
                <p>Create your first goal to start tracking your career progress</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tasks;