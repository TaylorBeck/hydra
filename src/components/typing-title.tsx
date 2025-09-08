'use client';

import { useEffect, useState } from 'react';

interface TypingTitleProps {
  models: string[];
  className?: string;
}

export function TypingTitle({ models, className = '' }: TypingTitleProps) {
  const [currentModelIndex, setCurrentModelIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [showCursor, setShowCursor] = useState(true);

  const prefix = 'Hi, I\'m ';
  const currentModel = models[currentModelIndex];

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (isTyping) {
      // Typing phase
      const targetText = prefix + currentModel;
      if (displayText.length < targetText.length) {
        timeout = setTimeout(() => {
          setDisplayText(targetText.slice(0, displayText.length + 1));
        }, 100); // Typing speed
      } else {
        // Finished typing, wait before starting to delete
        timeout = setTimeout(() => {
          setIsTyping(false);
        }, 2000); // Pause duration
      }
    } else {
      // Deleting phase
      if (displayText.length > prefix.length) {
        timeout = setTimeout(() => {
          setDisplayText(displayText.slice(0, -1));
        }, 50); // Deleting speed (faster than typing)
      } else {
        // Finished deleting model name, move to next model
        setCurrentModelIndex((prev) => (prev + 1) % models.length);
        setIsTyping(true);
      }
    }

    return () => clearTimeout(timeout);
  }, [displayText, isTyping, currentModel, models, prefix]);

  // Cursor blinking effect
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 530); // Cursor blink speed

    return () => clearInterval(cursorInterval);
  }, []);

  return (
    <div className={`text-center mb-4 sm:mb-6 lg:mb-8 ${className}`}>
      <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-4xl xl:text-5xl font-bold text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
        {displayText}
        <span 
          className={`inline-block w-0.5 h-6 sm:h-8 md:h-9 lg:h-10 xl:h-12 bg-blue-600 ml-1 transition-opacity duration-100 ${
            showCursor ? 'opacity-100' : 'opacity-0'
          }`}
        />
      </h1>
      <p className="text-base sm:text-lg md:text-xl lg:text-xl text-slate-600 dark:text-slate-400 mt-2 sm:mt-3 lg:mt-4 font-medium max-w-md sm:max-w-2xl mx-auto">
        Choose your AI model and start chatting
      </p>
    </div>
  );
}
