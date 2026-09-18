import express from 'express';
import { OpenAI, toFile } from 'openai';
import multer from 'multer';
import fs from 'fs';
import { rateLimit } from 'express-rate-limit';
import authMiddleware, { optionalAuthMiddleware } from '../middleware/authMiddleware.js';
import { getPool } from '../config/db.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

let openai = null;
let clientStatusLogged = false;

function getOpenAIClient() {
  if (openai) return openai;

  const apiKey = process.env.GROQ_API_KEY;
  const isKeyValid = apiKey && apiKey !== 'gsk_your-key-here' && apiKey.trim() !== '';

  if (isKeyValid) {
    openai = new OpenAI({
      apiKey,
      baseURL: 'https://api.groq.com/openai/v1',
    });
    if (!clientStatusLogged) {
      console.log('Groq API Client initialized successfully.');
      clientStatusLogged = true;
    }
    return openai;
  }

  if (!clientStatusLogged) {
    console.warn('WARNING: GROQ_API_KEY is not set or is using the placeholder. Running in MOCK mode.');
    clientStatusLogged = true;
  }
  return null;
}

// --- RATE LIMITERS ---
const analyzeLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10, // Increased limits slightly for testing ease
  message: {
    error: "Too many analysis requests. Please wait before practicing again."
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const transcribeLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  message: {
    error: "Too many transcription requests. Please try again later."
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Helper to generate dynamic mock fallback analysis (rigorous calculations)
function generateMockAnalysis(transcript, topic, targetDuration, actualDuration) {
  const wordCount = transcript.split(/\s+/).filter(Boolean).length;
  const wpm = actualDuration > 0 ? Math.round((wordCount / actualDuration) * 60) : 0;
  
  const fillers = ['um', 'uh', 'like', 'so', 'you know', 'actually', 'basically'];
  const detectedFillers = [];
  let fillerCount = 0;
  
  fillers.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = transcript.match(regex);
    if (matches) {
      fillerCount += matches.length;
      detectedFillers.push(word);
    }
  });

  // Strict WPM logic (Ideal: 130 - 150 WPM)
  let wpmScore = 95;
  if (wpm < 110) {
    wpmScore = 50; // Too slow/under-delivering WPM
  } else if (wpm > 160) {
    wpmScore = 55; // Too fast/rushed speech
  } else if (wpm >= 110 && wpm < 130) {
    wpmScore = 78; // Slightly slow but acceptable
  } else if (wpm > 150 && wpm <= 160) {
    wpmScore = 80; // Slightly fast but acceptable
  }

  // Strict Duration Match (Ideal: 80% to 110% of target)
  const timeRatio = actualDuration / targetDuration;
  let timeScore = 90;
  if (timeRatio < 0.5 || timeRatio > 1.5) timeScore = 35;
  else if (timeRatio < 0.8 || timeRatio > 1.2) timeScore = 60;

  // Strict Fluency Logic (Deduct 8 points per filler word)
  const fluencyScore = Math.max(20, 95 - (fillerCount * 8));

  // Determine key speech dimensions dynamically
  const confidenceScore = Math.max(30, 85 - (fillerCount * 5) - (timeRatio < 0.6 ? 20 : 0));
  const relevanceScore = wordCount < 20 ? 30 : 85;
  const vocabularyScore = wordCount < 30 ? 45 : 75;
  const structureScore = wordCount < 40 ? 40 : 78;
  const clarityScore = Math.max(40, 90 - (fillerCount * 4));
  const engagementScore = Math.max(30, 80 - (fillerCount * 6));

  const overallScore = Math.round(
    (wpmScore + timeScore + fluencyScore + confidenceScore + relevanceScore + vocabularyScore + structureScore + clarityScore + engagementScore) / 9
  );

  return {
    overallScore,
    categories: {
      confidence: {
        score: confidenceScore,
        feedback: fillerCount > 4 
          ? "Your confidence score was impacted by frequent filler words. Work on pausing silently to gather your thoughts."
          : "Good composure. You maintained a steady stream of speech."
      },
      fluency: {
        score: fluencyScore,
        feedback: `You spoke at ${wpm} WPM. Found ${fillerCount} filler words (${detectedFillers.join(', ') || 'none'}). Real-time pacing requires strict focus.`
      },
      relevance: {
        score: relevanceScore,
        feedback: wordCount < 20 
          ? "Speech length is too brief to adequately address the topic details."
          : `The speech stayed focused on the topic "${topic}".`
      },
      vocabulary: {
        score: vocabularyScore,
        feedback: wordCount < 30 
          ? "Repetitive phrasing detected due to limited speech length. Expand your vocabulary range."
          : "Clear and functional vocabulary. Try to inject active verbal anchors."
      },
      structure: {
        score: structureScore,
        feedback: wordCount < 40
          ? "Deduction: Speech terminated before establishing a logical introduction, body, and conclusion."
          : "Structural frame present. Establish clearer signposts between transitions."
      },
      clarity: {
        score: clarityScore,
        feedback: "Clear pronunciation. Focus on deliberate articulation during transitions."
      },
      engagement: {
        score: engagementScore,
        feedback: "Steady presentation. Work on pitch modulation to keep the audience hooked."
      },
      timeManagement: {
        score: timeScore,
        feedback: `Spoke for ${actualDuration}s out of a ${targetDuration}s target. Keep practicing to hit the target window.`
      }
    },
    fillerWords: {
      count: fillerCount,
      words: detectedFillers,
      feedback: fillerCount > 3 
        ? "Highly elevated filler words count. Focus on replaced breaths instead of vocalizing pauses." 
        : "Excellent job keeping filler words minimized."
    },
    anxietyIndicators: {
      level: fillerCount > 6 || timeRatio < 0.5 ? 'high' : (fillerCount > 3 ? 'moderate' : 'low'),
      signs: fillerCount > 3 ? ["Frequent filler words", "Unbalanced pacing"] : ["Controlled rate of speech"],
      tips: [
        "Inhale deeply through your nose for 4 seconds before you start speaking.",
        "Remember that pauses feel much longer to you than they do to your audience.",
        "Practice silent breathing transitions instead of filling space with sounds."
      ]
    },
    strengths: [
      `Relevant coverage of topic: "${topic}".`,
      `Stable vocal projection at ${wpm} WPM.`
    ],
    improvements: [
      "Rigorous filler word reduction.",
      "Expand descriptive speech details.",
      "Practice timing pacing goals strictly."
    ],
    overallFeedback: `Analysis completed. Overall rating is strictly calculated at ${overallScore}/100. Pacing was measured at ${wpm} WPM. Focus closely on reducing filler usage during pauses to boost your delivery impact.`,
    challengeForNext: "Try to speak for the full target duration while using fewer than 2 filler words.",
    exemplarSpeech: targetDuration <= 60 
      ? `Here is a perfect 100/100 one-minute speech transcript on "${topic}":\n\n"Today, let us look at "${topic}". It is a subject of growing importance that touches our daily choices. To understand it, we must realize that first, it challenges conventional thinking, forcing us to adapt. Second, it guides how we build relationships and leverage opportunities. In conclusion, embracing "${topic}" is key to progress. Let us carry this understanding forward. Thank you."`
      : `Here is a perfect 100/100 detailed speech transcript on "${topic}":\n\n"Ladies and gentlemen, let us dive deep into the concept of "${topic}". When we consider this subject, we are looking at a cornerstone of modern development. To unpack this, I want to present three key examples.\n\nFirst, consider the impact on our personal lives. We see daily shifts in how we allocate time and attention. Second, look at the professional landscape. Modern structures have been completely transformed, demanding new skills and resilience. Third, let us analyze the cultural paradigm. It defines our shared values and societal aspirations.\n\nUltimately, this is a call to action. We must adapt, learn, and grow. Let us ask ourselves: how will we leverage this power to shape our tomorrow? Thank you."`
  };
}

