import React, { useState, useEffect, useRef } from 'react';
import TranscriptCard from './TranscriptCard';

interface TranscriptData {
  [key: string]: {
    en: string;
    es: string;
  };
}

interface TranscriptViewerProps {
  data: TranscriptData;
}

const TranscriptViewer: React.FC<TranscriptViewerProps> = ({ data }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const englishAudioRef = useRef<HTMLAudioElement | null>(null);
  const spanishAudioRef = useRef<HTMLAudioElement | null>(null);

  // Get all transcript entries
  const transcriptEntries = Object.entries(data);
  
  // Get current transcript entry or return null if no data
  const currentEntry = transcriptEntries[currentIndex] || null;
  const currentData = currentEntry ? data[currentEntry[0]] : null;

  // Calculate progress percentage
  const progressPercentage = transcriptEntries.length > 0 
    ? ((currentIndex + 1) / transcriptEntries.length) * 100 
    : 0;

  // Function to play audio
  const playAudio = () => {
    console.log('Attempting to play audio...');
    if (englishAudioRef.current && spanishAudioRef.current) {
      console.log('Audio elements found, playing English first...');
      console.log('Current English audio source:', englishAudioRef.current.src);
      console.log('Current Spanish audio source:', spanishAudioRef.current.src);
      console.log('Audio elements ready state:', {
        english: englishAudioRef.current.readyState,
        spanish: spanishAudioRef.current.readyState
      });
      
      setIsPlaying(true);
      englishAudioRef.current.play().catch(error => {
        console.error('Error playing English audio:', error);
        console.error('Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
        setIsPlaying(false);
      });
    } else {
      console.error('Audio elements not found', {
        englishRef: englishAudioRef.current,
        spanishRef: spanishAudioRef.current
      });
    }
  };

  // Handle audio ended
  const handleAudioEnded = (event: React.SyntheticEvent<HTMLAudioElement, Event>) => {
    const audioElement = event.currentTarget;
    console.log('Audio ended event:', {
      element: audioElement === englishAudioRef.current ? 'English' : 'Spanish',
      currentTime: audioElement.currentTime,
      duration: audioElement.duration
    });
    
    if (audioElement === englishAudioRef.current) {
      console.log('English audio ended, playing Spanish...');
      spanishAudioRef.current?.play().catch(error => {
        console.error('Error playing Spanish audio:', error);
        console.error('Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
        setIsPlaying(false);
      });
    } else if (audioElement === spanishAudioRef.current) {
      console.log('Spanish audio ended');
      setIsPlaying(false);
    }
  };

  // Update audio sources when index changes
  useEffect(() => {
    if (englishAudioRef.current && spanishAudioRef.current) {
      const nextId = currentIndex + 1;
      const englishSrc = `/podcasts/Park%20Predators/audio/The_Angler-formatted-id${nextId}-en.mp3`;
      const spanishSrc = `/podcasts/Park%20Predators/audio/The_Angler-formatted-id${nextId}-es.mp3`;
      
      console.log(`Updating audio sources for slide ${nextId}:`);
      console.log(`English: ${englishSrc}`);
      console.log(`Spanish: ${spanishSrc}`);
      
      // Reset isPlaying state when changing audio sources
      setIsPlaying(false);
      
      englishAudioRef.current.src = englishSrc;
      spanishAudioRef.current.src = spanishSrc;
      
      // Add error handlers for audio loading
      englishAudioRef.current.onerror = (e) => {
        console.error('Error loading English audio:', e);
        console.error('Error details:', {
          error: englishAudioRef.current?.error,
          networkState: englishAudioRef.current?.networkState
        });
      };
      spanishAudioRef.current.onerror = (e) => {
        console.error('Error loading Spanish audio:', e);
        console.error('Error details:', {
          error: spanishAudioRef.current?.error,
          networkState: spanishAudioRef.current?.networkState
        });
      };
      
      // Add load handlers for audio loading
      englishAudioRef.current.oncanplaythrough = () => {
        console.log('English audio loaded and ready to play', {
          readyState: englishAudioRef.current?.readyState,
          networkState: englishAudioRef.current?.networkState
        });
      };
      spanishAudioRef.current.oncanplaythrough = () => {
        console.log('Spanish audio loaded and ready to play', {
          readyState: spanishAudioRef.current?.readyState,
          networkState: spanishAudioRef.current?.networkState
        });
      };
    }
  }, [currentIndex]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
        setCurrentIndex(prevIndex => 
          prevIndex < transcriptEntries.length - 1 ? prevIndex + 1 : prevIndex
        );
      } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
        setCurrentIndex(prevIndex => 
          prevIndex > 0 ? prevIndex - 1 : prevIndex
        );
      } else if (event.key === 'Escape') {
        setCurrentIndex(0);
      } else if (event.key === 'Enter' && !isPlaying) {
        console.log('Enter key pressed, isPlaying:', isPlaying);
        playAudio();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [transcriptEntries.length, isPlaying]);

  // Don't render anything if there's no data
  if (!currentData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Loading transcript data...</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-white">
      <TranscriptCard
        id={currentEntry[0]}
        english={currentData.en}
        spanish={currentData.es}
        isVisible={isVisible}
      />
      <div className="progress-bar-container">
        <div 
          className="progress-bar" 
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
      <div className="progress-text">
        {currentIndex + 1} / {transcriptEntries.length}
      </div>
      {/* Hidden audio elements */}
      <audio
        ref={englishAudioRef}
        onEnded={handleAudioEnded}
        preload="auto"
      />
      <audio
        ref={spanishAudioRef}
        onEnded={handleAudioEnded}
        preload="auto"
      />
    </div>
  );
};

export default TranscriptViewer; 