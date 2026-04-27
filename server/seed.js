const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    await prisma.booking.deleteMany({});
    await prisma.flight.deleteMany({});

    const operator = await prisma.operator.upsert({
        where: { email: 'ops@luxair.com' },
        update: {},
        create: {
            companyName: 'LuxAir Services',
            email: 'ops@luxair.com',
            password: 'password123',
            verified: true,
        }
    });

    const currDate = new Date();
    const deps = [
       { loc: 'Stockholm, Sweden (Bromma)', lat: 59.3546, lng: 17.9396 },
       { loc: 'Gothenburg, Sweden (Landvetter)', lat: 57.6628, lng: 12.2844 },
       { loc: 'London, UK (Farnborough)', lat: 51.2758, lng: -0.7762 },
       { loc: 'Paris, France (Le Bourget)', lat: 48.9615, lng: 2.4287 },
       { loc: 'Nice, France (Côte d\'Azur)', lat: 43.6653, lng: 7.2150 },
       { loc: 'Geneva, Switzerland', lat: 46.2381, lng: 6.1089 },
       { loc: 'Berlin, Germany (BER)', lat: 52.3667, lng: 13.5033 },
       { loc: 'Ibiza, Spain', lat: 38.8729, lng: 1.3731 },
    ];

    for(let i=0; i<15; i++) {
        const d1 = deps[Math.floor(Math.random() * deps.length)];
        let d2;
        do {
           d2 = deps[Math.floor(Math.random() * deps.length)];
        } while (d1.loc === d2.loc);

        const daysOffset = Math.floor(Math.random() * 30);
        const depTime = new Date(currDate);
        depTime.setDate(currDate.getDate() + daysOffset);

        const arrTime = new Date(depTime);
        arrTime.setHours(depTime.getHours() + 2); // European flights are shorter

        const hasPrice = Math.random() > 0.3;

        await prisma.flight.create({
            data: {
                departureLocation: d1.loc,
                arrivalLocation: d2.loc,
                latitude: d1.lat,
                longitude: d1.lng,
                destLatitude: d2.lat,
                destLongitude: d2.lng,
                departureTime: depTime,
                arrivalTime: arrTime,
                aircraftType: ['Gulfstream G650', 'Citation X', 'Challenger 350', 'Global 7500'][Math.floor(Math.random()*4)],
                capacity: Math.floor(Math.random() * 8) + 6,
                price: hasPrice ? (Math.floor(Math.random() * 10) + 5) * 1000 : null, // EUR 5k-15k
                operatorId: operator.id
            }
        });
    }

    console.log("Seeding complete with European locations!");
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  });
