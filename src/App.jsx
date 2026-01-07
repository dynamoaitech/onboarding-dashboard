import React, { useState } from 'react';

const TASKS = [
  { id: 1, week: 1, day: 1, task: "Complete HR paperwork and benefits enrollment", category: "Admin", priority: "High" },
  { id: 2, week: 1, day: 1, task: "Set up IT access (email, systems, VPN)", category: "Admin", priority: "High" },
  { id: 3, week: 1, day: 1, task: "Meet with direct manager - clarify expectations", category: "Relationship", priority: "High" },
  { id: 4, week: 1, day: 1, task: "Request organizational chart", category: "Admin", priority: "Medium" },
  { id: 5, week: 1, day: 1, task: "Schedule 1:1s with direct reports", category: "Relationship", priority: "High" },
  { id: 6, week: 1, day: 2, task: "Review Apex quality management system", category: "Technical", priority: "High" },
  { id: 7, week: 1, day: 2, task: "Study accreditation documentation", category: "Technical", priority: "High" },
  { id: 8, week: 1, day: 3, task: "Review current service offerings", category: "Technical", priority: "High" },
  { id: 9, week: 1, day: 3, task: "Study ISO 14044 documentation", category: "Technical", priority: "High" },
  { id: 10, week: 1, day: 3, task: "Study ISO 14067 documentation", category: "Technical", priority: "High" },
  { id: 11, week: 1, day: 4, task: "Review sample verification reports", category: "Technical", priority: "Medium" },
  { id: 12, week: 1, day: 5, task: "Review PCR documents in your domain", category: "Technical", priority: "Medium" },
  { id: 13, week: 1, day: 5, task: "Identify gaps in team capabilities", category: "Strategic", priority: "Medium" },
  { id: 14, week: 1, day: 6, task: "Meet with Quality Manager", category: "Relationship", priority: "High" },
  { id: 15, week: 1, day: 6, task: "Meet with 2-3 peer principals", category: "Relationship", priority: "Medium" },
  { id: 16, week: 1, day: 7, task: "Prepare Week 1 summary for manager", category: "Admin", priority: "High" },
  { id: 17, week: 2, day: 8, task: "Shadow team on active verification audit", category: "Technical", priority: "High" },
  { id: 18, week: 2, day: 9, task: "Attend client meeting as observer", category: "Relationship", priority: "Medium" },
  { id: 19, week: 2, day: 10, task: "Meet with Business Development team", category: "Relationship", priority: "High" },
  { id: 20, week: 2, day: 11, task: "Begin technical review of assigned project", category: "Technical", priority: "High" },
  { id: 21, week: 2, day: 12, task: "Identify 2-3 market expansion opportunities", category: "Strategic", priority: "Medium" },
  { id: 22, week: 2, day: 14, task: "Prepare Week 2 summary", category: "Admin", priority: "High" },
  { id: 23, week: 3, day: 15, task: "Lead/co-lead a verification project", category: "Technical", priority: "High" },
  { id: 24, week: 3, day: 16, task: "Conduct knowledge-sharing session", category: "Leadership", priority: "High" },
  { id: 25, week: 3, day: 18, task: "Contribute to proposal/client deliverable", category: "Biz Dev", priority: "High" },
  { id: 26, week: 3, day: 19, task: "Present process improvement recommendations", category: "Strategic", priority: "High" },
  { id: 27, week: 3, day: 21, task: "Draft preliminary 90-day vision", category: "Strategic", priority: "High" },
  { id: 28, week: 4, day: 22, task: "Complete significant technical deliverable", category: "Technical", priority: "High" },
  { id: 29, week: 4, day: 23, task: "Lead client presentation or meeting", category: "Relationship", priority: "High" },
  { id: 30, week: 4, day: 24, task: "Submit proposal or scope document", category: "Biz Dev", priority: "High" },
  { id: 31, week: 4, day: 26, task: "Meet with skip-level manager", category: "Relationship", priority: "High" },
  { id: 32, week: 4, day: 27, task: "Finalize 30-day assessment", category: "Strategic", priority: "High" },
  { id: 33, week: 4, day: 28, task: "Present 60/90-day strategic plan", category: "Strategic", priority: "High" },
  { id: 34, week: 4, day: 30, task: "Set personal development goals", category: "Strategic", priority: "Medium" },
];

