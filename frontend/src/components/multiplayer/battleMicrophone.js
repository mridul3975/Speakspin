let preparedStream = null;
let generation = 0;
let acquisition = null;
export async function prepareBattleMicrophone() {
  if (preparedStream?.getAudioTracks().some(track => track.readyState === 'live')) return preparedStream;
  if (!navigator.mediaDevices?.getUserMedia) throw new Error('Microphone recording is not available in this browser. Try a current browser on a secure connection.');
  if (acquisition) return acquisition;
  const requestedGeneration = generation;
  const request = navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
    if (generation !== requestedGeneration) {
      stream.getTracks().forEach(track => track.stop());
      throw new DOMException('Microphone check was cancelled.', 'AbortError');
    }
    preparedStream = stream;
    return stream;
  }).finally(() => { if (acquisition === request) acquisition = null; });
  acquisition = request;
  return request;
}
export function takeBattleMicrophone() {
  const stream = preparedStream; preparedStream = null;
  return stream?.getAudioTracks().some(track => track.readyState === 'live') ? stream : null;
}
export function releaseBattleMicrophone() {
  generation += 1;
  acquisition = null;
  preparedStream?.getTracks().forEach(track => track.stop()); preparedStream = null;
}
