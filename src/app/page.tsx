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

export default function Home() {
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
        <section className="py-16 md:py-24 bg-slate-50 text-slate-900 dark:bg-gradient-to-b dark:from-slate-900 dark:to-slate-800 dark:text-white overflow-hidden">
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
                className="text-l md:text-2xl text-slate-600 dark:text-slate-300 max-w-[800px]"
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
          variants={fadeIn}
        >
          <div className="container mx-auto px-4 md:px-6 max-w-7xl">
            <motion.div 
              className="text-center mb-12"
              variants={fadeInUp}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Use AI Travel Planner?</h2>
              <p className="text-xl text-muted-foreground max-w-[700px] mx-auto">
                Our AI-powered platform helps you create the perfect travel experience tailored to your needs.
              </p>
            </motion.div>
            
            <motion.div 
              className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
              variants={staggerChildren}
            >
              <motion.div 
                className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 flex flex-col items-center text-center"
                variants={fadeInUp}
                whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                transition={{ duration: 0.2 }}
              >
                <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full mb-4">
                  <MapPin className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-bold mb-3">Personalized Itineraries</h3>
                <p className="text-muted-foreground">
                  Get custom travel plans tailored to your preferences, budget, and group size.
                </p>
              </motion.div>
              
              <motion.div 
                className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 flex flex-col items-center text-center"
                variants={fadeInUp}
                whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                transition={{ duration: 0.2 }}
              >
                <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full mb-4">
                  <IndianRupee className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-bold mb-3">Budget Optimization</h3>
                <p className="text-muted-foreground">
                  Our AI helps you make the most of your travel budget with cost-effective recommendations.
                </p>
              </motion.div>
              
              <motion.div 
                className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 flex flex-col items-center text-center"
                variants={fadeInUp}
                whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                transition={{ duration: 0.2 }}
              >
                <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full mb-4">
                  <Users className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-xl font-bold mb-3">Local Insights</h3>
                <p className="text-muted-foreground">
                  Discover hidden gems and local tips that most tourists miss out on.
                </p>
              </motion.div>
            </motion.div>
          </div>
        </motion.section>
        
        <motion.section 
          className="py-16 md:py-24"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeIn}
        >
          <div className="container mx-auto px-4 md:px-6 max-w-7xl">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <motion.div variants={fadeInUp}>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">How It Works</h2>
                <motion.div 
                  className="space-y-8"
                  variants={staggerChildren}
                >
                  <motion.div 
                    className="flex gap-4"
                    variants={fadeInUp}
                  >
                    <div className="bg-blue-100 dark:bg-blue-900/30 h-8 w-8 rounded-full flex items-center justify-center shrink-0">
                      <span className="font-bold text-blue-600 dark:text-blue-400">1</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Enter Your Travel Details</h3>
                      <p className="text-muted-foreground">
                        Provide your destination, trip duration, number of travelers, and budget.
                      </p>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    className="flex gap-4"
                    variants={fadeInUp}
                  >
                    <div className="bg-blue-100 dark:bg-blue-900/30 h-8 w-8 rounded-full flex items-center justify-center shrink-0">
                      <span className="font-bold text-blue-600 dark:text-blue-400">2</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">AI Creates Your Itinerary</h3>
                      <p className="text-muted-foreground">
                        Our advanced AI analyzes thousands of options to create your perfect trip plan.
                      </p>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    className="flex gap-4"
                    variants={fadeInUp}
                  >
                    <div className="bg-blue-100 dark:bg-blue-900/30 h-8 w-8 rounded-full flex items-center justify-center shrink-0">
                      <span className="font-bold text-blue-600 dark:text-blue-400">3</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Enjoy Your Perfect Trip</h3>
                      <p className="text-muted-foreground">
                        Get a day-by-day itinerary with activities, accommodations, and budget breakdown.
                      </p>
                    </div>
                  </motion.div>
                </motion.div>
              </motion.div>
              
              <motion.div 
                className="bg-slate-100 dark:bg-slate-800 p-8 rounded-xl border border-slate-200 dark:border-slate-700"
                variants={fadeInUp}
                whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                transition={{ duration: 0.3 }}
              >
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2 flex items-center">
                      <Clock className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                      Save Time Planning
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Create a complete travel plan in minutes instead of hours of research.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-2 flex items-center">
                      <IndianRupee className="h-5 w-5 mr-2 text-green-600 dark:text-green-400" />
                      Save Money
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Get recommendations optimized for your budget with cost breakdowns.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-2 flex items-center">
                      <MapPin className="h-5 w-5 mr-2 text-red-600 dark:text-red-400" />
                      Discover Hidden Gems
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Find local attractions and experiences that guidebooks miss.
                    </p>
                  </div>
                  
                  <motion.button 
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="w-full mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-3 px-4 rounded-md transition-all duration-200 flex items-center justify-center"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    Start Planning Now <ArrowRight className="ml-2 h-4 w-4" />
                  </motion.button>
                </div>
              </motion.div>
            </div>
        </div>
        </motion.section>
      </main>
      <Footer />
    </div>
  );
}