const SCENARIOS = [
  { title: "Skip-Level Asks About Problems", situation: "Your skip-level asks how things are going", wrong: "Complain about processes or people", right: "\"Things are going well. I'm learning a lot and [manager] has been very helpful. We're working through some improvements together. Is there anything specific you'd like me to focus on?\"", why: "Positive, credits manager, redirects to their priorities" },
  { title: "Asked to Do Something Below Your Level", situation: "Manager asks you to do admin work", wrong: "\"That's not in my job description.\"", right: "\"Happy to help. Can we discuss how to balance it with [priority]? I want to focus where I add most value.\"", why: "Shows flexibility while redirecting" },
  { title: "Peer Takes Credit for Your Work", situation: "Colleague presents your idea as theirs", wrong: "\"Actually, that was my idea.\"", right: "\"Glad to see this gaining traction. When I was exploring this, I also found [insight]. Would it help if I shared my notes?\"", why: "Subtly establishes involvement, adds value" },
  { title: "You Make a Mistake", situation: "You made an error affecting a deliverable", wrong: "\"It wasn't entirely my fault...\"", right: "\"I made an error on [X]. Here's what happened, the impact, and my plan to fix it. I wanted you to know immediately.\"", why: "Takes ownership, shows problem-solving" },
];

const PHRASES = [
  { situation: "Entering a discussion", phrase: "\"Building on what [name] said...\"" },
  { situation: "Offering different view", phrase: "\"Another lens to consider...\"" },
  { situation: "Admitting uncertainty", phrase: "\"I don't have the full picture yet, but...\"" },
  { situation: "Volunteering", phrase: "\"I can take point on that and report back by [date].\"" },
  { situation: "Disagreeing with senior", phrase: "\"I see the logic. One thing I've seen work is...\"" },
];

