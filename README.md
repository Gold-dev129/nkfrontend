# NKYLUXURY Frontend Client

This is the production-ready React client application for NKYLUXURY, an exquisite luxury jewelry brand eCommerce application.

## Tech Stack
- **React.js & Vite** - Main rendering engine and fast bundling.
- **Tailwind CSS** - Modern custom responsive styles.
- **Redux Toolkit & Redux Persist** - Session preservation and global state synchronization.
- **React Router DOM** - Page routing and layouts.
- **Framer Motion** - Sleek luxury micro-animations and transitions.
- **Axios** - Async API communication requests.
- **Recharts** - Interactive charts rendering for Admin Portal.

---

## Environmental Config Checklist
Create a `.env` file in this directory based on the `.env.example` file:

```env
VITE_API_URL=http://localhost:5000/api
```

---

## Local Setup
1. Open your terminal in the frontend directory.
2. Install the node modules:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Access the web app via `http://localhost:5173`.

---

## Production Build & Vercel Deployment
### Vercel:
1. Create a Vercel account and click **Add New Project**.
2. Connect your GitHub repository containing the frontend folder.
3. Configure the Root Directory parameter to point to the frontend folder.
4. Set the **Build Command** to: `npm run build`
5. Set the **Output Directory** to: `dist`
6. Add the environment variable:
   - `VITE_API_URL` = link to your deployed backend URL (e.g. `https://nk-backend.onrender.com/api`)
7. Click Deploy!
