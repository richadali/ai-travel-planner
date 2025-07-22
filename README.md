# AI Travel Planner

An AI-powered travel planning application that generates personalized travel itineraries based on user preferences. Built with Next.js 15, TypeScript, Tailwind CSS, and Google Gemini AI.

[AI Travel Planner - aitravelplanner.richadali.dev](https://aitravelplanner.richadali.dev)

## Project Overview

AI Travel Planner is a modern web application that leverages artificial intelligence to create detailed travel itineraries tailored to user preferences. Users can input their destination, trip duration, number of travelers, and budget to receive a comprehensive day-by-day travel plan including activities, accommodations, dining recommendations, and budget allocation.

## Key Features

### Itinerary Generation

- **AI-Powered Planning**: Generates detailed travel itineraries using Google Gemini AI
- **Personalized Recommendations**: Tailors suggestions based on destination, duration, group size, and budget
- **Comprehensive Details**: Includes daily activities, accommodations, transportation options, and budget breakdown
- **Local Insights**: Provides recommendations for local cuisine, cultural experiences, and hidden gems

### User Experience

- **Responsive Design**: Optimized for all devices from mobile to desktop
- **Dark/Light Mode**: Supports user preference for theme with smooth transitions
- **Interactive Interface**: Clean, intuitive UI with modern design principles
- **Real-time Generation**: Visual feedback during itinerary creation process
- **Modern UI**: Glassmorphism effects, backdrop blur, and smooth animations

### Trip Management

- **Save Trips**: Store generated itineraries for future reference
- **Trip Dashboard**: View and manage all saved travel plans
- **PDF Export**: Download itineraries as PDF for offline access
- **Trip Sharing**: Share travel plans with friends and family via unique links

### User Authentication

- **Secure Login**: Google OAth Login
- **User Profiles**: Personalized dashboard for each user
- **Guest Access**: Generate itineraries without signing up
- **Data Persistence**: Seamlessly transition from guest to authenticated user

## Analytics System

The application includes a comprehensive analytics tracking system to monitor site usage and itinerary generations:

### Analytics Features

- **Page View Tracking**: Automatically tracks all page visits with referrer information
- **Itinerary Generation Tracking**: Records all travel plan generations with success/failure status
- **Performance Monitoring**: Tracks API response times for optimization
- **Daily Summaries**: Aggregates data into daily summaries for trend analysis
- **Top Destinations**: Identifies most popular travel destinations
- **Admin Dashboard**: Visual analytics dashboard with charts and filters

## Technical Architecture

### Frontend Architecture

- **Framework**: Next.js 15 with App Router for optimized routing and server components
- **Type Safety**: TypeScript for robust type checking and developer experience
- **Styling**: Tailwind CSS 4 for utility-first styling with custom theme configuration
- **Components**: Shadcn/ui component library for consistent design language
- **Forms**: React Hook Form with Zod validation for type-safe form handling
- **State Management**: React Context API and hooks for state management
- **Animations**: Framer Motion for smooth UI transitions and animations
- **UI Effects**: Glassmorphism, backdrop blur, and animated borders

### Backend Architecture

- **API Routes**: Next.js API routes for serverless function architecture
- **Database ORM**: Prisma for type-safe database operations
- **Database**: MySQL for relational data storage
- **Authentication**: NextAuth.js v5 for secure user authentication
- **AI Integration**: Google Gemini AI API for intelligent itinerary generation
- **PDF Generation**: Custom PDF generation service for downloadable itineraries
- **Caching**: Strategic caching for improved performance

### Data Models

- **Users**: User accounts and authentication data
- **Trips**: Saved travel itineraries with relationships to users
- **Itineraries**: Detailed day-by-day travel plans
- **Analytics**: Usage statistics and performance metrics
- **Sharing**: Trip sharing records with access controls

## Security Features

- **Authentication**: Secure user authentication with NextAuth.js v5
- **Authorization**: Role-based access control for admin features
- **Data Validation**: Comprehensive input validation using Zod
- **CSRF Protection**: Built-in protection against cross-site request forgery
- **Rate Limiting**: API rate limiting to prevent abuse
- **Secure Headers**: HTTP security headers for enhanced protection
- **Environment Variables**: Sensitive information stored in environment variables

## Project Structure

```
ai-travel-planner/
├── src/
│   ├── app/              # Next.js App Router pages and layouts
│   │   ├── api/          # API routes
│   │   ├── admin/        # Admin dashboard
│   │   ├── dashboard/    # User dashboard
│   │   └── trips/        # Trip viewing pages
│   ├── components/       # React components
│   │   ├── ui/           # UI components (Shadcn/ui)
│   │   └── ...           # Feature components
│   ├── lib/              # Utility functions and services
│   │   ├── database.ts   # Database operations
│   │   ├── gemini.ts     # AI integration
│   │   └── ...           # Other utilities
│   └── types/            # TypeScript type definitions
├── prisma/               # Prisma schema and migrations
│   ├── schema.prisma     # Database schema
│   └── migrations/       # Database migrations
├── public/               # Static assets
└── ...                   # Configuration files
```

## Tech Stack

### Frontend

- Next.js 15 (App Router)
- React 19
- TypeScript 5
- Tailwind CSS 4
- Shadcn/ui components
- React Hook Form with Zod validation
- Framer Motion
- Lucide React icons

### Backend

- Next.js API Routes
- Prisma ORM 6
- MySQL database
- Google Gemini AI
- NextAuth.js v5
- JWT authentication

### Development Tools

- ESLint 9
- TypeScript 5
- Prisma CLI
- Tailwind CSS 4

## Roadmap

Future enhancements planned for the AI Travel Planner:

- **Multi-language Support**: Expand to support multiple languages
- **Weather Integration**: Include weather forecasts in travel plans
- **Booking Integration**: Add direct booking links for accommodations and activities
- **Mobile App**: Develop companion mobile applications
- **Collaborative Planning**: Allow multiple users to collaborate on trip planning
- **AI Personalization**: More advanced personalization based on user preferences and past trips
- **Real-time Collaboration**: Live trip planning with multiple users
- **Advanced Analytics**: More detailed insights and reporting features

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

Developed by Richad Ali

## Support

For support or questions, please contact [richadali.dev](https://richadali.dev)
