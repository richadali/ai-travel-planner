# AI Travel Planner

An AI-powered travel planning application that generates personalized travel itineraries based on user preferences. Built with Next.js, TypeScript, Tailwind CSS, and Google Gemini AI.

## Features

- Generate detailed travel itineraries based on destination, duration, group size, and budget
- View daily activities, accommodations, transportation options, and budget breakdown
- Save and manage multiple travel plans
- Responsive design with dark/light mode support

## Analytics System

The application includes a comprehensive analytics tracking system to monitor site usage and itinerary generations:

### Features

- **Page View Tracking**: Automatically tracks all page visits with referrer information
- **Itinerary Generation Tracking**: Records all travel plan generations with success/failure status
- **Performance Monitoring**: Tracks API response times for optimization
- **Daily Summaries**: Aggregates data into daily summaries for trend analysis
- **Top Destinations**: Identifies most popular travel destinations
- **Admin Dashboard**: Visual analytics dashboard with charts and filters

### Implementation

The analytics system consists of:

1. **Database Schema**: Dedicated tables for page views, itinerary generations, and daily summaries
2. **Middleware**: Automatic page view tracking via Next.js middleware
3. **Service Layer**: `AnalyticsService` for tracking and retrieving analytics data
4. **API Integration**: Integrated with travel plan generation API
5. **Admin Dashboard**: Visual interface for viewing analytics data

### Admin Access

To access the analytics dashboard:

1. Navigate to `/admin/analytics`
2. For production environments, configure the `ADMIN_API_KEY` environment variable for secure access

### Privacy Considerations

- IP addresses are stored for unique visitor counting but can be anonymized
- User agents are stored for browser/device analytics
- No personally identifiable information is collected unless a user is logged in

## Tech Stack

### Frontend

- Next.js 14+ (App Router)
- TypeScript
- Tailwind CSS
- Shadcn/ui components
- React Hook Form with Zod validation

### Backend

- Next.js API Routes
- Prisma ORM
- MySQL database
- Google Gemini AI

### Deployment

- Docker & Docker Compose
- Nginx as reverse proxy

## Getting Started

### Prerequisites

- Node.js 18+
- MySQL database
- Google Gemini API key

### Environment Setup

1. Clone the repository:

```bash
git clone https://github.com/yourusername/ai-travel-planner.git
cd ai-travel-planner
```

2. Copy the example environment file and update it with your values:

```bash
cp .env.example .env
```

3. Update the `.env` file with your actual values:

   - Get a Gemini API key from [Google AI Studio](https://aistudio.google.com/)
   - Set up your database connection string
   - Generate a secure random string for NEXTAUTH_SECRET

4. Install dependencies:

```bash
npm install
```

4. Set up the database:

```bash
npx prisma migrate dev
```

5. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Docker Deployment

To deploy the application using Docker:

1. Make sure you have Docker and Docker Compose installed
2. Build and start the containers:

```bash
docker-compose up -d
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Production Deployment

For production deployment:

1. Update the `nginx.conf` file with your domain name
2. Set up SSL certificates
3. Deploy to your VPS using Docker Compose:

```bash
docker-compose -f docker-compose.yml up -d
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

Developed by Richad Ali
