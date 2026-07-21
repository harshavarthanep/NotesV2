# ZenDocs PWA — deploy on GitHub Pages

1. Put ALL of these files in the ROOT of your repository (index.html, manifest.json, sw.js, the icons, logo.svg).
2. GitHub repo → Settings → Pages → deploy from branch → main / root.
3. Open the https://…github.io/… URL. HTTPS is required for install + service worker (GitHub Pages provides it).
4. Also add your github.io domain in Firebase Console → Authentication → Settings → Authorized domains, or login will be blocked.
5. The install popup appears automatically on Chrome/Edge/Android; on iPhone it shows Share → Add to Home Screen steps. It never appears inside the installed app.

Updating: bump the CACHE name in sw.js (e.g. zendocs-v3.9.1) whenever you deploy a new index.html so devices fetch the fresh version.
