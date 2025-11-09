import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Props {
  texts: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseBetween?: number;
}

export default function TypewriterBubble({
  texts,
  typingSpeed = 70,
  deletingSpeed = 40,
  pauseBetween = 1500,
}: Props) {
  const [loopIndex, setLoopIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    let timeout: number;
    const fullText = texts[loopIndex % texts.length];

    if (!isDeleting && charIndex <= fullText.length) {
      timeout = window.setTimeout(() => {
        setDisplayText(fullText.slice(0, charIndex));
        setCharIndex((i) => i + 1);
      }, typingSpeed);
    } else if (isDeleting && charIndex >= 0) {
      timeout = window.setTimeout(() => {
        setDisplayText(fullText.slice(0, charIndex));
        setCharIndex((i) => i - 1);
      }, deletingSpeed);
    } else {
      if (!isDeleting) {
        timeout = window.setTimeout(() => {
          setIsDeleting(true);
          setCharIndex((i) => i - 1);
        }, pauseBetween);
      } else {
        timeout = window.setTimeout(() => {
          setIsDeleting(false);
          setLoopIndex((i) => i + 1);
          setCharIndex(0);
        }, 160);
      }
    }

    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, loopIndex, texts, typingSpeed, deletingSpeed, pauseBetween]);

  return (
    <motion.div
      className="type-bubble"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="bubble-text">
        {displayText}
        <span className="caret">|</span>
      </div>

    
    </motion.div>
  );
}
