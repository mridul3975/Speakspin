import React, { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { GameButton, LoadingState, StatusNotice } from './game/GameUI';

export function AnalyzingScreen({ onCancel }) {
  const [isSlow, setIsSlow] = useState(false);
  useEffect(() => {
    const timeout = setTimeout(() => setIsSlow(true), 20000);
    return () => clearTimeout(timeout);
  }, []);
  return <div className="screen-stack judging-screen">
    <LoadingState title="Your round is with the judge." description="We’re reviewing your words, structure, and timing. Your feedback will appear here when it’s ready.">
      <div className="judging-submission">Speech submitted</div>
    </LoadingState>
    {isSlow && <StatusNotice>This is taking longer than usual. You can keep waiting{onCancel ? ' or return to your transcript.' : '.'}</StatusNotice>}
    {onCancel && <GameButton variant="ghost" onClick={onCancel}><ArrowLeft size={17} />Back to transcript</GameButton>}
  </div>;
}

export default AnalyzingScreen;
