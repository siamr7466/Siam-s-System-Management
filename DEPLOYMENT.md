# Vercel Deployment Guide for SIAM Management

## ✅ Prerequisites
- GitHub account
- Vercel account (free tier works)
- Your code pushed to a GitHub repository

## 📋 Step-by-Step Deployment

### 1. Push Your Code to GitHub
```bash
git init
git add .
git commit -m "Initial commit - SIAM Management System"
git branch -M main
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

### 2. Deploy to Vercel

#### Option A: Using Vercel Dashboard (Recommended)
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure your project:
   - **Framework Preset**: Next.js
   - **Root Directory**: ./
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

#### Option B: Using Vercel CLI
```bash
npm i -g vercel
vercel login
vercel
```

### 3. Configure Environment Variables

In Vercel Dashboard → Your Project → Settings → Environment Variables, add:

```
DATABASE_URL=your_supabase_postgres_url
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your_secret_key_here
GOOGLE_CLIENT_ID=your_google_client_id (if using Google Auth)
GOOGLE_CLIENT_SECRET=your_google_client_secret (if using Google Auth)
```

**Important Notes:**
- `NEXTAUTH_URL` should be your Vercel deployment URL
- Generate `NEXTAUTH_SECRET` using: `openssl rand -base64 32`
- Make sure your DATABASE_URL is accessible from the internet

### 4. Database Setup
Your Supabase database is already configured. Just ensure:
- The connection string in Vercel matches your `.env`
- Prisma schema is up to date
- Run migrations if needed (Vercel will run `prisma generate` automatically)

### 5. Deploy!
- Vercel will automatically deploy on every push to `main`
- First deployment takes 2-3 minutes
- You'll get a URL like: `https://siam-management.vercel.app`

## 🔧 Post-Deployment

### Update NextAuth Callback URLs
Add your Vercel URL to your OAuth providers:
- Google Console: Add `https://your-app.vercel.app/api/auth/callback/google`
- Update `NEXTAUTH_URL` in Vercel environment variables

### Test Your Deployment
1. Visit your Vercel URL
2. Test login functionality
3. Verify database connections
4. Check all pages load correctly

## 🚀 Automatic Deployments
- **Production**: Pushes to `main` branch
- **Preview**: Pull requests get preview URLs
- **Rollback**: Easy rollback in Vercel dashboard

## 📊 Monitoring
- View logs in Vercel Dashboard → Your Project → Deployments
- Monitor performance and errors
- Set up alerts for failed deployments

## ⚠️ Common Issues

### Build Fails
- Check environment variables are set
- Verify DATABASE_URL is accessible
- Review build logs in Vercel

### Database Connection Issues
- Ensure Supabase allows connections from Vercel IPs
- Check connection pooling settings
- Verify SSL mode in connection string

### Authentication Issues
- Update NEXTAUTH_URL to your Vercel domain
- Regenerate NEXTAUTH_SECRET if needed
- Update OAuth callback URLs

## 🎉 Success!
Your SIAM Management System is now live on Vercel!

---

**Need Help?**
- Vercel Docs: https://vercel.com/docs
- Next.js Deployment: https://nextjs.org/docs/deployment
