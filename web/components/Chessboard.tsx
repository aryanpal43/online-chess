"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Chess, Square, Move } from 'chess.js';
import io from 'socket.io-client';
import type { Socket as SocketType } from 'socket.io-client';

const SOCKET_URL = 'https://online-chess-uyrw.onrender.com';
const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const ranks = [8, 7, 6, 5, 4, 3, 2, 1];

const bgGradients = [
  'linear-gradient(135deg, #eaf1fb 0%, #b6e0fe 100%)', // light blue
  'linear-gradient(135deg, #fbeee6 0%, #f7cac9 100%)', // light pink
  'linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 100%)', // teal
  'linear-gradient(135deg, #f3e5f5 0%, #ce93d8 100%)', // purple
  'linear-gradient(135deg, #fffde4 0%, #f9ea8f 100%)', // yellow
];

function getPieceEmoji(piece: any) {
  if (!piece) return '';
  const emojis: Record<string, string> = {
    K: '♔', Q: '♕', R: '♖', B: '♗', N: '♘', P: '♙',
    k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟',
  };
  const key = piece.color === 'w' ? piece.type.toUpperCase() : piece.type;
  return emojis[key] || '';
}

type Mode = 'local' | 'online';

interface ChessboardProps {
  mode?: Mode;
  room?: string;
}

const animatedBg = {
  background: 'linear-gradient(-45deg, #eaf1fb, #b6e0fe, #23272f, #3a3f4b)',
  backgroundSize: '400% 400%',
  animation: 'gradientBG 12s ease infinite',
};

// Add keyframes to the document head once
if (typeof window !== 'undefined' && !document.getElementById('gradientBG-keyframes')) {
  const style = document.createElement('style');
  style.id = 'gradientBG-keyframes';
  style.innerHTML = `@keyframes gradientBG {
    0% {background-position: 0% 50%;}
    50% {background-position: 100% 50%;}
    100% {background-position: 0% 50%;}
  }`;
  document.head.appendChild(style);
}

