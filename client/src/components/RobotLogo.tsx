import React from 'react';
import { motion } from 'framer-motion';

export function RobotLogo() {
  return (
    <motion.div 
      className="w-12 h-12 bg-blue-900 flex items-center justify-center relative"
      style={{
        clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'
      }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ 
        type: "spring",
        stiffness: 260,
        damping: 20
      }}
    >
      <motion.svg 
        width="32" 
        height="32" 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        {/* Robot Head */}
        <motion.path 
          d="M50 15C40 15 30 25 30 35V65C30 75 40 85 50 85C60 85 70 75 70 65V35C70 25 60 15 50 15Z" 
          fill="#E0E0E0"
          stroke="#00AEFF"
          strokeWidth="2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
        />
        
        {/* Robot Eye */}
        <motion.circle 
          cx="50" 
          cy="40" 
          r="10" 
          fill="#00AEFF"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
        />
        
        {/* Robot Chest Light */}
        <motion.path 
          d="M47 60L53 60L50 70Z" 
          fill="#00AEFF"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.2 }}
        />
        
        {/* Glow Effect */}
        <motion.circle 
          cx="50" 
          cy="40" 
          r="6" 
          fill="#FFFFFF"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.8, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
        />
      </motion.svg>
    </motion.div>
  );
}