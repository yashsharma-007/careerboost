import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import Auth from './components/Auth';
import Profile from './components/Profile';
import Jobs from './components/Jobs';
import Courses from './components/Courses';
<<<<<<< HEAD

function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('profile'); // 'profile', 'jobs', or 'courses'
=======
import Resume from './components/Resume';
import Tasks from './components/Tasks';
import Contests from './components/Contests';
import Interview from './components/Interview';
import Forum from './components/Forum';
import Dashboard from './components/Dashboard';
import People from './components/People';
import Messages from './components/Messages';
import Support from './components/Support';

import FloatingActionButton from './components/FloatingActionButton';
import './global.css';

function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('auth');
  const [viewParams, setViewParams] = useState({});
>>>>>>> 1a629c3 (Initial commit)

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user ?? null);
    };
    fetchUser();

<<<<<<< HEAD
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
=======
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user ?? null);
      setView(user ? 'dashboard' : 'auth');
    };
    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setView(session ? 'dashboard' : 'auth');
>>>>>>> 1a629c3 (Initial commit)
    });
    return () => authListener.subscription.unsubscribe();
  }, []);

<<<<<<< HEAD
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary to-gray-100 font-poppins">
      {user ? (
        view === 'profile' ? (
          <Profile user={user} onLogout={handleLogout} setView={setView} />
        ) : view === 'jobs' ? (
          <Jobs user={user} onLogout={handleLogout} setView={setView} />
        ) : (
          <Courses user={user} onLogout={handleLogout} setView={setView} />
        )
=======
  const handleSetView = (newView, params = {}) => {
    setView(newView);
    setViewParams(params);
  };

  const components = {
    auth: <Auth />,
    dashboard: <Dashboard user={user} onLogout={() => supabase.auth.signOut()} setView={handleSetView} />,
    profile: <Profile user={user} onLogout={() => supabase.auth.signOut()} setView={handleSetView} />,
    jobs: <Jobs user={user} onLogout={() => supabase.auth.signOut()} setView={handleSetView} />,
    courses: <Courses user={user} onLogout={() => supabase.auth.signOut()} setView={handleSetView} />,
    resume: <Resume user={user} onLogout={() => supabase.auth.signOut()} setView={handleSetView} />,
    tasks: <Tasks user={user} onLogout={() => supabase.auth.signOut()} setView={handleSetView} />,
    contests: <Contests user={user} onLogout={() => supabase.auth.signOut()} setView={handleSetView} />,
    interview: <Interview user={user} onLogout={() => supabase.auth.signOut()} setView={handleSetView} />,
    forum: <Forum user={user} onLogout={() => supabase.auth.signOut()} setView={handleSetView} />,
    people: <People user={user} onLogout={() => supabase.auth.signOut()} setView={handleSetView} />,
    support: <Support user={user} onLogout={() => supabase.auth.signOut()} setView={handleSetView} />,
    messages: <Messages user={user} onLogout={() => supabase.auth.signOut()} setView={handleSetView} selectedUserId={viewParams.selectedUserId} />,
  };

  return (
    <div className={user ? "flex" : "auth-page"}>
      {user ? (
        <>
          {components[view]}
          <FloatingActionButton />
        </>
>>>>>>> 1a629c3 (Initial commit)
      ) : (
        <Auth />
      )}
    </div>
  );
}

export default App;