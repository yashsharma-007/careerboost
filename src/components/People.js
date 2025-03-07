import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { FaUser, FaSignOutAlt, FaTrophy, FaBook, FaBriefcase, FaFileAlt, FaTasks, FaComments, FaUsers, FaHome, FaSearch, FaUserPlus, FaEnvelope, FaIdBadge, FaTools, FaInfoCircle, FaUserCheck, FaHourglassHalf, FaFilter, FaSort } from 'react-icons/fa';
import Sidebar from './Sidebar';
import '../global.css';
import '../sidebar.css';
import '../main.css';
import '../people.css';

const People = ({ user, onLogout, setView }) => {
  const [allUsers, setAllUsers] = useState([]);
  const [connections, setConnections] = useState([]);
  const [currentUserProfile, setCurrentUserProfile] = useState({ skills: [], role: '', username: '' });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [sortBy, setSortBy] = useState('username');

  useEffect(() => {
    const fetchData = async () => {
      console.log('Current user ID from auth:', user.id);
      console.log('Auth session:', await supabase.auth.getSession());

      // Fetch all user profiles except the current user
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('id, email, role, skills, bio, username')
        .neq('id', user.id);
      if (usersError) console.error('Users fetch error:', usersError);
      else console.log('Fetched all users:', usersData);

      // Fetch current user's profile
      const { data: currentUserData, error: currentUserError } = await supabase
        .from('profiles')
        .select('skills, role, username')
        .eq('id', user.id)
        .single();
      if (currentUserError) console.error('Current user fetch error:', currentUserError);
      else console.log('Fetched current user profile:', currentUserData);

      // Fetch user's connections
      const { data: connectionsData, error: connectionsError } = await supabase
        .from('connections')
        .select('*')
        .eq('user_id', user.id);
      if (connectionsError) console.error('Connections fetch error:', connectionsError);
      else console.log('Fetched connections:', connectionsData);

      setAllUsers(usersData || []);
      setCurrentUserProfile(currentUserData || { skills: [], role: '', username: '' });
      setConnections(connectionsData || []);
      setLoading(false);
    };
    fetchData();
  }, [user]);

  const handleConnect = async (connectedUserId) => {
    console.log('Attempting to connect:', { user_id: user.id, connected_user_id: connectedUserId });
    const { data, error } = await supabase.from('connections').insert({
      user_id: user.id,
      connected_user_id: connectedUserId,
      status: 'pending',
    });
    if (error) {
      console.error('Connection insert error:', error);
      alert(error.message);
    } else {
      console.log('Inserted connection:', data);
      const { data: updatedConnections } = await supabase.from('connections').select('*').eq('user_id', user.id);
      console.log('Updated connections:', updatedConnections);
      setConnections(updatedConnections || []);
    }
  };

  // Get unique roles for filter dropdown
  const uniqueRoles = [...new Set(allUsers.map(user => user.role))].filter(Boolean);

  // Filter and sort users
  const filteredUsers = allUsers
    .filter(user => {
      const matchesSearch = 
        (user.username ? user.username.toLowerCase().includes(searchTerm.toLowerCase()) : false) || 
        (user.email ? user.email.toLowerCase().includes(searchTerm.toLowerCase()) : false) ||
        (user.bio ? user.bio.toLowerCase().includes(searchTerm.toLowerCase()) : false);
      const matchesRole = filterRole ? (user.role ? user.role === filterRole : false) : true;
      return matchesSearch && matchesRole;
    })
    .sort((a, b) => {
      if (sortBy === 'username') {
        return (a.username || '').localeCompare(b.username || '');
      } else if (sortBy === 'role') {
        return (a.role || '').localeCompare(b.role || '');
      } else if (sortBy === 'skills') {
        return (b.skills?.length || 0) - (a.skills?.length || 0);
      }
      return 0;
    });

  const getConnectionStatus = (connection) => {
    if (!connection) return null;
    if (connection.status === 'pending') {
      return <span className="connection-status pending"><FaHourglassHalf /> Pending</span>;
    }
    return <span className="connection-status connected"><FaUserCheck /> Connected</span>;
  };

  if (loading) return (
    <div className="spinner">
      <div></div>
    </div>
  );

  return (
    <div className="flex">
      <Sidebar currentView="people" setView={setView} onLogout={onLogout} />

      {/* Main Content */}
      <div className="main-content">
        <header className="header">
          <h2><FaUsers className="header-icon" /> Connect with People</h2>
          <div className="user-info">
            <span><FaUser /> {currentUserProfile.username || user.email}</span>
          </div>
        </header>

        {/* Search and Filter Controls */}
        <div className="people-controls">
          <div className="search-container">
            <FaSearch className="search-icon" />
            <input 
              type="text" 
              placeholder="Search by name, email, or bio..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="filter-controls">
            <div className="filter-group">
              <label><FaFilter /> Filter by Role:</label>
              <select 
                value={filterRole} 
                onChange={(e) => setFilterRole(e.target.value)}
                className="filter-select"
              >
                <option value="">All Roles</option>
                {uniqueRoles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>
            
            <div className="filter-group">
              <label><FaSort /> Sort by:</label>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="filter-select"
              >
                <option value="username">Name</option>
                <option value="role">Role</option>
                <option value="skills">Skills Count</option>
              </select>
            </div>
          </div>
        </div>

        {/* User Stats */}
        <div className="people-stats">
          <div className="stat-card">
            <div className="stat-icon"><FaUsers /></div>
            <div className="stat-content">
              <h4>{allUsers.length}</h4>
              <p>Total Users</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"><FaUserCheck /></div>
            <div className="stat-content">
              <h4>{connections.filter(c => c.status === 'accepted').length}</h4>
              <p>Connections</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"><FaHourglassHalf /></div>
            <div className="stat-content">
              <h4>{connections.filter(c => c.status === 'pending').length}</h4>
              <p>Pending</p>
            </div>
          </div>
        </div>

        {/* All Users */}
        <div className="people-list">
          <h3>
            <span className="section-title">Community Members</span>
            <span className="results-count">{filteredUsers.length} results</span>
          </h3>
          
          {filteredUsers.length ? (
            <div className="people-grid">
              {filteredUsers.map(u => {
                const connection = connections.find(c => c.connected_user_id === u.id);
                return (
                  <div key={u.id} className="person-card">
                    <div className="person-header">
                      <div className="person-avatar">
                        {u.username ? u.username.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <h4>{u.username}</h4>
                      {getConnectionStatus(connection)}
                    </div>
                    
                    <div className="person-details">
                      <p><FaIdBadge /> <strong>Role:</strong> {u.role || 'Not specified'}</p>
                      <p><FaEnvelope /> <strong>Email:</strong> {u.email}</p>
                      <p><FaTools /> <strong>Skills:</strong> {u.skills && u.skills.length ? (
                        <span className="skills-list">
                          {u.skills.map(skill => (
                            <span key={skill} className="skill-tag">{skill}</span>
                          ))}
                        </span>
                      ) : 'None listed'}
                      </p>
                      {u.bio && (
                        <p className="bio"><FaInfoCircle /> <strong>Bio:</strong> {u.bio}</p>
                      )}
                    </div>
                    
                    <div className="person-actions">
                      <button
                        className={`connect-button ${connection ? 'disabled' : ''}`}
                        onClick={() => handleConnect(u.id)}
                        disabled={connection}
                      >
                        {connection ? 
                          (connection.status === 'pending' ? <><FaHourglassHalf /> Pending</> : <><FaUserCheck /> Connected</>) : 
                          <><FaUserPlus /> Connect</>}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="no-results">
              <FaSearch className="no-results-icon" />
              <p>No users found matching your search criteria.</p>
              <button onClick={() => {setSearchTerm(''); setFilterRole('');}}>Clear Filters</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default People;