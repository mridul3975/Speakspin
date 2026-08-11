import express from 'express';
import { OpenAI, toFile } from 'openai';
import multer from 'multer';
import fs from 'fs';
import { rateLimit } from 'express-rate-limit';
import authMiddleware from '../middleware/authMiddleware.js';
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

  // Strict WPM logic (Ideal: 110 - 140 WPM)
  let wpmScore = 90;
  if (wpm < 80 || wpm > 170) wpmScore = 40;
  else if (wpm < 100 || wpm > 150) wpmScore = 65;

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
    exemplarSpeech: `Here is a structured exemplar speech on "${topic}":\n\n"When we analyze the topic of "${topic}", we must evaluate its core dimensions. In public speaking, clarity is paramount. Firstly, establishing a strong hook captures audience focus. Secondly, backing assertions with precise facts builds credibility. Lastly, summarizing key takeaways reinforces memory. In conclusion, by structuring our points and managing pacing, we achieve highly effective communication. Thank you."`
  };
}

// POST /api/analyze-text (JWT Protected)
router.post('/analyze-text', authMiddleware, analyzeLimiter, async (req, res) => {
  const { transcript, topic, category, targetDuration, actualDuration } = req.body;

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
      const systemPrompt = `You are a highly critical, strict, and rigorous public speaking coach. You grade speech performances based on professional, standard public speaking frameworks (like Toastmasters). 
DO NOT inflate scores. Be extremely strict. Use the full 1-100 score range.
An average speech should get 60-70. If a speech has poor pacing (outside 110-150 WPM), excessive filler words, off-topic details, or is too short, grade it strictly below 50.
Respond ONLY with a valid JSON object matching the requested schema. Do not write markdown blocks or explanation text outside the JSON.`;

      const userPrompt = `You are an expert, strict speech evaluator. Analyze this performance:

Topic Given: ${topic}
Target Duration: ${targetDuration} seconds
Actual Duration: ${actualDuration} seconds  
Word Count: ${wordCount}
Words Per Minute (WPM): ${wpm}

Full Transcript:
"${transcript}"

Grade strictly using these ranges for overallScore:
- 90-100: Flawless professional execution, structured flow, zero fillers, accurate pacing (120-140 WPM).
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
        model: "llama-3.3-70b-versatile",
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

  // Save the analyzed speech session directly in PostgreSQL
  try {
    const query = `
      INSERT INTO sessions (
        user_id, topic, category, duration, overall_score, overall_feedback,
        categories, filler_words, anxiety_indicators, strengths, improvements,
        challenge_for_next, exemplar_speech
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    `;
    const values = [
      req.userId,
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
    console.log(`Saved speech analysis session to PostgreSQL for user: ${req.userId}`);
    res.json(analysisResult);
  } catch (dbError) {
    console.error("Failed to save session to PostgreSQL:", dbError);
    res.json(analysisResult);
  }
});

// GET /api/sessions (Fetch history)
router.get('/sessions', authMiddleware, async (req, res) => {
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
    console.error('Fetch sessions failed:', error);
    res.status(500).json({ error: 'Failed to retrieve speech history' });
  }
});

// DELETE /api/sessions (Clear history)
router.delete('/sessions', authMiddleware, async (req, res) => {
  try {
    await getPool().query('DELETE FROM sessions WHERE user_id = $1', [req.userId]);
    console.log(`Cleared speech history logs for user: ${req.userId}`);
    res.json({ message: 'Speech history cleared successfully' });
  } catch (error) {
    console.error('Clear history failed:', error);
    res.status(500).json({ error: 'Failed to clear speech history' });
  }
});

// POST /api/transcribe
router.post('/transcribe', authMiddleware, transcribeLimiter, upload.single('audio'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Audio file is required" });
  }

  const client = getOpenAIClient();

  if (!client) {
    console.log("Mock Transcribing audio file...");
    await new Promise(resolve => setTimeout(resolve, 1500));
    try { fs.unlinkSync(req.file.path); } catch (e) {}

    return res.json({
      text: "This is a mock transcription because no valid Groq API Key was detected in the environment. Please check the Web Speech API transcription on the frontend, which handles live audio without an API key.",
      duration: 10,
      language: "en"
    });
  }

  const mimeType = req.file.mimetype || 'audio/webm';
  const extension = mimeType.includes('mp4') ? 'mp4' : (mimeType.includes('ogg') ? 'ogg' : 'webm');
  const tempFilePath = `${req.file.path}.${extension}`;
  
  try {
    fs.renameSync(req.file.path, tempFilePath);

    const audioFile = await toFile(fs.createReadStream(tempFilePath), `speech.${extension}`, { type: mimeType });

    const transcription = await client.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-large-v3",
    });

    try { fs.unlinkSync(tempFilePath); } catch (e) {}

    res.json({
      text: transcription.text,
      duration: 0,
      language: "en"
    });
  } catch (error) {
    console.error("Groq Whisper transcription failed:", error);
    try { fs.unlinkSync(tempFilePath); } catch (e) {}
    try { fs.unlinkSync(req.file.path); } catch (e) {}
    res.status(500).json({ error: "Transcription failed" });
  }
});

export default router;
