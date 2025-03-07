import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { FaDownload } from 'react-icons/fa';
import html2pdf from 'html2pdf.js';
import Sidebar from './Sidebar';
import '../global.css';
import '../sidebar.css';
import '../main.css';
import '../resume.css';

const Resume = ({ user, onLogout, setView }) => {
  const [profile, setProfile] = useState({
    full_name: '',
    email: '',
    phone: '',
    address: '',
    linkedin: '',
    education: [],
    experience: [],
    projects: [],
    skills: {
      computer: [],
      software: [],
      relevant_coursework: [],
    },
    positions: [],
    resume_options: {
      show_full_name: true,
      show_address: true,
      show_email: true,
      show_phone: true,
      show_linkedin: true,
      show_education: true,
      show_experience: true,
      show_projects: true,
      show_skills: true,
      show_positions: true,
    },
  });
  const [template, setTemplate] = useState('standard'); // 'standard', 'compact'
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingOptions, setEditingOptions] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, email, phone, address, linkedin, education, experience, projects, skills, positions, resume_options')
        .eq('id', user.id)
        .single();
      if (error) {
        console.error('Error fetching profile:', error);
      } else {
        setProfile({
          full_name: data.full_name || user.email.split('@')[0],
          email: data.email || user.email || 'Email not provided',
          phone: data.phone || '',
          address: data.address || '',
          linkedin: data.linkedin || '',
          education: data.education || [],
          experience: data.experience || [],
          projects: data.projects || [],
          skills: {
            computer: data.skills?.computer || [],
            software: data.skills?.software || [],
            relevant_coursework: data.skills?.relevant_coursework || [],
          },
          positions: data.positions || [],
          resume_options: data.resume_options || {
            show_full_name: true,
            show_address: true,
            show_email: true,
            show_phone: true,
            show_linkedin: true,
            show_education: true,
            show_experience: true,
            show_projects: true,
            show_skills: true,
            show_positions: true,
          },
        });
        generateSuggestions(data);
      }
      setLoading(false);
    };
    fetchProfile();
  }, [user]);

  const generateSuggestions = (profile) => {
    const sugg = [];
    if (!profile.full_name) sugg.push('Add your full name to the header.');
    if (!profile.phone) sugg.push('Include your phone number for contact.');
    if (!profile.education?.length) sugg.push('Add your educational background.');
    if (!profile.experience?.length) sugg.push('List your work experience.');
    if (!profile.projects?.length) sugg.push('Include relevant projects.');
    if (!profile.skills?.computer?.length) sugg.push('Add computer skills.');
    if (!profile.positions?.length) sugg.push('Highlight positions of responsibility.');
    setSuggestions(sugg);
  };

  const downloadPDF = () => {
    const element = document.getElementById('resume-preview');
    const fileName = `${profile.full_name.replace(/\s+/g, '_')}_resume.pdf`;
    html2pdf()
      .from(element)
      .set({ margin: [0.5, 0.5], filename: fileName, image: { type: 'jpeg', quality: 0.95 } })
      .save();
  };

  const handleOptionChange = (e) => {
    const { name, checked } = e.target;
    setProfile((prev) => ({
      ...prev,
      resume_options: {
        ...prev.resume_options,
        [name]: checked,
      },
    }));
  };

  const saveOptions = async () => {
    setLoading(true);
    const { error } = await supabase
      .from('profiles')
      .update({ resume_options: profile.resume_options })
      .eq('id', user.id);
    setLoading(false);
    if (error) alert(error.message);
    else {
      alert('Resume options saved successfully!');
      setEditingOptions(false);
    }
  };

  if (loading) return (
    <div className="spinner">
      <div></div>
    </div>
  );

  return (
    <div className="flex">
      <Sidebar currentView="resume" setView={setView} onLogout={onLogout} />

      <div className="main-content">
        <header className="header">
          <h2>Resume Builder</h2>
          <div className="resume-controls">
            <select value={template} onChange={(e) => setTemplate(e.target.value)}>
              <option value="standard">Standard Template</option>
              <option value="compact">Compact Template</option>
            </select>
            <button onClick={downloadPDF}><FaDownload /> Download PDF</button>
            <button onClick={() => setEditingOptions(!editingOptions)}>
              {editingOptions ? 'Cancel' : 'Edit Options'}
            </button>
          </div>
        </header>

        {editingOptions && (
          <div className="resume-options">
            <h4>Resume Display Options</h4>
            <label>
              <input
                type="checkbox"
                name="show_full_name"
                checked={profile.resume_options.show_full_name}
                onChange={handleOptionChange}
              /> Show Full Name
            </label>
            <label>
              <input
                type="checkbox"
                name="show_address"
                checked={profile.resume_options.show_address}
                onChange={handleOptionChange}
              /> Show Address
            </label>
            <label>
              <input
                type="checkbox"
                name="show_email"
                checked={profile.resume_options.show_email}
                onChange={handleOptionChange}
              /> Show Email
            </label>
            <label>
              <input
                type="checkbox"
                name="show_phone"
                checked={profile.resume_options.show_phone}
                onChange={handleOptionChange}
              /> Show Phone
            </label>
            <label>
              <input
                type="checkbox"
                name="show_linkedin"
                checked={profile.resume_options.show_linkedin}
                onChange={handleOptionChange}
              /> Show LinkedIn
            </label>
            <label>
              <input
                type="checkbox"
                name="show_education"
                checked={profile.resume_options.show_education}
                onChange={handleOptionChange}
              /> Show Education
            </label>
            <label>
              <input
                type="checkbox"
                name="show_experience"
                checked={profile.resume_options.show_experience}
                onChange={handleOptionChange}
              /> Show Experience
            </label>
            <label>
              <input
                type="checkbox"
                name="show_projects"
                checked={profile.resume_options.show_projects}
                onChange={handleOptionChange}
              /> Show Projects
            </label>
            <label>
              <input
                type="checkbox"
                name="show_skills"
                checked={profile.resume_options.show_skills}
                onChange={handleOptionChange}
              /> Show Skills
            </label>
            <label>
              <input
                type="checkbox"
                name="show_positions"
                checked={profile.resume_options.show_positions}
                onChange={handleOptionChange}
              /> Show Positions of Responsibility
            </label>
            <button onClick={saveOptions} disabled={loading}>
              {loading ? 'Saving...' : 'Save Options'}
            </button>
          </div>
        )}

        <div className={`resume-preview ${template}`} id="resume-preview">
          {template === 'standard' ? (
            <div className="resume-standard">
              {/* Header */}
              <header className="resume-header">
                {profile.resume_options.show_full_name && <h1>{profile.full_name}</h1>}
                <div className="contact-details">
                  {profile.resume_options.show_address && <span>Address: {profile.address || 'Not provided'}</span>}
                  {profile.resume_options.show_email && <span>Email: {profile.email}</span>}
                  {profile.resume_options.show_phone && <span>Mobile: {profile.phone || 'Not provided'}</span>}
                  {profile.resume_options.show_linkedin && profile.linkedin && <span>LinkedIn: <a href={profile.linkedin} target="_blank" rel="noopener noreferrer">{profile.linkedin || 'Not provided'}</a></span>}
                </div>
                <div className="degree-title">Graduate, Mechanical Engineering</div>
              </header>

              {profile.resume_options.show_education && (
                <section className="resume-section">
                  <h2>Education</h2>
                  <hr />
                  {profile.education.length > 0 ? (
                    profile.education.map((edu, index) => (
                      <div key={index} className="education-item">
                        <h3>{edu.degree || 'Degree not specified'}</h3>
                        <p className="institution">{edu.institution || 'Institution'} | CGPA: {edu.cgpa || 'N/A'} | {edu.year || 'Year'}</p>
                      </div>
                    ))
                  ) : (
                    <p>No education details provided</p>
                  )}
                </section>
              )}

              {profile.resume_options.show_experience && (
                <section className="resume-section">
                  <h2>Experience</h2>
                  <hr />
                  {profile.experience.length > 0 ? (
                    profile.experience.map((exp, index) => (
                      <div key={index} className="experience-item">
                        <h3>{exp.title || 'Title not specified'}</h3>
                        <p className="company">{exp.company || 'Company'} | {exp.duration || 'Duration'}</p>
                        <ul className="experience-details">
                          {exp.responsibilities?.map((resp, i) => <li key={i}>{resp}</li>) || <li>No details provided</li>}
                        </ul>
                      </div>
                    ))
                  ) : (
                    <p>No experience provided</p>
                  )}
                </section>
              )}

              {profile.resume_options.show_projects && (
                <section className="resume-section">
                  <h2>Projects</h2>
                  <hr />
                  {profile.projects.length > 0 ? (
                    profile.projects.map((proj, index) => (
                      <div key={index} className="project-item">
                        <h3>{proj.title || 'Title not specified'}</h3>
                        <p className="duration">{proj.duration || 'Duration'}</p>
                        <ul className="project-details">
                          {proj.description?.map((desc, i) => <li key={i}>{desc}</li>) || <li>No details provided</li>}
                        </ul>
                      </div>
                    ))
                  ) : (
                    <p>No projects provided</p>
                  )}
                </section>
              )}

              {profile.resume_options.show_skills && (
                <section className="resume-section">
                  <h2>Skills</h2>
                  <hr />
                  <div className="skills-container">
                    <div className="skill-column">
                      <h3>Computer Skills:</h3>
                      <ul>
                        {profile.skills.computer.length > 0 ? profile.skills.computer.map((skill, i) => <li key={i}>{skill}</li>) : <li>None</li>}
                      </ul>
                    </div>
                    <div className="skill-column">
                      <h3>Software Skills:</h3>
                      <ul>
                        {profile.skills.software.length > 0 ? profile.skills.software.map((skill, i) => <li key={i}>{skill}</li>) : <li>None</li>}
                      </ul>
                    </div>
                    <div className="skill-column">
                      <h3>Relevant Coursework:</h3>
                      <ul>
                        {profile.skills.relevant_coursework.length > 0 ? profile.skills.relevant_coursework.map((course, i) => <li key={i}>{course}</li>) : <li>None</li>}
                      </ul>
                    </div>
                  </div>
                </section>
              )}

              {profile.resume_options.show_positions && (
                <section className="resume-section">
                  <h2>Positions of Responsibility</h2>
                  <hr />
                  {profile.positions.length > 0 ? (
                    profile.positions.map((pos, index) => (
                      <div key={index} className="position-item">
                        <h3>{pos.title || 'Title not specified'}</h3>
                        <p className="duration">{pos.duration || 'Duration'}</p>
                        <p>{pos.description || 'No details provided'}</p>
                      </div>
                    ))
                  ) : (
                    <p>No positions provided</p>
                  )}
                </section>
              )}
            </div>
          ) : (
            <div className="resume-compact">
              {/* Compact Header */}
              <header className="resume-header">
                {profile.resume_options.show_full_name && <h1>{profile.full_name}</h1>}
                <div className="contact-details">
                  {profile.resume_options.show_address && <span>{profile.address || 'Address not provided'}</span>}
                  {profile.resume_options.show_email && <span> | {profile.email}</span>}
                  {profile.resume_options.show_phone && <span> | {profile.phone || 'Phone not provided'}</span>}
                  {profile.resume_options.show_linkedin && profile.linkedin && <span> | <a href={profile.linkedin} target="_blank" rel="noopener noreferrer">{profile.linkedin || 'LinkedIn'}</a></span>}
                </div>
                <div className="degree-title">Graduate, Mechanical Engineering</div>
              </header>

              {/* Compact Sections */}
              <div className="compact-sections">
                <div className="column">
                  {profile.resume_options.show_education && (
                    <section className="resume-section">
                      <h2>Education</h2>
                      {profile.education.map((edu, index) => (
                        <p key={index}>{edu.degree} - {edu.institution} ({edu.year})</p>
                      )) || <p>No education</p>}
                    </section>
                  )}
                  {profile.resume_options.show_experience && (
                    <section className="resume-section">
                      <h2>Experience</h2>
                      {profile.experience.map((exp, index) => (
                        <div key={index}>
                          <strong>{exp.title}</strong> - {exp.company} ({exp.duration})
                        </div>
                      )) || <p>No experience</p>}
                    </section>
                  )}
                </div>
                <div className="column">
                  {profile.resume_options.show_projects && (
                    <section className="resume-section">
                      <h2>Projects</h2>
                      {profile.projects.map((proj, index) => (
                        <div key={index}>
                          <strong>{proj.title}</strong> ({proj.duration})
                        </div>
                      )) || <p>No projects</p>}
                    </section>
                  )}
                  {profile.resume_options.show_skills && (
                    <section className="resume-section">
                      <h2>Skills</h2>
                      <ul>
                        {[...profile.skills.computer, ...profile.skills.software, ...profile.skills.relevant_coursework].map((skill, i) => <li key={i}>{skill}</li>) || <li>None</li>}
                      </ul>
                    </section>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div className="suggestions">
            <h3>Suggestions to Improve Your Resume</h3>
            <ul>
              {suggestions.map((sugg, index) => (
                <li key={index}>{sugg}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Resume;