import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import Auth from './components/Auth';
import Profile from './components/Profile';
import Jobs from './components/Jobs';
import Courses from './components/Courses';

function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('profile'); // 'profile', 'jobs', or 'courses'

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user ?? null);
    };
    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });
    return () => authListener.subscription.unsubscribe();
  }, []);

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
      ) : (
        <Auth />
      )}
    </div>
  );
}

export default App;