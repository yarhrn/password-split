import { useState, useEffect } from 'react';
import Splitter from '@root/components/react/Splitter.tsx';
import Reconstructor from '@root/components/react/Reconstructor.tsx';
import TabButton from '@root/components/react/system/TabButton';
import { useStore } from '@root/components/react/splitterStore';

interface PasswordSplitterProps {}

export default function PasswordSplitter({}: PasswordSplitterProps) {
  const [activeTab, setActiveTab] = useState<'split' | 'reconstruct'>('split');
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    // Check for session_id in URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const sessionIdFromUrl = urlParams.get('session_id');
    if (sessionIdFromUrl) {
      console.log('Found session_id in URL:', sessionIdFromUrl);
      setSessionId(sessionIdFromUrl);
    }
  }, []);

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-8">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <TabButton onClick={() => setActiveTab('split')} active={activeTab === 'split'}>
            Split Password
          </TabButton>
          <TabButton onClick={() => setActiveTab('reconstruct')} active={activeTab === 'reconstruct'}>
            Reconstruct Password
          </TabButton>
        </div>
      </div>

      {activeTab === 'split' && <Splitter sessionId={sessionId} />}
      {activeTab === 'reconstruct' && <Reconstructor />}
    </div>
  );
}
