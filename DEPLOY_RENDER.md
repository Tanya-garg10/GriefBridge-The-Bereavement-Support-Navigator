# Deploy GriefBridge to Render

[Render](https://render.com) is a modern cloud platform that makes deploying Node.js applications simple and straightforward. Follow these steps to deploy GriefBridge to Render.

## Prerequisites

- GitHub account with GriefBridge repository
- Render account (free tier available)
- `GEMINI_API_KEY` from Google AI Studio

## Step-by-Step Deployment

### 1. Prepare Your Repository

Ensure your repository is pushed to GitHub with all necessary files:
- `package.json`
- `package-lock.json`
- `server.ts`
- `.env.example`
- Build output will be generated during deployment

### 2. Create a Render Account

1. Visit [render.com](https://render.com)
2. Sign up with GitHub (easiest option) or email
3. Connect your GitHub account for repository access

### 3. Create a New Web Service

1. Click **New +** in the Render dashboard
2. Select **Web Service**
3. Click **Connect** next to your GriefBridge repository
4. If not visible, click **Configure account** to grant GitHub permissions

### 4. Configure the Web Service

**Name:** `griefbridge` (or your preferred name)

**Environment:** Node

**Region:** Select closest to your users (e.g., `usw` for US West)

**Branch:** `master` (or your deployment branch)

**Build Command:**
```bash
npm install && npm run build
```

**Start Command:**
```bash
npm start
```

### 5. Add Environment Variables

1. Scroll down to **Environment** section
2. Click **Add Environment Variable**
3. Add the following variables:

| Variable | Value |
|----------|-------|
| `GEMINI_API_KEY` | Your Google Gemini API key |
| `APP_URL` | `https://griefbridge-<random>.onrender.com` (after first deploy) |
| `NODE_ENV` | `production` |

### 6. Deploy

1. Click **Create Web Service**
2. Render will build and deploy your application
3. Initial deployment takes 3-5 minutes
4. You'll receive a unique URL like `https://griefbridge-<random>.onrender.com`

### 7. Monitor Your Deployment

- View logs in the **Logs** tab
- Check deployment status in **Events**
- Access your application at the generated URL

## Troubleshooting

### Build Fails

Check the build logs for errors. Common issues:
- Missing `GEMINI_API_KEY` - add it in Environment variables
- Node version mismatch - Render uses Node 18+

### Application Crashes After Deploy

1. Check the application logs
2. Verify all environment variables are set
3. Ensure `package.json` has correct scripts

### Cold Starts

Render's free tier instances sleep after 15 minutes of inactivity. Your application will start automatically when accessed, but may take 30 seconds to restart.

## Updating Your Deployment

Render automatically redeploys when you push to your connected GitHub branch. Simply commit and push changes:

```bash
git add .
git commit -m "Your changes"
git push origin master
```

Deployment will start automatically and take 3-5 minutes.

## Custom Domain (Optional)

1. In the Web Service dashboard, go to **Settings**
2. Under **Custom Domain**, click **Add Custom Domain**
3. Follow Render's DNS configuration instructions
4. Point your domain to Render's nameservers

## Important Notes

- **Free Tier Limitations**: Instance sleeps after 15 minutes of inactivity
- **Upgrade to Pro**: For always-on service, upgrade your plan in Settings
- **Database**: For persistent data, configure Firebase Firestore separately
- **SSL/TLS**: Automatically provided by Render

## Need Help?

- [Render Documentation](https://render.com/docs)
- [Node.js on Render](https://render.com/docs/deploy-node-express-app)
- GitHub Issues in the GriefBridge repository
