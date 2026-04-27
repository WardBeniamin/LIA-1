const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// ─── HEALTH ───────────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date() });
});

// ─── FLIGHTS ──────────────────────────────────────────────────────────────────

// GET all flights — supports: from, to, date, aircraft, minPrice, maxPrice
app.get('/api/flights', async (req, res) => {
  const { from, to, date, aircraft, minPrice, maxPrice } = req.query;
  try {
    const filters = {};
    if (from) filters.departureLocation = { contains: from };
    if (to)   filters.arrivalLocation   = { contains: to };
    if (aircraft) filters.aircraftType  = { contains: aircraft };

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setUTCHours(23, 59, 59, 999);
      filters.departureTime = { gte: startOfDay, lte: endOfDay };
    }

    if (minPrice || maxPrice) {
      filters.price = {};
      if (minPrice) filters.price.gte = parseFloat(minPrice);
      if (maxPrice) filters.price.lte = parseFloat(maxPrice);
    }

    const flights = await prisma.flight.findMany({
      where: filters,
      include: { operator: { select: { id: true, companyName: true, verified: true } } },
      orderBy: { departureTime: 'asc' }
    });
    res.json(flights);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch flights' });
  }
});

// GET single flight
app.get('/api/flights/:id', async (req, res) => {
  try {
    const flight = await prisma.flight.findUnique({
      where: { id: req.params.id },
      include: { operator: true }
    });
    if (!flight) return res.status(404).json({ error: 'Not found' });
    res.json(flight);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch flight' });
  }
});

// POST create flight (Operator)
app.post('/api/flights', async (req, res) => {
  const data = req.body;
  try {
    const flight = await prisma.flight.create({
      data: {
        ...data,
        departureTime: new Date(data.departureTime),
        arrivalTime:   new Date(data.arrivalTime)
      }
    });
    res.json(flight);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create flight' });
  }
});

// PATCH update flight (Operator)
app.patch('/api/flights/:id', async (req, res) => {
  const { price, status, departureTime, arrivalTime } = req.body;
  try {
    const updateData = {};
    if (price !== undefined) updateData.price = price ? parseFloat(price) : null;
    if (status !== undefined) updateData.status = status;
    if (departureTime) updateData.departureTime = new Date(departureTime);
    if (arrivalTime) updateData.arrivalTime = new Date(arrivalTime);

    const flight = await prisma.flight.update({
      where: { id: req.params.id },
      data: updateData
    });
    res.json(flight);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update flight' });
  }
});

// DELETE flight (Operator)
app.delete('/api/flights/:id', async (req, res) => {
  try {
    await prisma.booking.deleteMany({ where: { flightId: req.params.id } });
    await prisma.flight.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete flight' });
  }
});

// ─── BOOKINGS ─────────────────────────────────────────────────────────────────

// POST book a flight (with optional cost-share)
app.post('/api/bookings', async (req, res) => {
  const { flightId, userId, priceOffered, costShare, passengers } = req.body;
  try {
    const booking = await prisma.booking.create({
      data: {
        flightId,
        userId,
        priceOffered,
        costShare: costShare || false,
        passengers: passengers || 1,
        status: 'PENDING'
      }
    });
    res.json(booking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to book flight' });
  }
});

// GET bookings for a user
app.get('/api/bookings/user/:userId', async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { userId: req.params.userId },
      include: { flight: { include: { operator: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// ─── USERS (mock auth) ────────────────────────────────────────────────────────

// POST register / log in  (returns mock session — no real JWT for MVP)
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ error: 'Email already registered' });
    const user = await prisma.user.create({ data: { name, email, password } });
    res.json({ id: user.id, name: user.name, email: user.email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.password !== password)
      return res.status(401).json({ error: 'Invalid credentials' });
    res.json({ id: user.id, name: user.name, email: user.email });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// ─── ALERTS ───────────────────────────────────────────────────────────────────

// In-memory alerts store (replaced by DB in production)
let alerts = [];

app.get('/api/alerts', (req, res) => {
  const { userId } = req.query;
  res.json(userId ? alerts.filter(a => a.userId === userId) : alerts);
});

app.post('/api/alerts', (req, res) => {
  const alert = { id: Date.now().toString(), createdAt: new Date(), ...req.body };
  alerts.push(alert);
  res.json(alert);
});

app.delete('/api/alerts/:id', (req, res) => {
  alerts = alerts.filter(a => a.id !== req.params.id);
  res.json({ success: true });
});

// ─── ANALYTICS (Operator) ─────────────────────────────────────────────────────

app.get('/api/analytics/operator/:operatorId', async (req, res) => {
  try {
    const flights  = await prisma.flight.findMany({ where: { operatorId: req.params.operatorId } });
    const flightIds = flights.map(f => f.id);
    const bookings = await prisma.booking.findMany({ where: { flightId: { in: flightIds } } });

    const totalRevenue  = bookings.reduce((s, b) => s + (b.priceOffered || 0), 0);
    const byStatus = bookings.reduce((acc, b) => {
      acc[b.status] = (acc[b.status] || 0) + 1;
      return acc;
    }, {});
    const popularRoutes = flights
      .map(f => ({ route: `${f.departureLocation} → ${f.arrivalLocation}`, bookingCount: bookings.filter(b => b.flightId === f.id).length }))
      .sort((a, b) => b.bookingCount - a.bookingCount)
      .slice(0, 5);

    res.json({
      totalFlights:     flights.length,
      totalBookings:    bookings.length,
      totalRevenue,
      bookingsByStatus: byStatus,
      popularRoutes,
    });
  } catch (err) {
    res.status(500).json({ error: 'Analytics failed' });
  }
});

// ─── SERVER ───────────────────────────────────────────────────────────────────
app.use(express.static('client/dist'));

// Serve SPA index.html for any unmatched routes
app.get('*', (req, res) => {
  res.sendFile('index.html', { root: 'client/dist' });
});
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
