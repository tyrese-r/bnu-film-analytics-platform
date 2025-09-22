# BNU Film Analytics Platform - Server

A backend API for a film analytics platform that allows users to discover movies, create reviews, and manage their saved movies. The platform integrates with OMDB and YouTube APIs to provide movie information, reviews, ratings and trailers.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Testing**: Vitest
- **External APIs**: OMDB API, YouTube Data API

## Installation

```bash
npm install
```

## Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env` file in the root directory
4. Configure environment variables (see Environment Variables section)
5. Set up Supabase (see Supabase Setup section)
6. Run the development server: `npm run dev`

## Environment Variables

Create a `.env` file with the following variables:

```env
PORT=3000
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
OMDB_API_KEY=your_omdb_api_key
YOUTUBE_API_KEY=your_youtube_api_key
```

## API Keys Setup

### OMDB API Key
1. Visit [OMDB API](http://www.omdbapi.com/apikey.aspx)
2. Sign up for a free account
3. Choose the free tier (1,000 requests/day)
4. Copy your API key to the `OMDB_API_KEY` variable

### YouTube Data API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the YouTube Data API v3
4. Go to "Credentials" and create an API key
5. Copy your API key to the `YOUTUBE_API_KEY` variable

**Note**: 
- **OMDB API key is required** for movie search functionality
- **YouTube API key is optional** - needed for trailer search but not essential (app works without it)

## Supabase Setup

1. Create a new project on [Supabase](https://supabase.com)
2. Navigate to the SQL Editor in your Supabase dashboard
3. Copy and paste the SQL commands from the `SQL` documentation to create the necessary tables
4. Enable Row Level Security (RLS) on all tables - **Required for data security**
5. **Important**: Disable email confirmation in Authentication settings (Settings > Auth > Email confirmation)
6. Copy your project URL and anon key to the `.env` file

For detailed database setup instructions, refer to the SQL documentation in the project.

## API Endpoints

### Authentication

- `POST /api/v1/auth/signup` - Create new user account
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/auth/me` - Get current user
- `POST /api/v1/auth/logout` - User logout

### Movies

- `GET /api/v1/movies` - Get all movies
- `GET /api/v1/movies/:id` - Get movie by ID
- `POST /api/v1/movies` - Create new movie (authenticated)
- `GET /api/v1/movies/search/omdb` - Search movies on OMDB
- `GET /api/v1/movies/:id/reviews` - Get reviews for a movie

### Reviews

- `GET /api/v1/reviews` - Get all reviews
- `GET /api/v1/reviews/my` - Get current user's reviews (authenticated)
- `POST /api/v1/reviews` - Create new review (authenticated)
- `GET /api/v1/reviews/:id` - Get review by ID
- `PUT /api/v1/reviews/:id` - Update review (authenticated)
- `DELETE /api/v1/reviews/:id` - Delete review (authenticated)

### Saved Movies

- `GET /api/v1/saved-movies` - Get user's saved movies (authenticated)
- `POST /api/v1/saved-movies` - Save a movie (authenticated)
- `DELETE /api/v1/saved-movies/:id` - Remove saved movie (authenticated)

### Health

- `GET /api/v1/health` - Health check endpoint

## Development

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm test         # Run tests
npm run test:watch # Run tests in watch mode
```

## Testing

Run the test suite to ensure everything is working correctly:

```bash
npm test
```

The project uses **Vitest** for testing with a fast, modern testing framework.

## Project Structure

```
src/
├── config/          # Configuration files
├── handlers/        # Route handlers
├── lib/            # Utility libraries
├── middleware/     # Express middleware
├── routes/         # Route definitions
├── services/       # External API services
├── types/          # TypeScript type definitions
└── validators/     # Request validation

Files with .spec.ts are unit tests located alongside the functions they test.
```
