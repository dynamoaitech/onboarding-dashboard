import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Login from './components/Login';
import Signup from './components/Signup';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';

const CATEGORIES = ['Admin', 'Technical', 'Relationship', 'Strategic', 'Leadership', 'Biz Dev'];
const PRIORITIES = ['High', 'Medium', 'Low'];

export default function App() {
  // Authentication state
  const [authState, setAuthState] = useState('loading'); // loading | authenticated | unauthenticated
  const [user, setUser] = useState(null); // { id, name, email }
  const [authView, setAuthView] = useState('login'); // login | signup | forgot | reset

  // Dashboard state
  const [tab, setTab] = useState('dashboard');
  const [currentDay, setCurrentDay] = useState(1);
  const [tasks, setTasks] = useState([]);
  const [completed, setCompleted] = useState({});
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [wins, setWins] = useState([]);
  const [newWin, setNewWin] = useState('');
  const [relationships, setRelationships] = useState([
    { id: 1, name: '', role: 'Direct Manager', importance: 'Critical', status: 'New' },
    { id: 2, name: '', role: 'Skip-Level', importance: 'High', status: 'New' },
    { id: 3, name: '', role: 'Quality Manager', importance: 'High', status: 'New' },
    { id: 4, name: '', role: 'BD Lead', importance: 'High', status: 'New' },
    { id: 5, name: '', role: 'Peer Principal', importance: 'Medium', status: 'New' },
    { id: 6, name: '', role: 'Direct Report', importance: 'High', status: 'New' },
  ]);
  const [weekNotes, setWeekNotes] = useState({ 1: '', 2: '', 3: '', 4: '' });
  const [loading, setLoading] = useState(true);
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [newTask, setNewTask] = useState({ week: 1, day: 1, task: '', category: 'Admin', priority: 'High' });

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth');
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
        setAuthState('authenticated');
      } else {
        setAuthState('unauthenticated');
      }
    } catch {
      setAuthState('unauthenticated');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'logout' })
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
    setAuthState('unauthenticated');
    setUser(null);
    setTasks([]);
    setCompleted({});
    setRelationships([]);
    setWins([]);
    setWeekNotes({ 1: '', 2: '', 3: '', 4: '' });
  };

  // Load data from API on mount (only when authenticated)
  useEffect(() => {
    if (authState !== 'authenticated') {
      setLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        // Load tasks
        const tasksRes = await fetch('/api/tasks');
        if (tasksRes.ok) {
          const tasksData = await tasksRes.json();
          setTasks(tasksData);
          const completedMap = {};
          tasksData.forEach(task => {
            if (task.status === 'completed') completedMap[task.id] = true;
          });
          setCompleted(completedMap);
        } else if (tasksRes.status === 401) {
          setAuthState('unauthenticated');
          return;
        }

        // Load relationships
        const relationshipsRes = await fetch('/api/relationships');
        if (relationshipsRes.ok) {
          const relationshipsData = await relationshipsRes.json();
          if (relationshipsData.length > 0) {
            setRelationships(relationshipsData);
          }
        }

        // Load wins
        const winsRes = await fetch('/api/wins');
        if (winsRes.ok) {
          const winsData = await winsRes.json();
          setWins(winsData);
        }

        // Load weekly notes
        const weeklyRes = await fetch('/api/weekly');
        if (weeklyRes.ok) {
          const weeklyData = await weeklyRes.json();
          const notesMap = { 1: '', 2: '', 3: '', 4: '' };
          weeklyData.forEach(log => {
            notesMap[log.week] = log.notes || '';
          });
          setWeekNotes(notesMap);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [authState]);

  // Toggle task completion and save to API
  const toggle = async (id) => {
    const newCompleted = { ...completed, [id]: !completed[id] };
    setCompleted(newCompleted);

    try {
      await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, completed: newCompleted[id] })
      });
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  // Create new task
  const createTask = async () => {
    if (!newTask.task.trim()) {
      alert('Please enter a task description');
      return;
    }

    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create', ...newTask })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        const createdTask = { ...newTask, id: data.id, status: 'pending' };
        setTasks([...tasks, createdTask]);
        setNewTask({ week: selectedWeek, day: 1, task: '', category: 'Admin', priority: 'High' });
        setShowNewTaskForm(false);

        // Reload tasks from server to ensure sync
        const tasksRes = await fetch('/api/tasks');
        if (tasksRes.ok) {
          const tasksData = await tasksRes.json();
          setTasks(tasksData);
        }
      } else {
        console.error('Failed to create task:', data);
        alert('Failed to create task: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Error creating task: ' + error.message);
    }
  };

  // Update task
  const updateTask = async (updatedTask) => {
    try {
      await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update', ...updatedTask })
      });

      setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t));
      setEditingTask(null);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  // Delete task
  const deleteTask = async (id) => {
    if (!confirm('Delete this task?')) return;

    try {
      await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', id })
      });

      setTasks(tasks.filter(t => t.id !== id));
      const newCompleted = { ...completed };
      delete newCompleted[id];
      setCompleted(newCompleted);
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  // Update relationship and save to API
  const updateRelationship = async (id, field, value) => {
    const updated = relationships.map(x => x.id === id ? {...x, [field]: value} : x);
    setRelationships(updated);

    const relationship = updated.find(r => r.id === id);
    try {
      await fetch('/api/relationships', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, name: relationship.name, status: relationship.status })
      });
    } catch (error) {
      console.error('Error saving relationship:', error);
    }
  };

  // Add win and save to API
  const addWin = async () => {
    if (!newWin.trim()) return;

    const win = { text: newWin, day: currentDay };
    setWins([...wins, win]);
    setNewWin('');

    try {
      await fetch('/api/wins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(win)
      });
    } catch (error) {
      console.error('Error saving win:', error);
    }
  };

  // Update weekly notes and save to API (with debounce)
  const updateWeeklyNotes = async (week, notes) => {
    setWeekNotes({...weekNotes, [week]: notes});

    // Debounce the API call
    if (window.weeklyNotesTimer) clearTimeout(window.weeklyNotesTimer);
    window.weeklyNotesTimer = setTimeout(async () => {
      try {
        await fetch('/api/weekly', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ week, notes })
        });
      } catch (error) {
        console.error('Error saving weekly notes:', error);
      }
    }, 1000);
  };

  const todayTasks = tasks.filter(t => t.day === currentDay);
  const weekTasks = tasks.filter(t => t.week === selectedWeek);
  const doneCount = Object.values(completed).filter(Boolean).length;
  const highPriority = tasks.filter(t => t.priority === 'High' && !completed[t.id]).length;

  const catColor = { Admin: 'bg-blue-100 text-blue-700', Technical: 'bg-purple-100 text-purple-700', Relationship: 'bg-green-100 text-green-700', Strategic: 'bg-orange-100 text-orange-700', Leadership: 'bg-pink-100 text-pink-700', 'Biz Dev': 'bg-yellow-100 text-yellow-700' };

  // Show loading screen while checking auth
  if (authState === 'loading') {
    return (
      <div className="min-h-screen bg-gray-500 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-semibold text-white">Loading...</div>
        </div>
      </div>
    );
  }

  // Show auth screens when not authenticated
  if (authState === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-gray-500 flex items-center justify-center">
        {authView === 'login' && <Login onSuccess={checkAuth} onNavigate={setAuthView} />}
        {authView === 'signup' && <Signup onSuccess={checkAuth} onNavigate={setAuthView} />}
        {authView === 'forgot' && <ForgotPassword onNavigate={setAuthView} />}
        {authView === 'reset' && <ResetPassword onSuccess={() => setAuthView('login')} />}
      </div>
    );
  }

  // Show loading screen while fetching dashboard data
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-500 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-semibold text-white">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  // Authenticated dashboard view
  return (
    <div className="min-h-screen bg-gray-500 text-slate-800">
      <header className="bg-white border-b px-4 py-3 sticky top-0 z-10">
        <div className="flex justify-between items-center max-w-4xl mx-auto">
          <div>
            <h1 className="font-bold text-lg">Onboarding Command Center</h1>
            <p className="text-xs text-slate-500">{user?.name} • {user?.email}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-100 rounded-lg px-3 py-1">
              <button onClick={() => setCurrentDay(Math.max(1, currentDay-1))} className="text-slate-400 hover:text-slate-600 text-lg">−</button>
              <div className="text-center">
                <div className="text-xs text-slate-500">Day</div>
                <div className="text-xl font-bold text-blue-600">{currentDay}</div>
              </div>
              <button onClick={() => setCurrentDay(Math.min(30, currentDay+1))} className="text-slate-400 hover:text-slate-600 text-lg">+</button>
            </div>
            <button onClick={handleLogout} className="px-3 py-1.5 text-sm bg-slate-200 hover:bg-slate-300 rounded-lg transition-colors">
              Logout
            </button>
          </div>
        </div>
      </header>

      <nav className="bg-white border-b px-4 py-2 overflow-x-auto sticky top-16 z-10">
        <div className="flex gap-1 max-w-4xl mx-auto">
          {[['dashboard','📊 Dashboard'],['tasks','✅ Tasks'],['people','👥 People'],['weekly','📅 Weekly'],['wins','🏆 Wins'],['progress','📈 Progress']].map(([k,l]) => (
            <button key={k} onClick={() => setTab(k)} className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap ${tab === k ? 'bg-blue-600 text-white' : 'hover:bg-slate-100'}`}>{l}</button>
          ))}
        </div>
      </nav>

      <main className="max-w-4xl mx-auto p-4">
        {tab === 'dashboard' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-white rounded-xl p-4 shadow-sm"><div className="text-2xl font-bold text-blue-600">{doneCount}/{tasks.length}</div><div className="text-xs text-slate-500">Tasks Done</div></div>
              <div className="bg-white rounded-xl p-4 shadow-sm"><div className="text-2xl font-bold text-red-500">{highPriority}</div><div className="text-xs text-slate-500">High Priority Left</div></div>
              <div className="bg-white rounded-xl p-4 shadow-sm"><div className="text-2xl font-bold text-green-600">{relationships.filter(r=>r.name).length}/{relationships.length}</div><div className="text-xs text-slate-500">Contacts Made</div></div>
              <div className="bg-white rounded-xl p-4 shadow-sm"><div className="text-2xl font-bold text-yellow-500">{wins.length}</div><div className="text-xs text-slate-500">Wins Logged</div></div>
            </div>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="bg-blue-600 text-white px-4 py-2 font-semibold">Day {currentDay} Tasks</div>
              {todayTasks.length ? todayTasks.map(t => (
                <div key={t.id} onClick={() => toggle(t.id)} className="px-4 py-3 border-b flex items-center gap-3 cursor-pointer hover:bg-slate-50">
                  <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${completed[t.id] ? 'bg-green-500 border-green-500 text-white' : 'border-slate-300'}`}>{completed[t.id] && '✓'}</span>
                  <span className={completed[t.id] ? 'line-through text-slate-400' : ''}>{t.task}</span>
                  <span className={`ml-auto text-xs px-2 py-0.5 rounded ${catColor[t.category]}`}>{t.category}</span>
                </div>
              )) : <div className="p-8 text-center text-slate-400">No tasks for Day {currentDay}</div>}
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="font-semibold mb-2">Quick Win</div>
              <div className="flex gap-2">
                <input value={newWin} onChange={e => setNewWin(e.target.value)} placeholder="Log an accomplishment..." className="flex-1 px-3 py-2 border rounded-lg" onKeyDown={e => { if (e.key === 'Enter') addWin(); }} />
                <button onClick={addWin} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Add</button>
              </div>
            </div>
          </div>
        )}

        {tab === 'tasks' && (
          <div className="space-y-4">
            <div className="flex gap-2 justify-between items-center">
              <div className="flex gap-2">{[1,2,3,4].map(w => <button key={w} onClick={() => setSelectedWeek(w)} className={`px-4 py-2 rounded-lg ${selectedWeek === w ? 'bg-blue-600 text-white' : 'bg-white'}`}>Week {w}</button>)}</div>
              <button onClick={() => { setNewTask({ week: selectedWeek, day: selectedWeek * 7 - 6, task: '', category: 'Admin', priority: 'High' }); setShowNewTaskForm(true); }} className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center gap-2">
                <span className="text-lg">+</span> Add Task
              </button>
            </div>

            {showNewTaskForm && (
              <div className="bg-white rounded-xl shadow-sm p-4">
                <div className="font-semibold mb-3">New Task</div>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-slate-500">Week</label>
                      <input type="number" min="1" max="4" value={newTask.week} onChange={e => setNewTask({...newTask, week: parseInt(e.target.value)})} className="w-full px-3 py-2 border rounded-lg" />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500">Day</label>
                      <input type="number" min="1" max="30" value={newTask.day} onChange={e => setNewTask({...newTask, day: parseInt(e.target.value)})} className="w-full px-3 py-2 border rounded-lg" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500">Task Description</label>
                    <input type="text" value={newTask.task} onChange={e => setNewTask({...newTask, task: e.target.value})} onKeyDown={e => { if (e.key === 'Enter') createTask(); }} placeholder="Enter task description..." className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-slate-500">Category</label>
                      <select value={newTask.category} onChange={e => setNewTask({...newTask, category: e.target.value})} className="w-full px-3 py-2 border rounded-lg">
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-slate-500">Priority</label>
                      <select value={newTask.priority} onChange={e => setNewTask({...newTask, priority: e.target.value})} className="w-full px-3 py-2 border rounded-lg">
                        {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={createTask} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Create</button>
                    <button onClick={() => setShowNewTaskForm(false)} className="px-4 py-2 bg-slate-200 rounded-lg">Cancel</button>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              {weekTasks.map(t => (
                editingTask?.id === t.id ? (
                  <div key={t.id} className="px-4 py-3 border-b bg-slate-50">
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <input type="number" min="1" max="4" value={editingTask.week} onChange={e => setEditingTask({...editingTask, week: parseInt(e.target.value)})} className="px-2 py-1 border rounded text-sm" placeholder="Week" />
                        <input type="number" min="1" max="30" value={editingTask.day} onChange={e => setEditingTask({...editingTask, day: parseInt(e.target.value)})} className="px-2 py-1 border rounded text-sm" placeholder="Day" />
                      </div>
                      <input type="text" value={editingTask.task} onChange={e => setEditingTask({...editingTask, task: e.target.value})} className="w-full px-2 py-1 border rounded text-sm" />
                      <div className="grid grid-cols-2 gap-2">
                        <select value={editingTask.category} onChange={e => setEditingTask({...editingTask, category: e.target.value})} className="px-2 py-1 border rounded text-sm">
                          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <select value={editingTask.priority} onChange={e => setEditingTask({...editingTask, priority: e.target.value})} className="px-2 py-1 border rounded text-sm">
                          {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => updateTask(editingTask)} className="px-3 py-1 bg-blue-600 text-white rounded text-sm">Save</button>
                        <button onClick={() => setEditingTask(null)} className="px-3 py-1 bg-slate-200 rounded text-sm">Cancel</button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div key={t.id} className="px-4 py-3 border-b flex items-center gap-3 hover:bg-slate-50">
                    <span onClick={() => toggle(t.id)} className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-xs cursor-pointer ${completed[t.id] ? 'bg-green-500 border-green-500 text-white' : 'border-slate-300'}`}>{completed[t.id] && '✓'}</span>
                    <span className="text-xs text-slate-400 w-10">Day {t.day}</span>
                    <span className={`flex-1 ${completed[t.id] ? 'line-through text-slate-400' : ''}`}>{t.task}</span>
                    <span className={`text-xs px-2 py-0.5 rounded ${catColor[t.category]}`}>{t.category}</span>
                    <span className={`text-xs ${t.priority === 'High' ? 'text-red-500 font-bold' : 'text-slate-400'}`}>{t.priority}</span>
                    <button onClick={() => setEditingTask(t)} className="text-blue-600 hover:text-blue-800 text-sm">✏️</button>
                    <button onClick={() => deleteTask(t.id)} className="text-red-600 hover:text-red-800 text-sm">🗑️</button>
                  </div>
                )
              ))}
              {weekTasks.length === 0 && <div className="p-8 text-center text-slate-400">No tasks for Week {selectedWeek}</div>}
            </div>
          </div>
        )}

        {tab === 'people' && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50"><tr><th className="px-3 py-2 text-left">Name</th><th className="px-3 py-2 text-left">Role</th><th className="px-3 py-2 text-left">Status</th></tr></thead>
              <tbody>{relationships.map(r => (
                <tr key={r.id} className="border-t">
                  <td className="px-3 py-2"><input value={r.name} onChange={e => updateRelationship(r.id, 'name', e.target.value)} placeholder="Enter name..." className="w-full px-2 py-1 border rounded" /></td>
                  <td className="px-3 py-2">{r.role}<span className={`ml-2 text-xs px-1.5 py-0.5 rounded ${r.importance === 'Critical' ? 'bg-red-100 text-red-600' : r.importance === 'High' ? 'bg-orange-100 text-orange-600' : 'bg-slate-100'}`}>{r.importance}</span></td>
                  <td className="px-3 py-2"><select value={r.status} onChange={e => updateRelationship(r.id, 'status', e.target.value)} className="px-2 py-1 border rounded text-xs">{['New','Building','Strong','Needs Work'].map(s => <option key={s}>{s}</option>)}</select></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}

        {tab === 'weekly' && (
          <div className="space-y-4">
            <div className="flex gap-2">{[1,2,3,4].map(w => <button key={w} onClick={() => setSelectedWeek(w)} className={`px-4 py-2 rounded-lg ${selectedWeek === w ? 'bg-blue-600 text-white' : 'bg-white'}`}>Week {w}</button>)}</div>
            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="font-semibold mb-2">Week {selectedWeek} Progress Log</div>
              <textarea value={weekNotes[selectedWeek]} onChange={e => updateWeeklyNotes(selectedWeek, e.target.value)} placeholder="Key accomplishments, challenges, lessons learned..." className="w-full h-40 px-3 py-2 border rounded-lg" />
              <div className="mt-3 p-3 bg-yellow-50 rounded-lg text-sm text-yellow-800"><strong>Friday Tip:</strong> Copy to email for your manager. Structure: Completed, In Progress, Planned, Need Input.</div>
            </div>
          </div>
        )}

        {tab === 'wins' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="font-semibold mb-2">🏆 Log Your Wins</div>
              <div className="flex gap-2">
                <input value={newWin} onChange={e => setNewWin(e.target.value)} placeholder="What did you accomplish?" className="flex-1 px-3 py-2 border rounded-lg" onKeyDown={e => { if (e.key === 'Enter') addWin(); }} />
                <button onClick={addWin} className="px-4 py-2 bg-yellow-500 text-white rounded-lg">Add</button>
              </div>
            </div>
            {wins.length ? wins.map((w,i) => <div key={i} className="bg-white rounded-xl shadow-sm p-4 flex gap-3"><span className="text-yellow-500">🏆</span><div><div>{w.text}</div><div className="text-xs text-slate-400">Day {w.day}</div></div></div>) : <div className="bg-white rounded-xl shadow-sm p-8 text-center text-slate-400">No wins yet. Start logging!</div>}
          </div>
        )}

        {tab === 'progress' && (
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {/* Overall Progress - Pie Chart */}
              <div className="bg-white rounded-xl shadow-sm p-4">
                <div className="font-semibold mb-3">Overall Progress</div>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Completed', value: doneCount },
                        { name: 'Remaining', value: tasks.length - doneCount }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      <Cell fill="#10b981" />
                      <Cell fill="#e5e7eb" />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="text-center mt-2">
                  <div className="text-2xl font-bold text-blue-600">{tasks.length > 0 ? Math.round((doneCount / tasks.length) * 100) : 0}%</div>
                  <div className="text-xs text-slate-500">{doneCount} of {tasks.length} tasks completed</div>
                </div>
              </div>

              {/* Progress by Week - Bar Chart */}
              <div className="bg-white rounded-xl shadow-sm p-4">
                <div className="font-semibold mb-3">Progress by Week</div>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart
                    data={[1,2,3,4].map(week => {
                      const weekTasksData = tasks.filter(t => t.week === week);
                      const weekCompleted = weekTasksData.filter(t => completed[t.id]).length;
                      return {
                        week: `Week ${week}`,
                        Completed: weekCompleted,
                        Remaining: weekTasksData.length - weekCompleted
                      };
                    })}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Completed" stackId="a" fill="#10b981" />
                    <Bar dataKey="Remaining" stackId="a" fill="#e5e7eb" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Progress by Category - Horizontal Bar Chart */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="font-semibold mb-3">Progress by Category</div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  layout="vertical"
                  data={CATEGORIES.map(cat => {
                    const catTasks = tasks.filter(t => t.category === cat);
                    const catCompleted = catTasks.filter(t => completed[t.id]).length;
                    return {
                      category: cat,
                      Completed: catCompleted,
                      Remaining: catTasks.length - catCompleted
                    };
                  })}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="category" type="category" width={100} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Completed" stackId="a" fill="#10b981" />
                  <Bar dataKey="Remaining" stackId="a" fill="#e5e7eb" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Daily Completion Trend - Line Chart */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="font-semibold mb-3">Daily Completion Trend</div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={Array.from({length: 30}, (_, i) => {
                    const day = i + 1;
                    const completedByDay = tasks.filter(t => t.day <= day && completed[t.id]).length;
                    return {
                      day: `Day ${day}`,
                      Completed: completedByDay
                    };
                  })}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" interval={4} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="Completed" stroke="#3b82f6" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