const Chessboard: React.FC<ChessboardProps> = ({ mode = 'local', room = '' }) => {
  const [game, setGame] = useState(new Chess());
  const [selected, setSelected] = useState<Square | null>(null);
  const [board, setBoard] = useState(game.board());
  const [invalidMoveMsg, setInvalidMoveMsg] = useState('');
  const [gameOverMsg, setGameOverMsg] = useState('');
  const [availableMoves, setAvailableMoves] = useState<string[]>([]);
  const [flip, setFlip] = useState(false);
  const [status, setStatus] = useState('');
  const socketRef = useRef<any>(null);
  const moveSoundRef = useRef<HTMLAudioElement | null>(null);
  const captureSoundRef = useRef<HTMLAudioElement | null>(null);
  const checkmateSoundRef = useRef<HTMLAudioElement | null>(null);
  const [bgIndex, setBgIndex] = useState(0);

  useEffect(() => {
    moveSoundRef.current = new Audio('/sounds/move.mp3');
    captureSoundRef.current = new Audio('/sounds/capture.mp3');
    checkmateSoundRef.current = new Audio('/sounds/checkmate.mp3');
  }, []);

  // Socket.IO setup for online mode
  useEffect(() => {
    if (mode === 'online' && room) {
      const socket = io(SOCKET_URL);
      socketRef.current = socket;
      setStatus('Connecting...');
      socket.on('connect', () => {
        setStatus('Connected');
        socket.emit('join', room);
      });
      socket.on('fen', (fen: string | null) => {
        if (fen) {
          const newGame = new Chess(fen);
          setGame(newGame);
          setBoard(newGame.board());
        }
      });
      socket.on('move', ({ move, fen }) => {
        const newGame = new Chess(fen);
        setGame(newGame);
        setBoard(newGame.board());
        setSelected(null);
        setAvailableMoves([]);
      });
      socket.on('disconnect', () => {
        setStatus('Disconnected');
      });
      return () => {
        socket.disconnect();
      };
    }
  }, [mode, room]);

  const handleMoveSound = (isCapture: boolean, isCheckmate: boolean = false) => {
    try {
      if (isCheckmate && checkmateSoundRef.current) {
        checkmateSoundRef.current.currentTime = 0;
        checkmateSoundRef.current.play().catch(e => console.log('Checkmate sound error:', e));
      } else if (isCapture && captureSoundRef.current) {
        captureSoundRef.current.currentTime = 0;
        captureSoundRef.current.play().catch(e => console.log('Capture sound error:', e));
      } else if (moveSoundRef.current) {
        moveSoundRef.current.currentTime = 0;
        moveSoundRef.current.play().catch(e => console.log('Move sound error:', e));
      }
    } catch (e) {
      console.log('Sound playback error:', e);
    }
  };

  const handleSquareClick = (square: Square) => {
    if (gameOverMsg) return; // Prevent moves after game over
    if (selected) {
      const move = { from: selected, to: square };
      try {
        const result = game.move(move);
        if (result) {
          setGame(new Chess(game.fen()));
          setBoard(game.board());
          setSelected(null);
          setAvailableMoves([]);
          // Play sound
          const isCheckmate = game.isCheckmate();
          handleMoveSound(!!result.captured, isCheckmate);
          // Change background
          setBgIndex(i => (i + 1) % bgGradients.length);
          // Game over detection
          if (isCheckmate) {
            setGameOverMsg('Checkmate! ' + (game.turn() === 'w' ? 'Black' : 'White') + ' wins!');
          } else if (game.isDraw()) {
            setGameOverMsg('Draw!');
          }
          if (mode === 'online' && room && socketRef.current) {
            socketRef.current.emit('move', {
              room,
              move,
              fen: game.fen(),
            });
          }
        } else {
          setSelected(null);
          setAvailableMoves([]);
          setInvalidMoveMsg('Invalid move!');
          setTimeout(() => setInvalidMoveMsg(''), 1500);
        }
      } catch (e) {
        setSelected(null);
        setAvailableMoves([]);
        setInvalidMoveMsg('Invalid move!');
        setTimeout(() => setInvalidMoveMsg(''), 1500);
      }
    } else {
      // Only select if there's a piece on the square
      const [file, rank] = [square[0], parseInt(square[1])];
      const piece = board[8 - rank][files.indexOf(file)];
      if (piece) {
        setSelected(square);
        // Highlight available moves
        const moves = game.moves({ square, verbose: true }) as { to: string }[];
        setAvailableMoves(moves.map(m => m.to));
      }
    }
  };

  // Responsive board size
  const getBoardSize = () => {
    if (typeof window === 'undefined') return 384;
    const vw = window.innerWidth;
    if (vw < 500) return vw - 32; // mobile: 16px margin each side
    if (vw < 900) return 384;
    return 480; // large screens
  };
  const [boardSize, setBoardSize] = useState(getBoardSize());
  const squareSize = boardSize / 8;

  useEffect(() => {
    const handleResize = () => setBoardSize(getBoardSize());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleRestart = () => {
    setGame(new Chess());
    setBoard(game.board());
    setSelected(null);
    setAvailableMoves([]);
    setGameOverMsg('');
  };

  // Background color by turn
  const bgColor = game.turn() === 'w'
    ? 'linear-gradient(135deg, #eaf1fb 0%, #b6e0fe 100%)'
    : 'linear-gradient(135deg, #23272f 0%, #3a3f4b 100%)';

  return (
    <div style={{ ...animatedBg, display: 'flex', flexDirection: 'column', alignItems: 'center', fontFamily: 'Inter, Arial, sans-serif', minHeight: '100vh', justifyContent: 'center', transition: 'background 0.7s' }}>
      {/* Always show Restart button */}
     
      {/* Game Over Modal */}
      {gameOverMsg && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            background: 'white',
            borderRadius: 16,
            padding: 32,
            boxShadow: '0 8px 32px #0003',
            textAlign: 'center',
            minWidth: 300,
          }}>
            <h2 style={{ color: '#134074', fontSize: 28, marginBottom: 16 }}>{gameOverMsg}</h2>
            <button
              onClick={handleRestart}
              style={{
                padding: '12px 28px',
                fontSize: 18,
                borderRadius: 8,
                border: 'none',
                background: '#134074',
                color: 'white',
                fontWeight: 600,
                cursor: 'pointer',
                marginRight: 12,
              }}
            >
              Restart Game
            </button>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '12px 28px',
                fontSize: 18,
                borderRadius: 8,
                border: 'none',
                background: '#6fa8dc',
                color: '#134074',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Back to Home
            </button>
          </div>
        </div>
      )}
      <h2 style={{ color: 'black', fontSize: 28, fontWeight: 700, margin: 16 }}>Chessboard</h2>
      <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
        <button onClick={handleRestart} style={{ padding: '8px 16px', borderRadius: 6, border: 'none', background: '#134074', color: 'white', fontWeight: 600, cursor: 'pointer', fontSize: 16 }}>Restart Game</button>
        <button onClick={() => setFlip(f => !f)} style={{ padding: '8px 16px', borderRadius: 6, border: 'none', background: '#6fa8dc', color: '#134074', fontWeight: 600, cursor: 'pointer', fontSize: 16 }}>Flip Board</button>
      </div>
      <div style={{ marginBottom: 8, fontSize: 18, fontWeight: 500, color: gameOverMsg ? 'green' : '#134074' }}>
        {gameOverMsg ? gameOverMsg : `Turn: ${game.turn() === 'w' ? 'White ♔' : 'Black ♚'}`}
      </div>
      {invalidMoveMsg && (
        <div style={{ color: 'red', fontWeight: 'bold', marginBottom: 8 }}>{invalidMoveMsg}</div>
      )}
      <div style={{
        display: 'inline-block',
        position: 'relative',
        margin: 16,
        borderRadius: 18,
        boxShadow: '0 4px 24px 0 #0002',
        background: '#eaf1fb',
        padding: 16,
      }}>
        {/* File labels (a-h) on top */}
        <div style={{ display: 'flex', marginLeft: squareSize, marginBottom: 2 }}>
          {files.map((file) => (
            <div key={file} style={{ width: squareSize, height: 24, textAlign: 'center', fontWeight: 'bold', color: '#134074', fontSize: 18 }}>{file}</div>
          ))}
        </div>
        {/* Board with rank labels */}
        <div style={{ display: 'flex' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {ranks.map((rank, rIdx) => (
              <div key={rank} style={{ display: 'flex', alignItems: 'center' }}>
                {/* Rank label */}
                <div style={{ width: 24, height: squareSize, textAlign: 'center', fontWeight: 'bold', color: '#134074', fontSize: 18 }}>{rank}</div>
                {/* Squares */}
                {files.map((file, fIdx) => {
                  const square = `${file}${rank}` as Square;
                  const piece = board[8 - rank][files.indexOf(file)];
                  const isSelected = selected === square;
                  const isAvailable = availableMoves.includes(square);
                  const bgColor = isAvailable
                    ? '#ffe066'
                    : (fIdx + rIdx) % 2 === 0 ? '#6fa8dc' : '#134074';
                  const pieceEmoji = getPieceEmoji(piece);
                  return (
                    <div
                      key={square}
                      onClick={() => handleSquareClick(square)}
                      style={{
                        width: squareSize,
                        height: squareSize,
                        background: bgColor,
                        border: isSelected ? '3px solid #ff5e5b' : '1px solid #333',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: squareSize * 0.7,
                        cursor: gameOverMsg ? 'not-allowed' : 'pointer',
                        userSelect: 'none',
                        boxSizing: 'border-box',
                        position: 'relative',
                        borderRadius: 8,
                        transition: 'background 0.2s, border 0.2s',
                        outline: isAvailable ? '2px dashed #ffb700' : undefined,
                        outlineOffset: isAvailable ? '-4px' : undefined,
                      }}
                      onMouseEnter={e => {
                        if (isAvailable) e.currentTarget.style.background = '#ffe599';
                      }}
                      onMouseLeave={e => {
                        if (isAvailable) e.currentTarget.style.background = '#ffe066';
                      }}
                    >
                      {pieceEmoji}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chessboard; 
