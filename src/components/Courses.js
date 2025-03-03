import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { FaUser, FaSignOutAlt, FaTrophy, FaBook, FaBriefcase, FaPlay, FaCheckCircle } from 'react-icons/fa';

const Courses = ({ user, onLogout, setView }) => {
  const [courses, setCourses] = useState([]);
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(true);

  // Sample roadmaps (could be stored in DB later)
  const roadmaps = {
    'Full Stack Developer': [
      'HTML & CSS Basics',
      'JavaScript Fundamentals',
      'React for Frontend',
      'Node.js for Backend',
      'Database Design with SQL',
    ],
    'Data Scientist': [
      'Python Basics',
      'Statistics & Probability',
      'Data Analysis with Pandas',
      'Machine Learning with Scikit-Learn',
      'Deep Learning with TensorFlow',
    ],
  };

  useEffect(() => {
    const fetchData = async () => {
      // Fetch courses
      const { data: coursesData } = await supabase.from('courses').select('*');
      setCourses(coursesData || []);

      // Fetch progress
      const { data: progressData } = await supabase
        .from('course_progress')
        .select('course_id, completion_percentage')
        .eq('user_id', user.id);
      const progressMap = progressData?.reduce((acc, item) => {
        acc[item.course_id] = item.completion_percentage;
        return acc;
      }, {}) || {};
      setProgress(progressMap);

      setLoading(false);
    };
    fetchData();
  }, [user]);

  const updateProgress = async (courseId, percentage) => {
    const { error } = await supabase
      .from('course_progress')
      .upsert({ user_id: user.id, course_id: courseId, completion_percentage: percentage }, { onConflict: ['user_id', 'course_id'] });
    if (error) alert(error.message);
    else setProgress({ ...progress, [courseId]: percentage });
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
          <li
            className="flex items-center text-lg cursor-pointer hover:text-accent transition duration-200"
            onClick={() => setView('profile')}
          >
            <FaUser className="mr-3" /> Profile
          </li>
          <li
            className="flex items-center text-lg cursor-pointer hover:text-accent transition duration-200"
            onClick={() => setView('jobs')}
          >
            <FaBriefcase className="mr-3" /> Jobs
          </li>
          <li className="flex items-center text-lg font-semibold bg-white bg-opacity-10 p-2 rounded-md transition duration-200 hover:bg-opacity-20">
            <FaBook className="mr-3" /> Courses
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
          <h2 className="text-2xl font-bold text-primary tracking-tight">Courses & Roadmaps</h2>
        </header>

        {/* Courses */}
        <div className="mb-10">
          <h3 className="text-xl font-semibold mb-6 text-primary flex items-center">
            <FaBook className="mr-2 text-accent" /> Available Courses
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.length ? (
              courses.map(course => (
                <div
                  key={course.id}
                  className="bg-white p-6 rounded-xl shadow-lg transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                >
                  <h4 className="text-lg font-semibold text-primary">{course.title}</h4>
                  <p className="text-gray-600 mt-1">{course.category}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {course.skills_covered.map(skill => (
                      <span key={skill} className="bg-accent text-white px-2 py-1 rounded-full text-sm">{skill}</span>
                    ))}
                  </div>
                  <div className="mt-4 flex justify-between items-center">
                    <button
                      className="bg-primary text-white px-4 py-2 rounded-full hover:bg-blue-700 transition flex items-center"
                      onClick={() => window.open(course.content_url, '_blank')}
                    >
                      <FaPlay className="mr-2" /> Start
                    </button>
                    <div className="flex items-center">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={progress[course.id] || 0}
                        onChange={(e) => updateProgress(course.id, parseInt(e.target.value))}
                        className="w-16 p-1 border rounded-lg text-center"
                      />
                      <span className="ml-2 text-gray-600">%</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-600 col-span-full">No courses available yet.</p>
            )}
          </div>
        </div>

        {/* Roadmaps */}
        <div>
          <h3 className="text-xl font-semibold mb-6 text-primary flex items-center">
            <FaBook className="mr-2 text-accent" /> Career Roadmaps
          </h3>
          <div className="space-y-8">
            {Object.entries(roadmaps).map(([title, steps]) => (
              <div key={title} className="bg-white p-6 rounded-xl shadow-lg transform transition-all duration-300 hover:shadow-xl">
                <h4 className="text-lg font-semibold text-primary mb-4">{title}</h4>
                <ol className="space-y-3">
                  {steps.map((step, index) => (
                    <li key={index} className="flex items-center text-gray-700">
                      <FaCheckCircle className="text-accent mr-2" /> {step}
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Courses;