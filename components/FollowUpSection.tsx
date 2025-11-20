
import React from 'react';
import type { PlaceSuggestion, GroundingLink } from '../types';
import { Decision } from '../types';
import { LoadingSpinner } from './LoadingSpinner';

interface FollowUpSectionProps {
  decision: Decision;
  onGetPlaces: () => void;
  onRefreshPlaces: () => void;
  suggestions: PlaceSuggestion[];
  groundingLinks?: GroundingLink[];
  isLoading: boolean;
  error: string | null;
}

export const FollowUpSection: React.FC<FollowUpSectionProps> = ({
  decision,
  onGetPlaces,
  onRefreshPlaces,
  suggestions,
  groundingLinks = [],
  isLoading,
  error,
}) => {
  const hasSuggestions = suggestions.length > 0;
  const isGoOut = decision === Decision.GoOut;

  // Dynamic Text based on decision
  const buttonText = isGoOut ? '✨ 推薦一些好去處！' : '✨ 推薦在家做的事！';
  const loadingText = isGoOut ? 'AI 嚮導正在搜尋地圖...' : 'AI 嚮導正在搜尋靈感...';
  const headerText = isGoOut ? '為你找到這些好地方：' : '為你找到這些好點子：';
  const refreshText = isGoOut ? '🔄 換一批好去處' : '🔄 換一批好點子';

  const cardBgClass = isGoOut ? 'bg-white/80' : 'bg-purple-50/80';
  const cardTitleColor = isGoOut ? 'text-emerald-900' : 'text-purple-900';
  const cardSubtitleColor = isGoOut ? 'text-emerald-600/70' : 'text-purple-600/70';
  const mainBtnClass = isGoOut 
    ? 'from-emerald-400 to-cyan-500 hover:from-emerald-500 hover:to-cyan-600 focus:ring-cyan-300'
    : 'from-indigo-400 to-purple-500 hover:from-indigo-500 hover:to-purple-600 focus:ring-purple-300';

  return (
    <div className="w-full mt-8 text-center animate-fade-in-slow">
      {!hasSuggestions && !isLoading && (
        <button
          onClick={onGetPlaces}
          disabled={isLoading}
          className={`bg-gradient-to-r ${mainBtnClass} disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-3 px-6 rounded-full transition-transform transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed focus:outline-none focus:ring-4 flex items-center justify-center text-md shadow-lg mx-auto`}
        >
            {buttonText}
        </button>
      )}
      
      {isLoading && (
         <div className={`flex justify-center items-center py-6 ${isGoOut ? 'text-cyan-600' : 'text-purple-600'} font-bold`}>
            <LoadingSpinner />
            <span className="ml-2">{loadingText}</span>
         </div>
      )}

      {error && <p className="mt-4 text-center text-red-500 font-bold">{error}</p>}
      
      {hasSuggestions && !isLoading && (
        <div className="mt-6">
          <h3 className="text-xl font-bold text-gray-700 mb-6 text-center">{headerText}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            {suggestions.map((suggestion, index) => {
                const linkUrl = suggestion.mapUri || suggestion.externalLink || `https://www.google.com/search?q=${encodeURIComponent(suggestion.name + " " + suggestion.address)}`;
                const linkText = isGoOut ? '📍 在地圖上查看' : '🔍 查看更多資訊';
                const linkBtnClass = isGoOut 
                    ? 'bg-cyan-50 hover:bg-cyan-100 text-cyan-700' 
                    : 'bg-purple-50 hover:bg-purple-100 text-purple-700';

                return (
                  <div
                    key={index}
                    className={`group flex flex-col p-6 ${cardBgClass} rounded-2xl shadow-md hover:shadow-xl animate-slide-in backdrop-blur-sm border border-white/60 transition-all duration-300 transform hover:-translate-y-1`}
                    style={{ animationDelay: `${index * 150}ms`, opacity: 0 }}
                  >
                    <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300 origin-left">{suggestion.emoji}</div>
                    <h4 className={`font-bold text-lg ${cardTitleColor} mb-1 line-clamp-1`} title={suggestion.name}>{suggestion.name}</h4>
                    <p className={`text-xs font-semibold ${cardSubtitleColor} mb-2 uppercase tracking-wider line-clamp-1`}>{suggestion.address}</p>
                    <p className="text-gray-600 mb-4 text-sm leading-relaxed flex-grow">{suggestion.description}</p>
                    
                    <a 
                      href={linkUrl}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={`mt-auto text-center w-full block font-bold py-2 rounded-lg transition-colors duration-200 text-sm ${linkBtnClass}`}
                    >
                      {linkText}
                    </a>
                  </div>
                );
            })}
          </div>
          
          <div className="mt-8 text-center">
             <button
                onClick={onRefreshPlaces}
                className={`bg-white border-2 font-bold py-2 px-6 rounded-full transition-all duration-200 focus:outline-none shadow-sm hover:shadow-md flex items-center mx-auto ${isGoOut ? 'border-cyan-100 text-cyan-600 hover:bg-cyan-50 focus:ring-cyan-200' : 'border-purple-100 text-purple-600 hover:bg-purple-50 focus:ring-purple-200'}`}
             >
                {refreshText}
             </button>
          </div>

          {/* Grounding Sources Footer */}
          {groundingLinks.length > 0 && (
             <div className="mt-6 pt-4 border-t border-gray-200/50 text-xs text-gray-400 text-left">
                <p className="font-semibold mb-1">資料來源：</p>
                <ul className="space-y-1">
                    {groundingLinks.map((link, i) => (
                        <li key={i}>
                            <a href={link.uri} target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-gray-600 truncate block max-w-xs">
                                {link.title}
                            </a>
                        </li>
                    ))}
                </ul>
             </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes fade-in-slow {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-slow {
          animation: fade-in-slow 0.5s ease-out forwards;
        }
        @keyframes slide-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-in {
          animation: slide-in 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }
      `}</style>
    </div>
  );
};
