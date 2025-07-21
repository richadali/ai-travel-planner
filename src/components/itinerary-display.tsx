import React, { useState, useEffect } from "react";
import { ItineraryType } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { generateTravelItineraryPDF } from "@/lib/pdf-generator";
import { 
  MapPin, Clock, Coffee, Utensils, Bed, Bus, Plane, IndianRupee, 
  LightbulbIcon, CloudRain, CalendarDays, ChefHat, Share2, Download, FileText, Save, Lock, Check, X
} from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Tooltip } from "@/components/ui/tooltip";
import { useRouter, usePathname } from "next/navigation";
import { AuthModal } from "@/components/ui/auth-modal";

interface ItineraryDisplayProps {
  itinerary: ItineraryType;
  className?: string;
  tripMetadata?: {
    destination: string;
    duration: number;
    peopleCount: number;
    budget: number;
    currency?: string;
  };
  tripId?: string;
  isSharedView?: boolean;
}

export const ItineraryDisplay: React.FC<ItineraryDisplayProps> = ({
  itinerary,
  className,
  tripMetadata,
  tripId,
  isSharedView = false,
}) => {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  
  // Check if we're on a saved trip page
  const isSavedTripPage = pathname?.includes('/trips/') && !pathname?.includes('/share/');
  
  // Set isSaved to true if tripId is provided (meaning it's already saved)
  useEffect(() => {
    if (tripId) {
      setIsSaved(true);
    }
  }, [tripId]);

  // Auto-hide success message after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const handleSave = async () => {
    if (!tripMetadata) {
      setErrorMessage('Trip information is not available for saving.');
      return;
    }

    // Prevent duplicate saves
    if (isSaved) {
      setSuccessMessage('This trip has already been saved.');
      return;
    }

    if (!session) {
      // Show auth modal instead of redirecting
      setIsAuthModalOpen(true);
      // Save itinerary to localStorage for later retrieval
      try {
        localStorage.setItem('savedItinerary', JSON.stringify(itinerary));
        localStorage.setItem('savedTripMetadata', JSON.stringify(tripMetadata));
        console.log('Saved itinerary to localStorage before login prompt');
      } catch (error) {
        console.error('Error saving itinerary to localStorage:', error);
      }
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage(null);

      const saveResponse = await fetch('/api/trips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          destination: tripMetadata.destination,
          duration: tripMetadata.duration,
          peopleCount: tripMetadata.peopleCount,
          budget: tripMetadata.budget,
          currency: tripMetadata.currency || 'INR',
          itinerary: itinerary,
        }),
      });

      if (!saveResponse.ok) {
        const errorData = await saveResponse.json();
        throw new Error(errorData.error || 'Failed to save trip');
      }

      const saveData = await saveResponse.json();
      
      // Mark as saved to prevent duplicate saves
      setIsSaved(true);
      setSuccessMessage('Trip saved successfully! You can access it from your dashboard.');
    } catch (error: any) {
      console.error('Error saving trip:', error);
      setErrorMessage(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = async () => {
    if (!tripMetadata) {
      setErrorMessage('Trip information is not available for sharing.');
      return;
    }

    // Require authentication for sharing
    if (!session) {
      // Show auth modal instead of proceeding with sharing
      setIsAuthModalOpen(true);
      // Save itinerary to localStorage for later retrieval
      try {
        localStorage.setItem('savedItinerary', JSON.stringify(itinerary));
        localStorage.setItem('savedTripMetadata', JSON.stringify(tripMetadata));
        localStorage.setItem('pendingAction', 'share');
        console.log('Saved itinerary to localStorage before login prompt');
      } catch (error) {
        console.error('Error saving itinerary to localStorage:', error);
      }
      return;
    }

    try {
      setIsSharing(true);
      setErrorMessage(null);

      let currentTripId = tripId;
      let shareUrl;
        
      // If we don't have a tripId, save the trip first
      if (!currentTripId) {
        try {
          const saveResponse = await fetch('/api/trips', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              destination: tripMetadata.destination,
              duration: tripMetadata.duration,
              peopleCount: tripMetadata.peopleCount,
              budget: tripMetadata.budget,
              currency: tripMetadata.currency || 'INR',
              itinerary: itinerary,
            }),
          });
          
          if (!saveResponse.ok) {
            const errorData = await saveResponse.json();
            throw new Error(errorData.error || 'Failed to save trip');
          }

          const saveData = await saveResponse.json();
          currentTripId = saveData.trip.id;
          
          // Mark as saved since we just saved it
          setIsSaved(true);
        } catch (error: any) {
          console.error('Error saving trip for sharing:', error);
          throw new Error(`Failed to prepare share link: ${error.message}`);
        }
      }
          
      // Create share link using the saved trip ID
        const shareResponse = await fetch('/api/trips/share', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            tripId: currentTripId,
              ownerName: session.user.name || 'Travel Planner User',
            expiryDays: 30,
          }),
        });

          if (!shareResponse.ok) {
            throw new Error('Failed to create share link');
          }

          const shareData = await shareResponse.json();
          shareUrl = shareData.shareUrl;

      if (shareUrl) {
        // Use native share API if available, otherwise copy to clipboard
        if (navigator.share) {
          await navigator.share({
            title: `Travel Itinerary for ${tripMetadata.destination}`,
            text: `Check out my ${tripMetadata.duration}-day travel plan for ${tripMetadata.destination}!`,
            url: shareUrl,
          });
          setSuccessMessage('Trip shared successfully!');
        } else {
          // Fallback for browsers that don't support the Web Share API
          await navigator.clipboard.writeText(shareUrl);
          setSuccessMessage('Share link copied to clipboard!');
        }
      } else {
        throw new Error('Could not generate share link');
      }
    } catch (error: any) {
      console.error('Error sharing:', error);
      setErrorMessage(error.message);
    } finally {
      setIsSharing(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!tripMetadata) {
      setErrorMessage('Trip information is not available for PDF generation.');
      return;
    }

    try {
      setIsGeneratingPDF(true);
      setErrorMessage(null);
      let currentTripId = tripId;

      // For authenticated users, save the trip if needed
      if (session) {
        // If we don't have a tripId, save the trip first
        if (!currentTripId && !isSaved) {
        try {
          const saveResponse = await fetch('/api/trips', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              destination: tripMetadata.destination,
              duration: tripMetadata.duration,
              peopleCount: tripMetadata.peopleCount,
              budget: tripMetadata.budget,
              currency: tripMetadata.currency || 'INR',
              itinerary: itinerary,
            }),
          });

            if (saveResponse.ok) {
              const saveData = await saveResponse.json();
          currentTripId = saveData.trip.id;
              
              // Mark as saved since we just saved it
              setIsSaved(true);
            }
          } catch (error) {
            console.error('Error saving trip before download:', error);
            // Continue with PDF generation even if saving fails
          }
        }
      }

      // Track the download if we have a tripId
      if (currentTripId) {
        console.log(`[Download] Tracking download for trip: ${currentTripId}`);
        
        try {
          const trackResponse = await fetch('/api/trips/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tripId: currentTripId,
          downloadType: 'pdf',
              userId: session?.user?.id || undefined
        }),
          });
          
          if (trackResponse.ok) {
            console.log('[Download] Successfully tracked download');
          } else {
            const errorData = await trackResponse.text();
            console.error(`[Download] Failed to track download: ${trackResponse.status}`, errorData);
            }
          } catch (error) {
          console.error('[Download] Failed to track download:', error);
        }
      } 
      // For anonymous users or when no tripId is available, create a temporary trip for tracking
      else if (!currentTripId && tripMetadata) {
        try {
          console.log('[Download] Creating temporary trip for anonymous download tracking');
          
          // Create a temporary trip just for tracking purposes
          const tempTripResponse = await fetch('/api/trips/temp', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              destination: tripMetadata.destination,
              duration: tripMetadata.duration,
              peopleCount: tripMetadata.peopleCount,
              budget: tripMetadata.budget,
              currency: tripMetadata.currency || 'INR',
              // We don't need to send the full itinerary for tracking
              isAnonymous: true
            }),
          });
          
          if (tempTripResponse.ok) {
            const tempTripData = await tempTripResponse.json();
            
            if (tempTripData.tripId) {
              // Track the download using the temporary trip ID
              const trackResponse = await fetch('/api/trips/download', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  tripId: tempTripData.tripId,
                  downloadType: 'pdf',
                  isAnonymous: true
                }),
              });
              
              if (trackResponse.ok) {
                console.log('[Download] Successfully tracked anonymous download');
              } else {
                const errorData = await trackResponse.text();
                console.error(`[Download] Failed to track anonymous download: ${trackResponse.status}`, errorData);
              }
            }
          } else {
            console.error('[Download] Failed to create temporary trip for tracking');
          }
        } catch (error) {
          console.error('[Download] Error tracking anonymous download:', error);
          // Continue with PDF generation even if tracking fails
        }
      }

      // Prepare metadata for PDF generation
      const pdfMetadata = {
        destination: tripMetadata.destination,
        duration: tripMetadata.duration,
        peopleCount: tripMetadata.peopleCount,
        budget: tripMetadata.budget,
        currency: tripMetadata.currency || 'INR',
        generatedAt: new Date(),
        ownerName: session?.user?.name || 'Travel Planner User'
      };
      
      // Generate and download the PDF
      await generateTravelItineraryPDF(
        itinerary, 
        pdfMetadata,
        `${tripMetadata.destination.replace(/\s+/g, '_')}_Travel_Itinerary.pdf`
      );

      setSuccessMessage('PDF downloaded successfully!');
    } catch (error: any) {
      console.error('Error generating PDF:', error);
      setErrorMessage(error.message);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className={cn("space-y-10 mx-auto max-w-5xl", className)}>
      <div className="text-center max-w-3xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          {isSharedView ? 'Shared Travel Itinerary' : 'Your Travel Itinerary'}
        </h2>
        <p className="text-xl text-muted-foreground">
          {isSharedView 
            ? "Here's a personalized travel plan shared with you!" 
            : "Here's your personalized travel plan with daily activities, accommodations, and budget breakdown."
          }
        </p>
        
        {/* Success Message */}
        {successMessage && (
          <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-800 dark:text-green-200 text-sm flex items-center justify-between">
            <div className="flex items-center">
              <Check className="h-4 w-4 mr-2 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
            <button 
              onClick={() => setSuccessMessage(null)}
              className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        
        {/* Error Message */}
        {errorMessage && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-200 text-sm flex items-center justify-between">
            <div className="flex items-center">
              <X className="h-4 w-4 mr-2 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button 
              onClick={() => setErrorMessage(null)}
              className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        
        <div className="flex justify-center gap-3 mt-6 no-print">
          {/* Only show save button if not on a saved trip page and not in shared view */}
          {!isSharedView && !isSavedTripPage && (
            status === "authenticated" ? (
              <button 
                onClick={handleSave}
                disabled={isSaving || isSaved}
                className={cn(
                  "px-4 py-2 rounded-lg font-medium transition-colors flex items-center",
                  isSaved 
                    ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 cursor-default" 
                    : "bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-800/50 text-green-800 dark:text-green-300 disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                {isSaving ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : isSaved ? (
                  <>
                    <Check className="mr-2 h-4 w-4" /> Trip Saved
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" /> Save Trip
                  </>
                )}
              </button>
            ) : (
              <Tooltip content="Sign in to save your trip and access it later">
                <button 
                  onClick={handleSave}
                  className="bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-4 py-2 rounded-lg font-medium flex items-center relative group hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <Lock className="mr-2 h-4 w-4" /> Save Trip
                </button>
              </Tooltip>
            )
          )}
          
          <button 
            onClick={handleShare}
            disabled={isSharing}
            className="bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-800/50 text-blue-800 dark:text-blue-300 px-4 py-2 rounded-lg font-medium transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSharing ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sharing...
              </>
            ) : (
              <>
                <Share2 className="mr-2 h-4 w-4" /> Share Itinerary
              </>
            )}
          </button>
          <button 
            onClick={handleDownloadPDF}
            disabled={isGeneratingPDF}
            className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 px-4 py-2 rounded-lg font-medium transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGeneratingPDF ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating PDF...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" /> Download PDF
              </>
            )}
          </button>
        </div>
      </div>

      {/* Authentication Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        title="Sign In Required"
        message="Please sign in to save your travel itinerary and access it later from any device."
      />

      {/* Trip Overview */}
      {itinerary?.bestTimeToVisit && (
        <div className="space-y-6">
          <h3 className="text-2xl font-bold flex items-center border-b pb-2">
            <CalendarDays className="mr-2 h-6 w-6 text-purple-600 dark:text-purple-400" />
            Trip Overview
          </h3>
          
          <Card className="border-slate-200 dark:border-slate-700 shadow-md overflow-hidden">
            <CardContent className="p-6 grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center">
                  <CalendarDays className="mr-2 h-5 w-5 text-purple-600 dark:text-purple-400" />
                  Best Time to Visit
                </h3>
                <p className="text-muted-foreground">{itinerary.bestTimeToVisit}</p>
              </div>
              
              {itinerary?.localCuisine && Array.isArray(itinerary.localCuisine) && itinerary.localCuisine.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-2 flex items-center">
                    <ChefHat className="mr-2 h-5 w-5 text-amber-600 dark:text-amber-400" />
                    Local Cuisine to Try
                  </h3>
                  <ul className="space-y-1">
                    {itinerary.localCuisine.map((cuisine, index) => (
                      <li key={`cuisine-${index}`} className="flex items-center">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-600 dark:bg-amber-400 mr-2"></span>
                        <span>{cuisine}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Daily Itinerary */}
      <div className="space-y-8">
        <h3 className="text-2xl font-bold flex items-center border-b pb-2">
          <Clock className="mr-2 h-6 w-6 text-blue-600 dark:text-blue-400" />
          Daily Schedule
        </h3>
        
        {itinerary?.days && Array.isArray(itinerary.days) && itinerary.days.map((day) => (
          <Card key={`day-${day.day}`} className="overflow-hidden border-slate-200 dark:border-slate-700 shadow-md">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              <CardTitle className="text-xl pt-2">Day {day.day}</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <MapPin className="mr-2 h-5 w-5 text-blue-600 dark:text-blue-400" />
                    Activities
                  </h3>
                  <div className="space-y-6">
                    {day?.activities && Array.isArray(day.activities) && day.activities.map((activity, index) => (
                      <div 
                        key={`activity-${day.day}-${index}`} 
                        className="border-l-2 border-blue-200 dark:border-blue-800 pl-4 relative hover:bg-slate-50 dark:hover:bg-slate-900 p-3 rounded-r-md transition-colors"
                      >
                        <div className="absolute -left-2 top-0 h-4 w-4 rounded-full bg-blue-600 dark:bg-blue-400" />
                        <div className="flex justify-between items-start">
                          <div className="flex-1 pr-4">
                            <h4 className="font-medium text-lg">{activity.name}</h4>
                            <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center flex-wrap">
                              <Clock className="inline mr-1 h-3 w-3" /> {activity.time || 'Anytime'} • 
                              <MapPin className="inline mx-1 h-3 w-3" /> {activity.location || 'Location not specified'}
                            </p>
                            <p className="mt-2">{activity.description}</p>
                            
                            {activity.weatherConsideration && (
                              <div className="mt-2 text-sm bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded p-2 flex items-start">
                                <CloudRain className="h-4 w-4 mr-2 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                                <p className="text-blue-800 dark:text-blue-200">{activity.weatherConsideration}</p>
                              </div>
                            )}
                          </div>
                          <div className="text-sm font-medium bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded flex-shrink-0">
                            {formatCurrency(activity.cost || 0)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {day?.meals && Array.isArray(day.meals) && day.meals.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <Utensils className="mr-2 h-5 w-5 text-green-600 dark:text-green-400" />
                    Meals
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {day.meals.map((meal, index) => {
                      let MealIcon = Utensils;
                      if (meal.type === 'breakfast') MealIcon = Coffee;
                      
                      return (
                        <div
                          key={`meal-${day.day}-${index}`}
                          className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700"
                        >
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium capitalize flex items-center">
                              <MealIcon className="mr-2 h-4 w-4 text-green-600 dark:text-green-400" />
                                {meal.type || 'Meal'}
                            </span>
                            <span className="text-sm bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-0.5 rounded">
                                {formatCurrency(meal.cost || 0)}
                            </span>
                          </div>
                          <p className="text-sm mb-1">{meal.suggestion}</p>
                          {meal.location && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center mt-2">
                              <MapPin className="inline mr-1 h-3 w-3" /> {meal.location}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Accommodation */}
      {itinerary?.accommodation && Array.isArray(itinerary.accommodation) && itinerary.accommodation.length > 0 && (
      <div className="space-y-6">
        <h3 className="text-2xl font-bold flex items-center border-b pb-2">
          <Bed className="mr-2 h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          Accommodation Options
        </h3>
        
        <div className="grid gap-6 md:grid-cols-2">
          {itinerary.accommodation.map((accommodation, index) => (
            <Card
              key={`accommodation-${index}`}
              className="border-slate-200 dark:border-slate-700 overflow-hidden shadow-md"
            >
              <CardHeader className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-center pt-2">
                  <CardTitle className="text-xl">{accommodation.name}</CardTitle>
                  <span className="font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 px-2 py-1 rounded text-sm">
                      {formatCurrency(accommodation.pricePerNight || 0)} / night
                  </span>
                </div>
                <CardDescription className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                    {accommodation.location || 'Location not specified'}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <p className="mb-4">{accommodation.description}</p>
                
                {accommodation.suitableFor && (
                  <div className="mb-3">
                    <span className="inline-block bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 px-2 py-1 rounded-full text-xs font-medium">
                      Suitable for: {accommodation.suitableFor}
                    </span>
                  </div>
                )}
                
                  {accommodation.amenities && Array.isArray(accommodation.amenities) && accommodation.amenities.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Amenities</h4>
                    <div className="flex flex-wrap gap-2">
                      {accommodation.amenities.map((amenity, i) => (
                        <span
                          key={`amenity-${index}-${i}`}
                          className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full border border-slate-200 dark:border-slate-700"
                        >
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      )}

      {/* Transportation */}
      {itinerary?.transportation && Array.isArray(itinerary.transportation) && itinerary.transportation.length > 0 && (
      <div className="space-y-6">
        <h3 className="text-2xl font-bold flex items-center border-b pb-2">
          <Bus className="mr-2 h-6 w-6 text-orange-600 dark:text-orange-400" />
          Transportation
        </h3>
        
        <Card className="border-slate-200 dark:border-slate-700 shadow-md">
          <CardContent className="p-6">
            <div className="space-y-6">
              {itinerary.transportation.map((transport, index) => {
                // Choose icon based on transport type
                let TransportIcon = Bus;
                  if (transport.type && transport.type.toLowerCase().includes('plane')) TransportIcon = Plane;
                
                return (
                  <div
                    key={`transport-${index}`}
                    className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-6 last:border-0 last:pb-0"
                  >
                    <div className="flex flex-1 pr-4">
                      <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-full mr-4 self-start flex-shrink-0">
                        <TransportIcon className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div>
                          <h3 className="font-medium text-lg">{transport.type || 'Transportation'}</h3>
                        <p className="text-muted-foreground">{transport.description}</p>
                        
                        {transport.recommendedFor && (
                          <span className="inline-block mt-2 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 px-2 py-1.5 rounded-full text-xs">
                            Recommended for: {transport.recommendedFor}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 px-2 py-1 rounded flex-shrink-0">
                        {formatCurrency(transport.cost || 0)}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
      )}

      {/* Budget Breakdown */}
      {itinerary?.budgetBreakdown && (
      <div className="space-y-6">
        <h3 className="text-2xl font-bold flex items-center border-b pb-2">
          <IndianRupee className="mr-2 h-6 w-6 text-green-600 dark:text-green-400" />
          Budget Breakdown
        </h3>
        
        <Card className="border-slate-200 dark:border-slate-700 shadow-md">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
                <span className="flex items-center">
                  <Bed className="h-5 w-5 mr-2 text-indigo-600 dark:text-indigo-400" />
                  Accommodation
                </span>
                  <span className="font-medium">{formatCurrency(itinerary.budgetBreakdown.accommodation || 0)}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
                <span className="flex items-center">
                  <Utensils className="h-5 w-5 mr-2 text-green-600 dark:text-green-400" />
                  Food
                </span>
                  <span className="font-medium">{formatCurrency(itinerary.budgetBreakdown.food || 0)}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
                <span className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                  Activities
                </span>
                  <span className="font-medium">{formatCurrency(itinerary.budgetBreakdown.activities || 0)}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
                <span className="flex items-center">
                  <Bus className="h-5 w-5 mr-2 text-orange-600 dark:text-orange-400" />
                  Transportation
                </span>
                  <span className="font-medium">{formatCurrency(itinerary.budgetBreakdown.transportation || 0)}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
                <span>Miscellaneous</span>
                  <span className="font-medium">{formatCurrency(itinerary.budgetBreakdown.miscellaneous || 0)}</span>
              </div>
              <div className="flex justify-between items-center pt-2 font-bold text-lg">
                <span>Total</span>
                  <span className="text-green-600 dark:text-green-400">{formatCurrency(itinerary.budgetBreakdown.total || 0)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      )}

      {/* Local Tips */}
      {itinerary?.tips && Array.isArray(itinerary.tips) && itinerary.tips.length > 0 && (
      <div className="space-y-6">
        <h3 className="text-2xl font-bold flex items-center border-b pb-2">
          <LightbulbIcon className="mr-2 h-6 w-6 text-yellow-600 dark:text-yellow-400" />
          Local Tips & Insights
        </h3>
        
        <Card className="border-slate-200 dark:border-slate-700 shadow-md">
          <CardContent className="p-6">
            <ul className="space-y-4">
              {itinerary.tips.map((tip, index) => (
                <li key={`tip-${index}`} className="flex items-start">
                  <div className="bg-yellow-100 dark:bg-yellow-900/30 p-1 rounded-full mr-3 mt-0.5 flex-shrink-0">
                    <LightbulbIcon className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <p>{tip}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
      )}
      
      <div className="flex justify-center gap-4 pt-8 border-t border-slate-200 dark:border-slate-800 no-print">
        {/* Only show save button if not on a saved trip page and not in shared view */}
        {!isSharedView && !isSavedTripPage && (
          status === "authenticated" ? (
            <button 
              onClick={handleSave}
              disabled={isSaving || isSaved}
              className={cn(
                "px-4 py-2 rounded-lg font-medium transition-colors flex items-center",
                isSaved 
                  ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 cursor-default" 
                  : "bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-800/50 text-green-800 dark:text-green-300 disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : isSaved ? (
                <>
                  <Check className="mr-2 h-4 w-4" /> Trip Saved
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" /> Save Trip
                </>
              )}
            </button>
          ) : (
            <Tooltip content="Sign in to save your trip and access it later">
              <button 
                onClick={handleSave}
                className="bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-4 py-2 rounded-lg font-medium flex items-center relative group hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <Lock className="mr-2 h-4 w-4" /> Save Trip
                <span className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Sign in to save
                </span>
              </button>
            </Tooltip>
          )
        )}
        <button 
          onClick={handleShare}
          disabled={isSharing}
          className="bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-800/50 text-blue-800 dark:text-blue-300 px-4 py-2 rounded-lg font-medium transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSharing ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Sharing...
            </>
          ) : (
            <>
              <Share2 className="mr-2 h-4 w-4" /> Share Itinerary
            </>
          )}
        </button>
        <button 
          onClick={handleDownloadPDF}
          disabled={isGeneratingPDF}
          className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 px-4 py-2 rounded-lg font-medium transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGeneratingPDF ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating PDF...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" /> Download PDF
            </>
          )}
        </button>
      </div>
    </div>
  );
}; 