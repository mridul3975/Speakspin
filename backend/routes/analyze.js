import express from 'express';
import { OpenAI, toFile } from 'openai';
import multer from 'multer';
import fs from 'fs';
import { rateLimit } from 'express-rate-limit';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Defer OpenAI client initialization to run lazily when a request is handled
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
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5, 
  message: {
    error: "Too many analysis requests from this IP. Please wait 10 minutes before practicing again to protect server resources."
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const transcribeLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5,
  message: {
    error: "Too many transcription requests from this IP. Please try again in 10 minutes."
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Helper to generate mock fallback analysis based on transcript keywords
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

  const wpmScore = wpm >= 110 && wpm <= 150 ? 95 : (wpm < 80 ? 60 : 80);
  const timeRatio = actualDuration / targetDuration;
  const timeScore = timeRatio >= 0.8 && timeRatio <= 1.2 ? 95 : (timeRatio < 0.5 ? 50 : 75);
  const fillerPenalty = Math.max(0, fillerCount * 3);
  const fluencyScore = Math.max(40, 95 - fillerPenalty);
  
  const overallScore = Math.round((wpmScore + timeScore + fluencyScore + 85 + 80 + 75 + 78 + 80) / 8);

  return {
    overallScore,
    categories: {
      confidence: {
        score: Math.min(100, Math.max(50, 80 + Math.round(Math.random() * 10))),
        feedback: "Your tone was relatively stable, but adding more vocal variety and pausing deliberately instead of using fillers would boost your perceived confidence."
      },
      fluency: {
        score: fluencyScore,
        feedback: `You spoke with an average rate of ${wpm} WPM. Found ${fillerCount} filler words (${detectedFillers.join(', ') || 'none'}). Try to practice silent pauses to bridge transitions.`
      },
      relevance: {
        score: 85,
        feedback: `The content directly addressed the topic "${topic}". You maintained a steady focus throughout your presentation.`
      },
      vocabulary: {
        score: 75,
        feedback: "Your vocabulary was clear and accessible. Try incorporating more vivid descriptive adjectives and active verbs to enrich the delivery."
      },
      structure: {
        score: 80,
        feedback: "You had a noticeable beginning and concluding thought, though structuring with a clear 'Rule of Three' in the body would improve overall flow."
      },
      clarity: {
        score: 85,
        feedback: "Pronunciation was clear, and words were easily understandable throughout the session."
      },
      engagement: {
        score: 78,
        feedback: "Your phrasing kept the main points interesting. Modulating your pitch and speed on key ideas could hook the listener even further."
      },
      timeManagement: {
        score: timeScore,
        feedback: `Spoke for ${actualDuration}s out of the ${targetDuration}s target. This represents a good effort in hitting your duration target.`
      }
    },
    fillerWords: {
      count: fillerCount,
      words: detectedFillers,
      feedback: fillerCount > 3 
        ? "Filler word count is slightly elevated. Try slowing down your pace by 5% and replacing fillers with silent breathing room." 
        : "Excellent job keeping filler words to a minimum!"
    },
    anxietyIndicators: {
      level: fillerCount > 5 || timeRatio < 0.6 ? 'moderate' : 'low',
      signs: fillerCount > 5 ? ["Frequent filler words", "Slightly rushed pacing"] : ["Consistent rate of speech"],
      tips: [
        "Inhale deeply through your nose for 4 seconds before you start speaking.",
        "Remember that pauses feel much longer to you than they do to your audience.",
        "Anchor your feet firmly and use hand gestures to ground your nervous energy."
      ]
    },
    strengths: [
      `Stayed closely aligned with the topic: "${topic}".`,
      `Good vocal clarity with a pacing of ${wpm} words per minute.`,
      "Clear articulation of the main thesis statement early in the speech."
    ],
    improvements: [
      "Reduce reliance on filler words during transitions.",
      "Work on structuring the body points with explicit verbal signposts (firstly, secondly).",
      "Practice using deliberate silence instead of vocalized pauses to let points land."
    ],
    overallFeedback: `You did a great job speaking about "${topic}" for ${actualDuration} seconds! Your speech was coherent and relevant, maintaining an average speed of ${wpm} WPM. Focusing on minimizing fillers and incorporating structural signposts will make your next speech even more impactful.`,
    challengeForNext: "Try to speak for the full target duration while using fewer than 2 filler words.",
    exemplarSpeech: `Here is a perfect 100/100 exemplar speech on "${topic}":\n\n"When we consider the question of "${topic}", we are forced to weigh both its challenges and its possibilities. Historically, our choices have shaped our culture. In the modern era, there are three primary pillars we must emphasize. Firstly, clear communication bridges the gap of misunderstanding. Secondly, consistency of action develops trust in our methods. Finally, a collective vision ensures we progress together. In conclusion, by balancing our immediate goals with our long-term values, we build a legacy of success. Thank you."`
  };
}

// POST /api/analyze-text with rate limiter
router.post('/analyze-text', analyzeLimiter, async (req, res) => {
  const { transcript, topic, targetDuration, actualDuration } = req.body;

  if (!transcript || transcript.trim() === "") {
    return res.status(400).json({ error: "Transcript is required" });
  }

  const wordCount = transcript.split(/\s+/).filter(Boolean).length;
  const wpm = actualDuration > 0 ? Math.round((wordCount / actualDuration) * 60) : 0;

  const client = getOpenAIClient();

  if (!client) {
    console.log("Using Mock AI Speech Coach response...");
    await new Promise(resolve => setTimeout(resolve, 1500));
    const analysis = generateMockAnalysis(transcript, topic, targetDuration, actualDuration);
    return res.json(analysis);
  }

  try {
    const systemPrompt = `You are a supportive but honest speech coach. Always be encouraging while giving constructive, specific feedback. Respond ONLY with valid JSON, no markdown, no explanation.`;

    const userPrompt = `You are an expert speech coach. Analyze this speech performance.

Topic Given: ${topic}
Target Duration: ${targetDuration} seconds
Actual Duration: ${actualDuration} seconds  
Word Count: ${wordCount}
Words Per Minute: ${wpm}

Full Transcript:
${transcript}

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
      temperature: 0.7,
    });

    const resultText = response.choices[0].message.content;
    const analysisResult = JSON.parse(resultText);
    res.json(analysisResult);
  } catch (error) {
    console.error("Groq API call failed, falling back to mock analysis:", error);
    const fallback = generateMockAnalysis(transcript, topic, targetDuration, actualDuration);
    res.json(fallback);
  }
});

// POST /api/transcribe with rate limiter
router.post('/transcribe', transcribeLimiter, upload.single('audio'), async (req, res) => {
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

  const tempFilePath = `${req.file.path}.webm`;
  
  try {
    fs.renameSync(req.file.path, tempFilePath);

    const audioFile = await toFile(fs.createReadStream(tempFilePath), 'speech.webm', { type: 'audio/webm' });

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
