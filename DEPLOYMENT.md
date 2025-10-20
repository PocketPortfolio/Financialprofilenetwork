# Pocket Portfolio - Deployment Guide

## Local Development

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Vercel CLI (optional, for preview deployments)

### Setup

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd pocket-portfolio-app
   npm install
   ```

2. **Environment Configuration**
   ```bash
   cp env.example .env.local
   ```
   
   Edit `.env.local` with your Firebase credentials:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key_here
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

3. **Run Development Server**
   ```bash
   npm run dev
   ```
   
   The app will be available at `http://localhost:3001`

### Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Type check
npm run type-check
```

## Vercel Deployment

### Prerequisites
- Vercel account
- Vercel CLI installed (`npm i -g vercel`)

### Deployment Steps

1. **Login to Vercel**
   ```bash
   vercel login
   ```

2. **Link Project**
   ```bash
   vercel link
   ```

3. **Set Environment Variables**
   ```bash
   vercel env add NEXT_PUBLIC_FIREBASE_API_KEY
   vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
   vercel env add NEXT_PUBLIC_FIREBASE_PROJECT_ID
   vercel env add NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
   vercel env add NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
   vercel env add NEXT_PUBLIC_FIREBASE_APP_ID
   ```

4. **Deploy**
   
   **Development/Preview:**
   ```bash
   vercel dev
   ```
   
   **Production:**
   ```bash
   vercel --prod
   ```

### Vercel CLI Commands

```bash
# Run local development with Vercel
vercel dev

# Deploy to preview environment
vercel

# Deploy to production
vercel --prod

# Check deployment status
vercel ls

# View logs
vercel logs
```

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase API key | `AIzaSy...` |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase auth domain | `myapp.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID | `myapp-12345` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket | `myapp.appspot.com` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID | `123456789` |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase app ID | `1:123456789:web:abc123` |

### Setting Variables in Vercel

**Via CLI:**
```bash
vercel env add VARIABLE_NAME
```

**Via Dashboard:**
1. Go to your project in Vercel dashboard
2. Navigate to Settings > Environment Variables
3. Add each variable for Production, Preview, and Development

## Firebase Setup

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Authentication (Google provider)
4. Enable Firestore Database

### 2. Get Configuration
1. Go to Project Settings > General
2. Scroll to "Your apps" section
3. Add a web app
4. Copy the configuration object

### 3. Security Rules

**Firestore Rules:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Trades are user-specific
    match /trades/{tradeId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
  }
}
```

## Troubleshooting

### Common Issues

1. **API Routes Not Working**
   - Check that API routes are in `app/api/` directory
   - Verify Vercel configuration in `vercel.json`

2. **Firebase Authentication Issues**
   - Ensure all environment variables are set
   - Check Firebase project configuration
   - Verify authorized domains in Firebase console

3. **Build Failures**
   - Check for TypeScript errors: `npm run type-check`
   - Verify all dependencies are installed
   - Check for environment variable issues

4. **Port Conflicts**
   - Default Next.js port is 3000
   - Our app runs on 3001 to avoid conflicts
   - Use `npm run dev -- -p 3001` to specify port

### Development vs Production

| Feature | Development | Production |
|---------|-------------|------------|
| API Endpoints | Mock data | Real data sources |
| Authentication | Mock auth | Firebase auth |
| Data Persistence | Local state | Firestore |
| Error Handling | Detailed logs | User-friendly messages |
| Performance | Development mode | Optimized build |

## Performance Optimization

### Build Optimization
- Next.js automatically optimizes images and fonts
- API routes have 30-second timeout limit
- Static assets are served from CDN

### Monitoring
- Use Vercel Analytics for performance monitoring
- Check Vercel dashboard for deployment status
- Monitor API usage and errors

## Security Considerations

1. **Environment Variables**
   - Never commit `.env.local` to version control
   - Use Vercel's environment variable system for production

2. **Firebase Security**
   - Implement proper Firestore security rules
   - Use Firebase Auth for user management
   - Validate all user inputs

3. **API Security**
   - Implement rate limiting
   - Validate all API inputs
   - Use HTTPS in production
