import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Moon, RefreshCw, Trophy, User, Volume2, VolumeX } from 'lucide-react';
import confetti from 'canvas-confetti';
import useSound from 'use-sound';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type Player = 'X' | 'O';
type SquareValue = Player | null;

const WINNING_COMBINATIONS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
  [0, 4, 8], [2, 4, 6]             // Diagonals
];

export default function TicTacToe() {
  const [board, setBoard] = useState<SquareValue[]>(Array(9).fill(null));
  const [roundStarter, setRoundStarter] = useState<Player>('X');
  const [currentPlayer, setCurrentPlayer] = useState<Player>('X');
  const [winner, setWinner] = useState<SquareValue | 'Draw'>(null);
  const [winningLine, setWinningLine] = useState<number[] | null>(null);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);

  // Sound effects - using useRef for stable persistence and better performance
  const sounds = React.useRef<{ [key: string]: HTMLAudioElement }>({});

  useEffect(() => {
    // Initializing sounds with high-quality, stable Mixkit paths
    sounds.current = {
      star: new Audio('https://assets.mixkit.co/active_storage/sfx/2573/2573-preview.mp3'),
      moon: new Audio('https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3'),
      win: new Audio('https://assets.mixkit.co/active_storage/sfx/2020/2020-preview.mp3'),
      draw: new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3'),
      reset: new Audio('https://assets.mixkit.co/active_storage/sfx/1471/1471-preview.mp3'),
    };
    
    Object.values(sounds.current).forEach(audio => {
      audio.load();
      audio.volume = 0.6;
    });
  }, []);

  const playSfx = useCallback((key: string) => {
    if (!isSoundEnabled) return;
    const sfx = sounds.current[key];
    if (sfx) {
      sfx.currentTime = 0;
      const playPromise = sfx.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Silently handle if user hasn't interacted with DOM yet
        });
      }
    }
  }, [isSoundEnabled]);

  const checkWinner = useCallback((squares: SquareValue[]) => {
    for (const [a, b, c] of WINNING_COMBINATIONS) {
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return { winner: squares[a], line: [a, b, c] };
      }
    }
    if (squares.every(s => s !== null)) {
      return { winner: 'Draw' as const, line: null };
    }
    return null;
  }, []);

  const handleClick = (index: number) => {
    if (board[index] || winner) return;

    // Trigger move sound immediately
    if (currentPlayer === 'X') {
      playSfx('star');
    } else {
      playSfx('moon');
    }

    const newBoard = [...board];
    newBoard[index] = currentPlayer;
    setBoard(newBoard);

    const result = checkWinner(newBoard);
    if (result) {
      setWinner(result.winner);
      setWinningLine(result.line);
      
      if (result.winner === 'Draw') {
        setTimeout(() => playSfx('draw'), 200);
      } else {
        setTimeout(() => {
          playSfx('win');
          confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#FACC15', '#60A5FA', '#C084FC']
          });
        }, 300);
      }
    } else {
      setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
    }
  };

  const resetGame = () => {
    playSfx('reset');
    const nextStarter = roundStarter === 'X' ? 'O' : 'X';
    setRoundStarter(nextStarter);
    setBoard(Array(9).fill(null));
    setCurrentPlayer(nextStarter);
    setWinner(null);
    setWinningLine(null);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-2 md:p-4 font-sans overflow-hidden">
      {/* Decorative stars */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white opacity-20"
            initial={{ scale: 0 }}
            animate={{ 
              scale: [0, 1, 0.5, 1],
              x: [0, Math.random() * 20 - 10],
              y: [0, Math.random() * 20 - 10]
            }}
            transition={{ 
              duration: 3 + Math.random() * 5, 
              repeat: Infinity,
              delay: Math.random() * 5
            }}
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${2 + Math.random() * 4}px`,
              height: `${2 + Math.random() * 4}px`,
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="z-10 text-center mb-4 md:mb-8 relative w-full max-w-xs"
      >
        <button 
          onClick={() => setIsSoundEnabled(!isSoundEnabled)}
          className="absolute -right-2 md:-right-12 top-0 p-2 md:p-3 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-sm transition-all"
        >
          {isSoundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
        </button>
        <h1 className="text-4xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-400 to-blue-400 drop-shadow-lg leading-tight uppercase">
          Nourin
        </h1>
        <p className="text-purple-200 text-sm md:text-lg font-medium tracking-widest uppercase">Tic-Tac-Toe</p>
      </motion.div>

      <div className="relative z-10 bg-white/10 backdrop-blur-xl p-4 md:p-6 rounded-3xl border-2 md:border-4 border-white/20 shadow-2xl w-full max-w-[340px] md:max-w-md">
        {/* Game Status */}
        <div className="flex items-center justify-between mb-4 md:mb-8 px-1">
          <motion.div 
            animate={{ 
              scale: currentPlayer === 'X' ? 1.1 : 1,
              opacity: currentPlayer === 'X' || winner === 'X' ? 1 : 0.5
            }}
            className={cn(
              "flex flex-col items-center gap-1 md:gap-2 transition-all p-2 md:p-3 rounded-2xl",
              currentPlayer === 'X' && !winner ? "bg-yellow-400/20 shadow-[0_0_20px_rgba(250,204,21,0.3)]" : ""
            )}
          >
            <div className="bg-yellow-400 p-2 md:p-3 rounded-xl shadow-lg transform rotate-[-5deg]">
              <Star className="w-6 h-6 md:w-8 md:h-8 text-yellow-900 fill-yellow-900" />
            </div>
            <span className="text-yellow-400 font-bold text-[10px] md:text-sm uppercase tracking-tighter">Starling</span>
          </motion.div>

          {winner ? (
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="px-3 md:px-6 py-1 md:py-2 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full font-black text-white shadow-xl flex items-center gap-1 md:gap-2 absolute left-1/2 -translate-x-1/2 z-20 whitespace-nowrap top-4 md:static md:translate-x-0"
            >
              {winner === 'Draw' ? (
                <span className="text-sm md:text-xl">IT'S A TIE! 🤝</span>
              ) : (
                <>
                  <Trophy className="w-4 h-4 md:w-6 md:h-6 animate-bounce" />
                  <span className="text-sm md:text-xl">{winner === 'X' ? 'STARLING' : 'MOONY'} WINS!</span>
                </>
              )}
            </motion.div>
          ) : (
            <div className="h-10 w-20 md:w-32 flex items-center justify-center">
              <div className="flex gap-1 md:gap-2">
                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-pink-400" />
                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2, delay: 0.3 }} className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-purple-400" />
                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2, delay: 0.6 }} className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-blue-400" />
              </div>
            </div>
          )}

          <motion.div 
            animate={{ 
              scale: currentPlayer === 'O' ? 1.1 : 1,
              opacity: currentPlayer === 'O' || winner === 'O' ? 1 : 0.5
            }}
            className={cn(
              "flex flex-col items-center gap-1 md:gap-2 transition-all p-2 md:p-3 rounded-2xl",
              currentPlayer === 'O' && !winner ? "bg-blue-400/20 shadow-[0_0_20px_rgba(96,165,250,0.3)]" : ""
            )}
          >
            <div className="bg-blue-400 p-2 md:p-3 rounded-xl shadow-lg transform rotate-[5deg]">
              <Moon className="w-6 h-6 md:w-8 md:h-8 text-blue-900 fill-blue-900" />
            </div>
            <span className="text-blue-400 font-bold text-[10px] md:text-sm uppercase tracking-tighter">Moony</span>
          </motion.div>
        </div>

        {/* Board */}
        <div className="grid grid-cols-3 gap-2 md:gap-4 bg-purple-800/40 p-2 md:p-4 rounded-2xl shadow-inner border-2 border-white/10">
          {board.map((value, i) => (
            <motion.button
              key={i}
              whileHover={!value && !winner ? { scale: 1.05 } : {}}
              whileTap={!value && !winner ? { scale: 0.9 } : {}}
              onClick={() => handleClick(i)}
              className={cn(
                "w-20 h-20 md:w-28 md:h-28 rounded-xl md:rounded-2xl flex items-center justify-center transition-all duration-300 relative overflow-hidden shadow-md",
                !value && !winner ? "bg-purple-700/50 hover:bg-purple-600/50 active:shadow-inner" : "cursor-default",
                winningLine?.includes(i) ? "bg-gradient-to-br from-pink-500 to-yellow-500 ring-2 md:ring-4 ring-white ring-inset shadow-[0_0_20px_rgba(255,255,255,0.4)]" : "bg-purple-800/60"
              )}
            >
              <AnimatePresence mode="wait">
                {value === 'X' && (
                  <motion.div
                    key="x"
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  >
                    <Star className="w-10 h-10 md:w-16 md:h-16 text-yellow-400 fill-yellow-400 drop-shadow-[0_4px_8px_rgba(0,0,0,0.4)]" />
                  </motion.div>
                )}
                {value === 'O' && (
                  <motion.div
                    key="o"
                    initial={{ scale: 0, rotate: 45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  >
                    <Moon className="w-10 h-10 md:w-16 md:h-16 text-blue-400 fill-blue-400 drop-shadow-[0_4px_8px_rgba(0,0,0,0.4)]" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          ))}
        </div>

        {/* Reset Button */}
        <motion.button
          whileHover={{ scale: 1.05, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
          whileTap={{ scale: 0.95 }}
          onClick={resetGame}
          className="mt-4 md:mt-8 w-full group relative flex items-center justify-center gap-2 md:gap-3 bg-white text-indigo-900 font-black px-4 md:px-6 py-3 md:py-4 rounded-2xl shadow-xl overflow-hidden"
        >
          <div className="absolute inset-0 bg-yellow-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left opacity-10" />
          <RefreshCw className="w-5 h-5 md:w-6 md:h-6 group-hover:rotate-180 transition-transform duration-500" />
          <span className="text-lg md:text-xl tracking-wide uppercase">PLAY AGAIN</span>
        </motion.button>
      </div>

      <footer className="mt-8 z-10 flex gap-4 text-purple-300/60 font-medium text-xs tracking-tighter uppercase">
        <div className="flex items-center gap-1"><User className="w-3 h-3" /> 2 Players</div>
        <div>•</div>
        <div>Made with Love</div>
        <div>•</div>
        <div>v1.0</div>
      </footer>

      {/* Cloud shapes at bottom for extra cuteness */}
      <div className="absolute -bottom-10 left-0 right-0 h-40 opacity-20 pointer-events-none">
         <svg viewBox="0 0 1440 320" className="w-full h-full">
           <path fill="#ffffff" d="M0,192L48,176C96,160,192,128,288,128C384,128,480,160,576,181.3C672,203,768,213,864,202.7C960,192,1056,160,1152,144C1248,128,1344,128,1392,128L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
         </svg>
      </div>
    </div>
  );
}
