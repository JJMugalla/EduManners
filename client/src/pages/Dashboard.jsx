import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { socket } from '../socket/socket';
import { Star, Coins, LogOut, Sun, Moon } from 'lucide-react';

export default function Dashboard() {
  const { logout } = useAuth();
  const [students, setStudents] = useState([]);
  // We handle dark mode state locally for simplicity in this view
  const [darkMode, setDarkMode] = useState(false);

  // Theme Toggle Logic
  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode]);

  // Data Fetching
  const fetchStudents = async () => {
    try {
        // Uses the base URL set in AuthContext
        const res = await axios.get('/students');
        setStudents(res.data);
    } catch (error) { console.error("Fetch error", error); }
  };

  useEffect(() => {
    fetchStudents();
    
    // Real-time listener for star updates
    socket.on('data_update', (updatedStudent) => {
        setStudents(prev => prev.map(s => s._id === updatedStudent._id ? updatedStudent : s));
    });
    
    return () => socket.off('data_update');
  }, []);

  const handleStar = async (studentId, type) => {
    try {
        await axios.put('/stars', { studentId, type, habitName: "Manual Entry" });
    } catch (e) { alert("Error adding star"); }
  };

  const handleRedeem = async (studentId, exchangeType) => {
    try {
        await axios.post('/redeem', { studentId, exchangeType });
        alert("Redeemed successfully!");
    } catch(e) { alert(e.response?.data?.error || "Redemption failed"); }
  };

  const addStudent = async () => {
    const name = prompt("Enter Student Name:");
    if(name) {
        try {
            await axios.post('/students', { name });
            fetchStudents();
        } catch (e) { alert("Error creating student"); }
    }
  };

  return (
    <div className="min-h-screen p-6 transition-colors duration-300 bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">EduManners</h1>
        <div className="flex gap-4 items-center">
            <button onClick={addStudent} className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition">+ Student</button>
            <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition">
                {darkMode ? <Sun size={20}/> : <Moon size={20}/>}
            </button>
            <button onClick={logout} className="text-red-500 hover:text-red-700 transition"><LogOut /></button>
        </div>
      </header>

      <div className="grid gap-8">
        {students.length === 0 && <p className="text-center text-gray-500">No students found. Click "+ Student" to add one.</p>}
        
        {students.map(student => (
          <div key={student._id} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg transition-all">
            <h2 className="text-2xl font-bold mb-4 border-b pb-2 dark:border-gray-700">{student.name}</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Gold Section */}
                <StatCard title="Gold" count={student.stats.goldStars} color="text-yellow-500" 
                    onAdd={() => handleStar(student._id, 'gold')} 
                    onRedeem={() => handleRedeem(student._id, 'gold')}
                    btnText="100 -> 10 Coins"
                    canRedeem={student.stats.goldStars >= 100}
                />
                {/* Silver Section */}
                <StatCard title="Silver" count={student.stats.silverStars} color="text-gray-400" 
                    onAdd={() => handleStar(student._id, 'silver')} 
                    onRedeem={() => handleRedeem(student._id, 'silver')}
                    btnText="200 -> 5 Coins"
                    canRedeem={student.stats.silverStars >= 200}
                />
                {/* Bronze Section */}
                <StatCard title="Bronze" count={student.stats.bronzeStars} color="text-orange-500" 
                    onAdd={() => handleStar(student._id, 'bronze')} 
                    onRedeem={() => handleRedeem(student._id, 'bronze')}
                    btnText="300 -> 100 Coins"
                    canRedeem={student.stats.bronzeStars >= 300}
                />
                {/* Wallet Section */}
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 flex flex-col justify-between">
                    <div className="flex items-center gap-2 mb-2 text-green-600 font-bold"><Coins /> Wallet</div>
                    <div className="text-4xl font-bold text-green-700 dark:text-green-400 text-center my-4">{student.stats.coins}</div>
                    <p className="text-xs text-center text-gray-500">Total Coins</p>
                </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Sub-component for internal use
const StatCard = ({ title, count, color, onAdd, onRedeem, btnText, canRedeem }) => (
    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg flex flex-col justify-between h-full">
        <div>
            <div className={`flex items-center gap-2 mb-2 font-bold ${color}`}><Star fill="currentColor"/> {title}</div>
            <div className="text-3xl font-bold mb-3 text-center">{count}</div>
        </div>
        <div className="flex flex-col gap-2 mt-auto">
            <button onClick={onAdd} className="bg-white dark:bg-gray-600 py-1 rounded shadow text-sm hover:bg-gray-100 dark:hover:bg-gray-500 transition">+ Add Star</button>
            <button 
                onClick={onRedeem} 
                disabled={!canRedeem}
                className={`text-white py-1 rounded shadow text-xs transition ${canRedeem ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-400 cursor-not-allowed'}`}
            >
                Redeem ({btnText})
            </button>
        </div>
    </div>
);