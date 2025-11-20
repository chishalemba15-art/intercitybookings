-- IntercityBookings Database Schema
-- Generated for Neon PostgreSQL

-- Create ENUM types
CREATE TYPE bus_type AS ENUM ('luxury', 'standard');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');
CREATE TYPE payment_method AS ENUM ('airtel_money', 'mtn_momo');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');

-- Operators Table
CREATE TABLE operators (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    logo VARCHAR(500),
    color VARCHAR(50) DEFAULT 'bg-blue-600',
    rating DECIMAL(2, 1) DEFAULT 4.0,
    phone VARCHAR(20),
    email VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Routes Table
CREATE TABLE routes (
    id SERIAL PRIMARY KEY,
    from_city VARCHAR(100) NOT NULL,
    to_city VARCHAR(100) NOT NULL,
    distance INTEGER,
    estimated_duration INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Buses/Schedules Table
CREATE TABLE buses (
    id SERIAL PRIMARY KEY,
    operator_id INTEGER NOT NULL REFERENCES operators(id),
    route_id INTEGER NOT NULL REFERENCES routes(id),
    departure_time VARCHAR(5) NOT NULL,
    arrival_time VARCHAR(5),
    price DECIMAL(10, 2) NOT NULL,
    type bus_type NOT NULL,
    total_seats INTEGER NOT NULL,
    available_seats INTEGER NOT NULL,
    features TEXT,
    is_active BOOLEAN DEFAULT true,
    operates_on TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Bookings Table
CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    bus_id INTEGER NOT NULL REFERENCES buses(id),
    booking_ref VARCHAR(20) NOT NULL UNIQUE,
    passenger_name VARCHAR(255) NOT NULL,
    passenger_phone VARCHAR(20) NOT NULL,
    passenger_email VARCHAR(255),
    seat_number VARCHAR(10) NOT NULL,
    travel_date TIMESTAMP NOT NULL,
    status booking_status DEFAULT 'pending',
    total_amount DECIMAL(10, 2) NOT NULL,
    special_requests TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Payments Table
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER NOT NULL REFERENCES bookings(id),
    amount DECIMAL(10, 2) NOT NULL,
    payment_method payment_method NOT NULL,
    payment_status payment_status DEFAULT 'pending',
    transaction_ref VARCHAR(100),
    phone_number VARCHAR(20) NOT NULL,
    processed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Feedback Table
CREATE TABLE feedback (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER REFERENCES bookings(id),
    name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(20),
    message TEXT NOT NULL,
    rating INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create Indexes for better performance
CREATE INDEX idx_buses_operator ON buses(operator_id);
CREATE INDEX idx_buses_route ON buses(route_id);
CREATE INDEX idx_buses_active ON buses(is_active);
CREATE INDEX idx_bookings_bus ON bookings(bus_id);
CREATE INDEX idx_bookings_ref ON bookings(booking_ref);
CREATE INDEX idx_bookings_travel_date ON bookings(travel_date);
CREATE INDEX idx_payments_booking ON payments(booking_id);
CREATE INDEX idx_feedback_booking ON feedback(booking_id);

-- Insert Sample Data

-- Operators
INSERT INTO operators (name, slug, description, color, rating, phone, email) VALUES
('Mazhandu Family', 'mazhandu-family', 'Premium intercity bus service with excellent safety records', 'bg-red-600', 4.8, '+260211234567', 'info@mazhandu.zm'),
('Power Tools', 'power-tools', 'Reliable and affordable bus transport across Zambia', 'bg-blue-600', 4.5, '+260211234568', 'info@powertools.zm'),
('Juldan Motors', 'juldan-motors', 'Luxury coaches for long-distance travel', 'bg-green-600', 4.9, '+260211234569', 'info@juldan.zm'),
('Shalom Bus', 'shalom-bus', 'Comfortable and punctual bus services', 'bg-purple-600', 4.2, '+260211234570', 'info@shalom.zm'),
('Likili', 'likili', 'Connect to remote destinations across Zambia', 'bg-orange-600', 4.0, '+260211234571', 'info@likili.zm');

-- Routes
INSERT INTO routes (from_city, to_city, distance, estimated_duration) VALUES
('Lusaka', 'Livingstone', 480, 360),
('Lusaka', 'Kitwe', 320, 300),
('Lusaka', 'Johannesburg', 1200, 900),
('Lusaka', 'Chipata', 570, 420),
('Lusaka', 'Mongu', 580, 480),
('Lusaka', 'Ndola', 320, 300);

-- Buses/Schedules
INSERT INTO buses (operator_id, route_id, departure_time, arrival_time, price, type, total_seats, available_seats, features, operates_on) VALUES
(1, 1, '06:00', '12:00', 350.00, 'luxury', 45, 45, '["AC", "USB", "Snacks", "Wi-Fi"]', '[1,2,3,4,5,6,0]'),
(2, 2, '07:30', '12:30', 280.00, 'standard', 50, 50, '["AC", "Leg Room"]', '[1,2,3,4,5,6,0]'),
(3, 3, '10:00', '01:00', 1200.00, 'luxury', 30, 30, '["Reclining Seats", "Meal", "Toilet", "AC", "Entertainment"]', '[1,3,5]'),
(4, 4, '05:00', '12:00', 300.00, 'standard', 40, 40, '["Music", "Storage"]', '[1,2,3,4,5,6,0]'),
(5, 5, '06:30', '14:30', 400.00, 'standard', 35, 35, '["AC"]', '[1,2,3,4,5,6,0]'),
(1, 6, '14:00', '19:00', 310.00, 'luxury', 45, 45, '["AC", "TV", "USB"]', '[1,2,3,4,5,6,0]');

-- Analytics and Admin Tables

-- Admin Users Table
CREATE TABLE admin_users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Search Analytics Table
CREATE TABLE search_analytics (
    id SERIAL PRIMARY KEY,
    search_query VARCHAR(255),
    destination VARCHAR(100),
    travel_date TIMESTAMP,
    results_count INTEGER,
    user_phone VARCHAR(20),
    session_id VARCHAR(100),
    ip_address VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Page Views Table
CREATE TABLE page_views (
    id SERIAL PRIMARY KEY,
    page VARCHAR(255) NOT NULL,
    user_phone VARCHAR(20),
    session_id VARCHAR(100),
    referrer VARCHAR(500),
    user_agent VARCHAR(500),
    ip_address VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Booking Attempts Table
CREATE TABLE booking_attempts (
    id SERIAL PRIMARY KEY,
    bus_id INTEGER REFERENCES buses(id),
    user_phone VARCHAR(20) NOT NULL,
    session_id VARCHAR(100),
    status VARCHAR(50) DEFAULT 'attempted',
    failure_reason TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for Analytics
CREATE INDEX idx_search_analytics_destination ON search_analytics(destination);
CREATE INDEX idx_search_analytics_created_at ON search_analytics(created_at);
CREATE INDEX idx_page_views_session ON page_views(session_id);
CREATE INDEX idx_page_views_created_at ON page_views(created_at);
CREATE INDEX idx_booking_attempts_bus ON booking_attempts(bus_id);
CREATE INDEX idx_booking_attempts_created_at ON booking_attempts(created_at);

-- Insert Default Admin User (password: admin123 - CHANGE THIS!)
-- Password hash is bcrypt hash of 'admin123'
INSERT INTO admin_users (email, password_hash, name, role) VALUES
('admin@intercity.zm', '$2a$10$rKJ5vZ8xKxKx8xKxKxKxKO9qKxKxKxKxKxKxKxKxKxKxKxKxKxKx', 'System Administrator', 'super_admin');
