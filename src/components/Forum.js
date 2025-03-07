import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { FaUser, FaSignOutAlt, FaTrophy, FaBook, FaBriefcase, FaFileAlt, FaTasks, FaComments, FaUsers, FaArrowUp, FaArrowDown, FaLightbulb, FaProjectDiagram, FaReply, FaRegClock } from 'react-icons/fa';
import Sidebar from './Sidebar';
import '../global.css';
import '../sidebar.css';
import '../main.css';
import '../stylef.css';

const Forum = ({ user, onLogout, setView }) => {
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [votes, setVotes] = useState([]);
  const [newPost, setNewPost] = useState({ title: '', content: '', type: 'doubt' });
  const [newComment, setNewComment] = useState({});
  const [selectedPost, setSelectedPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      const { data: postsData, error: postsError } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
      const { data: commentsData, error: commentsError } = await supabase.from('comments').select('*');
      const { data: votesData, error: votesError } = await supabase.from('votes').select('*').eq('user_id', user.id);
      if (postsError) console.error('Posts fetch error:', postsError);
      if (commentsError) console.error('Comments fetch error:', commentsError);
      if (votesError) console.error('Votes fetch error:', votesError);
      console.log('Fetched posts:', postsData);
      console.log('Fetched comments:', commentsData);
      console.log('Fetched votes:', votesData);
      setPosts(postsData || []);
      setComments(commentsData || []);
      setVotes(votesData || []);
      setLoading(false);
    };
    fetchData();
  }, [user]);

  const handleAddPost = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('posts').insert({
      user_id: user.id,
      title: newPost.title,
      content: newPost.content,
      type: newPost.type,
    });
    if (error) {
      console.error('Post insert error:', error);
      alert(error.message);
    } else {
      setNewPost({ title: '', content: '', type: 'doubt' });
      const { data } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
      console.log('New posts after insert:', data);
      setPosts(data || []);
    }
  };

  const handleAddComment = async (postId, e) => {
    e.preventDefault();
    const commentContent = newComment[postId] || '';
    if (!commentContent.trim()) {
      alert('Comment cannot be empty!');
      return;
    }
    const { error } = await supabase.from('comments').insert({
      user_id: user.id,
      post_id: postId,
      content: commentContent,
    });
    if (error) {
      console.error('Comment insert error:', error);
      alert(error.message);
    } else {
      setNewComment({ ...newComment, [postId]: '' });
      const { data } = await supabase.from('comments').select('*');
      console.log('New comments after insert:', data);
      setComments(data || []);
    }
  };

  const handleVote = async (commentId, value) => {
    const existingVote = votes.find(v => v.comment_id === commentId);
    if (existingVote) {
      const { error } = await supabase.from('votes').delete().match({ id: existingVote.id });
      if (error) {
        console.error('Vote delete error:', error);
        alert(error.message);
      } else {
        setVotes(votes.filter(v => v.id !== existingVote.id));
      }
    } else {
      const { error } = await supabase.from('votes').insert({
        user_id: user.id,
        comment_id: commentId,
        value,
      });
      if (error) {
        console.error('Vote insert error:', error);
        alert(error.message);
      } else {
        const { data } = await supabase.from('votes').select('*').eq('user_id', user.id);
        console.log('Updated votes:', data);
        setVotes(data || []);
      }
    }
  };

  const getVoteCount = (commentId) => {
    const commentVotes = votes.filter(v => v.comment_id === commentId);
    const total = commentVotes.reduce((sum, v) => sum + v.value, 0);
    console.log(`Vote count for comment ${commentId}:`, total);
    return total;
  };

  const handlePostClick = (e, postId) => {
    // Prevent propagation from child elements from toggling
    if (e.target.tagName !== 'TEXTAREA' && e.target.tagName !== 'BUTTON' && e.target.tagName !== 'INPUT') {
      setSelectedPost(postId === selectedPost ? null : postId);
    }
  };

  const getPostTypeIcon = (type) => {
    switch(type) {
      case 'doubt':
        return <FaLightbulb />;
      case 'project':
        return <FaProjectDiagram />;
      case 'opportunity':
        return <FaBriefcase />;
      default:
        return <FaComments />;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const filteredPosts = activeTab === 'all' 
    ? posts 
    : posts.filter(post => post.type === activeTab);

  if (loading) return (
    <div className="spinner">
      <div></div>
    </div>
  );

  return (
    <div className="flex">
      <Sidebar currentView="forum" setView={setView} onLogout={onLogout} />
      
      {/* Main Content */}
      <div className="main-content">
        <header className="header">
          <h2><FaComments className="header-icon" /> Community Forum</h2>
          <div className="user-info">
            <span><FaUser /> {user.email}</span>
          </div>
        </header>

        {/* New Post Form */}
        <div className="forum-form-container">
          <h3>Create a Post</h3>
          <form className="forum-form" onSubmit={handleAddPost}>
            <input
              type="text"
              value={newPost.title}
              onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
              placeholder="Post Title"
              required
            />
            <textarea
              value={newPost.content}
              onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
              placeholder="Your doubt, project, or opportunity..."
              rows="4"
              required
            />
            <div className="form-row">
              <select
                value={newPost.type}
                onChange={(e) => setNewPost({ ...newPost, type: e.target.value })}
              >
                <option value="doubt">Doubt</option>
                <option value="project">Project</option>
                <option value="opportunity">Opportunity</option>
              </select>
              <button type="submit">Post</button>
            </div>
          </form>
        </div>

        {/* Posts List */}
        <div className="forum-posts">
          <div className="forum-header">
            <h3>Recent Posts</h3>
            <div className="forum-tabs">
              <button 
                className={activeTab === 'all' ? 'active' : ''} 
                onClick={() => setActiveTab('all')}
              >
                All
              </button>
              <button 
                className={activeTab === 'doubt' ? 'active' : ''} 
                onClick={() => setActiveTab('doubt')}
              >
                Doubts
              </button>
              <button 
                className={activeTab === 'project' ? 'active' : ''} 
                onClick={() => setActiveTab('project')}
              >
                Projects
              </button>
              <button 
                className={activeTab === 'opportunity' ? 'active' : ''} 
                onClick={() => setActiveTab('opportunity')}
              >
                Opportunities
              </button>
            </div>
          </div>
          
          {filteredPosts.length ? (
            filteredPosts.map(post => (
              <div
                key={post.id}
                className={`post-card ${selectedPost === post.id ? 'expanded' : ''}`}
                onClick={(e) => handlePostClick(e, post.id)}
              >
                <div className="post-header">
                  <h4>
                    {getPostTypeIcon(post.type)}
                    {post.title} 
                    <span className={`post-type ${post.type}`}>{post.type.toUpperCase()}</span>
                  </h4>
                  <div className="post-meta">
                    <span className="post-date"><FaRegClock /> {formatDate(post.created_at)}</span>
                    <span className="post-comments">{comments.filter(c => c.post_id === post.id).length} replies</span>
                  </div>
                </div>
                <p>{post.content}</p>
                <div className="post-footer">
                  <button className="view-comments-btn">
                    {selectedPost === post.id ? 'Hide Comments' : 'View Comments'}
                  </button>
                </div>
                {selectedPost === post.id && (
                  <div
                    className="comments-section"
                    onClick={(e) => e.stopPropagation()} // Prevent click inside comments from closing
                  >
                    <h5>Comments ({comments.filter(c => c.post_id === post.id).length})</h5>
                    {comments.filter(c => c.post_id === post.id).length ? (
                      comments.filter(c => c.post_id === post.id)
                        .sort((a, b) => getVoteCount(b.id) - getVoteCount(a.id))
                        .map(comment => (
                          <div key={comment.id} className="comment-card">
                            <p>{comment.content}</p>
                            <div className="vote-controls">
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleVote(comment.id, 1); }}
                                className={votes.find(v => v.comment_id === comment.id && v.value === 1) ? 'voted' : ''}
                              >
                                <FaArrowUp /> {getVoteCount(comment.id) > 0 ? getVoteCount(comment.id) : ''}
                              </button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleVote(comment.id, -1); }}
                                className={votes.find(v => v.comment_id === comment.id && v.value === -1) ? 'voted' : ''}
                              >
                                <FaArrowDown /> {getVoteCount(comment.id) < 0 ? -getVoteCount(comment.id) : ''}
                              </button>
                            </div>
                          </div>
                        ))
                    ) : (
                      <p className="no-comments">No comments yet. Be the first to reply!</p>
                    )}
                    <form className="comment-form" onSubmit={(e) => handleAddComment(post.id, e)}>
                      <textarea
                        value={newComment[post.id] || ''}
                        onChange={(e) => setNewComment({ ...newComment, [post.id]: e.target.value })}
                        onClick={(e) => e.stopPropagation()} // Prevent textarea click from closing
                        placeholder="Your answer..."
                        rows="3"
                        required
                      />
                      <button type="submit"><FaReply /> Reply</button>
                    </form>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="no-posts">
              <p>No posts yet. Be the first to start a discussion!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Forum;