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

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptWithUser,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.85,
        topP: 0.95,
      },
    });

    const reply = response.text?.trim();
    if (!reply) {
      return `صحا خويا ${userName}، ما فهمتش مليح ولا كان فما انقطاع خفيف، عاودلي برك واش قلتلي ربي يبارك فيك!`;
    }

    return reply;
  } catch (error: any) {
    console.error('[Gemini AI Error]', error);
    return `يا خويا ${userName}، صار مشكل تقني خفيف في الاتصال بالذكاء الاصطناعي (${error.message || 'خطأ'}). دقيقة وعاودلي يا الغالي!`;
  }
}
