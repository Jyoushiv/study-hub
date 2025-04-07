# GitHub Upload and Deployment Guide

This guide will walk you through the process of uploading your Productivity Hub project to GitHub and deploying it on Vercel.

## Uploading to GitHub

1. **Create a GitHub Repository**
   - Go to [GitHub](https://github.com) and sign in to your account
   - Click the "+" icon in the top-right corner and select "New repository"
   - Name your repository (e.g., "productivity-hub")
   - Choose whether to make it public or private
   - Click "Create repository"

2. **Initialize Git in Your Project (if not already done)**
   ```bash
   cd productivity-hub
   git init
   ```

3. **Add Your Files to Git**
   ```bash
   git add .
   ```

4. **Commit Your Changes**
   ```bash
   git commit -m "Initial commit"
   ```

5. **Add the Remote Repository**
   ```bash
   git remote add origin https://github.com/yourusername/productivity-hub.git
   ```

6. **Push Your Code to GitHub**
   ```bash
   git push -u origin main
   ```
   Note: If your default branch is named "master" instead of "main", use that instead.

## Deploying to Vercel

### Method 1: Deploy from GitHub

1. **Sign in to Vercel**
   - Go to [Vercel](https://vercel.com) and sign in with your GitHub account

2. **Import Your Repository**
   - Click "Add New..." and select "Project"
   - Select your GitHub repository from the list
   - Vercel will automatically detect that it's a Next.js project

3. **Configure Project Settings**
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: pnpm build (or npm build)
   - Output Directory: .next

4. **Deploy**
   - Click "Deploy" and wait for the build to complete
   - Vercel will provide you with a URL to access your application

### Method 2: Deploy from Command Line

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy the Project**
   ```bash
   vercel
   ```

4. **Follow the Prompts**
   - Link to existing project? Select "No" for a new deployment
   - Set up project? Select "Yes"
   - Which scope? Choose your account or team
   - Link to existing project? Select "No" for a new project
   - What's your project's name? Enter a name (e.g., "productivity-hub")
   - In which directory is your code located? Press Enter for current directory
   - Want to override settings? Select "No" to use the detected settings

5. **Production Deployment**
   - For a production deployment, use:
   ```bash
   vercel --prod
   ```

## Updating Your Deployed Project

Whenever you make changes to your project, you can update your deployment:

1. **Commit Your Changes**
   ```bash
   git add .
   git commit -m "Update description"
   git push
   ```

2. **Redeploy on Vercel**
   - If you've set up automatic deployments, Vercel will automatically deploy your changes when you push to GitHub
   - Otherwise, you can manually redeploy using the Vercel dashboard or CLI:
   ```bash
   vercel --prod
   ```

## Custom Domain (Optional)

1. **Add a Custom Domain in Vercel**
   - Go to your project in the Vercel dashboard
   - Click on "Settings" > "Domains"
   - Add your domain and follow the instructions to configure DNS settings

2. **Configure DNS**
   - Update your domain's DNS settings according to Vercel's instructions
   - Wait for DNS propagation (can take up to 48 hours)

Your Productivity Hub is now live and accessible to users worldwide!
