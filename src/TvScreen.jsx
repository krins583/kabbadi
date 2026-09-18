import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase'; 
import './TvScreen.css';

const TvScreen = () => {
  const [matchData, setMatchData] = useState({
    teamA: 'TEAM A',
    teamB: 'TEAM B',
    scoreA: 0,
    scoreB: 0,
    status: 'WAITING', 
    winner: 'DRAW'
  });

  // ⚡ Independent Smooth Timer States
  const [localTimeLeft, setLocalTimeLeft] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const matchRef = doc(db, 'matches', 'liveMatch');
    
    const unsubscribe = onSnapshot(matchRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        
        let currentStatus = 'WAITING';
        let currentWinner = 'DRAW';

        if (data.isMatchStarted) {
          if (data.isMatchOver) {
            currentStatus = 'FULL_TIME';
            currentWinner = data.scoreA > data.scoreB ? data.teamAName : (data.scoreB > data.scoreA ? data.teamBName : 'DRAW');
          } else if (data.isHalfTime) {
            currentStatus = 'HALF_TIME';
          } else {
            currentStatus = data.currentHalf === 1 ? '1ST_HALF' : '2ND_HALF';
          }
        }

        setMatchData({
          teamA: data.teamAName || 'TEAM A',
          teamB: data.teamBName || 'TEAM B',
          scoreA: data.scoreA || 0,
          scoreB: data.scoreB || 0,
          status: currentStatus,
          winner: currentWinner
        });

        // Sync Timer (Agar internet delay ho, toh smart sync karega)
        setIsTimerRunning(data.isTimerRunning || false);
        setLocalTimeLeft((prev) => {
          // Agar 2 seconds se zyada piche ho, ya timer pause ho, toh turant sync karlo
          if (Math.abs(prev - (data.timeLeft || 0)) > 2 || !data.isTimerRunning) {
            return data.timeLeft || 0;
          }
          return prev; // Varna local chalne do (smoothness ke liye)
        });
      }
      setIsLoading(false);
    }, (error) => {
      console.error("TV Screen Sync Error:", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // ⚡ LOCAL SMOOTH TIMER
  useEffect(() => {
    let interval = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setLocalTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  useEffect(() => {
    document.body.className = 'tv-dark'; 
  }, []);

  const getStatusText = () => {
    switch (matchData.status) {
      case '1ST_HALF': return '1ST HALF';
      case 'HALF_TIME': return 'HALF TIME';
      case '2ND_HALF': return '2ND HALF';
      case 'FULL_TIME': return 'FULL TIME';
      default: return 'WAITING TO START';
    }
  };

  // Convert seconds into MM:SS format
  const formattedTime = () => {
    const m = Math.floor(localTimeLeft / 60).toString().padStart(2, '0');
    const s = (localTimeLeft % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  if (isLoading) {
    return <div className="tv-loading">SYNCING LIVE MATCH...</div>;
  }

  return (
    <div className="tv-container">
      <header className="tv-header">
        <h1 className="tv-title">KABADDI</h1>
        <div className={`tv-status-badge ${matchData.status === 'HALF_TIME' ? 'tv-pulse' : ''}`}>
          {getStatusText()}
        </div>
      </header>

      {matchData.status !== 'FULL_TIME' && matchData.status !== 'WAITING' ? (
        <main className="tv-scoreboard">
          <div className="tv-team tv-team-a">
            <h2 className="tv-team-name">{matchData.teamA}</h2>
            <div className="tv-score-box">
              <span className="tv-score-value">{matchData.scoreA}</span>
            </div>
          </div>

          <div className="tv-center-info">
            <div className="tv-timer-container">
              <span className={`tv-timer ${matchData.status === 'HALF_TIME' ? 'tv-blink' : ''}`}>
                {formattedTime()}
              </span>
            </div>
            <div className="tv-vs-badge">VS</div>
          </div>

          <div className="tv-team tv-team-b">
            <h2 className="tv-team-name">{matchData.teamB}</h2>
            <div className="tv-score-box">
              <span className="tv-score-value">{matchData.scoreB}</span>
            </div>
          </div>
        </main>
      ) : matchData.status === 'FULL_TIME' ? (
        <main className="tv-result-screen">
          <h2 className="tv-result-heading">MATCH COMPLETED</h2>
          
          <div className="tv-final-scores">
            <div className="tv-final-team">
              <h3>{matchData.teamA}</h3>
              <p>{matchData.scoreA}</p>
            </div>
            <div className="tv-vs-divider"></div>
            <div className="tv-final-team">
              <h3>{matchData.teamB}</h3>
              <p>{matchData.scoreB}</p>
            </div>
          </div>
          
          <div className="tv-winner-announcement">
            {matchData.winner === 'DRAW' ? (
              <div className="tv-draw-text">MATCH TIED</div>
            ) : (
              <>
                <span className="tv-winner-label">WINNER</span>
                <div className="tv-winner-name">{matchData.winner}</div>
              </>
            )}
          </div>
          <p className="tv-waiting-text">Waiting for the next match...</p>
        </main>
      ) : (
        <main className="tv-result-screen">
            <h2 className="tv-draw-text">PREPARE FOR THE MATCH</h2>
            <p className="tv-waiting-text">Scoreboard will activate shortly...</p>
        </main>
      )}
    </div>
  );
};

export default TvScreen;