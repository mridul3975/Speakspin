import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export function MultiplayerLobby({ socket, user, onMatchFound, onBack }) {
  const [statusMessage, setStatusMessage] = useState('Initializing search...');

  useEffect(() => {
    if (!socket) {
      setStatusMessage('Connecting to matchmaking servers...');
      return;
    }

    // Connect and register in lobby
    socket.emit('joinLobby', {
      userId: user.id || user._id || 'guest',
      name: user.name || 'Guest Speaker'
    });

    socket.on('waitingInLobby', ({ message }) => {
      setStatusMessage(message);
    });

    socket.on('matchFound', (matchDetails) => {
      setStatusMessage('Match Found! Joining battle room...');
      setTimeout(() => {
        onMatchFound(matchDetails);
      }, 1000);
    });

    return () => {
      socket.off('waitingInLobby');
      socket.off('matchFound');
    };
  }, [socket, user]);

  const handleCancel = () => {
    if (socket) {
      socket.emit('leaveBattle');
    }
    onBack();
  };

  return (
    <div className="setup-container" style={{ textAlign: 'center', margin: '2rem auto 0', maxWidth: '500px' }}>
      <div className="setup-header">
        <h2 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          <span className="material-symbols-outlined text-4xl">swords</span> BATTLE LOBBY
        </h2>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem 1rem', gap: '2rem' }}>
        <div style={{ position: 'relative', width: '80px', height: '80px' }}>
          <div style={{
            position: 'absolute',
            inset: 0,
            border: '4px solid #ffffff',
            borderTopColor: 'transparent',
            animation: 'spin 1.5s linear infinite'
          }} />
          <span className="material-symbols-outlined text-4xl" style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            animation: 'pulse 1.5s ease-in-out infinite'
          }}>
            groups
          </span>
        </div>

        <div>
          <p className="setup-instruction" style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>
            MATCHMAKING QUEUE
          </p>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.2rem', textTransform: 'uppercase', marginTop: '0.5rem' }}>
            {statusMessage}
          </h3>
        </div>

        <button className="btn btn-secondary" onClick={handleCancel} style={{ width: '100%', marginTop: '1rem' }}>
          <span className="material-symbols-outlined text-sm">cancel</span> CANCEL SEARCH
        </button>
      </div>
    </div>
  );
}

export default MultiplayerLobby;
