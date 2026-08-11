/**
 * API client for SpeakSpin backend services.
 */

// Dynamically use Render backend URL in production, or fallback to local proxy in dev
const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

let authToken = null;

/**
 * Configure the global JWT bearer token for all subsequent requests.
 */
export function setAuthToken(token) {
  authToken = token;
}

/**
 * Helper to build authorization headers dynamically.
 */
function getHeaders(extraHeaders = {}) {
  const headers = {};
  
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  
  return {
    ...headers,
    ...extraHeaders
  };
}

/* --- AUTHENTICATION API --- */

export async function loginWithGoogle(credential) {
  try {
    const response = await fetch(`${API_BASE}/api/auth/google`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ credential }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Authentication with Google failed.');
    }

    const data = await response.json();
    setAuthToken(data.token);
    return data;
  } catch (error) {
    console.error('API Error in loginWithGoogle:', error);
    throw error;
  }
}

export async function fetchCurrentUser() {
  try {
    const response = await fetch(`${API_BASE}/api/auth/me`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to fetch current user profile.');
    }

    return await response.json();
  } catch (error) {
    console.error('API Error in fetchCurrentUser:', error);
    throw error;
  }
}

/* --- SPEECH ANALYSIS API --- */

export async function analyzeText({ transcript, topic, category, targetDuration, actualDuration }) {
  try {
    const response = await fetch(`${API_BASE}/api/analyze-text`, {
      method: 'POST',
      headers: getHeaders({
        'Content-Type': 'application/json',
      }),
      body: JSON.stringify({
        transcript,
        topic,
        category,
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

/* --- AUDIO TRANSCRIPTION API --- */

export async function transcribeAudio(audioBlob) {
  try {
    const formData = new FormData();
    const mimeType = audioBlob.type || 'audio/webm';
    const extension = mimeType.includes('mp4') ? 'mp4' : (mimeType.includes('ogg') ? 'ogg' : 'webm');
    formData.append('audio', audioBlob, `speech.${extension}`);

    const response = await fetch(`${API_BASE}/api/transcribe`, {
      method: 'POST',
      headers: getHeaders(),
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

/* --- HISTORY API --- */

export async function fetchHistory() {
  try {
    const response = await fetch(`${API_BASE}/api/sessions`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to retrieve speech history.');
    }

    return await response.json();
  } catch (error) {
    console.error('API Error in fetchHistory:', error);
    throw error;
  }
}

export async function clearHistoryDB() {
  try {
    const response = await fetch(`${API_BASE}/api/sessions`, {
      method: 'DELETE',
      headers: getHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to clear speech history.');
    }

    return await response.json();
  } catch (error) {
    console.error('API Error in clearHistoryDB:', error);
    throw error;
  }
}
