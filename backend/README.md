# AI-Powered Voice Caller - Backend

This is the backend service for the AI-Powered Voice Caller application. It provides APIs for call management, AI conversation, and CRM integration.

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: Supabase (PostgreSQL)
- **Authentication**: JWT + Supabase Auth
- **AI Services**:
  - OpenAI (Conversation, Transcription)
  - ElevenLabs (Text-to-Speech)
- **Telephony**: Twilio
- **CRM**: Zoho CRM
- **Logging**: Winston
- **Validation**: express-validator

## Prerequisites

1. Node.js 18 or later
2. Supabase account
3. Twilio account
4. OpenAI API key
5. ElevenLabs API key
6. Zoho CRM account (optional)

## Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Variables**
   Copy `.env.example` to `.env` and fill in your credentials:
   ```bash
   cp .env.example .env
   ```

4. **Database Setup**
   - Create a new project in Supabase
   - Run the database migrations:
     ```bash
     npm run migrate
     ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port | No (default: 3000) |
| `NODE_ENV` | Environment (development/production) | Yes |
| `SUPABASE_URL` | Supabase project URL | Yes |
| `SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes |
| `JWT_SECRET` | Secret for JWT signing | Yes |
| `JWT_EXPIRES_IN` | JWT expiration time | No (default: '1h') |
| `TWILIO_ACCOUNT_SID` | Twilio Account SID | Yes |
| `TWILIO_AUTH_TOKEN` | Twilio Auth Token | Yes |
| `TWILIO_PHONE_NUMBER` | Twilio phone number | Yes |
| `OPENAI_API_KEY` | OpenAI API key | Yes |
| `ELEVENLABS_API_KEY` | ElevenLabs API key | Yes |
| `ELEVENLABS_VOICE_ID` | Default voice ID for ElevenLabs | No |
| `ZOHO_CLIENT_ID` | Zoho Client ID | No |
| `ZOHO_CLIENT_SECRET` | Zoho Client Secret | No |
| `ZOHO_REFRESH_TOKEN` | Zoho Refresh Token | No |
| `ZOHO_CRM_DOMAIN` | Zoho CRM domain | No (default: 'www.zohoapis.com') |

## API Documentation

API documentation is available at `/api-docs` when running in development mode.

## Available Scripts

- `npm start` - Start the production server
- `npm run dev` - Start the development server with hot-reload
- `npm test` - Run tests
- `npm run lint` - Lint code
- `npm run migrate` - Run database migrations

## Project Structure

```
backend/
├── src/
│   ├── config/           # Configuration files
│   ├── controllers/      # Route controllers
│   ├── middleware/       # Express middleware
│   ├── models/           # Database models
│   ├── routes/           # Route definitions
│   ├── services/         # Business logic and external services
│   ├── utils/            # Utility functions
│   ├── validators/       # Request validators
│   └── index.js          # Application entry point
├── migrations/           # Database migrations
└── scripts/              # Utility scripts
```

## Deployment

### Prerequisites
- Docker (for containerized deployment)
- Render.com account (or your preferred hosting)

### Steps

1. **Build the Docker image**
   ```bash
   docker build -t ai-voice-caller-backend .
   ```

2. **Run the container**
   ```bash
   docker run -d \
     --name ai-voice-caller-backend \
     -p 3000:3000 \
     --env-file .env \
     ai-voice-caller-backend
   ```

3. **Deploy to Render**
   - Connect your GitHub repository to Render
   - Create a new Web Service
   - Configure environment variables
   - Deploy

## License

MIT
