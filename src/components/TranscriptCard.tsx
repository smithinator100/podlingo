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
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="transcript-card"
        >
          <div className="transcript-container">
            {/* English text */}
            <div className="transcript-english">
              {english}
            </div>
            
            {/* Divider */}
            <div className="transcript-divider" />
            
            {/* Spanish text */}
            <div className="transcript-spanish">
              {spanish}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TranscriptCard; 