import { useState, useEffect } from 'react';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from './firebase'; 
import './App.css';

function App() {
  const [theme, setTheme] = useState('dark');
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  
  const [isMatchStarted, setIsMatchStarted] = useState(false);
  const [teamAName, setTeamAName] = useState('HOME TEAM');
  const [teamBName, setTeamBName] = useState('AWAY TEAM');
  const [customTime, setCustomTime] = useState(20);
  const [scoreA, setScoreA] = useState(0);
  const [scoreB, setScoreB] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [currentHalf, setCurrentHalf] = useState(1);
  const [isHalfTime, setIsHalfTime] = useState(false);
  const [isMatchOver, setIsMatchOver] = useState(false);
  const [savedMatches, setSavedMatches] = useState([]);

  useEffect(() => {
    document.body.className = theme === 'dark' ? 'dark-theme' : 'light-theme';
  }, [theme]);

  // Initial Load
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const matchRef = doc(db, 'matches', 'liveMatch');
        const matchSnap = await getDoc(matchRef);
        if (matchSnap.exists()) {
          const data = matchSnap.data();
          setIsMatchStarted(data.isMatchStarted ?? false);
          setTeamAName(data.teamAName ?? 'HOME TEAM');
          setTeamBName(data.teamBName ?? 'AWAY TEAM');
          setCustomTime(data.customTime ?? 20);
          setScoreA(data.scoreA ?? 0);
          setScoreB(data.scoreB ?? 0);
          setTimeLeft(data.timeLeft ?? 0);
          setIsTimerRunning(data.isTimerRunning ?? false);
          setCurrentHalf(data.currentHalf ?? 1);
          setIsHalfTime(data.isHalfTime ?? false);
          setIsMatchOver(data.isMatchOver ?? false);
        }

        const historyRef = doc(db, 'matches', 'history');
        const historySnap = await getDoc(historyRef);
        if (historySnap.exists()) {
          setSavedMatches(historySnap.data().records || []);
        }
      } catch (error) {
        console.error("Error fetching Firestore data:", error);
      } finally {
        setIsDataLoaded(true);
      }
    };
    fetchInitialData();
  }, []);

  // Auto-Save Live Match
  useEffect(() => {
    if (!isDataLoaded) return;
    const matchRef = doc(db, 'matches', 'liveMatch');
    setDoc(matchRef, {
      isMatchStarted, teamAName, teamBName, customTime, scoreA, scoreB, 
      timeLeft, isTimerRunning, currentHalf, isHalfTime, isMatchOver
    }).catch(err => console.error("Error saving match:", err));
  }, [isMatchStarted, teamAName, teamBName, customTime, scoreA, scoreB, timeLeft, isTimerRunning, currentHalf, isHalfTime, isMatchOver, isDataLoaded]);

  // Auto-Save History
  useEffect(() => {
    if (!isDataLoaded) return;
    const historyRef = doc(db, 'matches', 'history');
    setDoc(historyRef, { records: savedMatches }).catch(err => console.error("Error saving history:", err));
  }, [savedMatches, isDataLoaded]);

  // ⚡ OPTIMIZED TIMER LOGIC (Bina lag ke perfect 1 sec)
  useEffect(() => {
    let interval = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => (prevTime > 0 ? prevTime - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]); // Ab yeh baar-baar destroy nahi hoga

  // Handle Timer hitting 0
  useEffect(() => {
    if (timeLeft === 0 && isMatchStarted && isTimerRunning) {
      setIsTimerRunning(false);
      if (currentHalf === 1) setIsHalfTime(true);
      else if (currentHalf === 2) setIsMatchOver(true);
    }
  }, [timeLeft, isMatchStarted, isTimerRunning, currentHalf]);

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  const startNewMatch = () => {
    setScoreA(0);
    setScoreB(0);
    setTimeLeft(customTime * 60);
    setCurrentHalf(1);
    setIsHalfTime(false);
    setIsMatchOver(false);
    setIsMatchStarted(true);
    setIsTimerRunning(false);
  };

  const startSecondHalf = () => {
    setCurrentHalf(2);
    setTimeLeft(customTime * 60);
    setIsHalfTime(false);
    setIsTimerRunning(false);
  };

  const endMatchAndSave = () => {
    const matchData = {
      id: Date.now(),
      date: new Date().toLocaleString(),
      teamA: teamAName,
      teamB: teamBName,
      scoreA,
      scoreB,
      winner: scoreA > scoreB ? teamAName : (scoreB > scoreA ? teamBName : 'Draw')
    };
    setSavedMatches([matchData, ...savedMatches]);
    setIsMatchStarted(false);
    setIsTimerRunning(false);
    setIsHalfTime(false);
    setIsMatchOver(false);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const updateScore = (team, points) => {
    if (!isTimerRunning || isHalfTime || isMatchOver) return;
    if (team === 'A') setScoreA((prev) => Math.max(0, prev + points)); 
    else setScoreB((prev) => Math.max(0, prev + points));
  };

  if (!isDataLoaded) return <div style={{ color: 'white', textAlign: 'center', marginTop: '50px' }}>Loading...</div>;

  return (
    <div className="app-container">
      <header className="header">
        <h1 className="premium-title">Kabaddi Pro</h1>
        <button className="theme-toggle glass-btn" onClick={toggleTheme}>
          {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
        </button>
      </header>

      {!isMatchStarted ? (
        <section className="setup-section glass-card">
          <div className="section-header">
            <h2>Match Setup</h2>
            <div className="accent-line"></div>
          </div>
          <div className="input-grid">
            <div className="input-group">
              <label>Team 1 (Left)</label>
              <input type="text" value={teamAName} onChange={(e) => setTeamAName(e.target.value.toUpperCase())} />
            </div>
            <div className="input-group">
              <label>Team 2 (Right)</label>
              <input type="text" value={teamBName} onChange={(e) => setTeamBName(e.target.value.toUpperCase())} />
            </div>
            <div className="input-group full-width-input">
              <label>Duration per Half (Minutes)</label>
              <input type="number" value={customTime} onChange={(e) => setCustomTime(Number(e.target.value))} min="1" />
            </div>
          </div>
          <button className="btn-primary start-btn" onClick={startNewMatch}>Initialize Match</button>
        </section>
      ) : (
        <section className="match-section">
          <div className="scoreboard-header glass-card">
            <div className="half-indicator">
              <div className="active-half-badge">
                {isMatchOver ? "FULL TIME" : isHalfTime ? "HALF TIME" : `${currentHalf === 1 ? '1st' : '2nd'} HALF`}
              </div>
            </div>
            <div className="timer-wrapper">
              <h2 className={`digital-timer ${(!isTimerRunning && !isHalfTime && !isMatchOver) ? 'blink' : ''}`}>
                {formatTime(timeLeft)}
              </h2>
              {!isHalfTime && !isMatchOver && (
                <button className={`play-pause-btn ${isTimerRunning ? 'pause' : 'play'}`} onClick={() => setIsTimerRunning(!isTimerRunning)}>
                  {isTimerRunning ? 'Pause' : 'Start'}
                </button>
              )}
              {isHalfTime && (
                <button className="play-pause-btn play" onClick={startSecondHalf}>Start 2nd Half</button>
              )}
            </div>
          </div>

          <div className="scoreboard">
            {/* Team A */}
            <div className="team-card glass-card team-a-glow">
              <h3 className="team-name">{teamAName}</h3>
              <div className="score-container"><div className="digital-score">{scoreA}</div></div>
              <div className={`kabaddi-controls ${!isTimerRunning ? 'controls-disabled' : ''}`}>
                <div className="control-row">
                  <button className="premium-btn touch-btn" onClick={() => updateScore('A', 1)}>Touch +1</button>
                  <button className="premium-btn tackle-btn" onClick={() => updateScore('A', 1)}>Tackle +1</button>
                </div>
                <div className="control-row">
                  <button className="premium-btn bonus-btn" onClick={() => updateScore('A', 1)}>Bonus +1</button>
                  <button className="premium-btn allout-btn" onClick={() => updateScore('A', 2)}>All Out +2</button>
                </div>
                <button className="premium-btn super-btn" onClick={() => updateScore('A', 3)}>Super Play +3</button>
                <button className="premium-btn minus-btn" onClick={() => updateScore('A', -1)}>Correction -1</button>
              </div>
            </div>

            <div className="vs-badge-container"><div className="vs-badge">VS</div></div>

            {/* Team B */}
            <div className="team-card glass-card team-b-glow">
              <h3 className="team-name">{teamBName}</h3>
              <div className="score-container"><div className="digital-score">{scoreB}</div></div>
              <div className={`kabaddi-controls ${!isTimerRunning ? 'controls-disabled' : ''}`}>
                <div className="control-row">
                  <button className="premium-btn touch-btn" onClick={() => updateScore('B', 1)}>Touch +1</button>
                  <button className="premium-btn tackle-btn" onClick={() => updateScore('B', 1)}>Tackle +1</button>
                </div>
                <div className="control-row">
                  <button className="premium-btn bonus-btn" onClick={() => updateScore('B', 1)}>Bonus +1</button>
                  <button className="premium-btn allout-btn" onClick={() => updateScore('B', 2)}>All Out +2</button>
                </div>
                <button className="premium-btn super-btn" onClick={() => updateScore('B', 3)}>Super Play +3</button>
                <button className="premium-btn minus-btn" onClick={() => updateScore('B', -1)}>Correction -1</button>
              </div>
            </div>
          </div>

          <button className="btn-end" onClick={endMatchAndSave}>End Match & Save Record</button>
        </section>
      )}
    </div>
  );
}

export default App;