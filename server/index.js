const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const app = express();
const prisma = new PrismaClient();

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ─── HEALTH ───────────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date() });
});

// ─── FLIGHTS (Enhanced Search) ────────────────────────────────────────────────

// GET all flights — supports: from, to, date, aircraft, minPrice, maxPrice, sortBy, limit
app.get('/api/flights', async (req, res) => {
  const { from, to, date, aircraft, minPrice, maxPrice, sortBy = 'departureTime', limit = 100 } = req.query;
  try {
    const filters = {};
    
    // Flexible location search (contains)
    if (from) filters.departureLocation = { contains: from, mode: 'insensitive' };
    if (to) filters.arrivalLocation = { contains: to, mode: 'insensitive' };
    if (aircraft) filters.aircraftType = { contains: aircraft, mode: 'insensitive' };
    
    // Date filter (whole day)
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setUTCHours(23, 59, 59, 999);
      filters.departureTime = { gte: startOfDay, lte: endOfDay };
    }

    // Price range filter
    if (minPrice || maxPrice) {
      filters.price = {};
      if (minPrice) filters.price.gte = parseFloat(minPrice);
      if (maxPrice) filters.price.lte = parseFloat(maxPrice);
    }

    // Only show available flights
    filters.status = 'AVAILABLE';

    const orderByMap = {
      'departureTime': { departureTime: 'asc' },
      'price': { price: 'asc' },
      'capacity': { capacity: 'desc' },
      'recent': { createdAt: 'desc' }
    };

    const flights = await prisma.flight.findMany({
      where: filters,
      include: { operator: { select: { id: true, companyName: true, verified: true } } },
      orderBy: orderByMap[sortBy] || { departureTime: 'asc' },
      take: Math.min(parseInt(limit) || 100, 1000)
    });
    
    res.json(flights);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch flights' });
  }
});

