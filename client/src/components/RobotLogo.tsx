import React from 'react';
import { motion } from 'framer-motion';

export function RobotLogo() {
  return (
    <motion.svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-white"
      initial={{ opacity: 0.8 }}
      animate={{ 
        opacity: [0.8, 1, 0.8],
        scale: [1, 1.05, 1]
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        repeatType: "reverse"
      }}
    >
      <motion.path
        d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM7 13.5C6.17 13.5 5.5 12.83 5.5 12C5.5 11.17 6.17 10.5 7 10.5C7.83 10.5 8.5 11.17 8.5 12C8.5 12.83 7.83 13.5 7 13.5ZM12 13.5C11.17 13.5 10.5 12.83 10.5 12C10.5 11.17 11.17 10.5 12 10.5C12.83 10.5 13.5 11.17 13.5 12C13.5 12.83 12.83 13.5 12 13.5ZM17 13.5C16.17 13.5 15.5 12.83 15.5 12C15.5 11.17 16.17 10.5 17 10.5C17.83 10.5 18.5 11.17 18.5 12C18.5 12.83 17.83 13.5 17 13.5Z"
        fill="currentColor"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{
          duration: 2,
          ease: "easeInOut",
          repeat: Infinity,
          repeatType: "loop",
          repeatDelay: 1
        }}
      />
      <motion.path
        d="M17 9C17.5523 9 18 8.55228 18 8C18 7.44772 17.5523 7 17 7C16.4477 7 16 7.44772 16 8C16 8.55228 16.4477 9 17 9Z"
        fill="#4BE3EB"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: 0.5,
          delay: 1,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      />
      <motion.path
        d="M7 9C7.55228 9 8 8.55228 8 8C8 7.44772 7.55228 7 7 7C6.44772 7 6 7.44772 6 8C6 8.55228 6.44772 9 7 9Z"
        fill="#4BE3EB"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: 0.5,
          delay: 1.2,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      />
    </motion.svg>
  );
}