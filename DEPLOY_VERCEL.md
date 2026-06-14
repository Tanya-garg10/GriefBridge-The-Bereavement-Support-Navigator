# Deploy GriefBridge to Vercel

[Vercel](https://vercel.com) is a frontend-focused platform that also supports Node.js backend applications. Follow these steps to deploy GriefBridge to Vercel.

## Prerequisites

- GitHub account with GriefBridge repository
- Vercel account (free tier available)
- `GEMINI_API_KEY` from Google AI Studio

## Step-by-Step Deployment

### 1. Prepare Your Repository

Ensure your repository is pushed to GitHub with all files:
- `package.json`
- `package-lock.json`
- `server.ts`
- `.env.example`
- `vite.config.ts`

### 2. Create a Vercel Account

1. Visit [vercel.com](https://vercel.com)
2. Sign up with GitHub (recommended)
3. Click **Continue with GitHub** and authorize Vercel

### 3. Import Project

1. Click **Add New...** → **Project**
2. Click **Import Git Repository**
3. Find and select the GriefBridge repository
4. Click **Import**

### 4. Configure Project

**Project Name:** `griefbridge`

**Framework Preset:** Node.js

**Root Directory:** `./` (default)

### 5. Set Build and Output Settings

Vercel will auto-detect, but verify these settings:

**Build Command:**
```bash
npm run build
```

**Output Directory:** `dist`

**Install Command:**
```bash
npm install
```

### 6. Add Environment Variables

1. Under **Environment Variables**, add:

| Name | Value |
|------|-------|
| `GEMINI_API_KEY` | Your Google Gemini API key |
| `APP_URL` | `https://griefbridge-<user>.vercel.app` |
| `NODE_ENV` | `production` |

2. Click **Add** for each variable
3. Select which environments to apply to (Production, Preview, Development)

### 7. Deploy

1. Click **Deploy**
2. Vercel will build and deploy your application
3. Deployment typically takes 2-3 minutes
4. You'll get a unique URL like `https://griefbridge-<user>.vercel.app`

### 8. Monitor Your Deployment

- View deployment logs in the **Deployments** tab
- Check function logs in **Functions**
- Monitor performance in **Analytics**

## Troubleshooting

### Build Fails

Common issues:
- **Timeout**: Vercel has a 10-minute build limit
- **Missing dependencies**: Run `npm install` locally and commit `package-lock.json`
- **Environment variables**: Verify all secrets are added in Vercel dashboard

Check the build log for specific error messages.

### Application Won't Start

1. Verify the start command in `package.json`:
   ```json
   "scripts": {
     "start": "node dist/server.cjs"
   }
   ```

2. Check function logs for errors:
   - Go to **Deployments** → **Logs**
   - Look for runtime errors

### Axios/Network Issues

Ensure your API calls use absolute URLs:
```javascript
const baseUrl = process.env.APP_URL || 'http://localhost:3000';
const response = await fetch(`${baseUrl}/api/endpoint`);
```

## Production Deployment URL

After initial deployment, update your environment variables:

1. Go to **Settings** → **Environment Variables**
2. Update `APP_URL` to your Vercel URL
3. Redeploy by pushing a change or clicking **Redeploy** button

## Custom Domain (Optional)

1. Go to **Settings** → **Domains**
2. Click **Add**
3. Enter your domain (e.g., `griefbridge.com`)
4. Follow DNS setup instructions
5. Update `APP_URL` environment variable to use your custom domain

## Auto-Deployment from Git

By default, Vercel automatically deploys when you push to your connected branch. Any push triggers a new deployment:

```bash
git add .
git commit -m "Your changes"
git push origin master
```

## Production Tips

### Disable Preview Deployments (Optional)

1. Go to **Settings** → **Git**
2. Under **Preview Deployments**, select **None**
3. Only production branch will deploy

### Set Up GitHub Checks

1. Go to **Settings** → **Git**
2. Enable **GitHub Checks** for branch protection
3. Deployment must succeed before merging PRs

### Monitor Performance

1. Go to **Analytics** for performance insights
2. Track Core Web Vitals
3. Review function execution times

## Important Notes

- **Cold Starts**: First request may take 10-30 seconds (normal for serverless)
- **Serverless Functions**: Your Express server runs as Vercel Functions
- **Storage**: Use Firebase Firestore for persistent data
- **Custom Server**: Vercel automatically detects and deploys Express servers

## Connecting to Firebase (Optional)

To enable persistent data storage:

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Get your Firebase config
3. Add Firebase credentials as Vercel environment variables
4. Update your code to connect to Firebase

## Cost Considerations

- **Free Tier**: Up to 100 Serverless Function Executions per day
- **Pro Plan**: $20/month for higher limits
- **PostgreSQL**: Optional add-on for database needs

## Need Help?

- [Vercel Documentation](https://vercel.com/docs)
- [Node.js Runtime](https://vercel.com/docs/functions/runtimes/node-js)
- [Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- GitHub Issues in the GriefBridge repository

## Quick Comparison: Render vs Vercel

| Feature | Render | Vercel |
|---------|--------|--------|
| **Free Tier** | Yes (with sleep) | Yes (limited executions) |
| **Always-On** | Pro plan required | Pro plan ($20/month) |
| **Cold Starts** | Long (15 min wake) | Short (improved) |
| **Custom Domain** | Built-in | Built-in |
| **Git Integration** | Excellent | Excellent |
| **Best For** | Full-stack apps | Frontend + backend |
