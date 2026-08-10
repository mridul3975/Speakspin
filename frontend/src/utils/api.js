/**
 * API client for SpeakSpin backend services.
 */

export async function analyzeText({ transcript, topic, targetDuration, actualDuration }) {
  try {
    const response = await fetch('/api/analyze-text', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transcript,
        topic,
        targetDuration,
        actualDuration,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Server error occurred during analysis.');
    }

    return await response.json();
  } catch (error) {
    console.error('API Error in analyzeText:', error);
    throw error;
  }
}

export async function transcribeAudio(audioBlob) {
  try {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'speech.wav');

    const response = await fetch('/api/transcribe', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Server error occurred during transcription.');
    }

    return await response.json();
  } catch (error) {
    console.error('API Error in transcribeAudio:', error);
    throw error;
  }
}
