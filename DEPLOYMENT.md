# LIA-1 Flight Booking Application - Deployment Guide

## 🚀 Distributionskonfiguration

Din app är nu redo att distribueras!

### **Backend (Express API) → Render.com**

1. Gå till [render.com](https://render.com) och skapa ett konto (gratis)
2. Klicka **New +** → **Web Service**
3. Koppla GitHub-repot `wardbeniamin/LIA-1`
4. Fyll in:
   - **Name:** `lia-1-api` (eller valfritt namn)
   - **Root Directory:** `server`
   - **Build Command:** `npm install && npx prisma generate`
   - **Start Command:** `npm start`
5. Lägg till Environment Variables:
   ```
   NODE_ENV = production
   DATABASE_URL = file:./dev.db
   ```
6. Klicka **Deploy** och vänta (2-3 min)

**Din API URL blir något som:** `https://lia-1-api.onrender.com`

---

### **Frontend (React) → Vercel**

1. Gå till [vercel.com](https://vercel.com) och logga in med GitHub
2. Klicka **New Project**
3. Välj repo `LIA-1` från GitHub
4. Vercel bör automatiskt detektera `vercel.json` och konfigurera rätt
5. Lägg till Environment Variable:
   ```
   VITE_API_URL = https://lia-1-api.onrender.com
   ```
6. Klicka **Deploy** och vänta (1-2 min)

**Din frontend URL blir något som:** `https://lia-1.vercel.app`

---

### **3. Uppdatera API-anrop i koden**

Din client behöver veta var API:n är. Uppdatera alla API-endpoints från `http://localhost:3000` till din Render-URL.

I komponenter/context-filer, ersätt:
```javascript
// Innan:
fetch('http://localhost:3000/api/flights')

// Efter:
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
fetch(`${API_URL}/api/flights`)
```

---

## 📋 Checklista

- [ ] Backend deployad på Render.com → få URL
- [ ] Frontend deployad på Vercel → få URL
- [ ] VITE_API_URL uppdaterad i Vercel Environment Variables
- [ ] Testa att frontend kan prata med backend
- [ ] Hemsidan är live! 🎉

---

## 🔧 Lokal utveckling (medan du deployar)

```bash
# Terminal 1: Backend
cd server
npm install
npm run dev

# Terminal 2: Frontend
cd client
npm install
npm run dev
```

Då är hemsidan på `http://localhost:5173` (frontend) och API på `http://localhost:3000` (backend)

---

## ⚠️ Viktigt!

- **SQLite på Render**: Filbaserad DB sparas inte mellan redeployments. Använd PostgreSQL istället för produktion (uppdatera senare).
- **CORS**: Express har redan `cors()` aktiverat - bör fungera mellan domains.
- **Environment Variables**: Lägg till alla känsliga variabler (API-nycklar, etc) via Vercel/Render UI, INTE i kod.
