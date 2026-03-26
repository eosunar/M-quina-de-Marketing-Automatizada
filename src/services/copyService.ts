import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export interface CopyGenerationParams {
  objective: string;
  channel: string;
  audience: string;
  tone: string;
  offer: string;
  cta: string;
  industry?: string;
  variationIndex?: number;
}

export async function generateMarketingCopy(params: CopyGenerationParams): Promise<string> {
  const model = "gemini-3-flash-preview";
  const variationPrompt = params.variationIndex 
    ? `This is variation #${params.variationIndex + 1}. Make it distinct from previous versions while maintaining the same core message.`
    : "";

  const prompt = `
    Generate a professional and engaging marketing copy for a campaign in the ${params.industry || 'general'} industry with the following details:
    - Objective: ${params.objective}
    - Channel: ${params.channel}
    - Target Audience: ${params.audience}
    - Brand Tone: ${params.tone}
    - Core Offer: ${params.offer}
    - Call to Action: ${params.cta}

    ${variationPrompt}

    The copy should be optimized for the specific channel (${params.channel}) and tailored to the ${params.industry || 'general'} industry standards and audience expectations.
    Provide only the text for the copy, no explanations or extra text.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [{ parts: [{ text: prompt }] }],
    });

    return response.text || "Failed to generate copy. Please try again.";
  } catch (error) {
    console.error("Error generating copy:", error);
    return "An error occurred while generating the copy.";
  }
}

export async function generateVideoScript(params: CopyGenerationParams): Promise<string> {
  const model = "gemini-3-flash-preview";
  const prompt = `
    Generate a high-energy, engaging short video script (Reels/TikTok) for a campaign in the ${params.industry || 'general'} industry with the following details:
    - Objective: ${params.objective}
    - Target Audience: ${params.audience}
    - Brand Tone: ${params.tone}
    - Core Offer: ${params.offer}
    - Call to Action: ${params.cta}

    The script should be structured with:
    1. Hook (0-3s): Something to stop the scroll.
    2. Value/Problem (3-10s): Address the audience's need or show the offer.
    3. Call to Action (10-15s): Clear next step.
    
    The script should be tailored to the ${params.industry || 'general'} industry standards and audience expectations.
    Include visual cues in brackets [like this] and spoken lines in plain text.
    Keep it under 15-30 seconds total.
    Provide only the script text, no explanations.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [{ parts: [{ text: prompt }] }],
    });

    return response.text || "Failed to generate video script. Please try again.";
  } catch (error) {
    console.error("Error generating video script:", error);
    return "An error occurred while generating the video script.";
  }
}

export async function generateCampaignImage(params: { prompt: string; aspectRatio?: "1:1" | "16:9" | "9:16" }): Promise<string> {
  const model = "gemini-2.5-flash-image";
  
  try {
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          {
            text: `Generate a high-quality, professional marketing visual for the following campaign concept: ${params.prompt}. 
            The style should be modern, clean, and visually striking. 
            Avoid text in the image. 
            Focus on the mood and core message.`
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: params.aspectRatio || "1:1",
        },
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }

    throw new Error("No image data received from model");
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
}

export async function generateCampaignImprovements(campaign: any): Promise<string[]> {
  const model = "gemini-3-flash-preview";
  const prompt = `
    Analyze the following marketing campaign and suggest 3-5 specific, actionable improvements to increase performance (Engagement, CTR, Conversions).
    
    Campaign Details:
    - Name: ${campaign.name}
    - Objective: ${campaign.description}
    - Industry: ${campaign.industry || 'General'}
    - Platform: ${campaign.platform}
    - Budget: $${campaign.budget}
    - Estimated Engagement: ${campaign.estimatedEngagement}
    - Estimated CTR: ${campaign.estimatedCTR}%
    - Estimated Conversions: ${campaign.estimatedConversions}
    
    Current Content:
    - Copies: ${campaign.copies?.join(' | ') || 'None'}
    - Video Scripts: ${campaign.videoScripts?.join(' | ') || 'None'}
    
    Consider current marketing trends for ${campaign.industry || 'general'} industry and the specific platform (${campaign.platform}).
    Provide the suggestions as a JSON array of strings.
    Example: ["Improve the hook in the first 3 seconds of the video script", "Use more benefit-oriented language in the copy", "Increase budget by 10% for better reach"]
    Provide ONLY the JSON array.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
      }
    });

    const text = response.text || "[]";
    return JSON.parse(text);
  } catch (error) {
    console.error("Error generating improvements:", error);
    return ["Focus on a clearer Call to Action", "Test different visual styles", "Refine the target audience segment"];
  }
}
