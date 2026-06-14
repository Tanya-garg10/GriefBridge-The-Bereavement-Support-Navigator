# GriefBridge — Bereavement Support Navigator

GriefBridge is a compassionate support dashboard for people navigating loss, relationship endings, job disruption, and other transition grief. It brings together journaling, wellness check-ins, peer discussion, support resources, and guided breathing tools in one React + Express application.

## Key features

- Onboarding and profile setup for grief or life transition journeys
- Dashboard with AI-powered insights and mood tracking
- Journal creation, analysis, and deletion
- Wellness check-ins for mood, sleep, and activity
- Community forum with anonymous sharing and replies
- Geolocated support resources and local help listings
- Guided breathing exercise for stress relief
- Profile editing and personalized recommendations

## Tech stack

- React + TypeScript frontend
- Vite development tooling
- Express backend server
- Google Gemini AI integration for insights
- Tailwind CSS styling support
- Firebase client packages included for future data connectors

## Local setup

1. Install dependencies:
   `npm install`

2. Create a local environment file:
   `copy .env.example .env`

3. Open `.env` and set your values.
   - `GEMINI_API_KEY` is optional but required for server-side AI insights.

4. Start the app locally:
   `npm run dev`

5. Open the app in your browser:
   `http://localhost:3000`

## Build and run production

1. Build the frontend and backend:
   `npm run build`
2. Start the production server:
   `npm start`

## Notes

- The server uses `dotenv` and reads `.env` automatically.
- If `GEMINI_API_KEY` is not provided, AI features will remain disabled and the app should still run with local fallback data.
- The repository includes starter support data for resources, posts, journals, and check-ins.

## Repository

This code is the GriefBridge app that was pushed to the remote repository at:

`https://github.com/Tanya-garg10/GriefBridge-The-Bereavement-Support-Navigator.git`
