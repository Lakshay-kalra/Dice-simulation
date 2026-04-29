import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { Dices, RefreshCw, Users, BarChart3, History } from 'lucide-react';

const socket = io('http://localhost:5005'); // Ensure it matches backend

function App() {
  const [diceCount, setDiceCount] = useState(1);
  const [rolls, setRolls] = useState([]);
  const [isRolling, setIsRolling] = useState(false);
  const [rollHistory, setRollHistory] = useState([]);
  const [roomId, setRoomId] = useState('');
  const [inRoom, setInRoom] = useState(false);

  useEffect(() => {
    socket.on('dice_rolled', (data) => {
      setRolls(data.rolls);
      addToHistory(data.rolls);
    });

    return () => {
      socket.off('dice_rolled');
    };
  }, []);

  const addToHistory = (newRolls) => {
    const total = newRolls.reduce((a, b) => a + b, 0);
    setRollHistory(prev => [{ values: newRolls, total, time: new Date().toLocaleTimeString() }, ...prev].slice(0, 10));
  };

  const rollDice = () => {
    setIsRolling(true);
    
    // Play sound logic would go here
    
    setTimeout(() => {
      const newRolls = Array.from({ length: diceCount }, () => Math.floor(Math.random() * 6) + 1);
      setRolls(newRolls);
      setIsRolling(false);
      
      if (inRoom) {
        socket.emit('roll_dice', { roomId, rolls: newRolls });
      } else {
        addToHistory(newRolls);
      }
    }, 600); // Wait for shake animation
  };

  const joinRoom = () => {
    if (roomId) {
      socket.emit('join_room', roomId);
      setInRoom(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans flex flex-col items-center py-10 px-4">
      <header className="mb-10 text-center">
        <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 flex items-center justify-center gap-4">
          <Dices size={48} className="text-purple-400" />
          Dice Simulator
        </h1>
        <p className="text-slate-400 mt-2">Roll, Analyze, and Play with Friends!</p>
      </header>

      <main className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Roll Controls */}
        <section className="col-span-2 space-y-8 flex flex-col items-center justify-center bg-slate-800 p-8 rounded-2xl shadow-xl shadow-purple-900/20 border border-slate-700">
          <div className="flex bg-slate-700 rounded-lg p-1">
            {[1, 2, 3, 4, 5, 6].map(num => (
              <button 
                key={num}
                onClick={() => setDiceCount(num)}
                className={`px-6 py-2 rounded-md transition-all font-semibold ${diceCount === num ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-300 hover:bg-slate-600'}`}
              >
                {num}
              </button>
            ))}
          </div>

          {/* Dice Display */}
          <div className="flex flex-wrap justify-center gap-6 min-h-[120px] py-4">
            {rolls.length > 0 ? (
              rolls.map((val, i) => (
                <div key={i} className={`w-24 h-24 bg-white rounded-xl shadow-inner flex items-center justify-center text-5xl text-slate-900 ${isRolling ? 'shake-anim' : ''}`}>
                  {/* For a real app, use SVG dice faces instead of numbers */}
                  {val}
                </div>
              ))
            ) : (
              <div className="text-slate-500 flex items-center gap-2">Ready to roll! <Dices /></div>
            )}
          </div>

          <h2 className="text-3xl font-bold text-slate-200">
            Total: <span className="text-pink-500">{rolls.reduce((a, b) => a + b, 0)}</span>
          </h2>

          <button 
            onClick={rollDice}
            disabled={isRolling}
            className="group relative px-10 py-4 font-bold text-xl rounded-full bg-gradient-to-r from-purple-600 to-pink-600 shadow-[0_0_40px_rgba(168,85,247,0.4)] hover:shadow-[0_0_60px_rgba(168,85,247,0.6)] transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
          >
            <span className="flex items-center gap-2">
              <RefreshCw className={`${isRolling ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
              {isRolling ? 'Rolling...' : 'ROLL DICE'}
            </span>
          </button>
        </section>

        {/* Right Column: Multiplayer & History */}
        <aside className="space-y-6">
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-purple-400">
              <Users size={20} /> Multiplayer
            </h3>
            {!inRoom ? (
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={roomId} 
                  onChange={e => setRoomId(e.target.value)} 
                  placeholder="Room code" 
                  className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 w-full focus:outline-none focus:border-purple-500"
                />
                <button onClick={joinRoom} className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg font-medium transition-colors">
                  Join
                </button>
              </div>
            ) : (
              <div className="text-green-400 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div> Joined Room: {roomId}
              </div>
            )}
          </div>

          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg flex-grow">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold flex items-center gap-2 text-pink-400">
                <History size={20} /> Recent Rolls
              </h3>
              {rollHistory.length > 0 && (
                <button 
                  onClick={() => setRollHistory([])}
                  className="text-xs bg-slate-700 hover:bg-pink-600 text-slate-300 hover:text-white px-2 py-1 rounded transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="space-y-3">
              {rollHistory.length === 0 && <p className="text-slate-500 text-sm">No rolls yet.</p>}
              {rollHistory.map((h, i) => (
                <div key={i} className="flex justify-between items-center bg-slate-900/50 p-3 rounded-lg text-sm border border-slate-700/50">
                  <div className="flex gap-1">
                    {h.values.map((v, j) => (
                      <span key={j} className="w-6 h-6 bg-slate-700 rounded flex items-center justify-center font-bold text-slate-300">
                        {v}
                      </span>
                    ))}
                  </div>
                  <div className="text-slate-400 text-xs text-right">
                    <span className="block font-bold text-purple-300">Total: {h.total}</span>
                    {h.time}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}

export default App;
