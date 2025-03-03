import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { FaUser, FaSignOutAlt, FaTrophy, FaBook, FaBriefcase, FaEdit } from 'react-icons/fa';

const Profile = ({ user, onLogout, setView }) => {
  const [profile, setProfile] = useState({
    role: 'student',
    skills: [],
    education: {},
    work_experience: {},
    achievements: '',
  });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (error) console.error(error);
      else setProfile(data);
      setLoading(false);
    };
    fetchProfile();
  }, [user]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        skills: profile.skills,
        education: profile.education,
        work_experience: profile.work_experience,
        achievements: profile.achievements,
      })
      .eq('id', user.id);
    setLoading(false);
    if (error) alert(error.message);
    else {
      alert('Profile updated successfully!');
      setEditing(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-secondary">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-primary"></div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-secondary to-gray-100">
      {/* Sidebar */}
      <div className="w-72 bg-primary text-white h-screen p-6 fixed shadow-xl transform transition-all duration-300 hover:w-76">
        <h1 className="text-3xl font-bold mb-10 tracking-tight">CareerBoost</h1>
        <ul className="space-y-6">
          <li className="flex items-center text-lg font-semibold bg-white bg-opacity-10 p-2 rounded-md transition duration-200 hover:bg-opacity-20">
            <FaUser className="mr-3" /> Profile
          </li>
          <li
            className="flex items-center text-lg cursor-pointer hover:text-accent transition duration-200"
            onClick={() => setView('jobs')}
          >
            <FaBriefcase className="mr-3" /> Jobs
          </li>
          <li className="flex items-center text-lg opacity-70 cursor-not-allowed">
            <FaBook className="mr-3" /> Courses (Soon)
          </li>
          <li className="flex items-center text-lg opacity-70 cursor-not-allowed">
            <FaTrophy className="mr-3" /> Contests (Soon)
          </li>
          <li
            className="mt-auto flex items-center text-lg cursor-pointer hover:text-accent transition duration-200"
            onClick={onLogout}
          >
            <FaSignOutAlt className="mr-3" /> Logout
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="ml-72 flex-1 p-10">
        <header className="bg-white shadow-lg p-6 rounded-xl mb-10 flex justify-between items-center transform transition-all duration-300 hover:shadow-xl">
          <h2 className="text-2xl font-bold text-primary tracking-tight">
            Welcome, <span className="text-accent">{user.email.split('@')[0]}</span>
          </h2>
          <button
            onClick={() => setEditing(!editing)}
            className="bg-accent text-white px-5 py-2 rounded-full hover:bg-green-700 transition duration-300 flex items-center shadow-md"
          >
            <FaEdit className="mr-2" /> {editing ? 'Cancel' : 'Edit Profile'}
          </button>
        </header>

        <div className="bg-white p-8 rounded-xl shadow-lg transform transition-all duration-300 hover:shadow-xl">
          <h3 className="text-xl font-semibold mb-6 text-primary flex items-center">
            <FaUser className="mr-2 text-accent" /> Your Profile
          </h3>
          {editing ? (
            <form onSubmit={handleUpdate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Skills</label>
                  <input
                    type="text"
                    value={profile.skills.join(', ')}
                    onChange={(e) => setProfile({ ...profile, skills: e.target.value.split(', ').filter(Boolean) })}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition duration-200"
                    placeholder="e.g., JavaScript, Python"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Education</label>
                  <input
                    type="text"
                    value={profile.education.degree || ''}
                    onChange={(e) =>
                      setProfile({ ...profile, education: { ...profile.education, degree: e.target.value } })
                    }
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition duration-200"
                    placeholder="e.g., B.Sc, XYZ University"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Work Experience</label>
                  <input
                    type="text"
                    value={profile.work_experience.role || ''}
                    onChange={(e) =>
                      setProfile({ ...profile, work_experience: { ...profile.work_experience, role: e.target.value } })
                    }
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition duration-200"
                    placeholder="e.g., Developer, ABC Corp"
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">Achievements</label>
                <textarea
                  value={profile.achievements}
                  onChange={(e) => setProfile({ ...profile, achievements: e.target.value })}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition duration-200"
                  rows="4"
                  placeholder="e.g., Won coding contest, Published research paper"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="bg-primary text-white px-6 py-3 rounded-full hover:bg-blue-700 transition duration-300 shadow-md"
              >
                {loading ? 'Saving...' : 'Save Profile'}
              </button>
            </form>
          ) : (
            <div className="space-y-4 text-gray-700">
              <p className="flex items-center">
                <span className="font-medium text-primary w-32">Role:</span> 
                <span className="bg-secondary px-3 py-1 rounded-full">{profile.role}</span>
              </p>
              <p className="flex items-center">
                <span className="font-medium text-primary w-32">Skills:</span> 
                {profile.skills.length ? profile.skills.map(skill => (
                  <span key={skill} className="bg-accent text-white px-3 py-1 rounded-full mr-2">{skill}</span>
                )) : 'None yet'}
              </p>
              <p className="flex items-center">
                <span className="font-medium text-primary w-32">Education:</span> 
                {profile.education.degree || 'Not provided'}
              </p>
              <p className="flex items-center">
                <span className="font-medium text-primary w-32">Work Experience:</span> 
                {profile.work_experience.role || 'Not provided'}
              </p>
              <p className="flex items-start">
                <span className="font-medium text-primary w-32">Achievements:</span> 
                <span className="flex-1">{profile.achievements || 'None yet'}</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;