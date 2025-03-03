import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { FaUser, FaSignOutAlt, FaTrophy, FaBook, FaBriefcase, FaSearch, FaHeart } from 'react-icons/fa';

const Jobs = ({ user, onLogout, setView }) => {
  const [jobs, setJobs] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [newJob, setNewJob] = useState({ title: '', description: '', location: '', skills: '', type: 'full-time' });
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({
    skills: [],
    // other profile properties if needed
  });

  useEffect(() => {
    const fetchData = async () => {
      const { data: jobsData } = await supabase.from('jobs').select('*');
      const { data: wishlistData } = await supabase
        .from('wishlist')
        .select('job_id')
        .eq('user_id', user.id);
      setJobs(jobsData || []);
      setWishlist(wishlistData?.map(item => item.job_id) || []);
      setLoading(false);
    };
    fetchData();
  }, [user]);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .single();
      if (error) console.error(error);
      else setProfile(data);
    };
    fetchProfile();
  }, []);

  const handlePostJob = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('jobs').insert({
      title: newJob.title,
      description: newJob.description,
      location: newJob.location,
      skills: newJob.skills.split(',').map(s => s.trim()),
      type: newJob.type,
      posted_by: user.id,
    });
    if (error) alert(error.message);
    else {
      setNewJob({ title: '', description: '', location: '', skills: '', type: 'full-time' });
      const { data } = await supabase.from('jobs').select('*');
      setJobs(data || []);
    }
  };

  const toggleWishlist = async (jobId) => {
    if (wishlist.includes(jobId)) {
      await supabase.from('wishlist').delete().match({ user_id: user.id, job_id: jobId });
      setWishlist(wishlist.filter(id => id !== jobId));
    } else {
      await supabase.from('wishlist').insert({ user_id: user.id, job_id: jobId });
      setWishlist([...wishlist, jobId]);
    }
  };

  const filteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(search.toLowerCase()) &&
    (!filter || job.type === filter)
  );

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
          <li
            className="flex items-center text-lg cursor-pointer hover:text-accent transition duration-200"
            onClick={() => setView('profile')}
          >
            <FaUser className="mr-3" /> Profile
          </li>
          <li className="flex items-center text-lg font-semibold bg-white bg-opacity-10 p-2 rounded-md transition duration-200 hover:bg-opacity-20">
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
          <h2 className="text-2xl font-bold text-primary tracking-tight">Explore Jobs</h2>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <FaSearch className="absolute top-3 left-3 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search jobs..."
                className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All Types</option>
              <option value="full-time">Full-Time</option>
              <option value="internship">Internship</option>
              <option value="remote">Remote</option>
            </select>
          </div>
        </header>

        {/* Job Posting Form (Recruiters Only) */}
        {profile.role === 'recruiter' && (
          <div className="bg-white p-6 rounded-xl shadow-lg mb-10 transform transition-all duration-300 hover:shadow-xl">
            <h3 className="text-lg font-semibold mb-4 text-primary">Post a Job</h3>
            <form onSubmit={handlePostJob} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  value={newJob.title}
                  onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                  placeholder="Job Title"
                  className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
                <input
                  type="text"
                  value={newJob.location}
                  onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                  placeholder="Location"
                  className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <input
                  type="text"
                  value={newJob.skills}
                  onChange={(e) => setNewJob({ ...newJob, skills: e.target.value })}
                  placeholder="Skills (comma-separated)"
                  className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <select
                  value={newJob.type}
                  onChange={(e) => setNewJob({ ...newJob, type: e.target.value })}
                  className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="full-time">Full-Time</option>
                  <option value="internship">Internship</option>
                  <option value="remote">Remote</option>
                </select>
              </div>
              <textarea
                value={newJob.description}
                onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                placeholder="Job Description"
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                rows="4"
                required
              />
              <button
                type="submit"
                className="bg-primary text-white px-6 py-3 rounded-full hover:bg-blue-700 transition duration-300 shadow-md"
              >
                Post Job
              </button>
            </form>
          </div>
        )}

        {/* Job Listings */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.length ? (
            filteredJobs.map(job => (
              <div
                key={job.id}
                className="bg-white p-6 rounded-xl shadow-lg transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              >
                <h4 className="text-lg font-semibold text-primary">{job.title}</h4>
                <p className="text-gray-600 mt-1">{job.location || 'Not specified'}</p>
                <p className="text-gray-700 mt-2">{job.description.slice(0, 100)}...</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {job.skills.map(skill => (
                    <span key={skill} className="bg-accent text-white px-2 py-1 rounded-full text-sm">{skill}</span>
                  ))}
                </div>
                <div className="mt-4 flex justify-between items-center">
                  <span className="bg-secondary px-3 py-1 rounded-full text-sm">{job.type}</span>
                  <button
                    onClick={() => toggleWishlist(job.id)}
                    className={`text-2xl ${wishlist.includes(job.id) ? 'text-red-500' : 'text-gray-400'} hover:text-red-600 transition`}
                  >
                    <FaHeart />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-600 col-span-full text-center">No jobs found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Jobs;