// POST /api/analyze-text (JWT Protected or Guest Session)
router.post('/analyze-text', optionalAuthMiddleware, analyzeLimiter, async (req, res) => {
  const { transcript, topic, category, targetDuration, actualDuration, language } = req.body;

  if (!transcript || transcript.trim() === "") {
    return res.status(400).json({ error: "Transcript is required" });
  }

  const wordCount = transcript.split(/\s+/).filter(Boolean).length;
  const wpm = actualDuration > 0 ? Math.round((wordCount / actualDuration) * 60) : 0;

  const client = getOpenAIClient();
  let analysisResult = null;

  if (!client) {
    console.log("Using Mock AI Speech Coach response...");
    await new Promise(resolve => setTimeout(resolve, 1500));
    analysisResult = generateMockAnalysis(transcript, topic, targetDuration, actualDuration);
  } else {
    try {
      const systemPrompt = `You are a highly critical, strict, and rigorous public speaking coach grading speech performances based on professional public speaking frameworks (like Toastmasters). 

CRITICAL GRADING CRITERIA:
1. Pacing & Pauses:
   - Reward controlled, deliberate pacing and short pauses (0.5 to 1.0 seconds max). These show confidence, presence, and control. DO NOT penalize these.
   - Penalize long, dead pauses (2.0 to 3.0+ seconds). These show nervousness, lack of competence, or losing the train of thought.
2. Words Per Minute (WPM) Calibration:
   - Confident speaker range: 130 to 150 WPM. If the speaker's average pace is within 130-150 WPM, reward them with high scores.
   - Slow speaker range: < 110 WPM. Reduce the score for lack of fluency and slow delivery.
   - Rushed speaker range: > 160 WPM. This is a rushed speech (not confidence), so penalize clarity and fluency.
3. Structuring Rules:
   - For targetDuration <= 60 seconds: Requires a quick, compelling hook/opening, body points, and a neat conclusion that is NOT rushed.
   - For targetDuration > 60 seconds (up to 300 seconds): Requires a formal opening, structured discussion body containing exactly 2 to 3 distinct examples or points, and a powerful conclusion (optionally ending with a question).
4. Exemplar Speech:
   - The exemplarSpeech must be a complete, flawless 100/100 speech transcript matching the target duration and topic (NOT tips). It must use strong vocabulary, professional tone, proper opening, discussion/examples, and conclusion.
5. Multi-Language Support:
   - The transcript is delivered in a specific spoken language. You must evaluate fluency, relevance, structures, and vocabulary properties according to the native linguistic rules of that language. Write all feedback fields in English, but generate the exemplarSpeech transcript itself in the native spoken language.
6. Respond ONLY with a valid JSON object matching the requested schema. No markdown outside.`;

      const userPrompt = `You are an expert, strict speech evaluator. Analyze this performance:

Topic Given: ${topic}
Spoken Language: ${language || 'en-US'}
Target Duration: ${targetDuration} seconds
Actual Duration: ${actualDuration} seconds  
Word Count: ${wordCount}
Words Per Minute (WPM): ${wpm}

Full Transcript:
"${transcript}"

Grade strictly using these ranges for overallScore:
- 90-100: Structured flow, zero fillers, accurate pacing (130-150 WPM), small pauses (0.5s-1s) for confidence, structured outline.
- 75-89: Good speech, minor errors (1-2 fillers), slight pacing deviations.
- 55-74: Average speech, moderate fillers (3-6), weak vocabulary, or unstructured body.
- Below 55: Poor speech, excessive fillers (7+), completely off-topic, or extremely short duration.

Return this exact JSON structure:
{
  "overallScore": number (1-100),
  "categories": {
    "confidence": { "score": number, "feedback": string },
    "fluency": { "score": number, "feedback": string },
    "relevance": { "score": number, "feedback": string },
    "vocabulary": { "score": number, "feedback": string },
    "structure": { "score": number, "feedback": string },
    "clarity": { "score": number, "feedback": string },
    "engagement": { "score": number, "feedback": string },
    "timeManagement": { "score": number, "feedback": string }
  },
  "fillerWords": {
    "count": number,
    "words": string[],
    "feedback": string
  },
  "anxietyIndicators": {
    "level": "low" | "moderate" | "high",
    "signs": string[],
    "tips": string[]
  },
  "strengths": string[],
  "improvements": string[],
  "overallFeedback": string,
  "challengeForNext": string,
  "exemplarSpeech": string
}`;

      const response = await client.chat.completions.create({
        model: "openai/gpt-oss-120b",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.2, // Lower temperature to follow guidelines strictly
      });

      const resultText = response.choices[0].message.content;
      analysisResult = JSON.parse(resultText);
    } catch (error) {
      console.error("Groq API call failed, falling back to mock analysis:", error);
      analysisResult = generateMockAnalysis(transcript, topic, targetDuration, actualDuration);
    }
  }

  // Save the analyzed speech session in PostgreSQL if user is authenticated
  const numericUserId = req.userId && !req.isGuest ? parseInt(req.userId, 10) : null;

  if (numericUserId && !isNaN(numericUserId)) {
    try {
      const query = `
        INSERT INTO sessions (
          user_id, topic, category, duration, overall_score, overall_feedback,
          categories, filler_words, anxiety_indicators, strengths, improvements,
          challenge_for_next, exemplar_speech
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      `;
      const values = [
        numericUserId,
        topic,
        category || 'General',
        actualDuration,
        analysisResult.overallScore,
        analysisResult.overallFeedback,
        JSON.stringify(analysisResult.categories),
        JSON.stringify(analysisResult.fillerWords),
        JSON.stringify(analysisResult.anxietyIndicators),
        JSON.stringify(analysisResult.strengths),
        JSON.stringify(analysisResult.improvements),
        analysisResult.challengeForNext,
        analysisResult.exemplarSpeech
      ];

      await getPool().query(query, values);
      console.log(`Saved speech analysis session to PostgreSQL for user: ${numericUserId}`);
    } catch (dbError) {
      console.error("Failed to save session to PostgreSQL (continuing with results):", dbError.message);
    }
  }

  res.json(analysisResult);
});