export default function App() {
  const [tab, setTab] = useState('dashboard');
  const [currentDay, setCurrentDay] = useState(1);
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
  const [expandedScenario, setExpandedScenario] = useState(null);
  const [weekNotes, setWeekNotes] = useState({ 1: '', 2: '', 3: '', 4: '' });

  const toggle = (id) => setCompleted({ ...completed, [id]: !completed[id] });
  const todayTasks = TASKS.filter(t => t.day === currentDay);
  const weekTasks = TASKS.filter(t => t.week === selectedWeek);
  const doneCount = Object.values(completed).filter(Boolean).length;
  const highPriority = TASKS.filter(t => t.priority === 'High' && !completed[t.id]).length;

  const catColor = { Admin: 'bg-blue-100 text-blue-700', Technical: 'bg-purple-100 text-purple-700', Relationship: 'bg-green-100 text-green-700', Strategic: 'bg-orange-100 text-orange-700', Leadership: 'bg-pink-100 text-pink-700', 'Biz Dev': 'bg-yellow-100 text-yellow-700' };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <header className="bg-white border-b px-4 py-3 sticky top-0 z-10">
        <div className="flex justify-between items-center max-w-4xl mx-auto">
          <div>
            <h1 className="font-bold text-lg">Onboarding Command Center</h1>
            <p className="text-xs text-slate-500">Principal/Lead Assurer • Apex Companies</p>
          </div>
          <div className="flex items-center gap-2 bg-slate-100 rounded-lg px-3 py-1">
            <button onClick={() => setCurrentDay(Math.max(1, currentDay-1))} className="text-slate-400 hover:text-slate-600 text-lg">−</button>
            <div className="text-center">
              <div className="text-xs text-slate-500">Day</div>
              <div className="text-xl font-bold text-blue-600">{currentDay}</div>
            </div>
            <button onClick={() => setCurrentDay(Math.min(30, currentDay+1))} className="text-slate-400 hover:text-slate-600 text-lg">+</button>
          </div>
        </div>
      </header>

      <nav className="bg-white border-b px-4 py-2 overflow-x-auto sticky top-16 z-10">
        <div className="flex gap-1 max-w-4xl mx-auto">
          {[['dashboard','📊 Dashboard'],['tasks','✅ Tasks'],['people','👥 People'],['playbook','📖 Playbook'],['weekly','📅 Weekly'],['wins','🏆 Wins']].map(([k,l]) => (
            <button key={k} onClick={() => setTab(k)} className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap ${tab === k ? 'bg-blue-600 text-white' : 'hover:bg-slate-100'}`}>{l}</button>
          ))}
        </div>
      </nav>

      <main className="max-w-4xl mx-auto p-4">
        {tab === 'dashboard' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-white rounded-xl p-4 shadow-sm"><div className="text-2xl font-bold text-blue-600">{doneCount}/{TASKS.length}</div><div className="text-xs text-slate-500">Tasks Done</div></div>
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
                <input value={newWin} onChange={e => setNewWin(e.target.value)} placeholder="Log an accomplishment..." className="flex-1 px-3 py-2 border rounded-lg" onKeyDown={e => { if (e.key === 'Enter' && newWin.trim()) { setWins([...wins, { text: newWin, day: currentDay }]); setNewWin(''); }}} />
                <button onClick={() => { if (newWin.trim()) { setWins([...wins, { text: newWin, day: currentDay }]); setNewWin(''); }}} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Add</button>
              </div>
            </div>
          </div>
        )}

        {tab === 'tasks' && (
          <div className="space-y-4">
            <div className="flex gap-2">{[1,2,3,4].map(w => <button key={w} onClick={() => setSelectedWeek(w)} className={`px-4 py-2 rounded-lg ${selectedWeek === w ? 'bg-blue-600 text-white' : 'bg-white'}`}>Week {w}</button>)}</div>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              {weekTasks.map(t => (
                <div key={t.id} onClick={() => toggle(t.id)} className="px-4 py-3 border-b flex items-center gap-3 cursor-pointer hover:bg-slate-50">
                  <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-xs ${completed[t.id] ? 'bg-green-500 border-green-500 text-white' : 'border-slate-300'}`}>{completed[t.id] && '✓'}</span>
                  <span className="text-xs text-slate-400 w-10">Day {t.day}</span>
                  <span className={`flex-1 ${completed[t.id] ? 'line-through text-slate-400' : ''}`}>{t.task}</span>
                  <span className={`text-xs px-2 py-0.5 rounded ${catColor[t.category]}`}>{t.category}</span>
                  <span className={`text-xs ${t.priority === 'High' ? 'text-red-500 font-bold' : 'text-slate-400'}`}>{t.priority}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'people' && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50"><tr><th className="px-3 py-2 text-left">Name</th><th className="px-3 py-2 text-left">Role</th><th className="px-3 py-2 text-left">Status</th></tr></thead>
              <tbody>{relationships.map(r => (
                <tr key={r.id} className="border-t">
                  <td className="px-3 py-2"><input value={r.name} onChange={e => setRelationships(relationships.map(x => x.id === r.id ? {...x, name: e.target.value} : x))} placeholder="Enter name..." className="w-full px-2 py-1 border rounded" /></td>
                  <td className="px-3 py-2">{r.role}<span className={`ml-2 text-xs px-1.5 py-0.5 rounded ${r.importance === 'Critical' ? 'bg-red-100 text-red-600' : r.importance === 'High' ? 'bg-orange-100 text-orange-600' : 'bg-slate-100'}`}>{r.importance}</span></td>
                  <td className="px-3 py-2"><select value={r.status} onChange={e => setRelationships(relationships.map(x => x.id === r.id ? {...x, status: e.target.value} : x))} className="px-2 py-1 border rounded text-xs">{['New','Building','Strong','Needs Work'].map(s => <option key={s}>{s}</option>)}</select></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}

        {tab === 'playbook' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="font-semibold mb-3">🎤 Power Phrases for Meetings</div>
              <div className="grid md:grid-cols-2 gap-2">{PHRASES.map((p,i) => <div key={i} className="p-2 bg-slate-50 rounded-lg"><div className="text-xs text-slate-500">{p.situation}</div><div className="text-sm font-medium text-blue-700">{p.phrase}</div></div>)}</div>
            </div>
            <div className="font-semibold">📋 Scenario Playbook</div>
            {SCENARIOS.map((s,i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <button onClick={() => setExpandedScenario(expandedScenario === i ? null : i)} className="w-full px-4 py-3 flex justify-between items-center hover:bg-slate-50"><span className="font-medium">{s.title}</span><span className="text-slate-400">{expandedScenario === i ? '−' : '+'}</span></button>
                {expandedScenario === i && (
                  <div className="px-4 pb-4 space-y-2">
                    <div className="p-2 bg-slate-50 rounded text-sm"><span className="text-slate-500">Situation:</span> {s.situation}</div>
                    <div className="p-2 bg-red-50 rounded text-sm border-l-4 border-red-400"><span className="text-red-600">❌ Don't:</span> {s.wrong}</div>
                    <div className="p-2 bg-green-50 rounded text-sm border-l-4 border-green-400"><span className="text-green-600">✅ Do:</span> {s.right}</div>
                    <div className="p-2 bg-blue-50 rounded text-sm"><span className="text-blue-600">💡 Why:</span> {s.why}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {tab === 'weekly' && (
          <div className="space-y-4">
            <div className="flex gap-2">{[1,2,3,4].map(w => <button key={w} onClick={() => setSelectedWeek(w)} className={`px-4 py-2 rounded-lg ${selectedWeek === w ? 'bg-blue-600 text-white' : 'bg-white'}`}>Week {w}</button>)}</div>
            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="font-semibold mb-2">Week {selectedWeek} Progress Log</div>
              <textarea value={weekNotes[selectedWeek]} onChange={e => setWeekNotes({...weekNotes, [selectedWeek]: e.target.value})} placeholder="Key accomplishments, challenges, lessons learned..." className="w-full h-40 px-3 py-2 border rounded-lg" />
              <div className="mt-3 p-3 bg-yellow-50 rounded-lg text-sm text-yellow-800"><strong>Friday Tip:</strong> Copy to email for your manager. Structure: Completed, In Progress, Planned, Need Input.</div>
            </div>
          </div>
        )}

        {tab === 'wins' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="font-semibold mb-2">🏆 Log Your Wins</div>
              <div className="flex gap-2">
                <input value={newWin} onChange={e => setNewWin(e.target.value)} placeholder="What did you accomplish?" className="flex-1 px-3 py-2 border rounded-lg" onKeyDown={e => { if (e.key === 'Enter' && newWin.trim()) { setWins([...wins, { text: newWin, day: currentDay }]); setNewWin(''); }}} />
                <button onClick={() => { if (newWin.trim()) { setWins([...wins, { text: newWin, day: currentDay }]); setNewWin(''); }}} className="px-4 py-2 bg-yellow-500 text-white rounded-lg">Add</button>
              </div>
            </div>
            {wins.length ? wins.map((w,i) => <div key={i} className="bg-white rounded-xl shadow-sm p-4 flex gap-3"><span className="text-yellow-500">🏆</span><div><div>{w.text}</div><div className="text-xs text-slate-400">Day {w.day}</div></div></div>) : <div className="bg-white rounded-xl shadow-sm p-8 text-center text-slate-400">No wins yet. Start logging!</div>}
          </div>
        )}
      </main>
    </div>
  );
}
