import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import axios from 'axios';
import { FaUser, FaSignOutAlt, FaTrophy, FaBook, FaBriefcase, FaFileAlt, FaTasks, FaCode } from 'react-icons/fa';
import Sidebar from './Sidebar';
import '../global.css';
import '../sidebar.css';
import '../main.css';
import '../stylec.css';

// Judge0 API Configuration
const JUDGE0_URL = 'https://judge0-ce.p.rapidapi.com/submissions';
const JUDGE0_API_KEY = '790ec0e011msh28fee3e4e8f7e56p1ba8d9jsne0623b5e7bf8'; // Your provided API key (requires subscription fix)

const Contests = ({ user, onLogout, setView }) => {
  const [profile, setProfile] = useState(null);
  const [contests, setContests] = useState([]);
  const [problems, setProblems] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [newProblem, setNewProblem] = useState({ contest_id: '', title: '', description: '', test_cases: '' });
  const [code, setCode] = useState('');
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [profileData, contestsData, problemsData, submissionsData] = await Promise.all([
          supabase.from('profiles').select('role').eq('id', user.id).single(),
          supabase.from('contests').select('*'),
          supabase.from('problems').select('*'),
          supabase.from('submissions').select('*').eq('user_id', user.id),
        ]);
        if (profileData.error) throw profileData.error;
        if (contestsData.error) throw contestsData.error;
        if (problemsData.error) throw problemsData.error;
        if (submissionsData.error) throw submissionsData.error;

        setProfile(profileData.data);
        setContests(contestsData.data || []);
        setProblems(problemsData.data || []);
        setSubmissions(submissionsData.data || []);
      } catch (err) {
        console.error('Supabase fetch error:', err.message);
        setError('Failed to load data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    if (user && user.id) fetchData();
  }, [user]);

  const handleAddProblem = async (e) => {
    e.preventDefault();
    try {
      const testCases = newProblem.test_cases ? JSON.parse(newProblem.test_cases) : [];
      const { error } = await supabase.from('problems').insert({
        contest_id: parseInt(newProblem.contest_id),
        title: newProblem.title,
        description: newProblem.description,
        test_cases: testCases,
      });
      if (error) throw error;
      const { data } = await supabase.from('problems').select('*');
      setProblems(data || []);
      setNewProblem({ contest_id: '', title: '', description: '', test_cases: '' });
    } catch (err) {
      alert(`Error adding problem: ${err.message}`);
    }
  };

  const evaluateCode = async (problem, userCode) => {
    setOutput('Running...');
    let score = 0;
    const results = [];

    // Validate and sanitize userCode
    let sanitizedCode = userCode.trim();
    if (!sanitizedCode) {
      sanitizedCode = 'input => ""'; // Default to an empty string function if no code
    } else {
      try {
        // Test if the code is a valid function or expression
        new Function(`return ${sanitizedCode}`); // This will throw a SyntaxError if invalid
      } catch (e) {
        setError(`Syntax Error: ${e.message}. Please provide valid JavaScript code.`);
        setOutput('Error: Invalid code provided.');
        return 0;
      }
    }

    // Wrap the sanitized code
    const wrappedCode = `
      const solve = ${sanitizedCode};
      const readline = require('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: false
      });
      rl.on('line', (input) => {
        const result = solve(input.trim());
        console.log(result !== undefined && result !== null ? result.toString() : '');
        rl.close();
      });
    `;

    for (const test of problem.test_cases) {
      const maxRetries = 5;
      let attempt = 0;
      let delay = 2000; // Initial delay of 2 seconds

      while (attempt < maxRetries) {
        try {
          const response = await axios.post(
            JUDGE0_URL,
            {
              source_code: wrappedCode,
              language_id: 63, // JavaScript (Node.js)
              stdin: test.input,
              expected_output: test.output,
            },
            {
              headers: {
                'X-RapidAPI-Key': JUDGE0_API_KEY,
                'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
                'Content-Type': 'application/json',
              },
            }
          );

          const token = response.data.token;
          let status, result;

          // Poll with exponential backoff
          for (let pollAttempt = 0; pollAttempt < 5; pollAttempt++) {
            await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, pollAttempt))); // 1s, 2s, 4s, 8s, 16s
            result = await axios.get(`${JUDGE0_URL}/${token}`, {
              headers: {
                'X-RapidAPI-Key': JUDGE0_API_KEY,
                'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
              },
            });
            status = result.data.status.id;
            console.log('Judge0 Result:', result.data);

            if (status >= 3) break; // Completed (Accepted, Wrong Answer, etc.)
          }

          if (status === 3) { // Accepted
            const stdout = result.data.stdout ? result.data.stdout.trim() : '';
            results.push({ input: test.input, output: stdout, expected: test.output.trim() });
            if (stdout === test.output.trim()) score += 100 / problem.test_cases.length;
          } else if (status > 3) { // Error or Wrong Answer
            results.push({
              input: test.input,
              output: result.data.stderr || result.data.stdout || `Error (Status: ${result.data.status.description})`,
              expected: test.output.trim(),
            });
          }
          break; // Success, exit retry loop
        } catch (e) {
          console.error('Judge0 API error:', e.response ? e.response.data : e.message);
          if (e.response?.status === 403) {
            setError('403 Forbidden: You are not subscribed to Judge0 API. Please subscribe on RapidAPI and update the API key.');
            return 0; // Exit early
          } else if (e.response?.status === 429) {
            const retryAfter = e.response.headers['retry-after']
              ? parseInt(e.response.headers['retry-after']) * 1000
              : delay;
            console.warn(`Rate limit hit (attempt ${attempt + 1}/${maxRetries}), retrying after ${retryAfter}ms...`);
            await new Promise(resolve => setTimeout(resolve, retryAfter));
            delay *= 2; // Exponential backoff
            attempt++;
            if (attempt === maxRetries) {
              setError('429 Too Many Requests: Maximum retries reached. Please wait and try again later.');
              results.push({ input: test.input, output: 'Rate Limit Exceeded', expected: test.output });
              return 0;
            }
          } else {
            setError(`API Error: ${e.message}`);
            results.push({ input: test.input, output: 'API Error', expected: test.output });
            break;
          }
        }
      }
    }

    setOutput(results.map(r => `Input: ${r.input}\nOutput: ${r.output}\nExpected: ${r.expected}`).join('\n\n') || 'No results');
    return Math.round(score);
  };

  const handleSubmitCode = async () => {
    if (!selectedProblem) {
      setError('Please select a problem first.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const score = await evaluateCode(selectedProblem, code);
      const { error } = await supabase.from('submissions').insert({
        user_id: user.id,
        problem_id: selectedProblem.id,
        code,
        score,
      });
      if (error) throw error;
      const { data } = await supabase.from('submissions').select('*').eq('user_id', user.id);
      setSubmissions(data || []);
      setOutput(prev => `${prev}\nFinal Score: ${score}`);
    } catch (err) {
      setError(`Submission error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const leaderboard = contests.map(contest => {
    const contestSubmissions = submissions.filter(s => 
      problems.some(p => p.id === s.problem_id && p.contest_id === contest.id)
    );
    const userScores = contestSubmissions.reduce((acc, sub) => {
      acc[sub.user_id] = (acc[sub.user_id] || 0) + sub.score;
      return acc;
    }, {});
    return { contest, scores: Object.entries(userScores).sort((a, b) => b[1] - a[1]) };
  });

  if (loading) return (
    <div className="spinner">
      <div></div>
    </div>
  );

  return (
    <div className="flex">
      <Sidebar currentView="contests" setView={setView} onLogout={onLogout} />

      <div className="main-content">
        <header className="header">
          <h2>Coding Contests</h2>
        </header>

        {error && <div className="error-message">{error}</div>}

        {/* Add Problem (Admin Only) */}
        {profile?.role === 'admin' && (
          <div className="problem-form-container">
            <h3><FaTasks /> Add Problem</h3>
            <form className="problem-form" onSubmit={handleAddProblem}>
              <select
                value={newProblem.contest_id}
                onChange={(e) => setNewProblem({ ...newProblem, contest_id: e.target.value })}
                required
              >
                <option value="">Select Contest</option>
                {contests.map(c => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
              <input
                type="text"
                value={newProblem.title}
                onChange={(e) => setNewProblem({ ...newProblem, title: e.target.value })}
                placeholder="Problem Title"
                required
              />
              <textarea
                value={newProblem.description}
                onChange={(e) => setNewProblem({ ...newProblem, description: e.target.value })}
                placeholder="Problem Description"
                rows="4"
                required
              />
              <textarea
                value={newProblem.test_cases}
                onChange={(e) => setNewProblem({ ...newProblem, test_cases: e.target.value })}
                placeholder='Test Cases (JSON: [{"input": "1 2", "output": "3"}] )'
                rows="4"
              />
              <button type="submit"><FaCode /> Add Problem</button>
            </form>
          </div>
        )}

        {/* Contests & Problems */}
        <div className="contests-list">
          <h3><FaTrophy /> Active Contests</h3>
          {contests.map(contest => (
            <div key={contest.id} className="contest-card">
              <h4>{contest.title}</h4>
              <p>Start: {contest.start_time ? new Date(contest.start_time).toLocaleString() : 'TBD'}</p>
              <p>End: {contest.end_time ? new Date(contest.end_time).toLocaleString() : 'TBD'}</p>
              <div className="problems-list">
                {problems.filter(p => p.contest_id === contest.id).map(problem => (
                  <div key={problem.id} className="problem-card" onClick={() => setSelectedProblem(problem)}>
                    <h5>{problem.title}</h5>
                    <p>{problem.description.slice(0, 100)}...</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Code Editor */}
        {selectedProblem && (
          <div className="code-editor">
            <h3><FaCode /> {selectedProblem.title}</h3>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Write your JavaScript code here..."
              rows="10"
            />
            <button onClick={handleSubmitCode}><FaFileAlt /> Submit Code</button>
            <div className="output">
              <h4>Output & Results</h4>
              <pre>{output}</pre>
            </div>
          </div>
        )}

        {/* Leaderboard */}
        <div className="leaderboard">
          <h3><FaTrophy /> Leaderboard</h3>
          {leaderboard.map(({ contest, scores }) => (
            <div key={contest.id} className="leaderboard-section">
              <h4>{contest.title}</h4>
              <ul>
                {scores.map(([userId, score]) => (
                  <li key={userId}>{userId.slice(0, 8)}...: {score}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Contests;