import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  topic: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  overallScore: {
    type: Number,
    required: true
  },
  overallFeedback: {
    type: String,
    required: true
  },
  categories: {
    type: Map,
    of: new mongoose.Schema({
      score: Number,
      feedback: String
    }, { _id: false })
  },
  fillerWords: {
    count: { type: Number, default: 0 },
    words: [String],
    feedback: String
  },
  anxietyIndicators: {
    level: { type: String, enum: ['low', 'moderate', 'high'], default: 'low' },
    signs: [String],
    tips: [String]
  },
  strengths: [String],
  improvements: [String],
  challengeForNext: String,
  exemplarSpeech: String,
  date: {
    type: Date,
    default: Date.now
  }
});

const Session = mongoose.model('Session', sessionSchema);
export default Session;
