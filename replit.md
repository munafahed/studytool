# StudyMune - Academic Excellence Platform

## Overview
StudyMune is a Next.js application that provides an all-in-one platform for academic excellence. It includes various AI-powered tools for students including:
- AI Detector
- Audio Summary
- Citation Generator
- Essay Generator
- Flashcard Generator
- GPA Calculator
- Language Tools
- And more

## Recent Changes

### October 18, 2025
- **Question Generator Interactive Answers**: Major UX enhancement for question generator
  - Restructured AI flow to return questions with separate answers and options
  - Added interactive Show/Hide answer buttons for each question
  - Bulk Show All/Hide All Answers functionality
  - Improved layout for MCQ questions - options displayed in responsive grid (2 columns on desktop)
  - True/False questions now display options horizontally side-by-side
  - Visual highlighting of correct answers with green accent when revealed
  - Answer panel shows both letter and full option text for MCQ questions
  - Enhanced copy-to-clipboard to include formatted questions, options, and answers
- **PDF Reading Fix**: Fixed PDF.js worker configuration to use local module instead of external CDN for better reliability

### October 16, 2025
- **Vercel to Replit Migration**: Successfully migrated the project from Vercel to Replit
- **Port Configuration**: Updated dev and start scripts to bind to 0.0.0.0:5000 (required for Replit)
- **Environment Variables**: Configured Firebase and Google Genkit AI to use environment variables for secure configuration
- **Deployment Setup**: Configured autoscale deployment with proper build and start commands
- **Quiz Generator Removal**: Removed Quiz Generator tool completely from the platform
- **Question Generator Enhancement**: Upgraded Question Generator to accept file uploads (txt, md, doc, docx, pdf)
- **Question Types**: Added support for multiple question types (MCQ, True/False, Short Answer, Essay, Mixed)
- **Smart Question Count**: Automatic suggestion of question count based on file/text size (1 question per ~100 words)
- **Universal File Support**: Added comprehensive file reading support across all tools
  - PDF extraction using pdfjs-dist
  - Word (.docx) extraction using mammoth
  - Image OCR using tesseract.js (Arabic + English)
  - Text files (.txt, .md) support
  - Enhanced error handling with user-friendly messages
  - Applied to Question Generator and AI Detector tools
- **Password Reset Feature**: Added "Forgot Password" functionality
  - Password reset link on login page
  - Dedicated forgot-password page with email verification
  - Firebase password reset email integration
  - Clear error messages and success notifications
  - Easy navigation back to login page

## Technology Stack
- **Framework**: Next.js 15.3.3 with Turbopack
- **UI Library**: React 18 with Radix UI components
- **Styling**: Tailwind CSS with custom theme support
- **Authentication**: Firebase Auth
- **Database**: Firebase Firestore
- **AI Integration**: Google Genkit AI (Gemini 2.5 Flash)
- **Animations**: Framer Motion, TSParticles

## Environment Variables Required

### Firebase Configuration (Client-side)
- `NEXT_PUBLIC_FIREBASE_API_KEY` - Firebase API key
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` - Firebase auth domain
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID` - Firebase project ID
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` - Firebase storage bucket
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` - Firebase messaging sender ID
- `NEXT_PUBLIC_FIREBASE_APP_ID` - Firebase app ID

### Google Genkit AI Configuration
- `GOOGLE_API_KEY` - Google Generative AI API key (for Gemini)
- `GOOGLE_GENAI_API_KEY` - Alternative key name (fallback)

## Development

### Running Locally
```bash
npm run dev
```
The app will be available at http://localhost:5000

### Building for Production
```bash
npm run build
npm run start
```

### Other Scripts
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking
- `npm run genkit:dev` - Start Genkit development server

## Deployment
The project is configured for Replit autoscale deployment:
- **Build Command**: `npm run build`
- **Start Command**: `npm run start`
- **Port**: 5000 (bound to 0.0.0.0)

## Known Issues
- TSParticles has a version compatibility warning (doesn't affect functionality)
- Cross-origin request warnings in development (expected in Replit environment)
- Some LSP diagnostics in Firebase and TSParticles files (false positives, app runs correctly)

## Project Structure
```
├── src/
│   ├── ai/              # Genkit AI flows and configuration
│   ├── app/             # Next.js app directory (pages and layouts)
│   ├── components/      # React components
│   │   ├── layout/      # Header, Footer, Sidebar
│   │   ├── tools/       # Tool-specific forms
│   │   └── ui/          # Reusable UI components (Radix)
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utility functions
│   └── firebase.ts      # Firebase configuration and hooks
├── public/              # Static assets
└── docs/                # Documentation
```

## Security Best Practices
- All API keys and sensitive configuration stored in environment variables
- Client/server separation maintained
- Firebase configuration uses NEXT_PUBLIC_ prefix for client-side access
- Server-side API keys (GOOGLE_GENAI_API_KEY) kept private
