import React, { useEffect, useState } from 'react';
import TranscriptViewer from '../components/TranscriptViewer';

interface TranscriptData {
  [key: string]: {
    en: string;
    es: string;
  };
}

const TranscriptPage: React.FC = () => {
  const [transcriptData, setTranscriptData] = useState<TranscriptData>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load transcript data from a podcast file
    fetch('/podcasts/Park%20Predators/The_Angler-formatted.json')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        // Remove the original_file field and convert the data to the expected format
        const { original_file, ...transcript } = data;
        
        // Add a new slide at the beginning with podcast and episode information
        const updatedTranscript: TranscriptData = {
          id0: {
            en: "Park Predators: The Angler",
            es: "Park Predators: El Pescador"
          },
          ...transcript
        };
        
        setTranscriptData(updatedTranscript);
      })
      .catch(error => {
        console.error('Error loading transcript:', error);
        setError(`Failed to load transcript: ${error.message}`);
      });
  }, []);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <TranscriptViewer data={transcriptData} />
    </div>
  );
};

export default TranscriptPage; 