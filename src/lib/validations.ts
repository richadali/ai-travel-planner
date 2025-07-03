import { z } from "zod";

// List of common invalid inputs that should be rejected
const invalidDestinations = [
  "test", "hi", "hello", "asdf", "123", "none", "n/a", "na", "null", "undefined",
  "xyz", "abc", "foo", "bar", "baz", "qwerty", "example", "ok", "yes", "no",
  "random", "place", "city", "country", "destination", "location", "somewhere"
];

export const TripRequestSchema = z.object({
  destination: z.string()
    .min(2, "Destination must be at least 2 characters")
    .max(100, "Destination is too long")
    .refine(
      (value) => !invalidDestinations.includes(value.toLowerCase().trim()),
      {
        message: "Please enter a valid destination (city or country name)"
      }
    )
    .refine(
      (value) => /^[A-Za-z\s\-',\.]+$/.test(value),
      {
        message: "Destination should only contain letters, spaces, hyphens, apostrophes, commas and periods"
      }
    ),
  duration: z.coerce.number().int().min(1, "Minimum 1 day").max(30, "Maximum 30 days"),
  peopleCount: z.coerce.number().int().min(1, "Minimum 1 person").max(20, "Maximum 20 people"),
  budget: z.coerce.number().min(1, "Budget is required"),
  currency: z.string().default("INR"),
});

export type TripFormValues = z.infer<typeof TripRequestSchema>; 