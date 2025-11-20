import { db } from '../src/db';
import { operators, routes, buses } from '../src/db/schema';

async function seed() {
  console.log('🌱 Seeding database...');

  try {
    // Insert Operators
    const operatorData = await db.insert(operators).values([
      {
        name: 'Mazhandu Family',
        slug: 'mazhandu-family',
        description: 'Premium intercity bus service with excellent safety records',
        color: 'bg-red-600',
        rating: '4.8',
        phone: '+260211234567',
        email: 'info@mazhandu.zm',
      },
      {
        name: 'Power Tools',
        slug: 'power-tools',
        description: 'Reliable and affordable bus transport across Zambia',
        color: 'bg-blue-600',
        rating: '4.5',
        phone: '+260211234568',
        email: 'info@powertools.zm',
      },
      {
        name: 'Juldan Motors',
        slug: 'juldan-motors',
        description: 'Luxury coaches for long-distance travel',
        color: 'bg-green-600',
        rating: '4.9',
        phone: '+260211234569',
        email: 'info@juldan.zm',
      },
      {
        name: 'Shalom Bus',
        slug: 'shalom-bus',
        description: 'Comfortable and punctual bus services',
        color: 'bg-purple-600',
        rating: '4.2',
        phone: '+260211234570',
        email: 'info@shalom.zm',
      },
      {
        name: 'Likili',
        slug: 'likili',
        description: 'Connect to remote destinations across Zambia',
        color: 'bg-orange-600',
        rating: '4.0',
        phone: '+260211234571',
        email: 'info@likili.zm',
      },
    ]).returning();

    console.log('✅ Operators inserted:', operatorData.length);

    // Insert Routes
    const routeData = await db.insert(routes).values([
      { fromCity: 'Lusaka', toCity: 'Livingstone', distance: 480, estimatedDuration: 360 },
      { fromCity: 'Lusaka', toCity: 'Kitwe', distance: 320, estimatedDuration: 300 },
      { fromCity: 'Lusaka', toCity: 'Johannesburg', distance: 1200, estimatedDuration: 900 },
      { fromCity: 'Lusaka', toCity: 'Chipata', distance: 570, estimatedDuration: 420 },
      { fromCity: 'Lusaka', toCity: 'Mongu', distance: 580, estimatedDuration: 480 },
      { fromCity: 'Lusaka', toCity: 'Ndola', distance: 320, estimatedDuration: 300 },
    ]).returning();

    console.log('✅ Routes inserted:', routeData.length);

    // Insert Buses/Schedules
    const busData = await db.insert(buses).values([
      {
        operatorId: operatorData[0].id, // Mazhandu
        routeId: routeData[0].id, // Lusaka to Livingstone
        departureTime: '06:00',
        arrivalTime: '12:00',
        price: '350.00',
        type: 'luxury',
        totalSeats: 45,
        availableSeats: 45,
        features: JSON.stringify(['AC', 'USB', 'Snacks', 'Wi-Fi']),
        operatesOn: JSON.stringify([1, 2, 3, 4, 5, 6, 0]), // Daily
      },
      {
        operatorId: operatorData[1].id, // Power Tools
        routeId: routeData[1].id, // Lusaka to Kitwe
        departureTime: '07:30',
        arrivalTime: '12:30',
        price: '280.00',
        type: 'standard',
        totalSeats: 50,
        availableSeats: 50,
        features: JSON.stringify(['AC', 'Leg Room']),
        operatesOn: JSON.stringify([1, 2, 3, 4, 5, 6, 0]),
      },
      {
        operatorId: operatorData[2].id, // Juldan
        routeId: routeData[2].id, // Lusaka to Johannesburg
        departureTime: '10:00',
        arrivalTime: '01:00',
        price: '1200.00',
        type: 'luxury',
        totalSeats: 30,
        availableSeats: 30,
        features: JSON.stringify(['Reclining Seats', 'Meal', 'Toilet', 'AC', 'Entertainment']),
        operatesOn: JSON.stringify([1, 3, 5]), // Mon, Wed, Fri
      },
      {
        operatorId: operatorData[3].id, // Shalom
        routeId: routeData[3].id, // Lusaka to Chipata
        departureTime: '05:00',
        arrivalTime: '12:00',
        price: '300.00',
        type: 'standard',
        totalSeats: 40,
        availableSeats: 40,
        features: JSON.stringify(['Music', 'Storage']),
        operatesOn: JSON.stringify([1, 2, 3, 4, 5, 6, 0]),
      },
      {
        operatorId: operatorData[4].id, // Likili
        routeId: routeData[4].id, // Lusaka to Mongu
        departureTime: '06:30',
        arrivalTime: '14:30',
        price: '400.00',
        type: 'standard',
        totalSeats: 35,
        availableSeats: 35,
        features: JSON.stringify(['AC']),
        operatesOn: JSON.stringify([1, 2, 3, 4, 5, 6, 0]),
      },
      {
        operatorId: operatorData[0].id, // Mazhandu
        routeId: routeData[5].id, // Lusaka to Ndola
        departureTime: '14:00',
        arrivalTime: '19:00',
        price: '310.00',
        type: 'luxury',
        totalSeats: 45,
        availableSeats: 45,
        features: JSON.stringify(['AC', 'TV', 'USB']),
        operatesOn: JSON.stringify([1, 2, 3, 4, 5, 6, 0]),
      },
    ]).returning();

    console.log('✅ Buses inserted:', busData.length);
    console.log('🎉 Database seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seed();
