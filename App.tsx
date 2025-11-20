
import React, { useState, useCallback } from 'react';
import { DecisionCard } from './components/DecisionCard';
import { ResultDisplay } from './components/ResultDisplay';
import { FollowUpSection } from './components/FollowUpSection';
import { startChatAndGetDecision, getWeather, getPlaceSuggestions } from './services/geminiService';
import { Decision } from './types';
import type { DecisionResult, PlaceSuggestion, GroundingLink } from './types';
import type { Chat } from '@google/genai';


const SunCloudIcon = () => (
  <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline-block mb-2 text-yellow-400">
    <path d="M44.5 33.5C44.5 33.5 48 32 49.5 29C51 26 49 23.5 49 23.5C49 23.5 45.5 23.5 43.5 25.5C41.5 27.5 44.5 33.5 44.5 33.5Z" fill="#FFD15D"/>
    <path d="M50.4999 43.5C50.4999 43.5 54.5 42.5 55.5 39C56.5 35.5 54.5 32.5 54.5 32.5C54.5 32.5 50.5 33.5 48.5 35.5C46.5 37.5 50.4999 43.5 50.4999 43.5Z" fill="#FFD15D"/>
    <path d="M28.5 18.5C28.5 18.5 34 18 35.5 15C37 12 34.5 9 34.5 9C34.5 9 30 10 28 12C26 14 28.5 18.5 28.5 18.5Z" fill="#FFD15D"/>
    <path d="M19 32C19 32 24.5 30 26 27C27.5 24 25 21 25 21C25 21 20.5 22.5 18.5 24.5C16.5 26.5 19 32 19 32Z" fill="#FFD15D"/>
    <path d="M36.5 48C45.0604 48 52 41.0604 52 32.5C52 23.9396 45.0604 17 36.5 17C27.9396 17 21 23.9396 21 32.5C21 41.0604 27.9396 48 36.5 48Z" fill="#FFD15D"/>
    <path d="M46.75 48.0001C46.4167 47.9334 44.5 49.5001 42.5 50.0001C39.5 50.5001 37.6667 52.0001 37 53.0001C35.5 54.5001 32.5 54.5001 30 53.0001C27.5 51.5001 22 49.0001 19.5 46.5001C17 44.0001 14.5 39.5001 15 36.5001C15.5 33.5001 17.5 31.5001 19 30.5001C19.8333 29.8334 21.0417 29.6251 21.5 29.5001" stroke="#FDF3D8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M49 48.5C54.5 47 58.5 41 58.5 34C58.5 27 54.5 21.5 49 19.5" stroke="#FDF3D8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M15 36.5C9.5 38 6 43.5 6 49.5C6 55.5 9.5 61 15 62.5" stroke="#FDF3D8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M46.75 48C49.9167 47.3333 52.5 44.5 52.5 41C52.5 37.5 50.4167 34.6667 47.5 33.5" stroke="#FDF3D8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M42.75 50C44.9167 49.6667 46.5 48 46.5 46C46.5 44 44.9167 42.3333 42.75 42" stroke="#FDF3D8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M37 53C39.1667 52.3333 41 50.5 41 48C41 45.5 39.1667 43.6667 37 43" stroke="#FDF3D8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M30 53C32.5 52.1667 34.5 50 34.5 47C34.5 44 32.5 41.8333 30 41" stroke="#FDF3D8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M19.5 46.5C22.6667 45.6667 25.5 43 25.5 39.5C25.5 36 22.6667 33.3333 19.5 32.5" stroke="#FDF3D8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M15 36.5C17.1667 36 18.5 34.5 18.5 32.5C18.5 30.5 17.1667 29 15 28.5" stroke="#FDF3D8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);


const App: React.FC = () => {
  const [userInput, setUserInput] = useState<string>('');
  const [result, setResult] = useState<DecisionResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('思考中...');
  const [error, setError] = useState<string | null>(null);
  
  const [chat, setChat] = useState<Chat | null>(null);
  const [coordinates, setCoordinates] = useState<{lat: number, lon: number} | null>(null);
  const [placeSuggestions, setPlaceSuggestions] = useState<PlaceSuggestion[]>([]);
  const [groundingLinks, setGroundingLinks] = useState<GroundingLink[]>([]);
  const [isSuggestingPlaces, setIsSuggestingPlaces] = useState<boolean>(false);
  const [suggestionError, setSuggestionError] = useState<string | null>(null);

  const handleDecision = useCallback(async () => {
    if (!userInput.trim()) {
      setError('請告訴我你現在的心情！');
      return;
    }
    setIsLoading(true);
    setError(null);
    setResult(null);
    setChat(null);
    setPlaceSuggestions([]);
    setGroundingLinks([]);
    setSuggestionError(null);

    try {
      setLoadingMessage('正在取得您的位置...');
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        });
      });
      
      const { latitude, longitude } = position.coords;
      setCoordinates({ lat: latitude, lon: longitude });

      setLoadingMessage('正在查詢天氣...');
      const weatherDescription = await getWeather(latitude, longitude);

      setLoadingMessage('正在為您做決定...');
      const combinedInput = `我的心情：${userInput}。 目前天氣：${weatherDescription}`;
      const { chat: newChat, result: decisionResult } = await startChatAndGetDecision(combinedInput);
      setResult(decisionResult);
      setChat(newChat);

    } catch (err) {
      if (err instanceof GeolocationPositionError) {
         setError('無法取得您的位置。請允許存取位置資訊，然後再試一次。');
      } else {
        setError('糟糕，無法做出決定。請稍後再試。');
      }
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [userInput]);
  
  const handleGetPlaces = useCallback(async (isRefresh: boolean = false) => {
    if (!chat || !result || !coordinates) return;
    
    setIsSuggestingPlaces(true);
    setSuggestionError(null);
    try {
      const { places, groundingLinks } = await getPlaceSuggestions(
        chat, 
        result.decision,
        result.activity, 
        coordinates.lat, 
        coordinates.lon,
        isRefresh
      );
      setPlaceSuggestions(places);
      setGroundingLinks(groundingLinks);
    } catch (err) {
      setSuggestionError('抱歉，無法找到推薦建議。請稍後再試。');
      console.error(err);
    } finally {
      setIsSuggestingPlaces(false);
    }
  }, [chat, result, coordinates]);

  const handleReset = useCallback(() => {
    setUserInput('');
    setResult(null);
    setError(null);
    setChat(null);
    setPlaceSuggestions([]);
    setGroundingLinks([]);
    setSuggestionError(null);
  }, []);


  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-cyan-50 text-gray-800 flex flex-col items-center justify-center p-4 font-sans selection:bg-pink-300 selection:text-pink-900">
      <main className="w-full max-w-2xl flex flex-col items-center">
        <header className="text-center mb-8">
          <SunCloudIcon />
          <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-orange-500 via-red-500 to-purple-600 bg-clip-text text-transparent tracking-tight">
            今天... 要出門嗎？
          </h1>
          <p className="text-lg text-gray-500 mt-2">
            讓 AI 根據你的心情與當前天氣，幫你做個可愛的了斷
          </p>
        </header>
        
        <DecisionCard
          userInput={userInput}
          onUserInput={setUserInput}
          onDecide={handleDecision}
          isLoading={isLoading}
          loadingMessage={loadingMessage}
          error={error}
        />

        <div className="w-full mt-8">
          {result && <ResultDisplay result={result} />}
          {result && !isLoading && (
            <FollowUpSection 
              decision={result.decision}
              onGetPlaces={() => handleGetPlaces(false)}
              onRefreshPlaces={() => handleGetPlaces(true)}
              suggestions={placeSuggestions}
              groundingLinks={groundingLinks}
              isLoading={isSuggestingPlaces}
              error={suggestionError}
            />
          )}
          {result && !isLoading && (
            <div className="text-center mt-8 animate-fade-in-restart-button">
              <button
                onClick={handleReset}
                className="bg-white text-gray-700 font-bold py-3 px-6 rounded-full transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-gray-300 shadow-md border border-gray-200 hover:bg-gray-100 hover:shadow-lg"
              >
                ↻ 再玩一次！
              </button>
            </div>
          )}
        </div>
      </main>
      
      <footer className="mt-12 pb-4 text-center text-gray-400 text-sm">
        <p>&copy; {new Date().getFullYear()} Decision Helper. Powered by Gemini.</p>
      </footer>
       <style>{`
        @keyframes fade-in-restart-button-kf {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-restart-button {
          animation: fade-in-restart-button-kf 0.5s ease-out 0.5s forwards;
          opacity: 0; /* Start hidden */
        }
      `}</style>
    </div>
  );
};

export default App;
