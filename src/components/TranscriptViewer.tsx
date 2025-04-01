import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  const [isVisible] = useState(true);
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
  const playAudio = useCallback(() => {
    console.log('Attempting to play audio...', {
      currentIndex,
      currentEntryKey: currentEntry ? currentEntry[0] : 'none',
      hasEnglishAudio: !!englishAudioRef.current,
      hasSpanishAudio: !!spanishAudioRef.current,
      englishSrc: englishAudioRef.current?.src || 'none',
      spanishSrc: spanishAudioRef.current?.src || 'none'
    });
    
    // Skip audio for the title slide (id0)
    if (currentEntry && currentEntry[0] === 'id0') {
      console.log('Title slide detected, no audio to play, auto-advancing in 3 seconds');
      setIsPlaying(true);
      // Auto-advance after 3 seconds
      setTimeout(() => {
        setIsPlaying(false);
        // Only advance if we're still on the title slide
        if (currentIndex === 0) {
          setCurrentIndex(1);
        }
      }, 3000);
      return;
    }
    
    if (englishAudioRef.current && spanishAudioRef.current) {
      // Get the ID number from the entry key (e.g., 'id1' -> 1)
      const idNumber = parseInt(currentEntry[0].replace('id', ''), 10);
      
      // Recreate the audio element entirely to avoid potential issues
      const englishSrc = `/podcasts/Park%20Predators/audio/The_Angler-formatted-id${idNumber}-en.mp3`;
      
      console.log('Playing English audio from:', englishSrc);
      
      // Create new audio element to avoid caching issues
      const englishAudio = new Audio(englishSrc);
      englishAudio.onended = () => {
        console.log('English audio ended, playing Spanish...');
        
        // Play Spanish audio when English ends
        const spanishSrc = `/podcasts/Park%20Predators/audio/The_Angler-formatted-id${idNumber}-es.mp3`;
        const spanishAudio = new Audio(spanishSrc);
        
        spanishAudio.onended = () => {
          console.log('Spanish audio ended');
          setIsPlaying(false);
        };
        
        spanishAudio.onerror = (e) => {
          console.error('Error with Spanish audio:', e);
          setIsPlaying(false);
        };
        
        spanishAudio.play().catch(error => {
          console.error('Failed to play Spanish audio:', error);
          setIsPlaying(false);
        });
      };
      
      englishAudio.onerror = (e) => {
        console.error('Error with English audio:', e);
        setIsPlaying(false);
      };
      
      setIsPlaying(true);
      englishAudio.play().catch(error => {
        console.error('Failed to play English audio:', error);
        setIsPlaying(false);
      });
    } else {
      console.error('Audio elements not found');
      setIsPlaying(false);
    }
  }, [currentEntry, currentIndex]);

  // Instead, just set isPlaying to false when we navigate
  useEffect(() => {
    setIsPlaying(false);
  }, [currentIndex]);

  // Handle keyboard navigation
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
      } else if (event.key === 'Enter') {
        if (!isPlaying) {
          console.log('Enter key pressed, playing audio');
          playAudio();
        } else {
          console.log('Audio already playing, ignoring Enter key');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [transcriptEntries.length, isPlaying, playAudio]);

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
      
      {/* Add a play button that's always visible */}
      <button 
        className="play-button" 
        onClick={() => playAudio()} 
        disabled={isPlaying}
      >
        {isPlaying ? 'Playing...' : 'Play'}
      </button>
      
      {/* We're now creating audio elements dynamically, so we don't need these refs */}
      <audio
        ref={englishAudioRef}
        preload="auto"
      />
      <audio
        ref={spanishAudioRef}
        preload="auto"
      />
    </div>
  );
};

export default TranscriptViewer; 