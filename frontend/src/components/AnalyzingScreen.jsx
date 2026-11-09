import React, { useEffect, useState } from 'react';
import { ArrowLeft, Check, Mic } from 'lucide-react';
import { GameButton, LoadingState, StatusNotice } from './game/GameUI';

export function AnalyzingScreen({ onCancel }) {
  const [isSlow, setIsSlow] = useState(false);
  useEffect(() => {
    const timeout = setTimeout(() => setIsSlow(true), 20000);
    return () => clearTimeout(timeout);
  }, []);
  return <div className="screen-stack judging-screen solo-scene">
    <div className="solo-judging-mark" aria-hidden="true"><Mic size={36} /><span><Check size={15} /></span></div>
    <LoadingState title="Let’s hear how you did." description="We’re reviewing your words, structure, and timing. Your feedback will appear here when it’s ready.">
      <div className="judging-submission"><Check size={16} />Speech submitted</div>
    </LoadingState>
    {isSlow && <StatusNotice>This is taking longer than usual. You can keep waiting{onCancel ? ' or return to your transcript.' : '.'}</StatusNotice>}
    {onCancel && <GameButton variant="ghost" onClick={onCancel}><ArrowLeft size={17} />Back to transcript</GameButton>}
  </div>;
}

export default AnalyzingScreen;
