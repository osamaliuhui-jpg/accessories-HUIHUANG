import { GoogleGenAI } from "@google/genai";
import { TaskType } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Helper to convert file to base64
export const fileToGenerativePart = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove data url prefix (e.g. "data:image/jpeg;base64,")
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const getPromptForTask = (task: TaskType, info: { material: string; size: string; weight: string }) => {
  const basePrompt = `You are an expert product photographer and digital artist. 
  CRITICAL INSTRUCTION: The input images are reference views of the REFERENCE PRODUCT. You must generate a new image that features this EXACT product. 
  Do not change the product's shape, logo, color, material, or core design details.
  The product must look 100% identical to the reference images provided.
  `;

  switch (task) {
    case TaskType.WHITE_BG:
      return `${basePrompt} 
      Task: Generate a high-resolution product shot.
      Technique: Use the original product visuals to understand 3D shape and details.
      Background: Pure white background (#FFFFFF).
      Composition: Product centered, occupying 85% of the frame.
      Lighting: Studio lighting with soft natural shadow.
      Constraints: No text. No decoration. No color enhancement. High resolution.`;
      
    case TaskType.SIZE_GUIDE:
      return `${basePrompt} 
      Task: Display the original product with clean measurement lines.
      Dimensions: Use provided real dimensions only: ${info.size}.
      Style: Minimal layout. Thin grey lines, black text.
      Constraints: Do not cover product details. Add measurement lines clearly indicating height and width.`;
      
    case TaskType.DETAIL:
      return `${basePrompt} 
      Task: Ultra realistic macro photography zoom-in on original product details.
      Focus: Show texture, surface, joints, and finish based on all input views.
      Material Info: ${info.material}.
      Constraints: No color enhancement. No filters. Keep it raw and realistic.`;
      
    case TaskType.WEARING:
      return `${basePrompt} 
      Task: Generate a realistic photo of a real human model wearing or holding the product.
      Model Characteristics: The model must have Middle Eastern facial features.
      Scale: CRITICAL. Maintain real scale based on the size: ${info.size}. Do not enlarge. Do not exaggerate.
      Technique: Place the original product onto the model.
      Lighting: Natural lighting with realistic shadows.
      Style: Professional photography, natural look.`;
      
    case TaskType.LIFESTYLE:
      return `${basePrompt} 
      Task: Generate a lifestyle scene featuring the product in its natural environment.
      Style: Luxury minimal style.
      Lighting: Natural environment lighting.
      Constraint: Keep original color and material. No artistic effects.
      Technique: Place original product into realistic lifestyle scene.
      Atmosphere: High-end, clean, realistic.`;
      
    default:
      return basePrompt;
  }
};

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const generateProductImage = async (
  imageFiles: File[],
  task: TaskType,
  info: { material: string; size: string; weight: string },
  retries = 5 // Increased retries
): Promise<string> => {
  if (!apiKey) {
    throw new Error("API Key is missing");
  }

  // Convert all images to base64
  const imageParts = await Promise.all(imageFiles.map(async (file) => {
    const base64Data = await fileToGenerativePart(file);
    return {
      inlineData: {
        data: base64Data,
        mimeType: file.type,
      },
    };
  }));

  const prompt = getPromptForTask(task, info);
  const model = 'gemini-2.5-flash-image'; 

  let lastError;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: model,
        contents: {
          parts: [
            ...imageParts,
            { text: prompt },
          ],
        },
        config: {
          // Default config
        },
      });

      // Parse response for image
      const parts = response.candidates?.[0]?.content?.parts;
      if (parts) {
        for (const part of parts) {
          if (part.inlineData && part.inlineData.data) {
            return `data:image/png;base64,${part.inlineData.data}`;
          }
        }
      }

      throw new Error("No image data found in response. The model might have returned only text.");
    } catch (error: any) {
      lastError = error;
      console.error("Gemini API Error:", error);

      // Check for 429 (Resource Exhausted) or 503 (Service Unavailable)
      // Enhanced check to handle nested error objects common in Google APIs
      const isRateLimit = 
        error.status === 429 || 
        error.code === 429 || 
        error.message?.includes('429') || 
        error.message?.includes('quota') || 
        error.status === 'RESOURCE_EXHAUSTED' ||
        (error.error && (
          error.error.code === 429 || 
          error.error.status === 'RESOURCE_EXHAUSTED' || 
          error.error.message?.includes('quota')
        ));
        
      const isServerOverload = error.status === 503;

      if ((isRateLimit || isServerOverload) && attempt < retries) {
        // Increased exponential backoff: 4s, 8s, 16s, 32s, 64s
        const baseDelay = 4000;
        const delay = baseDelay * Math.pow(2, attempt);
        console.warn(`Rate limit hit. Retrying in ${delay}ms... (Attempt ${attempt + 1}/${retries})`);
        await wait(delay);
        continue;
      }
      
      // For other errors or if retries exhausted, throw immediately
      throw error;
    }
  }
  
  throw lastError;
};