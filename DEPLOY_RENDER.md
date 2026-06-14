# Deploy GriefBridge to Render

[Render](https://render.com) is a modern cloud platform that makes deploying Node.js applications simple and straightforward. This guide walks you through deploying GriefBridge with full production setup.

## Prerequisites

- GitHub account with GriefBridge repository pushed
- Render account (free tier available at [render.com](https://render.com))
- `GEMINI_API_KEY` from [Google AI Studio](https://aistudio.google.com/)
- (Optional) Firebase project for cloud data storage

## Architecture Overview

GriefBridge on Render runs as a single Web Service that serves:
- React frontend (compiled by Vite)
- Express backend (Node.js)
- API routes for journals, check-ins, forums, and resources
- Gemini AI sentiment analysis (server-side)

---

## Step-by-Step Deployment

### 1. Prepare Your Repository

Push all code to GitHub. Verify these files exist:
- ✅ `package.json` with build scripts
- ✅ `package-lock.json` for consistent dependencies
- ✅ `server.ts` (Express entry point)
- ✅ `.env.example` (for reference)
- ✅ `vite.config.ts` (frontend bundler config)
- ✅ `src/` directory with React components

```bash
git status
git push origin master
```

### 2. Create a Render Account

1. Go to [render.com](https://render.com)
2. Click **Sign Up**
3. Choose **GitHub** (recommended for easy repo access)
4. Authorize Render to access your GitHub account
5. Complete onboarding

### 3. Create a New Web Service

1. From Render dashboard, click **New +** (top-right)
2. Select **Web Service**
3. Find GriefBridge repository in the list
4. Click **Connect** next to it
5. If repository doesn't appear:
   - Click **Configure account**
   - Grant GitHub repository access permissions
   - Refresh and retry

### 4. Configure the Web Service

Fill in the following configuration:

**Basic Settings:**
- **Name:** `griefbridge` (or `griefbridge-prod`)
- **Environment:** `Node`
- **Region:** Select closest to your users:
  - `Oregon (us-west)` - US West Coast
  - `Ohio (us-east)` - US East Coast
  - `Frankfurt (eu-central)` - Europe
  - `Singapore (ap-south)` - Asia Pacific

**Git Settings:**
- **Branch:** `master` (or your deployment branch)
- **Auto-deploy:** Enable (auto-redeploy on git push)

**Build & Start Commands:**

Build Command:
```bash
npm install && npm run build
```

Start Command:
```bash
npm start
```

**Instance Type:**
- Free tier (default) - Adequate for testing
- Paid tier - Recommended for production (no sleep, better performance)

### 5. Configure Environment Variables

1. Scroll to **Environment** section
2. Click **Add Environment Variable** for each:

**Required Variables:**

| Key | Value | Notes |
|-----|-------|-------|
| `GEMINI_API_KEY` | Your API key from [aistudio.google.com](https://aistudio.google.com/) | Required for AI features |
| `NODE_ENV` | `production` | Performance optimizations |
| `APP_URL` | Get after first deploy | Update after deployment URL is assigned |

**Optional Firebase Variables:**

If using Firebase for persistent data:

| Key | Value |
|-----|-------|
| `FIREBASE_PROJECT_ID` | From Firebase Console |
| `FIREBASE_API_KEY` | Web API key |
| `FIREBASE_AUTH_DOMAIN` | `{projectId}.firebaseapp.com` |
| `FIREBASE_STORAGE_BUCKET` | `{projectId}.firebasestorage.app` |

3. After adding each variable, click **Save**

### 6. Deploy

1. Review all settings
2. Click **Create Web Service**
3. Render queues deployment
4. Monitor **Logs** tab for build progress
5. First build takes **3-5 minutes**

Expected output:
```
✓ Building application...
✓ Running: npm install
✓ Running: npm run build
✓ Starting server on port 3000...
✓ Application is live
```

### 7. Capture Your Deployment URL

After successful deployment:
1. Copy the generated URL (e.g., `https://griefbridge-abc123.onrender.com`)
2. Go back to **Environment**
3. Update `APP_URL` with this URL
4. Click **Save** - automatic redeploy occurs

### 8. Verify Deployment

1. Click the deployment URL to open your app
2. Test core functionality:
   - ✅ Landing page loads
   - ✅ Can create journal entry
   - ✅ Can add wellness check-in
   - ✅ Can view support resources
   - ✅ Forum loads community posts
3. Check browser console for errors
4. Check Render logs for backend errors

---

## Environment Variables Reference

### Required

**`GEMINI_API_KEY`**
- Get from [Google AI Studio](https://aistudio.google.com/)
- Click "Get API Key" → "Create API key in new project"
- Keep this secret - never commit to git

**`NODE_ENV`**
- Set to `production` for deployed instances
- Disables verbose logging
- Enables performance optimizations

**`APP_URL`**
- Your deployed application URL
- Used for email links, OAuth redirects, CORS
- Format: `https://griefbridge-<id>.onrender.com`

### Optional

**Firebase Credentials** (for cloud storage)
- `FIREBASE_PROJECT_ID`
- `FIREBASE_API_KEY`
- `FIREBASE_AUTH_DOMAIN`
- `FIREBASE_STORAGE_BUCKET`
- `FIREBASE_DATABASE_URL`

---

## Monitoring & Logs

### Real-Time Logs

1. From Web Service dashboard, click **Logs** tab
2. View streaming application output
3. Errors show in red text

### Common Log Messages

**Healthy startup:**
```
Starting server on port 3000...
Gemini Client successfully initialized
Application ready
```

**Errors to investigate:**
```
ENOENT: cannot find module 'xyz'     → Missing dependency
Error: GEMINI_API_KEY not set        → Missing env variable
Connection refused                   → Port or binding issue
```

### Application Metrics

1. Click **Metrics** tab to view:
   - CPU usage
   - Memory consumption
   - Request count
   - Response times
   - Error rates

---

## Auto-Deployment from Git

Render automatically redeploys when you push to the connected branch:

```bash
# Make changes locally
git add .
git commit -m "Add new feature"

# Push to GitHub
git push origin master

# Render detects push and automatically:
# 1. Builds the application
# 2. Runs tests (if configured)
# 3. Deploys to production
# 4. Health checks the deployment
```

**Deployment time:** 2-5 minutes

To disable auto-deploy:
1. Go to **Settings** → **Auto-Deploy**
2. Toggle **Off**
3. Manual deploys via **Deployments** tab

---

## Troubleshooting

### Build Fails

**Error: `npm ERR! code ENOENT`**
- Cause: Missing dependency
- Fix: Run `npm install` locally, commit `package-lock.json`, push

**Error: `Cannot find module 'xyz'`**
- Cause: Package not in `package.json`
- Fix: `npm install xyz`, commit, push

**Timeout during build**
- Cause: Build takes >15 minutes
- Fix: Upgrade to paid tier (higher time limits)

### Application Crashes

**Logs show: `Error: GEMINI_API_KEY not set`**
1. Go to **Environment**
2. Verify `GEMINI_API_KEY` exists
3. Click **Redeploy** in **Deployments** tab

**Port 3000 not binding**
1. Ensure `server.ts` listens on port 3000
2. Check for syntax errors: `npm run lint`
3. Local test: `npm run dev`

**Infinite redirect loop**
1. Verify `APP_URL` matches deployment URL
2. Check redirect URLs in sensitive operations
3. Clear browser cache and retry

### Performance Issues

**Slow initial requests**
- Free tier: Normal - instances sleep after 15 min inactivity
- Pro tier: Restart takes <5 seconds
- Solution: Upgrade to Pro plan

**High memory usage**
- Check for memory leaks in application
- Monitor via **Metrics** tab
- Restart instance from **Restart Instance** button

---

## Updating Your Deployment

### Deploy New Changes

```bash
# Local development
git add .
git commit -m "Your changes"
git push origin master
```

Render auto-detects and redeploys (2-5 minutes).

### Manual Redeploy

1. Go to **Deployments** tab
2. Click **Deploy latest commit** button
3. Follows build steps again

### Rollback to Previous Deploy

1. **Deployments** tab
2. Find previous successful deployment
3. Click **Redeploy** on that version

---

## Custom Domain (Optional)

### Add Your Own Domain

1. Register domain (GoDaddy, Namecheap, Route53, etc.)
2. In Render Web Service, go to **Settings**
3. Under **Custom Domain**, click **Add Custom Domain**
4. Enter your domain (e.g., `griefbridge.com`)
5. Copy the CNAME record provided
6. Add CNAME to your domain's DNS:
   - Login to domain registrar
   - Find DNS settings
   - Add CNAME: `your-domain.com` → Render's CNAME value
7. Wait 5-30 minutes for DNS propagation
8. Test: Visit `https://your-domain.com`

### SSL/TLS Certificate

- Automatically provisioned by Render
- Valid for up to 3 years
- Auto-renewal before expiration
- Redirects HTTP → HTTPS automatically

---

## Production Checklist

Before going live, verify:

- ✅ `GEMINI_API_KEY` is set and valid
- ✅ `APP_URL` points to correct deployment
- ✅ `NODE_ENV` set to `production`
- ✅ All features tested (journal, check-in, forum, resources)
- ✅ Error logs are empty
- ✅ Performance is acceptable
- ✅ Custom domain set up (if using)
- ✅ SSL/HTTPS working
- ✅ Firebase configured (if using persistence)

---

## Pricing & Limits

### Free Tier
- ✅ Unlimited projects
- ✅ Shared infrastructure
- ❌ Instance sleeps after 15 min inactivity
- ❌ Limited build time
- Cost: **$0/month**

### Pro Tier
- ✅ Always-on instances
- ✅ 500 build hours/month
- ✅ Priority support
- ✅ Private networking
- Cost: **$12/month** per service

### Upgrade Path

1. Go to **Settings** → **Plan**
2. Click **Upgrade to Pro**
3. Enter billing information
4. Service restarts (no downtime with paid plans)

---

## Important Notes

- **Sensitive Files**: Never commit `.env`, `firebase-applet-config.json`
- **Database**: Use Firebase Firestore for persistent data
- **Backups**: Configure Firebase backup policy
- **Rate Limiting**: Implement rate limits in Express for production
- **Monitoring**: Set up alerts for failed deployments

---

## Need Help?

- [Render Documentation](https://render.com/docs)
- [Node.js Deployment](https://render.com/docs/deploy-node-express-app)
- [Environment Variables](https://render.com/docs/configure-environment-variables)
- [GitHub Issues](https://github.com/Tanya-garg10/GriefBridge-The-Bereavement-Support-Navigator/issues)
- Render Support: support@render.com

---

## Next Steps

After deployment:
1. ✅ Test all features thoroughly
2. ✅ Set up custom domain (optional)
3. ✅ Configure Firebase for data persistence (optional)
4. ✅ Set up monitoring & alerts
5. ✅ Plan regular updates and maintenance
