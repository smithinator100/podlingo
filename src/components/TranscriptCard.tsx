import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import '../style.css';

interface TranscriptCardProps {
  id: string;
  english: string;
  spanish: string;
  isVisible: boolean;
}

const TranscriptCard: React.FC<TranscriptCardProps> = ({ id, english, spanish, isVisible }) => {
  // Check if this is the title slide (id0)
  const isTitleSlide = id === 'id0';

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={`transcript-card ${isTitleSlide ? 'title-slide' : ''}`}
        >
          <div className="transcript-container">
            {/* English text */}
            <div className={`transcript-english ${isTitleSlide ? 'title-text' : ''}`}>
              {english}
            </div>
            
            {/* Divider */}
            <div className="transcript-divider" />
            
            {/* Spanish text */}
            <div className={`transcript-spanish ${isTitleSlide ? 'title-text' : ''}`}>
              {spanish}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TranscriptCard; 