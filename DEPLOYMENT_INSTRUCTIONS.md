# 🚀 Deployment Guide: Backend to Render

You are using **Supabase** for your database, which is great! It means your database is already in the cloud, so you just need to put your Node.js code online.

## Step 1: Push to GitHub
1.  Initialize git if you haven't: `git init`
2.  Add files: `git add .`
3.  Commit: `git commit -m "Ready for deploy"`
4.  Push to a GitHub repository.

## Step 2: Create Web Service on Render
1.  Go to [dashboard.render.com](https://dashboard.render.com/).
2.  Click **New +** -> **Web Service**.
3.  Connect your GitHub repository.

## Step 3: Configure Settings
Since I created a `render.yaml` in your project root, Render might auto-detect some settings. If not, use:
-   **Root Directory**: `Backend` (Important!)
-   **Build Command**: `npm install && npm run build`
-   **Start Command**: `npm start`

## Step 4: Environment Variables (Critical!)
Go to the **Environment** tab in Render and add these keys (copy values from your local `Backend/.env` file):

| Key | Value Source |
| :--- | :--- |
| `DATABASE_URL` | `.env` |
| `DIRECT_URL` | `.env` |
| `JWT_SECRET` | `.env` |
| `SUPABASE_URL` | `.env` |
| `SUPABASE_ANON_KEY` | `.env` |
| `KEYCLOAK_BASE_URL` | `.env` |
| `KEYCLOAK_REALM` | `.env` |
| `KEYCLOAK_PROVISIONER_CLIENT_ID` | `.env` |
| `KEYCLOAK_PROVISIONER_CLIENT_SECRET` | `.env` |

## Step 5: Update Frontend
Once Render finishes deploying, it will give you a URL (e.g., `https://flowdash-backend.onrender.com`).
1.  Go to your Vercel Dashboard -> Project Settings -> Environment Variables.
2.  Update `VITE_API_BASE_URL` to your new Render URL: `https://flowdash-backend.onrender.com/api` (don't forget `/api` if your routes need it).
3.  Redeploy Vercel.
