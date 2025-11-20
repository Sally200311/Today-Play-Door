
import { GoogleGenAI, Type, Chat } from "@google/genai";
import type { DecisionResult, PlaceSuggestion, GroundingLink } from '../types';
import { Decision } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const decisionSchema = {
  type: Type.OBJECT,
  properties: {
    decision: {
      type: Type.STRING,
      enum: [Decision.GoOut, Decision.StayHome],
      description: `The final decision: '${Decision.GoOut}' (Go Out) or '${Decision.StayHome}' (Stay Home).`
    },
    reason: {
      type: Type.STRING,
      description: "A creative, fun, and persuasive explanation for the decision, written in Traditional Chinese. Be encouraging and slightly whimsical."
    },
    activity: {
      type: Type.STRING,
      description: "A short, suggested activity that fits the decision, written in Traditional Chinese. For example, '去附近的咖啡廳看本書' or '窩在沙發上看一部好電影'."
    }
  },
  required: ['decision', 'reason', 'activity']
};

export const getWeather = async (lat: number, lon: number): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `請用繁體中文，以輕鬆、口語化的方式，簡要描述在緯度 ${lat}、經度 ${lon} 的目前天氣狀況。例如：「天氣有點陰陰的，可能隨時會下雨喔！」或「是個陽光普照的好日子！」。`,
      config: {
        temperature: 0.5,
      },
    });
    return response.text.trim();
  } catch (error) {
    console.error("Error calling Gemini API for weather:", error);
    throw new Error("Failed to get weather information from the Gemini API.");
  }
};

export const startChatAndGetDecision = async (userInput: string): Promise<{ chat: Chat, result: DecisionResult }> => {
  try {
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: "你是一位友善且帶點奇幻風格的在地嚮導，你的目標是幫助使用者決定今天是否該出門。你的回答必須使用繁體中文，並且總是充滿創意和說服力。你會同時考慮使用者提供的心情和天氣狀況。如果使用者後續詢問可以去哪裡，請根據你先前建議的活動以及使用者提供的地理位置，來推薦真實、具體的地點。",
        temperature: 0.8,
        topP: 0.9,
      },
    });

    const response = await chat.sendMessage({
        message: `基於以下因素：「${userInput}」，我今天應該出門還是待在家？`,
        config: {
            responseMimeType: "application/json",
            responseSchema: decisionSchema,
        }
    });

    const jsonText = response.text.trim();
    const parsedResult = JSON.parse(jsonText) as DecisionResult;

    if (!Object.values(Decision).includes(parsedResult.decision)) {
        throw new Error(`Invalid decision value received from API: ${parsedResult.decision}`);
    }

    return { chat, result: parsedResult };

  } catch (error) {
    console.error("Error calling Gemini API for decision:", error);
    throw new Error("Failed to get a decision from the Gemini API.");
  }
};


export const getPlaceSuggestions = async (
  chat: Chat, 
  decision: Decision, 
  activity: string, 
  lat: number, 
  lon: number, 
  isRefresh: boolean = false
): Promise<{ places: PlaceSuggestion[], groundingLinks: GroundingLink[] }> => {
  try {
    let message = '';
    let toolConfig = {};

    if (decision === Decision.GoOut) {
        // Logic for Going Out (Google Maps)
        const basePrompt = isRefresh 
            ? `請針對同一個活動「${activity}」，再推薦「另外」3 個與剛才「完全不同」的地點。避免重複之前的建議。` 
            : `請根據「${activity}」這個活動，並參考使用者目前的位置（緯度 ${lat}、經度 ${lon}），用繁體中文推薦 3 個真實、具體存在且有趣的「地點」。`;

        message = `${basePrompt}
        
請嚴格依照以下格式列出這 3 個地點，每個地點之間用 "---ITEM---" 分隔，不要包含其他前言或結語：

---ITEM---
名稱：[地點名稱]
地址：[大致地址或區域]
Emoji：[代表該地點的一個表情符號]
描述：[簡短吸引人的描述，約 30 字]
---ITEM---
名稱：...
`;
        toolConfig = {
            tools: [{googleMaps: {}}],
            toolConfig: {
                retrievalConfig: {
                    latLng: {
                        latitude: lat,
                        longitude: lon
                    }
                }
            }
        };

    } else {
        // Logic for Staying Home (Google Search)
        const basePrompt = isRefresh
            ? `請針對同一個居家活動主題「${activity}」，再推薦「另外」3 個與剛才「完全不同」的具體作品或點子（例如不同的電影、書名、食譜或遊戲）。`
            : `既然決定「待在家」，請根據「${activity}」這個活動，推薦 3 個具體的「內容」或「點子」（例如具體的電影片名、書名、食譜名稱、或居家運動項目）。`;

        message = `${basePrompt}

請嚴格依照以下格式列出這 3 個項目，每個項目之間用 "---ITEM---" 分隔，不要包含其他前言或結語：

---ITEM---
名稱：[具體的作品名/活動名]
類別：[例如：科幻電影、義式料理、瑜珈]
Emoji：[代表該項目的一個表情符號]
描述：[簡短吸引人的描述，約 30 字]
---ITEM---
名稱：...
`;
        toolConfig = {
            tools: [{googleSearch: {}}]
        };
    }
    
    const response = await chat.sendMessage({
      message,
      config: toolConfig
    });

    const text = response.text || '';
    
    // Parse the custom text format
    const suggestions: PlaceSuggestion[] = [];
    const parts = text.split('---ITEM---');
    
    for (const part of parts) {
        if (!part.trim()) continue;
        
        const nameMatch = part.match(/名稱：(.*?)(?:\n|$)/);
        const addressMatch = part.match(/(?:地址|類別)：(.*?)(?:\n|$)/);
        const emojiMatch = part.match(/Emoji：(.*?)(?:\n|$)/);
        const descMatch = part.match(/描述：(.*?)(?:\n|$)/);

        if (nameMatch) {
            suggestions.push({
                name: nameMatch[1].trim(),
                address: addressMatch ? addressMatch[1].trim() : '',
                emoji: emojiMatch ? emojiMatch[1].trim() : '✨',
                description: descMatch ? descMatch[1].trim() : '',
            });
        }
    }

    // Extract Grounding Metadata
    const groundingLinks: GroundingLink[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    
    if (chunks) {
        chunks.forEach(chunk => {
            if (chunk.web?.uri && chunk.web?.title) {
                groundingLinks.push({ title: chunk.web.title, uri: chunk.web.uri });
            } else if (chunk.maps?.placeId) { // Type guard for maps logic
                const mapChunk = chunk as any;
                if (mapChunk.maps?.uri && mapChunk.maps?.title) {
                     groundingLinks.push({ title: mapChunk.maps.title, uri: mapChunk.maps.uri });
                }
            }
        });
    }

    // Attempt to attach URIs to suggestions
    suggestions.forEach(suggestion => {
        const match = groundingLinks.find(link => link.title.includes(suggestion.name) || suggestion.name.includes(link.title));
        if (match) {
            if (decision === Decision.GoOut) {
                suggestion.mapUri = match.uri;
            } else {
                suggestion.externalLink = match.uri;
            }
        }
    });

    return { places: suggestions, groundingLinks };

  } catch (error) {
    console.error("Error calling Gemini API for suggestions:", error);
    throw new Error("Failed to get suggestions from the Gemini API.");
  }
};
