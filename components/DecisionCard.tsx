
import React from 'react';
import { LoadingSpinner } from './LoadingSpinner';

interface DecisionCardProps {
  userInput: string;
  onUserInput: (value: string) => void;
  onDecide: () => void;
  isLoading: boolean;
  loadingMessage: string;
  error: string | null;
}

const MOOD_CHIPS = [
  { label: '😴 懶懶的', value: '覺得全身沒力，懶懶的，不太想動...' },
  { label: '😤 壓力山大', value: '工作壓力好大，覺得快爆炸了！' },
  { label: '🥳 超級開心', value: '心情超級好！充滿活力！' },
  { label: '🤔 猶豫不決', value: '不知道該做什麼，有一點選擇障礙...' },
  { label: '💔 心好累', value: '心情有點低落，覺得心好累...' },
];

export const DecisionCard: React.FC<DecisionCardProps> = ({
  userInput,
  onUserInput,
  onDecide,
  isLoading,
  loadingMessage,
  error,
}) => {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (!isLoading) {
        onDecide();
      }
    }
  };

  return (
    <div className="w-full max-w-xl rounded-3xl shadow-xl p-1 bg-gradient-to-br from-purple-400 via-pink-500 to-orange-400 transition-all duration-300">
      <div className="w-full h-full bg-white/70 backdrop-blur-lg rounded-[1.25rem] p-6 md:p-8">
        <div className="flex flex-col space-y-4">
          <label htmlFor="userInput" className="text-lg font-bold text-gray-700">
            今天心情如何？
          </label>
          
          {/* Mood Chips */}
          <div className="flex flex-wrap gap-2 mb-2">
            {MOOD_CHIPS.map((chip) => (
              <button
                key={chip.label}
                onClick={() => onUserInput(chip.value)}
                disabled={isLoading}
                className="text-sm bg-white/80 border border-pink-200 text-pink-700 py-1.5 px-3 rounded-full hover:bg-pink-100 hover:scale-105 hover:border-pink-300 transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {chip.label}
              </button>
            ))}
          </div>

          <textarea
            id="userInput"
            value={userInput}
            onChange={(e) => onUserInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="也可以自己打字喔！例如：天氣好好，但我想把劇追完..."
            className="w-full h-28 p-4 bg-gray-50 border-2 border-transparent rounded-xl focus:ring-4 focus:ring-pink-400 focus:border-pink-400 transition-colors duration-200 resize-none text-base placeholder:text-gray-400"
            disabled={isLoading}
          />
          {error && <p className="text-center text-red-500 font-bold -mt-2">{error}</p>}
          <button
            onClick={onDecide}
            disabled={isLoading || !userInput.trim()}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:bg-gray-300 text-white font-bold py-4 px-4 rounded-full transition-transform transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-pink-300 flex items-center justify-center text-lg shadow-lg mt-2"
          >
            {isLoading ? (
              <>
                <LoadingSpinner />
                <span className="ml-2">{loadingMessage}</span>
              </>
            ) : (
              '✨ 幫我決定！'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
