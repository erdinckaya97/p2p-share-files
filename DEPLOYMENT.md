# 🚀 Cloudflare Pages Deployment Guide

This guide contains step-by-step instructions for deploying the P2P Image Sharing site on Cloudflare Pages.

## Method 1: Automatic Deployment via GitHub (Recommended)

### Step 1: Create GitHub Repository

1. Create a new repository in your [GitHub](https://github.com) account
2. The repository can be created as public or private

### Step 2: Upload Code to GitHub

Navigate to the project folder in Terminal and run these commands:

```bash
cd /Users/username/Desktop/image-share-p2p
git init
git add .
git commit -m "Initial commit: P2P image sharing app"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
git push -u origin main
```

### Step 3: Create Project in Cloudflare Pages

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/login)
2. Click on **Workers & Pages** in the left menu
3. Click **Create application** button
4. Select **Pages** tab
5. Click **Connect to Git** button

### Step 4: Connect GitHub

1. Click **GitHub** button
2. Allow Cloudflare to access your GitHub account
3. Select the repository you created

### Step 5: Build Settings

Configure these settings:

- **Project name**: `image-share-p2p` (or your preferred name)
- **Production branch**: `main`
- **Framework preset**: `None`
- **Build command**: (leave empty)
- **Build output directory**: `/`
- **Root directory**: `/`

### Step 6: Deploy

1. Click **Save and Deploy** button
2. Wait for deployment to complete (usually 30-60 seconds)
3. Once deployed, you'll receive a URL: `https://image-share-p2p.pages.dev`

### Step 7: Add Custom Domain (Optional)

1. After deployment completes, go to **Custom domains** tab
2. Click **Set up a custom domain** button
3. Enter your domain name and follow the instructions

---

## Method 2: Direct Upload (Without Git)

### Step 1: Prepare Files

Make sure these files are in the project folder:
- `index.html`
- `styles.css`
- `app.js`
- `_headers`
- `robots.txt`

### Step 2: Upload to Cloudflare Pages

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/login)
2. Click **Workers & Pages** tab
3. Click **Create application** button
4. Select **Pages** tab
5. Click **Upload assets** button

### Step 3: Upload Files

1. Enter a name for **Project name**: `image-share-p2p`
2. Drag and drop all files or use **Select from computer**
3. Click **Deploy site** button

### Step 4: Deployment Complete

- Once deployed, you'll receive a URL
- Open this URL in your browser to test the site

---

## Method 3: Deploy with Wrangler CLI

### Step 1: Install Wrangler

```bash
npm install -g wrangler
```

### Step 2: Login to Cloudflare

```bash
wrangler login
```

### Step 3: Deploy

```bash
cd /Users/username/Desktop/image-share-p2p
wrangler pages deploy . --project-name=image-share-p2p
```

---

## 🔧 Post-Deployment Checks

### 1. HTTPS Check
- Cloudflare Pages automatically provides HTTPS
- Make sure the site URL starts with `https://`

### 2. WebRTC Test
- Open the site in two different browsers or devices
- Test file sharing
- Check if connection can be established

### 3. Browser Console
- Open browser console (F12)
- Make sure there are no error messages

### 4. Test on Different Devices
- Test on desktop browsers (Chrome, Firefox, Safari, Edge)
- Test on mobile devices

---

## 🐛 Troubleshooting

### "Failed to deploy" Error

**Solution**: 
- Make sure all files are in the correct directory
- Check that there are no large files in your Git history
- Ensure your Cloudflare account is active

### WebRTC Connection Error

**Solution**:
- Make sure you're accessing via HTTPS
- Check error messages in browser console
- Try using a different STUN/TURN server

### Files Not Showing

**Solution**:
- Clear browser cache
- Do a hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
- Ensure build output directory is `/`

---

## 📊 Deployment Statistics

In Cloudflare Pages Dashboard you can view:
- Total visitor count
- Request count
- Bandwidth usage
- Deployment history

---

## 🔄 Updates

### Via GitHub (Automatic)

```bash
git add .
git commit -m "Update: description"
git push
```

Cloudflare will automatically deploy the new version.

### Manual Upload

1. Go to Cloudflare Dashboard
2. Select your project
3. Click **Create new deployment** button
4. Upload updated files

---

## 🌐 Production URLs

After deployment completes, you'll receive URLs in this format:

- **Production**: `https://image-share-p2p.pages.dev`
- **Preview**: `https://[commit-hash].image-share-p2p.pages.dev`

---

## 💡 Tips

1. **Custom Domain**: Use a custom domain for a professional look
2. **Preview Deployments**: Automatic preview is created for each commit
3. **Rollback**: Easily roll back to previous versions
4. **Analytics**: Get detailed statistics with Cloudflare Analytics
5. **Edge Locations**: Fast access worldwide thanks to Cloudflare's global CDN

---

## 📞 Support

If you encounter issues:
- [Cloudflare Community](https://community.cloudflare.com/)
- [Cloudflare Docs](https://developers.cloudflare.com/pages/)
- [PeerJS Docs](https://peerjs.com/docs/)

---

**Good luck! 🎉**
