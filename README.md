# ✈️ AeroEmpty - Private Empty Leg Flights Platform

A modern full-stack web application for discovering, booking, and managing private empty leg flights across Europe.

**Live Demo:** https://lia-1-client.vercel.app/  
**GitHub:** https://github.com/WardBeniamin/LIA-1

---

## 🎯 Features

### 👤 **User Features**
- 🔍 **Advanced Flight Search** - Filter by location, date, aircraft type, and price range
- 🗺️ **Interactive Map** - Visualize flight routes in real-time
- 💰 **Smart Booking System** - Book at fixed price OR place custom bids ("Name Your Price")
- 🔔 **Alerts & Notifications** - Create alerts for specific routes and get matched flights
- 💳 **Cost-Sharing** - Split costs with other passengers
- 👤 **User Profiles** - Manage bookings, saved searches, and preferences

### 🏢 **Operator Features**
- ✈️ **Flight Management** - Add, edit, and manage empty leg listings
- 📊 **Analytics Dashboard** - Track revenue, bookings, and popular routes
- 📋 **Booking Requests** - Accept or decline passenger bookings
- ✓ **Verification Badge** - Build trust with verified operator status

---

## 🛠 Tech Stack

### Frontend
- **React 19** - Modern UI library
- **Vite 8** - Lightning-fast build tool
- **React Router 7** - Client-side routing
- **Leaflet 5** - Interactive maps
- **Lucide React** - Beautiful icons

### Backend
- **Node.js 18** - JavaScript runtime
- **Express 5** - Web framework
- **Prisma 5** - ORM & database
- **SQLite 3** - Lightweight database

### Deployment
- **Vercel** - Frontend hosting
- **Render** - Backend hosting
- **GitHub** - Source control

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/WardBeniamin/LIA-1.git
cd LIA-1
```

2. **Install dependencies**
```bash
# Frontend
cd client
npm install

# Backend
cd ../server
npm install
```

3. **Setup environment variables**

Create `.env` in the `server` directory:
```env
DATABASE_URL="file:./dev.db"
PORT=5000
NODE_ENV=development
```

Create `.env.local` in the `client` directory:
```env
VITE_API_URL=http://localhost:5000
```

4. **Setup database**
```bash
cd server
npx prisma migrate dev
npm run seed  # Add 15 test flights
```

5. **Start development servers**

Terminal 1 - Backend:
```bash
cd server
npm start
```

Terminal 2 - Frontend:
```bash
cd client
npm run dev
```

Open http://localhost:5173/ 🎉

---

## 📚 API Documentation

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/operators/register` - Register operator
- `POST /api/operators/login` - Operator login

### Flights
- `GET /api/flights?from=Stockholm&to=London&date=2024-05-15` - Search flights
- `POST /api/flights` - Add new flight (operators)
- `PATCH /api/flights/:id` - Update flight
- `DELETE /api/flights/:id` - Delete flight

### Bookings
- `POST /api/bookings` - Create booking/bid
- `GET /api/bookings/user/:userId` - User's bookings
- `GET /api/bookings/operator/:operatorId` - Operator's booking requests

### User Profile
- `GET /api/users/:id` - Get profile
- `PATCH /api/users/:id` - Update profile

### Alerts
- `POST /api/alerts` - Create alert
- `GET /api/alerts?userId=xyz` - Get user's alerts
- `DELETE /api/alerts/:id` - Delete alert

### Analytics
- `GET /api/analytics/operator/:operatorId` - Operator stats

---

## 🗂 Project Structure

```
LIA-1/
├── client/                 # React frontend
│   ├── src/
│   │   ├── pages/         # Page components (Dashboard, Profile, etc)
│   │   ├── components/    # Reusable UI components
│   │   ├── context/       # AuthContext for state management
│   │   ├── App.jsx        # Main app with routing
│   │   └── main.jsx       # Entry point
│   ├── package.json
│   └── vite.config.js
│
├── server/                # Express backend
│   ├── index.js          # Main server & API routes
│   ├── prisma/
│   │   └── schema.prisma # Database models
│   ├── seed.js           # Database seeding
│   ├── package.json
│   ├── .nvmrc            # Node version lock
│   └── render.yaml       # Render deployment config
│
├── .env.example          # Environment template
├── Procfile              # Heroku/Render config
├── README.md            # This file
└── package.json         # Root package.json
```

---

## 🗄 Database Schema

### Models
- **User** - Passengers with bookings and saved searches
- **Operator** - Flight operators with verification status
- **Flight** - Empty leg flights with route, timing, pricing
- **Booking** - Flight reservations with bidding support
- **SavedSearch** - User search preferences
- **Alert** - Route notifications for users

---

## 🧪 Test Data

The database includes 15 test flights from European cities:
- Stockholm, Gothenburg (Sweden)
- London (UK)
- Paris, Nice (France)
- Geneva, Zurich (Switzerland)
- Berlin, Munich (Germany)
- Milan (Italy)
- Ibiza (Spain)
- Vienna (Austria)

**Test Operator:**
- Email: `ops@luxair.com`
- Password: `password123`
- Status: Verified ✓

---

## 📦 Deployment

### Frontend (Vercel)
1. Push to GitHub
2. Vercel auto-deploys from `client/` folder
3. Environment variable: `VITE_API_URL=https://lia-1-backend.onrender.com`

### Backend (Render)
1. Push to GitHub
2. Render auto-deploys using `render.yaml` config
3. Automatically handles:
   - Node version (18.x)
   - Build: `cd server && npm install`
   - Start: `cd server && npm start`

---

## 🔒 Security

- GDPR compliant cookie banner
- Mock Stripe payment integration
- Protected operator registration
- User authentication system
- Verified operator badges

---

## 📝 TODO / Future Improvements

- [ ] Real Stripe payment integration
- [ ] Email notifications
- [ ] Advanced search with filters (carbon emissions, aircraft type matching)
- [ ] Review & rating system
- [ ] Direct messaging between users and operators
- [ ] Mobile app (React Native)
- [ ] API rate limiting
- [ ] Full end-to-end testing

---

## 👨‍💻 Development

### Create a new feature branch
```bash
git checkout -b feature/my-feature
```

### Commit changes
```bash
git add .
git commit -m "feat: add my feature"
git push origin feature/my-feature
```

### Create pull request on GitHub

---

## 📄 License

MIT License - feel free to use this project for educational purposes.

---

## 🤝 Support

For issues or questions, please open an issue on GitHub.

**Built with ❤️ for modern aviation professionals**
