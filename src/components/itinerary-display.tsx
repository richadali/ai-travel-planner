import React, { useState } from "react";
import { ItineraryType } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { generateTravelItineraryPDF } from "@/lib/pdf-generator";
import { 
  MapPin, Clock, Coffee, Utensils, Bed, Bus, Plane, IndianRupee, 
  LightbulbIcon, CloudRain, CalendarDays, ChefHat, Share2, Download, FileText 
} from "lucide-react";

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
}

export const ItineraryDisplay: React.FC<ItineraryDisplayProps> = ({
  itinerary,
  className,
  tripMetadata,
}) => {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'My Travel Itinerary',
        text: `Check out my travel plan for ${itinerary.days.length} days!`,
        url: window.location.href,
      })
      .catch((error) => console.log('Error sharing', error));
    } else {
      // Fallback for browsers that don't support the Web Share API
      navigator.clipboard.writeText(window.location.href)
        .then(() => alert('Link copied to clipboard!'))
        .catch(() => alert('Failed to copy link'));
    }
  };

  const handleDownloadPDF = async () => {
    if (!tripMetadata) {
      alert('Trip information is not available for PDF generation.');
      return;
    }

    try {
      setIsGeneratingPDF(true);

      // Prepare metadata for PDF generation
      const pdfMetadata = {
        destination: tripMetadata.destination,
        duration: tripMetadata.duration,
        peopleCount: tripMetadata.peopleCount,
        budget: tripMetadata.budget,
        currency: tripMetadata.currency || 'INR',
        generatedAt: new Date(),
        ownerName: 'Travel Planner User'
      };

      // Generate and download the PDF
      await generateTravelItineraryPDF(
        itinerary, 
        pdfMetadata,
        `${tripMetadata.destination.replace(/\s+/g, '_')}_Travel_Itinerary.pdf`
      );

    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className={cn("space-y-10 mx-auto max-w-5xl", className)}>
      <div className="text-center max-w-3xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Your Travel Itinerary</h2>
        <p className="text-xl text-muted-foreground">
          Here's your personalized travel plan with daily activities, accommodations, and budget breakdown.
        </p>
        
        <div className="flex justify-center gap-3 mt-6 no-print">
          <button 
            onClick={handleShare}
            className="bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-800/50 text-blue-800 dark:text-blue-300 px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
          >
            <Share2 className="mr-2 h-4 w-4" /> Share Itinerary
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

      {/* Trip Overview */}
      {itinerary.bestTimeToVisit && (
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
              
              {itinerary.localCuisine && itinerary.localCuisine.length > 0 && (
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
        
        {itinerary.days.map((day) => (
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
                    {day.activities.map((activity, index) => (
                      <div 
                        key={`activity-${day.day}-${index}`} 
                        className="border-l-2 border-blue-200 dark:border-blue-800 pl-4 relative hover:bg-slate-50 dark:hover:bg-slate-900 p-3 rounded-r-md transition-colors"
                      >
                        <div className="absolute -left-2 top-0 h-4 w-4 rounded-full bg-blue-600 dark:bg-blue-400" />
                        <div className="flex justify-between items-start">
                          <div className="flex-1 pr-4">
                            <h4 className="font-medium text-lg">{activity.name}</h4>
                            <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center flex-wrap">
                              <Clock className="inline mr-1 h-3 w-3" /> {activity.time} • 
                              <MapPin className="inline mx-1 h-3 w-3" /> {activity.location}
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
                            {formatCurrency(activity.cost)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

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
                              {meal.type}
                            </span>
                            <span className="text-sm bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-0.5 rounded">
                              {formatCurrency(meal.cost)}
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
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Accommodation */}
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
                    {formatCurrency(accommodation.pricePerNight)} / night
                  </span>
                </div>
                <CardDescription className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {accommodation.location}
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
                
                {accommodation.amenities && (
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

      {/* Transportation */}
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
                if (transport.type.toLowerCase().includes('plane')) TransportIcon = Plane;
                
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
                        <h3 className="font-medium text-lg">{transport.type}</h3>
                        <p className="text-muted-foreground">{transport.description}</p>
                        
                        {transport.recommendedFor && (
                          <span className="inline-block mt-2 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 px-2 py-1.5 rounded-full text-xs">
                            Recommended for: {transport.recommendedFor}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 px-2 py-1 rounded flex-shrink-0">
                      {formatCurrency(transport.cost)}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget Breakdown */}
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
                <span className="font-medium">{formatCurrency(itinerary.budgetBreakdown.accommodation)}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
                <span className="flex items-center">
                  <Utensils className="h-5 w-5 mr-2 text-green-600 dark:text-green-400" />
                  Food
                </span>
                <span className="font-medium">{formatCurrency(itinerary.budgetBreakdown.food)}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
                <span className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                  Activities
                </span>
                <span className="font-medium">{formatCurrency(itinerary.budgetBreakdown.activities)}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
                <span className="flex items-center">
                  <Bus className="h-5 w-5 mr-2 text-orange-600 dark:text-orange-400" />
                  Transportation
                </span>
                <span className="font-medium">{formatCurrency(itinerary.budgetBreakdown.transportation)}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
                <span>Miscellaneous</span>
                <span className="font-medium">{formatCurrency(itinerary.budgetBreakdown.miscellaneous)}</span>
              </div>
              <div className="flex justify-between items-center pt-2 font-bold text-lg">
                <span>Total</span>
                <span className="text-green-600 dark:text-green-400">{formatCurrency(itinerary.budgetBreakdown.total)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Local Tips */}
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
      
      <div className="flex justify-center gap-4 pt-8 border-t border-slate-200 dark:border-slate-800 no-print">
        <button 
          onClick={handleShare}
          className="bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-800/50 text-blue-800 dark:text-blue-300 px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
        >
          <Share2 className="mr-2 h-4 w-4" /> Share Itinerary
        </button>
        <button 
          onClick={() => window.print()}
          className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
        >
          <FileText className="mr-2 h-4 w-4" /> Print Itinerary
        </button>
      </div>
    </div>
  );
}; 