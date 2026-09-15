import React, { useState, useEffect } from 'react';
import { X, Gamepad2, RotateCcw, Trophy, Users } from 'lucide-react';

interface XOGameModalProps {
  isOpen: boolean;
  channelId: string;
  onClose: () => void;
  userId: string;
}

export const XOGameModal: React.FC<XOGameModalProps> = ({
  isOpen,
  channelId,
  onClose,
  userId,
}) => {
  const [board, setBoard] = useState<Array<string | null>>(Array(9).fill(null));
  const [turn, setTurn] = useState<'X' | 'O'>('X');
  const [winner, setWinner] = useState<string | null>(null);
  const [isDraw, setIsDraw] = useState(false);
  const [score, setScore] = useState({ X: 0, O: 0, ties: 0 });

  const checkWinner = (squares: Array<string | null>) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];
    for (const [a, b, c] of lines) {
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  };

  const handleCellClick = (index: number) => {
    if (board[index] || winner || isDraw) return;

    const nextBoard = [...board];
    nextBoard[index] = turn;
    setBoard(nextBoard);

    const win = checkWinner(nextBoard);
    if (win) {
      setWinner(win);
      setScore((s) => ({ ...s, [win]: (s as any)[win] + 1 }));
    } else if (nextBoard.every((c) => c !== null)) {
      setIsDraw(true);
      setScore((s) => ({ ...s, ties: s.ties + 1 }));
    } else {
      setTurn(turn === 'X' ? 'O' : 'X');
    }
  };

  const handleReset = () => {
    setBoard(Array(9).fill(null));
    setTurn('X');
    setWinner(null);
    setIsDraw(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
      <div id="xo-game-dialog" className="bg-[#313338] w-full max-w-sm rounded-xl shadow-2xl border border-[#232428] overflow-hidden text-[#dbdee1] animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#232428] bg-[#2b2d31]">
          <div className="flex items-center gap-2">
            <Gamepad2 className="w-5 h-5 text-[#5865f2]" />
            <h3 className="font-bold text-white text-base">🎮 XO Game • تحدي الروم</h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#949ba4] hover:text-white p-1 rounded hover:bg-[#35373c] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Score & Turn Banner */}
        <div className="p-4 bg-[#1e1f22] border-b border-[#2b2d31] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded font-bold ${turn === 'X' && !winner && !isDraw ? 'bg-cyan-500 text-black' : 'bg-[#2b2d31] text-cyan-400'}`}>
              Player X
            </span>
            <span className="text-[#80848e]">VS</span>
            <span className={`px-2 py-1 rounded font-bold ${turn === 'O' && !winner && !isDraw ? 'bg-rose-500 text-white' : 'bg-[#2b2d31] text-rose-400'}`}>
              Player O
            </span>
          </div>

          <div className="text-right text-[#949ba4] font-mono">
            {winner ? (
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5" /> الفائز: {winner}!
              </span>
            ) : isDraw ? (
              <span className="text-amber-400 font-bold">تعادل!</span>
            ) : (
              <span>الدور: <strong className={turn === 'X' ? 'text-cyan-400' : 'text-rose-400'}>{turn}</strong></span>
            )}
          </div>
        </div>

        {/* 3x3 Grid */}
        <div className="p-6 flex flex-col items-center">
          <div className="grid grid-cols-3 gap-2 w-64 h-64 bg-[#232428] p-2 rounded-lg border border-[#383a40]">
            {board.map((cell, idx) => (
              <button
                key={idx}
                onClick={() => handleCellClick(idx)}
                disabled={Boolean(cell || winner || isDraw)}
                className={`flex items-center justify-center text-3xl font-black rounded-md transition-all select-none cursor-pointer ${
                  cell === 'X'
                    ? 'bg-cyan-950/70 text-cyan-400 border border-cyan-500/50 shadow-inner'
                    : cell === 'O'
                    ? 'bg-rose-950/70 text-rose-400 border border-rose-500/50 shadow-inner'
                    : 'bg-[#2b2d31] hover:bg-[#35373c] text-transparent hover:border hover:border-[#5865f2]/40'
                }`}
              >
                {cell || ''}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between w-full mt-5 pt-3 border-t border-[#232428]">
            <div className="text-[11px] text-[#949ba4] font-mono">
              X: {score.X} | O: {score.O} | تعادل: {score.ties}
            </div>

            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#2b2d31] hover:bg-[#35373c] text-white text-xs font-medium transition-colors cursor-pointer border border-[#383a40]"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>جولة جديدة</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
