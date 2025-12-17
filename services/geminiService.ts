import { GoogleGenAI, Type } from "@google/genai";

// Initialize Gemini Client
// NOTE: In a real production app, you should proxy requests through a backend to hide the API key.
// Since this is a client-side demo instructions, we use the env variable directly.
const apiKey = process.env.API_KEY || 'AIzaSyAL09G8TkOclQ87iIsxzad8D8zqsD7uhlEAIzaSyAL09G8TkOclQ87iIsxzad8D8zqsD7uhlE'; 
const ai = new GoogleGenAI({ apiKey });

/**
 * Helper to convert File to Base64
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the Data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
};

/**
 * Recycle & Earn: Analyzes waste image to determine category.
 * Transient analysis - no storage.
 */
export const analyzeWasteImage = async (base64Image: string): Promise<{ item: string; category: string; advice: string; xp: number }> => {
  if (!apiKey) throw new Error("API Key missing");

  try {
    const model = 'gemini-2.5-flash';
    const prompt = `Analyze this image of waste. 
    1. Identify the item (e.g., "Plastic Water Bottle", "Banana Peel").
    2. Classify it strictly into one of these 4 categories: 'Recycling', 'Organic', 'Hazardous', 'General'.
       - Recycling: Plastic bottles, glass, cans, paper.
       - Organic: Food scraps, fruit peels, leaves.
       - Hazardous: Batteries, electronics, chemicals, light bulbs.
       - General: Snack bags, foam, dirty tissues, wrappers.
    3. Give a 1 sentence tip on how to dispose of it (e.g. "Rinse before throwing").
    4. Assign an XP value between 10 and 50 based on eco-impact.
    
    Return JSON format: { "item": string, "bin": string, "advice": string, "xp": number }`;

    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            item: { type: Type.STRING },
            bin: { type: Type.STRING },
            advice: { type: Type.STRING },
            xp: { type: Type.INTEGER }
          }
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    return {
      item: result.item || 'Unknown Item',
      category: result.bin || 'General',
      advice: result.advice || 'Dispose carefully.',
      xp: result.xp || 10
    };

  } catch (error) {
    console.error("Gemini Waste Analysis Error:", error);
    return { item: 'Unknown', category: 'General', advice: 'Could not analyze. Please try again.', xp: 0 };
  }
};

/**
 * Energy Points: OCR for Electricity Bill.
 * Returns structured data.
 */
export const analyzeUtilityBill = async (base64Image: string): Promise<{ units: number; amount: number; month: string }> => {
  if (!apiKey) throw new Error("API Key missing");

  try {
    const model = 'gemini-2.5-flash';
    const prompt = `Analyze this electricity bill. Extract the following:
    1. Total Units (kWh) used.
    2. Total Amount (THB) to pay.
    3. The billing month (e.g., "September 2024").
    
    Return JSON. If unclear, return nulls.`;

    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            units: { type: Type.NUMBER },
            amount: { type: Type.NUMBER },
            month: { type: Type.STRING }
          }
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    return {
      units: result.units || 0,
      amount: result.amount || 0,
      month: result.month || 'Unknown'
    };
  } catch (error) {
    console.error("Gemini Bill OCR Error:", error);
    throw new Error("Could not read bill.");
  }
};
