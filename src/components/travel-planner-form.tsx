import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TripRequestSchema, TripFormValues } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { Plane, Calendar, Users, IndianRupee, Sparkles } from "lucide-react";

interface TravelPlannerFormProps {
  onSubmit: (data: TripFormValues) => void;
  isLoading?: boolean;
  className?: string;
}

export function TravelPlannerForm({
  onSubmit,
  isLoading = false,
  className,
}: TravelPlannerFormProps) {
  const form = useForm<TripFormValues>({
    resolver: zodResolver(TripRequestSchema) as any,
    defaultValues: {
      destination: "",
      duration: 7,
      peopleCount: 2,
      budget: 50000,
      currency: "INR",
    },
  });

  // Function to validate numeric input
  const handleNumericInput = (
    e: React.ChangeEvent<HTMLInputElement>,
    onChange: (...event: any[]) => void,
    maxValue?: number
  ) => {
    const value = e.target.value;
    
    // Allow empty input for better UX
    if (value === "") {
      onChange("");
      return;
    }
    
    // Only allow numbers
    if (/^\d+$/.test(value)) {
      const numValue = parseInt(value, 10);
      
      // Check if the value is within range if maxValue is provided
      if (maxValue && numValue > maxValue) {
        onChange(maxValue);
      } else {
        onChange(numValue);
      }
    }
  };

  return (
    <Card className={cn("w-full max-w-3xl mx-auto border-slate-200 dark:border-slate-700 shadow-lg overflow-hidden", className)}>
      <div className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-6">
        <h2 className="text-2xl font-bold">Plan Your Trip</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Enter your travel details and we'll create a personalized itinerary for you.
        </p>
      </div>
      <CardContent className="p-6">
        <Form {...form}>
          <form 
            onSubmit={form.handleSubmit((data) => onSubmit(data as TripFormValues))} 
            className="space-y-6"
          >
            <FormField
              control={form.control as any}
              name="destination"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Plane className="h-4 w-4" /> Destination
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g. Guwahati, Mumbai, Paris" 
                      {...field} 
                      className="focus-visible:ring-slate-400 dark:focus-visible:ring-slate-600"
                    />
                  </FormControl>
                  <FormDescription>
                    Enter the city or country you want to visit.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control as any}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" /> Duration (days)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        inputMode="numeric"
                        placeholder="7"
                        value={field.value}
                        onChange={(e) => handleNumericInput(e, field.onChange, 30)}
                        className="focus-visible:ring-slate-400 dark:focus-visible:ring-slate-600"
                      />
                    </FormControl>
                    <FormDescription>
                      How many days? (1-30)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control as any}
                name="peopleCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Users className="h-4 w-4" /> Number of People
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        inputMode="numeric"
                        placeholder="2"
                        value={field.value}
                        onChange={(e) => handleNumericInput(e, field.onChange, 20)}
                        className="focus-visible:ring-slate-400 dark:focus-visible:ring-slate-600"
                      />
                    </FormControl>
                    <FormDescription>
                      How many travelers? (1-20)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control as any}
              name="budget"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <IndianRupee className="h-4 w-4" /> Budget (INR)
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      inputMode="numeric"
                      placeholder="50000"
                      value={field.value}
                      onChange={(e) => handleNumericInput(e, field.onChange)}
                      className="focus-visible:ring-slate-400 dark:focus-visible:ring-slate-600"
                    />
                  </FormControl>
                  <FormDescription>
                    What's your total budget for this trip? (in INR)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-2 rounded-md transition-all duration-200"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Generate Travel Plan
                </span>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
} 