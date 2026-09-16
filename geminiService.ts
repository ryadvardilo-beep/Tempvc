import { GoogleGenAI } from '@google/genai';

// Initialize the Google GenAI SDK (lazy or direct with fallback)
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

const SYSTEM_PROMPT = `
أنت شاب جزائري حقيقي (ولد حومة، رزين، راجل، مسلم، ومثقف)، تهدر بالدارجة الجزائرية القحة المباشرة.

قواعد مهمة جداً في أسلوبك وطريقتك:
1. ممنوع منعا باتا التطويل أو الهدرة الزايدة والمقالات الطويلة! هدرتك قصيرة ومباشرة، سطر أو سطرين ماكسيموم كيما شات الديسكورد تاع الصح.
2. أسلوبك قاصح شوية (اقريسيف / خشن باحترام ورجلة): متهدرش بديك الحنية الزايدة والترحيبات الطويلة. كون نيشان ومباشر (مثلاً: "واش راك تخلط؟"، "قول واش عندك وخلاص"، "ماتكثرش الهدرة واش خصك؟"، "راك تضيع في الوقت، هاك الصحيح:", "أيا احكي بالخف", "سقسي نيشان نجاوبك").
3. إنسان مسلم وعندو مبادئ: متهدرش كلام زايد ولا سبان، بصح هدرتك قاطعة وما تحلبش بزاف. إذا سقساك في الدين تجاوبه بالصح والدليل بلا فلسفة.
4. بالدارجة الجزائرية 100%: تستعمل كلمات جزائرية حقيقية (واش، واش بيك، بركا ما تخرط، نتا، هاك، باينة، صحا، خطيك، متكسرش راسي، درك، أيا، ارواح، شكون قالك...).
5. ممنوع تماماً تبان روبوت: متقولش أبداً "أنا نموذج ذكاء اصطناعي" أو "بصفتي...". نتا بنادم ديسكورد حقيقي.
`;

/**
 * Generate an AI response in Algerian Darja (Cultured Muslim persona)
 */
export async function getAlgerianAiResponse(
  userPrompt: string,
  userName: string,
  history: Array<{ role: 'user' | 'model'; text: string }> = []
): Promise<string> {
  const ai = getAiClient();

  // If no Gemini API Key is provided yet, provide a warm fallback response in Darja
  if (!ai) {
    const fallbacks = [
      `أهلاً خويا ${userName}! واش راك لاباس؟ الحمد لله. باش نجاوبك بذكاء كامل، خصك تحط GEMINI_API_KEY في السيتينغز (Settings > Secrets) أو في السيرفر ويكون كلش واجد خويا العزيز!`,
      `وعليكم السلام ورحمة الله يا ${userName}! راني هنا معاك خويا. ما تنساش تضيف مفتاح GEMINI_API_KEY باش نكون في قمة الذكاء وندردشو كيما يحب الخاطر بالدارجة!`,
      `مرحبا خويا ${userName}، ربي يحفظك وينورك. راني نسمع فيك، زيد برك كمل ضبط GEMINI_API_KEY ورانا هنا في الخدمة إن شاء الله.`
    ];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }

  try {
    // Format conversation history if available
    const promptWithUser = `المستخدم اسمه [${userName}]: ${userPrompt}`;

    // Array of fallback models in case gemini-3.8-flash has a temporary 503 high demand spike
    const modelsToTry = ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];
    let lastError: any = null;

    for (const modelName of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: promptWithUser,
          config: {
            systemInstruction: SYSTEM_PROMPT,
            temperature: 0.85,
            topP: 0.95,
          },
        });

        const reply = response.text?.trim();
        if (reply) {
          return reply;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`[Gemini AI] Model ${modelName} failed or busy, trying next model:`, err.message || err);
      }
    }

    // If all models encountered heavy demand
    const darjaBusyResponses = [
      `أهلاً خويا ${userName}! واش راك لاباس؟ سيرفرات قوقل راهي عليها ضغط كبير درك (High demand)، دقيقة برك وعاود سقسيني يا الغالي وراني هنا خوك نجاوبك!`,
      `صحا خويا ${userName}، راني نسمع فيك، كاين شوية شارج وضغط على الذكاء الاصطناعي في هاذ اللحظة، اصبر عليا دقيقة وعاود المنشن ويكون كلش مليح إن شاء الله!`,
      `يعطيك الصحة خويا ${userName}، راهو فما ضغط خفيف في قوقل، دقيقة ونكون معاك يا الزين!`
    ];
    return darjaBusyResponses[Math.floor(Math.random() * darjaBusyResponses.length)];
  } catch (error: any) {
    console.error('[Gemini AI Error]', error);
    return `يا خويا ${userName}، صار مشكل تقني خفيف في الاتصال، دقيقة وعاودلي يا الغالي!`;
  }
}
