"use client";

import React, { useState, useEffect } from "react";
import { TravelPlannerForm } from "@/components/travel-planner-form";
import { ItineraryDisplay } from "@/components/itinerary-display";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { LoadingSpinner } from "@/components/loading-spinner";
import { TripFormValues } from "@/lib/validations";
import { ItineraryType } from "@/types";
import { MapPin, IndianRupee, Users, Clock, ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { ErrorModal } from "@/components/ui/error-modal";
import { useSession } from "next-auth/react";
import { JsonLd } from "@/components/json-ld";

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [itinerary, setItinerary] = useState<ItineraryType | null>(null);
  const [tripMetadata, setTripMetadata] = useState<{
    destination: string;
    duration: number;
    peopleCount: number;
    budget: number;
    currency?: string;
  } | undefined>(undefined);
  const { status } = useSession();

  // Check for saved itinerary in localStorage when the component mounts
  // or when the authentication status changes
  useEffect(() => {
    // Only try to restore if we're not already showing an itinerary
    if (!itinerary) {
      try {
        const savedItinerary = localStorage.getItem('savedItinerary');
        const savedTripMetadata = localStorage.getItem('savedTripMetadata');
        
        if (savedItinerary && savedTripMetadata) {
          console.log('Found saved itinerary in localStorage');
          setItinerary(JSON.parse(savedItinerary));
          setTripMetadata(JSON.parse(savedTripMetadata));
          
          // Clear the saved data to prevent it from showing up on future visits
          localStorage.removeItem('savedItinerary');
          localStorage.removeItem('savedTripMetadata');
          
          // Scroll to the itinerary after a short delay
          setTimeout(() => {
            const itinerarySection = document.getElementById('itinerary-section');
            if (itinerarySection) {
              itinerarySection.scrollIntoView({ behavior: 'smooth' });
            }
          }, 500);
        }
      } catch (error) {
        console.error('Error retrieving saved itinerary from localStorage:', error);
      }
    }
  }, [status, itinerary]);

  const handleSubmit = async (data: TripFormValues) => {
    try {
      // Additional client-side validation for destination
      const destination = data.destination.trim().toLowerCase();
      const invalidDestinations = ["test", "hi", "hello", "asdf", "123", "none", "n/a", "na", "null", "undefined", 
                                   "xyz", "abc", "foo", "bar", "baz", "qwerty", "example"];
      
      if (invalidDestinations.includes(destination) || destination.length < 2 || /^\d+$/.test(destination)) {
        setError("Please enter a valid destination (city or country name)");
        return;
      }
      
      setIsLoading(true);
      setError(null);
      // Clear any existing itinerary when starting a new request
      setItinerary(null);

      const response = await fetch("/api/travel-plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        // Handle invalid destination errors more gracefully
        if (result.errorType === "INVALID_DESTINATION") {
          setError("We couldn't recognize that destination. Please enter a valid city or country name (e.g., 'Jorhat', 'Mumbai', 'New York').");
        } else {
          throw new Error(result.error || "Failed to generate travel plan");
        }
        return;
      }

      // The API now directly returns the itinerary in the result object
      setItinerary(result.itinerary);
      
      // Store trip metadata for PDF generation
      setTripMetadata({
        destination: data.destination,
        duration: data.duration,
        peopleCount: data.peopleCount,
        budget: data.budget,
        currency: data.currency || 'INR'
      });
      
      // Scroll to the itinerary after it's loaded
      setTimeout(() => {
        const itinerarySection = document.getElementById('itinerary-section');
        if (itinerarySection) {
          itinerarySection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } catch (err: any) {
      console.error("Error generating travel plan:", err);
      setError(err.message || "An error occurred while generating your travel plan");
    } finally {
      setIsLoading(false);
    }
  };

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.6 } }
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const staggerChildren = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  // Structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "AI Travel Planner",
    "url": "https://aitravelplanner.richadali.dev",
    "description": "Plan your perfect trip with AI assistance. Get personalized travel itineraries based on your destination, budget, and preferences.",
    "applicationCategory": "TravelApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "featureList": [
      "AI-generated travel itineraries",
      "Personalized recommendations",
      "Budget planning",
      "Activity suggestions",
      "Accommodation recommendations"
    ],
    "screenshot": "https://aitravelplanner.richadali.dev/screenshots/desktop.jpg",
    "softwareVersion": "1.0"
  };

  return (
    <div className="flex min-h-screen flex-col">
      {/* Add structured data for SEO */}
      <JsonLd data={structuredData} />
      
      <Header />
      <main className="flex-1">
        <section className="py-16 md:py-24 bg-gradient-to-b from-slate-900 to-slate-800 text-white overflow-hidden">
          <div className="container mx-auto px-4 md:px-6 max-w-7xl">
            <motion.div 
              className="flex flex-col items-center text-center space-y-6 mb-10"
              initial="hidden"
              animate="visible"
              variants={staggerChildren}
            >
              <motion.h1 
                className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tighter"
                variants={fadeInUp}
              >
                Plan Your Dream Trip with <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">AI</span>
              </motion.h1>
              <motion.p 
                className="text-l md:text-2xl text-slate-300 max-w-[800px]"
                variants={fadeInUp}
              >
                Enter your destination, budget, and preferences to get a personalized travel itinerary
                powered by generative AI.
              </motion.p>
            </motion.div>
            <motion.div 
              className="max-w-lg mx-auto"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <TravelPlannerForm 
                onSubmit={handleSubmit} 
                isLoading={isLoading}
              />
            </motion.div>
          </div>
        </section>

        {isLoading && (
          <motion.div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-8 max-w-md w-full mx-4">
              <LoadingSpinner size="lg" />
            </div>
          </motion.div>
        )}

        {/* Error Modal */}
        <ErrorModal message={error} onDismiss={() => setError(null)} />

        {itinerary && !isLoading && (
          <motion.section 
            id="itinerary-section"
            className="py-12 container mx-auto px-4 md:px-6 max-w-7xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <ItineraryDisplay 
              itinerary={itinerary} 
              tripMetadata={tripMetadata}
            />
          </motion.section>
        )}

        <motion.section 
          className="py-16 md:py-24 bg-slate-50 dark:bg-slate-900"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerChildren}
        >
          <div className="container mx-auto px-4 md:px-6 max-w-7xl">
            <div className="text-center mb-12">
              <motion.h2 
                className="text-3xl md:text-4xl font-bold mb-4"
                variants={fadeInUp}
              >
                How It Works
              </motion.h2>
              <motion.p 
                className="text-slate-600 dark:text-slate-400 max-w-3xl mx-auto"
                variants={fadeInUp}
              >
                Get your personalized travel itinerary in three simple steps
              </motion.p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 md:gap-12">
              <motion.div 
                className="flex flex-col items-center text-center"
                variants={fadeInUp}
              >
                <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center mb-4">
                  <MapPin className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-xl font-bold mb-2">Choose Destination</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Select where you want to go, from popular cities to hidden gems
                </p>
              </motion.div>
              
              <motion.div 
                className="flex flex-col items-center text-center"
                variants={fadeInUp}
              >
                <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center mb-4">
                  <Users className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-xl font-bold mb-2">Set Parameters</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Specify trip duration, number of people, and your budget
                </p>
              </motion.div>
              
              <motion.div 
                className="flex flex-col items-center text-center"
                variants={fadeInUp}
              >
                <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center mb-4">
                  <Sparkles className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-xl font-bold mb-2">Get Itinerary</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Receive a detailed day-by-day plan created just for you
                </p>
              </motion.div>
            </div>
            
            <motion.div 
              className="mt-12 text-center"
              variants={fadeInUp}
            >
              <a 
                href="#top" 
                className="inline-flex items-center text-indigo-600 dark:text-indigo-400 font-medium"
                onClick={(e) => {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                Create your itinerary now <ArrowRight className="ml-2 w-4 h-4" />
              </a>
            </motion.div>
          </div>
        </motion.section>
      </main>
      <Footer />
    </div>
  );
} 