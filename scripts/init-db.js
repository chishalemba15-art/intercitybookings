#!/usr/bin/env node

/**
 * Database Initialization Script
 * Runs schema.sql against Neon database
 * Usage: node scripts/init-db.js
 */

const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function initDatabase() {
  console.log('🚀 Starting database initialization...\n');

  // Check environment variable
  if (!process.env.DATABASE_URL) {
    console.error('❌ ERROR: DATABASE_URL environment variable is not set');
    console.error('   Please add DATABASE_URL to your .env file');
    process.exit(1);
  }

  try {
    // Read schema.sql file
    const schemaPath = path.join(__dirname, '..', 'schema.sql');
    console.log('📄 Reading schema from:', schemaPath);

    if (!fs.existsSync(schemaPath)) {
      console.error('❌ ERROR: schema.sql file not found');
      process.exit(1);
    }

    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Connect to database
    console.log('🔌 Connecting to Neon database...');
    const sql = neon(process.env.DATABASE_URL);

    // Execute schema
    console.log('⚡ Executing database schema...\n');
    await sql(schema);

    console.log('✅ Database initialized successfully!\n');
    console.log('📊 Tables created:');
    console.log('   - operators');
    console.log('   - routes');
    console.log('   - buses');
    console.log('   - bookings');
    console.log('   - payments');
    console.log('   - feedback');
    console.log('   - admin_users');
    console.log('   - search_analytics');
    console.log('   - page_views');
    console.log('   - booking_attempts');

    console.log('\n🎉 Sample data inserted successfully!');
    console.log('\n🔐 Default Admin Login:');
    console.log('   Email: admin@intercity.zm');
    console.log('   Password: admin123');
    console.log('   ⚠️  CHANGE PASSWORD IMMEDIATELY!\n');

  } catch (error) {
    console.error('❌ ERROR initializing database:');
    console.error(error.message);

    if (error.message.includes('already exists')) {
      console.log('\n💡 TIP: Tables already exist. To reset:');
      console.log('   1. Drop all tables in Neon console');
      console.log('   2. Run this script again');
    }

    process.exit(1);
  }
}

// Run initialization
initDatabase();