// GET single flight with detailed info
app.get('/api/flights/:id', async (req, res) => {
  try {
    const flight = await prisma.flight.findUnique({
      where: { id: req.params.id },
      include: { 
        operator: true,
        bookings: {
          select: { id: true, userId: true, passengers: true, status: true, priceOffered: true }
        }
      }
    });
    if (!flight) return res.status(404).json({ error: 'Flight not found' });
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
        arrivalTime: new Date(data.arrivalTime),
        price: data.price ? parseFloat(data.price) : null
      },
      include: { operator: true }
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
      data: updateData,
      include: { operator: true }
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

// POST book a flight (with optional cost-share and bidding)
app.post('/api/bookings', async (req, res) => {
  const { flightId, userId, priceOffered, costShare, passengers } = req.body;
  try {
    const booking = await prisma.booking.create({
      data: {
        flightId,
        userId,
        priceOffered: priceOffered ? parseFloat(priceOffered) : null,
        costShare: costShare || false,
        passengers: passengers || 1,
        status: 'PENDING'
      },
      include: { flight: { include: { operator: true } }, user: true }
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

// GET bookings for an operator (all flights' bookings)
app.get('/api/bookings/operator/:operatorId', async (req, res) => {
  try {
    const flights = await prisma.flight.findMany({
      where: { operatorId: req.params.operatorId },
      select: { id: true }
    });
    const flightIds = flights.map(f => f.id);
    const bookings = await prisma.booking.findMany({
      where: { flightId: { in: flightIds } },
      include: { flight: true, user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// PATCH update booking status (Operator can accept/reject)
app.patch('/api/bookings/:id', async (req, res) => {
  const { status } = req.body;
  try {
    if (!['PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    const booking = await prisma.booking.update({
      where: { id: req.params.id },
      data: { status },
      include: { flight: true, user: true }
    });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update booking' });
  }
});

// DELETE booking (cancel)
app.delete('/api/bookings/:id', async (req, res) => {
  try {
    await prisma.booking.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to cancel booking' });
  }
});

// ─── USERS (mock auth) ────────────────────────────────────────────────────────

// GET user profile
app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: { id: true, name: true, email: true, phone: true, createdAt: true }
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// POST register / log in  (returns mock session — no real JWT for MVP)
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, phone } = req.body;
  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ error: 'Email already registered' });
    const user = await prisma.user.create({ 
      data: { name, email, password, phone: phone || null } 
    });
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

// PATCH update user profile
app.patch('/api/users/:id', async (req, res) => {
  const { name, phone } = req.body;
  try {
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: {
        ...(name && { name }),
        ...(phone && { phone })
      },
      select: { id: true, name: true, email: true, phone: true }
    });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// ─── OPERATORS ────────────────────────────────────────────────────────────────

// GET operator profile
app.get('/api/operators/:id', async (req, res) => {
  try {
    const operator = await prisma.operator.findUnique({
      where: { id: req.params.id },
      select: { id: true, companyName: true, email: true, verified: true, createdAt: true }
    });
    if (!operator) return res.status(404).json({ error: 'Operator not found' });
    res.json(operator);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch operator' });
  }
});

// POST register operator
app.post('/api/operators/register', async (req, res) => {
  const { companyName, email, password, phone } = req.body;
  try {
    const existing = await prisma.operator.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ error: 'Email already registered' });
    const operator = await prisma.operator.create({
      data: { companyName, email, password, phone: phone || null }
    });
    res.json({ id: operator.id, companyName: operator.companyName, email: operator.email });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

// POST operator login
app.post('/api/operators/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const operator = await prisma.operator.findUnique({ where: { email } });
    if (!operator || operator.password !== password)
      return res.status(401).json({ error: 'Invalid credentials' });
    res.json({ id: operator.id, companyName: operator.companyName, email: operator.email, verified: operator.verified });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// ─── SAVED SEARCHES ───────────────────────────────────────────────────────────

// GET user's saved searches
app.get('/api/saved-searches/user/:userId', async (req, res) => {
  try {
    const searches = await prisma.savedSearch.findMany({
      where: { userId: req.params.userId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(searches);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch saved searches' });
  }
});

// POST save a new search
app.post('/api/saved-searches', async (req, res) => {
  const { userId, name, filters } = req.body;
  try {
    const search = await prisma.savedSearch.create({
      data: {
        userId,
        name,
        filters: JSON.stringify(filters)
      }
    });
    res.json(search);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save search' });
  }
});

// DELETE saved search
app.delete('/api/saved-searches/:id', async (req, res) => {
  try {
    await prisma.savedSearch.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete search' });
  }
});

// ─── ALERTS ───────────────────────────────────────────────────────────────────

// GET user's alerts (from database)
app.get('/api/alerts', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'userId required' });
    const alerts = await prisma.alert.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

// POST create alert
app.post('/api/alerts', async (req, res) => {
  const { userId, route, criteria } = req.body;
  try {
    const alert = await prisma.alert.create({
      data: {
        userId,
        route,
        criteria: criteria ? JSON.stringify(criteria) : null
      }
    });
    res.json(alert);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create alert' });
  }
});

// DELETE alert
app.delete('/api/alerts/:id', async (req, res) => {
  try {
    await prisma.alert.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete alert' });
  }
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

// ─── SEARCH MATCHING (Find matching flights for user alerts) ──────────────────

// GET matching flights for user's alerts
app.get('/api/matching-flights/:userId', async (req, res) => {
  try {
    const alerts = await prisma.alert.findMany({
      where: { userId: req.params.userId }
    });

    const matchingFlights = [];
    for (const alert of alerts) {
      const routeParts = alert.route.split('-').map(p => p.trim());
      const isOneWay = routeParts.length === 1;
      
      const filters = {
        status: 'AVAILABLE'
      };

      if (isOneWay) {
        // Search by single location (departure or arrival)
        filters.OR = [
          { departureLocation: { contains: routeParts[0], mode: 'insensitive' } },
          { arrivalLocation: { contains: routeParts[0], mode: 'insensitive' } }
        ];
      } else {
        // Search by route
        filters.departureLocation = { contains: routeParts[0], mode: 'insensitive' };
        filters.arrivalLocation = { contains: routeParts[1], mode: 'insensitive' };
      }

      // Apply additional criteria if exists
      if (alert.criteria) {
        try {
          const criteria = JSON.parse(alert.criteria);
          if (criteria.minPrice) filters.price = { gte: criteria.minPrice };
          if (criteria.maxPrice) filters.price = filters.price || {};
          if (criteria.maxPrice) filters.price.lte = criteria.maxPrice;
          if (criteria.aircraftType) filters.aircraftType = { contains: criteria.aircraftType, mode: 'insensitive' };
        } catch (e) {
          // Ignore parsing errors
        }
      }

      const flights = await prisma.flight.findMany({
        where: filters,
        include: { operator: { select: { id: true, companyName: true, verified: true } } },
        take: 10
      });

      matchingFlights.push(...flights.map(f => ({ ...f, alertId: alert.id, alertRoute: alert.route })));
    }

    res.json(matchingFlights);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to find matching flights' });
  }
});

// ─── SERVER ───────────────────────────────────────────────────────────────────
app.use(express.static('client/dist'));

// API routes are already defined above, fallback to SPA for frontend routes
app.use((err, req, res, next) => {
  res.status(500).json({ error: err.message });
});

// Fallback for SPA routing - catch non-API requests
app.use((req, res) => {
  res.sendFile('index.html', { root: 'client/dist' });
});

app.listen(PORT, () => console.log(`✓ Server running on port ${PORT}`));
