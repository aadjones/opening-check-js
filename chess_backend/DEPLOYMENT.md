# Backend Deployment Guide - Railway

This guide walks you through deploying the Chess Analysis Backend to Railway.

## Prerequisites

1. Railway account (sign up at [railway.app](https://railway.app))
2. GitHub repository with your code
3. Supabase project with environment variables ready

## Environment Variables

Set these environment variables in your Railway project:

### Required Environment Variables

```bash
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# JWT Configuration
JWT_SECRET=your_jwt_secret_key

# CORS Configuration (set to your frontend URL)
ALLOWED_ORIGINS=https://your-frontend-domain.vercel.app,http://localhost:3000,http://localhost:5173
```

### Optional Environment Variables

```bash
# Python Configuration
PYTHONPATH=/app
PYTHONUNBUFFERED=1

# Logging
LOG_LEVEL=INFO
```

## Deployment Steps

### Option 1: Deploy from GitHub (Recommended)

1. **Connect Railway to GitHub:**
   - Go to [railway.app](https://railway.app)
   - Click "Start a New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

2. **Configure Build Settings:**
   - Railway should auto-detect the Python project
   - Root directory: `chess_backend`
   - Build command: `pip install -r requirements.txt`
   - Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

3. **Set Environment Variables:**
   - Go to your project dashboard
   - Click on "Variables" tab
   - Add all the required environment variables listed above

4. **Deploy:**
   - Click "Deploy" or push to your main branch
   - Railway will automatically build and deploy your application

### Option 2: Deploy with Railway CLI

1. **Install Railway CLI:**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login to Railway:**
   ```bash
   railway login
   ```

3. **Initialize project:**
   ```bash
   cd chess_backend
   railway init
   ```

4. **Set environment variables:**
   ```bash
   railway variables set SUPABASE_URL=your_supabase_url
   railway variables set SUPABASE_ANON_KEY=your_anon_key
   railway variables set SUPABASE_SERVICE_ROLE_KEY=your_service_key
   railway variables set JWT_SECRET=your_jwt_secret
   railway variables set ALLOWED_ORIGINS=https://your-frontend.vercel.app
   ```

5. **Deploy:**
   ```bash
   railway up
   ```

## Verification

After deployment, verify your backend is working:

1. **Health Check:**
   ```bash
   curl https://your-app.railway.app/health
   ```
   Should return: `{"status": "healthy"}`

2. **Root Endpoint:**
   ```bash
   curl https://your-app.railway.app/
   ```
   Should return: `{"message": "Hello from the Chess Backend!"}`

## Custom Domain (Optional)

1. Go to your Railway project dashboard
2. Click on "Settings" tab
3. Scroll to "Domains" section
4. Add your custom domain
5. Update your frontend configuration to use the new domain

## Monitoring and Logs

- **View Logs:** Railway dashboard → "Deployments" tab → Click on deployment
- **Metrics:** Available in the Railway dashboard
- **Health Checks:** Configured to check `/health` endpoint

## Troubleshooting

### Common Issues:

1. **Build Failures:**
   - Check that `requirements.txt` is in the root of `chess_backend`
   - Verify Python version compatibility

2. **Runtime Errors:**
   - Check environment variables are set correctly
   - Review logs in Railway dashboard
   - Verify Supabase connection

3. **CORS Issues:**
   - Ensure `ALLOWED_ORIGINS` includes your frontend domain
   - Check that frontend is making requests to correct backend URL

### Support

- Railway Documentation: [docs.railway.app](https://docs.railway.app)
- Railway Discord: [discord.gg/railway](https://discord.gg/railway)

## Security Notes

- Never commit environment variables to version control
- Use Railway's environment variable management
- Regularly rotate JWT secrets and API keys
- Monitor logs for suspicious activity 