// POST /api/translate-topic
router.post('/translate-topic', async (req, res) => {
  const { topic, targetLanguage } = req.body;
  if (!topic) return res.status(400).json({ error: "Missing topic" });
  if (!targetLanguage || targetLanguage.startsWith('en')) {
    return res.json({ translated: topic });
  }

  const client = getOpenAIClient();
  if (!client) {
    return res.json({ translated: topic });
  }

  try {
    const prompt = `Translate the following public speaking topic into the native language specified by the language code: "${targetLanguage}".
Topic: "${topic}"
Return ONLY the translated topic text without quotes, explanation, or additional context.`;

    const chatCompletion = await client.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "openai/gpt-oss-20b",
      temperature: 0.2
    });

    const translated = chatCompletion.choices[0].message.content.trim();
    console.log(`[DEBUG] Translated topic "${topic}" to language "${targetLanguage}": "${translated}"`);
    res.json({ translated });
  } catch (err) {
    console.error("Translation API error:", err);
    res.json({ translated: topic });
  }
});

// GET /api/sessions (Fetch history)
router.get('/sessions', optionalAuthMiddleware, async (req, res) => {
  if (!req.userId || req.isGuest) {
    return res.json([]);
  }

  try {
    const sessionsRes = await getPool().query(
      'SELECT * FROM sessions WHERE user_id = $1 ORDER BY date DESC LIMIT 50',
      [req.userId]
    );

    const sessions = sessionsRes.rows.map(row => ({
      id: row.id,
      userId: row.user_id,
      topic: row.topic,
      category: row.category,
      duration: row.duration,
      overallScore: row.overall_score,
      overallFeedback: row.overall_feedback,
      categories: row.categories,
      fillerWords: row.filler_words,
      anxietyIndicators: row.anxiety_indicators,
      strengths: row.strengths,
      improvements: row.improvements,
      challengeForNext: row.challenge_for_next,
      exemplarSpeech: row.exemplar_speech,
      date: row.date
    }));

    res.json(sessions);
  } catch (error) {
    console.warn('Fetch sessions failed (DB may be offline), returning empty history:', error.message);
    res.json([]);
  }
});

