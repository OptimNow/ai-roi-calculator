# Deployment Instructions

## Vercel Deployment

### Configuration
- **Framework Preset:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

### Important: Static Assets

The logo and favicon are in the `public/images/` folder. Vite automatically copies the `public/` folder contents to `dist/` during build.

**If logo doesn't show after deployment:**

1. **Check Vercel build logs** to ensure `public/images/` files are being copied to `dist/images/`
2. **Trigger a fresh deployment** (not just redeploy) to ensure new files are picked up
3. **Clear browser cache** - the logo might be cached as a 404

### Manual Verification

After deployment, check:
- https://your-app.vercel.app/images/Logo.png (should display logo)
- https://your-app.vercel.app/images/favicon.jpg (should display favicon)

If these URLs return 404, the build didn't copy the public folder correctly.

### Troubleshooting

**Logo not showing:**
- Clear Vercel cache: Settings → Clear Build Cache
- Redeploy from scratch
- Check browser console for 404 errors on `/images/Logo.png`
- Verify `public/` folder is committed to Git

**Help button not working:**
- Check browser console for JavaScript errors
- Ensure `Settings` icon is imported in HelpGuide.tsx
- Clear browser cache and hard reload (Ctrl+Shift+R)

## Local Development

```bash
npm install
npm run dev
```

Visit http://localhost:5173 - logo should appear immediately.

## Build Locally

```bash
npm run build
```

Check `dist/images/` folder - Logo.png and favicon.jpg should be present.

Serve locally to test:
```bash
npx serve dist
```

Visit http://localhost:3000 - logo should appear.
