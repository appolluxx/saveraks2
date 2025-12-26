
import { GoogleGenAI, Type } from "@google/genai";

// Initialize the Google GenAI client with the API key from environment variables.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = error => reject(error);
  });
};

/**
 * Utility to extract clean JSON from a potentially markdown-formatted string
 */
const extractJson = (text: string | undefined): any => {
  if (!text || text === "undefined" || text.trim() === "") return {};
  
  try {
    // Remove markdown code block markers if present
    const cleanText = text.replace(/```json\n?|```/g, "").trim();
    return JSON.parse(cleanText);
  } catch (error) {
    console.error("Failed to parse JSON from AI response:", text);
    return {};
  }
};

/**
 * Master AI Scanner for SaveRaks 2.0
 * Analyzes campus environment images for waste, maintenance, or hazards.
 */
export const analyzeEnvironmentImage = async (base64Image: string): Promise<any> => {
  try {
    const model = 'gemini-3-flash-preview';
    const systemInstruction = `You are the SaveRaks Eco-Guardian AI for Surasakmontree School. 
    Analyze the image and categorize it into EXACTLY ONE of these three lowercase category strings:

    1. "waste" (Circular Economy):
       - If it is trash/recyclable.
       - Identify 'bin_color': "Yellow" (Recycle), "Green" (Organic), "Red" (Hazardous), "Blue" (General).
       - Provide 'upcycling_tip' (Thai language) e.g., "แยกฝาขวดไปขายเพื่อเพิ่มมูลค่า".
       - point_reward: 10.

    2. "grease_trap" (Water Care):
       - If it is a grease trap or water filter.
       - Identify 'maintenance_status': "clean" or "dirty".
       - "clean" = Clear water surface or well-maintained. "dirty" = Grease layer or food scraps.
       - point_reward: 50.

    3. "hazard" (Safety Map):
       - If it is a dangerous spot (flood, broken stairs, construction, exposed wires).
       - Identify 'risk_level': "Red" (Danger), "Orange" (Caution), "Green" (Safe).
       - point_reward: 20.

    CRITICAL: 
    - The 'category' MUST be one of: "waste", "grease_trap", or "hazard". 
    - Return JSON strictly. 
    - Use Thai for 'label' and 'upcycling_tip'.`;

    // Refactored to use systemInstruction in the config as recommended.
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Image } }
        ]
      },
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING, description: "Must be 'waste', 'grease_trap', or 'hazard'" },
            label: { type: Type.STRING, description: "Name of the object in Thai" },
            bin_color: { type: Type.STRING, description: "Yellow, Green, Red, or Blue" },
            upcycling_tip: { type: Type.STRING, description: "Advice in Thai" },
            maintenance_status: { type: Type.STRING, description: "clean or dirty" },
            risk_level: { type: Type.STRING, description: "Red, Orange, or Green" },
            point_reward: { type: Type.INTEGER }
          },
          required: ['category', 'label', 'point_reward']
        }
      }
    });

    // Directly access the .text property from the GenerateContentResponse.
    return extractJson(response.text);
  } catch (error) {
    console.error("Master Scanner Error:", error);
    throw error;
  }
};

/**
 * Analyzes an electricity bill image to extract units, cost, and month.
 */
export const analyzeUtilityBill = async (base64Image: string): Promise<any> => {
  try {
    const model = 'gemini-3-flash-preview';
    const prompt = `Extract units (kWh), amount (THB), and billing month from this electricity bill. Return JSON.`;
    
    // Multi-part content with image and text prompt.
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
          },
          required: ['units', 'amount', 'month']
        }
      }
    });
    
    // Directly access the .text property from the GenerateContentResponse.
    return extractJson(response.text);
  } catch (error) {
    console.error("Bill Reader Error:", error);
    throw new Error("Could not read bill.");
  }
};
