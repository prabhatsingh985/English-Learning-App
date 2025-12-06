# Deployment Guide

You have chosen the **Recommended Setup**:
-   **Frontend**: Vercel (Fast, Great for React/Vite)
-   **Backend**: Render (Stable, Supports persistent Socket.IO connections)

---

## 🚀 Step 1: Deploy Backend to Render.com

1.  Push your latest code to GitHub.
2.  Log in to [Render.com](https://render.com).
3.  Click **New +** -> **Web Service**.
4.  Connect your GitHub repository.
5.  **Settings**:
    *   **Root Directory**: `backend` (Important!)
    *   **Runtime**: Node
    *   **Build Command**: `npm install`
    *   **Start Command**: `node server.js`
6.  **Environment Variables**:
    *   `MONGODB_URI`: Your MongoDB Connection String.
    *   `GEMINI_API_KEY`: Your Google Gemini API Key.
    *   `JWT_SECRET`: Any secret string.
    *   `FRONTEND_URL`: `https://your-frontend-app.vercel.app` (You will update this *after* deploying frontend, or you can use `*` temporarily).
7.  Click **Create Web Service**.
8.  **Copy your Backend URL** (e.g., `https://english-app.onrender.com`).

---

## 🚀 Step 2: Deploy Frontend to Vercel

1.  Log in to [Vercel.com](https://vercel.com).
2.  **Add New** -> **Project**.
3.  Import the same repository.
4.  **Framework Preset**: Vite.
5.  **Root Directory**: Click `Edit` and select `frontend` (Important!).
6.  **Environment Variables**:
    *   `VITE_BACKEND_URL`: Paste your **Render Backend URL** here (e.g., `https://english-app.onrender.com`).
        *   *Note*: No trailing slash is best, but code handles it.
7.  Click **Deploy**.

---

## � Step 3: Final Link

1.  Copy your new **Vercel Frontend URL**.
2.  Go back to **Render Dashboard** -> **Environment Variables**.
3.  Update (or Add) `FRONTEND_URL` with your Vercel URL.
4.  Render will redeploy automatically.

## ✅ Checklist
- [ ] MongoDB Atlas Network Access allows `0.0.0.0/0`.
- [ ] Render Backend Status is "Live".
- [ ] Vercel Frontend Status is "Ready".

