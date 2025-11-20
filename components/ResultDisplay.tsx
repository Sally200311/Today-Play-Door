
import React, { useState } from 'react';
import type { DecisionResult } from '../types';
import { Decision } from '../types';

interface ResultDisplayProps {
  result: DecisionResult;
}

const GoOutIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" viewBox="0 0 64 64" fill="currentColor">
        <circle cx="32" cy="32" r="14"/>
        <path d="M32,6V2c0-1.1-0.9-2-2-2s-2,0.9-2,2v4C28,7.1,28.9,8,30,8S32,7.1,32,6z"/>
        <path d="M32,62v-4c0-1.1-0.9-2-2-2s-2,0.9-2,2v4c0,1.1,0.9,2,2,2S32,63.1,32,62z"/>
        <path d="M49.6,18.4c0.8-0.8,0.8-2,0-2.8l-2.8-2.8c-0.8-0.8-2-0.8-2.8,0s-0.8,2,0,2.8l2.8,2.8C47.5,19.2,48.8,19.2,49.6,18.4z"/>
        <path d="M17.2,49.6c0.8-0.8,0.8-2,0-2.8l-2.8-2.8c-0.8-0.8-2-0.8-2.8,0s-0.8,2,0,2.8l2.8,2.8C15.2,50.4,16.5,50.4,17.2,49.6z"/>
        <path d="M58,34h-4c-1.1,0-2-0.9-2-2s0.9-2,2-2h4c1.1,0,2,0.9,2,2S59.1,34,58,34z"/>
        <path d="M8,34H4c-1.1,0-2-0.9-2-2s0.9-2,2-2h4c1.1,0,2,0.9,2,2S9.1,34,8,34z"/>
        <path d="M49.6,46.8c-0.8-0.8-2-0.8-2.8,0l-2.8,2.8c-0.8,0.8-0.8,2,0,2.8s2,0.8,2.8,0l2.8-2.8C50.4,48.8,50.4,47.5,49.6,46.8z"/>
        <path d="M17.2,14.4c-0.8-0.8-2-0.8-2.8,0l-2.8,2.8c-0.8,0.8-0.8,2,0,2.8s2,0.8,2.8,0l2.8-2.8C18,16.5,18,15.2,17.2,14.4z"/>
    </svg>
);


const StayHomeIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.73,9.58l-8-7.46a1.002,1.002,0,00-1.46,0l-8,7.46A1,1,0,004,11.23V22a1,1,0,001,1H19a1,1,0,001-1V11.23a1,1,0,00-.27-1.65zM18,21H14V14a1,1,0,00-1-1h-2a1,1,0,00-1,1v7H6V10.5l6-5.55,6,5.55V21z"/>
    </svg>
);

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ result }) => {
  const [copied, setCopied] = useState(false);
  const isGoOut = result.decision === Decision.GoOut;

  const borderGradient = isGoOut
    ? 'bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500'
    : 'bg-gradient-to-br from-sky-400 via-indigo-500 to-violet-500';

  const innerBg = isGoOut
    ? 'bg-gradient-to-br from-yellow-50 via-orange-50 to-red-100'
    : 'bg-gradient-to-br from-sky-50 via-indigo-50 to-violet-100';
  
  const iconColor = isGoOut ? 'text-orange-500' : 'text-indigo-500';
  const reasonTextColor = isGoOut ? 'text-orange-900/80' : 'text-indigo-900/80';
  const activityBg = isGoOut ? 'bg-orange-200/60' : 'bg-indigo-200/60';
  const activityTextColor = isGoOut ? 'text-orange-900' : 'text-indigo-900';

  const titleGradient = isGoOut
    ? 'bg-gradient-to-r from-orange-500 to-red-500'
    : 'bg-gradient-to-r from-sky-500 to-violet-500';

  const handleCopy = async () => {
    const textToShare = `【今天出門嗎？】\nAI 說：${result.decision}！\n原因：${result.reason}\n建議：${result.activity}`;
    try {
      await navigator.clipboard.writeText(textToShare);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  return (
    <div className={`p-1 rounded-2xl text-center animate-fade-in ${borderGradient} shadow-lg relative`}>
       <div className={`p-6 rounded-xl text-center ${innerBg}`}>
        
        {/* Share Button */}
        <button 
          onClick={handleCopy}
          className={`absolute top-4 right-4 p-2 rounded-full transition-all duration-200 ${isGoOut ? 'bg-orange-100 text-orange-500 hover:bg-orange-200' : 'bg-indigo-100 text-indigo-500 hover:bg-indigo-200'}`}
          title="複製結果"
        >
          {copied ? (
             <span className="text-xs font-bold px-1">已複製!</span>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          )}
        </button>

        <div className="flex justify-center mb-4">
          <div className={iconColor}>
            {isGoOut ? <GoOutIcon /> : <StayHomeIcon />}
          </div>
        </div>
        <h2 className={`text-3xl font-black mb-3`}>
          <span className={`${titleGradient} bg-clip-text text-transparent`}>{result.decision}！</span>
        </h2>
        <p className={`text-base ${reasonTextColor} mb-4 leading-relaxed`}>{result.reason}</p>
        <div className={`inline-block px-5 py-2 rounded-full text-sm font-bold ${activityBg} ${activityTextColor} shadow-sm`}>
          💡 建議活動：{result.activity}
        </div>
      </div>
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-fade-in {
          animation: fade-in 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }
      `}</style>
    </div>
  );
};
