"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Plane, MapPin, Sparkles, Globe, IndianRupee, Bed, Clock, LightbulbIcon } from "lucide-react";
import { motion, Variants } from "framer-motion";

interface LoadingSpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function LoadingSpinner({ className, size = "md" }: LoadingSpinnerProps) {
  const [loadingStep, setLoadingStep] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState("Analyzing your destination...");
  
  const loadingMessages = [
    "Analyzing your destination...",
    "Finding the best local experiences...",
    "Optimizing your budget...",
    "Selecting accommodation options...",
    "Planning activities...",
    "Adding local tips and insights...",
    "Creating your personalized itinerary...",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingStep((prevStep) => {
        if (prevStep < loadingMessages.length - 1) {
          return prevStep + 1;
        }
        return prevStep;
      });
    }, 2500);

    return () => clearInterval(interval);
  }, [loadingMessages.length]);

  useEffect(() => {
    setLoadingMessage(loadingMessages[loadingStep]);
  }, [loadingStep, loadingMessages]);

  const sizeClasses = {
    sm: "h-5 w-5",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  const iconVariants: Variants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: { 
        type: "spring", 
        stiffness: 260, 
        damping: 20 
      } 
    },
    exit: { scale: 1.2, opacity: 0 }
  };

  const containerVariants: Variants = {
    animate: {
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const getLoadingIcon = () => {
    switch (loadingStep) {
      case 0:
        return <Globe className="text-blue-600 dark:text-blue-400" />;
      case 1:
        return <MapPin className="text-red-600 dark:text-red-400" />;
      case 2:
        return <motion.div className="text-green-600 dark:text-green-400"><IndianRupee /></motion.div>;
      case 3:
        return <motion.div className="text-indigo-600 dark:text-indigo-400"><Bed /></motion.div>;
      case 4:
        return <motion.div className="text-orange-600 dark:text-orange-400"><Clock /></motion.div>;
      case 5:
        return <motion.div className="text-yellow-600 dark:text-yellow-400"><LightbulbIcon /></motion.div>;
      case 6:
        return <motion.div className="text-purple-600 dark:text-purple-400"><Sparkles /></motion.div>;
      default:
        return <motion.div className="text-blue-600 dark:text-blue-400"><Plane /></motion.div>;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className="relative mb-8">
        <motion.div
          className={cn(
            "rounded-full bg-blue-100 dark:bg-blue-900/30 p-4 relative z-10",
            sizeClasses[size],
            className
          )}
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{ 
            duration: 3, 
            ease: "linear", 
            repeat: Infinity,
          }}
        >
          <motion.div 
            className="absolute inset-0 flex items-center justify-center"
            key={loadingStep}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={iconVariants}
          >
            {getLoadingIcon()}
          </motion.div>
        </motion.div>
        
        <motion.div 
          className="absolute -inset-4 rounded-full border-t-4 border-blue-600 dark:border-blue-400 opacity-20"
          initial={{ rotate: 0 }}
          animate={{ rotate: -360 }}
          transition={{ 
            duration: 8, 
            ease: "linear", 
            repeat: Infinity,
          }}
        />
      </div>
      
      <motion.div 
        className="text-center space-y-4 w-full"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div 
          className="text-xl font-semibold text-slate-800 dark:text-slate-200"
          key={loadingMessage}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.5 }}
        >
          {loadingMessage}
        </motion.div>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
          Our AI is hard at work creating your perfect travel plan. This might take a minute as we analyze thousands of options.
        </p>
        
        <motion.div 
          className="flex justify-center mt-6 space-x-2"
          variants={containerVariants}
          initial="initial"
          animate="animate"
        >
          {[0, 1, 2, 3, 4, 5, 6].map((step) => (
            <motion.div
              key={step}
              className={cn(
                "h-2 w-2 rounded-full",
                loadingStep === step 
                  ? "bg-blue-600 dark:bg-blue-400" 
                  : "bg-slate-300 dark:bg-slate-700"
              )}
              variants={iconVariants}
              animate={loadingStep === step ? 
                { scale: [1, 1.4, 1], opacity: 1 } : 
                { scale: 1, opacity: 0.5 }
              }
              transition={{ 
                duration: 0.5,
                repeat: loadingStep === step ? Infinity : 0,
                repeatDelay: 0.5
              }}
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
} 