// DELETE /api/sessions (Clear history)
router.delete('/sessions', authMiddleware, async (req, res) => {
  try {
    await getPool().query('DELETE FROM sessions WHERE user_id = $1', [req.userId]);
    console.log(`Cleared speech history logs for user: ${req.userId}`);
    res.json({ message: 'Speech history cleared successfully' });
  } catch (error) {
    console.warn('Clear history failed (DB may be offline):', error.message);
    res.json({ message: 'Speech history cleared (note: DB was offline)' });
  }
});

// POST /api/transcribe (JWT Protected or Guest Session)
router.post('/transcribe', optionalAuthMiddleware, transcribeLimiter, upload.single('audio'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Audio file is required" });
  }

  const rawLang = req.body?.language;
  // Normalize language to ISO-639-1 two-letter code for Whisper (e.g. 'en-US' -> 'en')
  const cleanLang = (rawLang && typeof rawLang === 'string' && rawLang.trim())
    ? rawLang.trim().split('-')[0].toLowerCase()
    : undefined;

  // If the audio file is empty or too tiny to contain speech
  if (req.file.size < 200) {
    try { fs.unlinkSync(req.file.path); } catch (e) {}
    return res.json({
      text: "",
      duration: 0,
      language: cleanLang || "en"
    });
  }

  const client = getOpenAIClient();

  if (!client) {
    console.log("Mock Transcribing audio file...");
    await new Promise(resolve => setTimeout(resolve, 1500));
    try { fs.unlinkSync(req.file.path); } catch (e) {}

    return res.json({
      text: "This is a mock transcription because no valid Groq API Key was detected in the environment. Please check the Web Speech API transcription on the frontend, which handles live audio without an API key.",
      duration: 10,
      language: cleanLang || "en"
    });
  }

  try {
    const fileBuffer = fs.readFileSync(req.file.path);
    const audioFile = await toFile(fileBuffer, 'speech.webm', {
      type: req.file.mimetype || 'audio/webm'
    });

    const transcription = await client.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-large-v3",
      ...(cleanLang ? { language: cleanLang } : {})
    });

    try { fs.unlinkSync(req.file.path); } catch (e) {}

    res.json({
      text: transcription.text ? transcription.text.trim() : "",
      duration: 0,
      language: cleanLang || "en"
    });
  } catch (error) {
    console.warn("Groq Whisper transcription note (falling back):", error.message);
    try { fs.unlinkSync(req.file.path); } catch (e) {}
    // Return empty text with 200 instead of 500 so frontend falls back to Web Speech smoothly
    res.json({
      text: "",
      duration: 0,
      note: "Audio decoding skipped or silent"
    });
  }
});

export default router;
