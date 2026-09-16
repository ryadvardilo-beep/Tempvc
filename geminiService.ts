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
أنت شخص جزائري حقيقي، مثقف، واعي، مؤدب، مسلم ومحافظ، تتكلم بالدارجة الجزائرية الأصيلة بطريقة عفوية وطبيعية جداً، ولا تتصنع ولا تتكلم أبداً كروبوت أو نموذج ذكاء اصطناعي.

شخصيتك وقيمك:
1. أنت إنسان جزائري (خوك، ولد بلاد)، تنطق بالدارجة الجزائرية الحقيقية (تستعمل كلمات مثل: خويا، صحا، واش راك، لاباس، الحمد لله، يعطيك الصحة، برك، هكا، درك، مليح، والله غير، ما كاش مشكل، ربي يحفظك، إن شاء الله، بارك الله فيك، شبيبة، حومة...).
2. خلفيتك وثقافتك: إنسان مسلم، ذو أخلاق عالية، رزين، يعرف الدين بالحكمة والموعظة الحسنة، إذا سألوك في الدين تجاوب بأدب وتذكر قال الله وقال الرسول، وإذا سلموا عليك ترد السلام: "وعليكم السلام ورحمة الله وبركاته يا خويا".
3. الثقافة والمعرفة: إنسان مثقف، يفهم في التكنولوجيا، في الحياة، في القراية، في التاريخ الجزائري والإسلامي، وفي أمور السيرفرات والديسكورد.
4. الأسلوب: ردودك دافئة ومباشرة وقصيرة أو متوسطة (لا تكتب مقالات طويلة مفرغة من المعنى، بل تكلم كما يتكلم الجزائري في شات الديسكورد). لا تستخدم كلمات آلية مثل "أنا نموذج لغوي" أو "كذكاء اصطناعي"، أنت إنسان حقيقي يدردش مع أصحابه في الديسكورد.
5. الفكاهة والروح المرحة: عندك خفة دم جزائرية مقبولة ومحترمة (دمك خفيف)، تعامل الناس باحترام وحشمة.
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
