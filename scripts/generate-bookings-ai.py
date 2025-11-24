#!/usr/bin/env python3
"""
AI-Powered Booking Generator for IntercityBookings
Uses Hugging Face transformers to generate realistic booking data
Designed to run as a cron job on VPS
"""

import os
import sys
import random
from datetime import datetime, timedelta
import psycopg2
from psycopg2.extras import RealDictCursor
import requests
import json

# Hugging Face API Configuration
HUGGINGFACE_API_KEY = os.getenv('HUGGINGFACE_API_KEY', '')
HF_API_URL = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2"

# Database Configuration
DATABASE_URL = os.getenv('DATABASE_URL', '')

# Zambian cities and common names
ZAMBIAN_CITIES = ['Lusaka', 'Kitwe', 'Ndola', 'Livingstone', 'Kabwe', 'Chipata',
                  'Solwezi', 'Mongu', 'Kasama', 'Chingola']

ZAMBIAN_FIRST_NAMES = ['Chanda', 'Mwansa', 'Banda', 'Phiri', 'Mulenga', 'Tembo',
                       'Zulu', 'Lungu', 'Musonda', 'Kunda', 'Chilufya', 'Mutale',
                       'Bwalya', 'Kabwe', 'Chishimba', 'Mwila', 'Sakala']

ZAMBIAN_LAST_NAMES = ['Banda', 'Mwansa', 'Phiri', 'Tembo', 'Mulenga', 'Zulu',
                      'Lungu', 'Musonda', 'Chanda', 'Kunda', 'Siame', 'Hichilema',
                      'Mumba', 'Ng\'ombe', 'Sakala', 'Bwalya']

def generate_realistic_name_with_ai():
    """Use Hugging Face API to generate realistic Zambian name"""
    try:
        headers = {"Authorization": f"Bearer {HUGGINGFACE_API_KEY}"}
        prompt = "Generate one realistic Zambian full name (first and last name only):"

        payload = {
            "inputs": prompt,
            "parameters": {
                "max_new_tokens": 20,
                "temperature": 0.9,
                "top_p": 0.95,
                "do_sample": True
            }
        }

        response = requests.post(HF_API_URL, headers=headers, json=payload, timeout=10)

        if response.status_code == 200:
            result = response.json()
            if isinstance(result, list) and len(result) > 0:
                generated_text = result[0].get('generated_text', '')
                # Extract just the name after the prompt
                name = generated_text.replace(prompt, '').strip().split('\n')[0].strip()
                # Clean up and validate
                name_parts = name.split()
                if len(name_parts) >= 2:
                    return f"{name_parts[0]} {name_parts[1]}"
    except Exception as e:
        print(f"AI generation failed: {e}, using fallback")

    # Fallback to random Zambian names
    return f"{random.choice(ZAMBIAN_FIRST_NAMES)} {random.choice(ZAMBIAN_LAST_NAMES)}"

def generate_phone_number():
    """Generate realistic Zambian phone number"""
    prefixes = ['097', '096', '095', '077', '076']
    return f"+260{random.choice(prefixes)}{random.randint(1000000, 9999999)}"

def generate_booking_ref():
    """Generate unique booking reference"""
    timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
    random_suffix = ''.join(random.choices('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', k=4))
    return f"BK{timestamp}{random_suffix}"

def get_random_bus_and_route(conn):
    """Get random bus with route information"""
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute("""
                SELECT
                    b.id as bus_id,
                    b.route_id,
                    b.total_seats,
                    b.departure_time,
                    b.price,
                    o.name as operator_name,
                    r.from_city,
                    r.to_city
                FROM buses b
                JOIN operators o ON b.operator_id = o.id
                JOIN routes r ON b.route_id = r.id
                WHERE b.available_seats > 0
                ORDER BY RANDOM()
                LIMIT 1
            """)
            result = cursor.fetchone()
            return result
    except Exception as e:
        print(f"Error fetching bus: {e}")
        return None

def get_available_seat(conn, bus_id):
    """Get next available seat number for the bus"""
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            # Get booked seats
            cursor.execute("""
                SELECT seat_number FROM bookings
                WHERE bus_id = %s AND status = 'confirmed'
            """, (bus_id,))
            booked_seats = [row['seat_number'] for row in cursor.fetchall()]

            # Get total seats
            cursor.execute("SELECT total_seats FROM buses WHERE id = %s", (bus_id,))
            total_seats = cursor.fetchone()['total_seats']

            # Find available seat
            for seat in range(1, total_seats + 1):
                seat_str = f"{seat:02d}"
                if seat_str not in booked_seats:
                    return seat_str

            return None
    except Exception as e:
        print(f"Error getting seat: {e}")
        return None

def create_booking(conn, bus_info, seat_number, passenger_name, phone):
    """Create a new booking in the database"""
    try:
        with conn.cursor() as cursor:
            # Generate travel date (1-14 days from now)
            days_ahead = random.randint(1, 14)
            travel_date = (datetime.now() + timedelta(days=days_ahead)).date()

            booking_ref = generate_booking_ref()

            cursor.execute("""
                INSERT INTO bookings (
                    booking_ref,
                    passenger_name,
                    passenger_phone,
                    bus_id,
                    seat_number,
                    travel_date,
                    status,
                    payment_method,
                    total_amount,
                    created_at,
                    updated_at
                ) VALUES (
                    %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW()
                )
                RETURNING id
            """, (
                booking_ref,
                passenger_name,
                phone,
                bus_info['bus_id'],
                seat_number,
                travel_date,
                'confirmed',
                random.choice(['mobile_money', 'cash', 'card']),
                float(bus_info['price'])
            ))

            booking_id = cursor.fetchone()[0]

            # Update available seats
            cursor.execute("""
                UPDATE buses
                SET available_seats = available_seats - 1,
                    updated_at = NOW()
                WHERE id = %s
            """, (bus_info['bus_id'],))

            conn.commit()

            return {
                'id': booking_id,
                'ref': booking_ref,
                'passenger': passenger_name,
                'route': f"{bus_info['from_city']} → {bus_info['to_city']}",
                'operator': bus_info['operator_name'],
                'seat': seat_number
            }
    except Exception as e:
        conn.rollback()
        print(f"Error creating booking: {e}")
        return None

def generate_bookings(count=1, use_ai=True):
    """Generate realistic bookings"""
    if not DATABASE_URL:
        print("ERROR: DATABASE_URL environment variable not set")
        sys.exit(1)

    try:
        conn = psycopg2.connect(DATABASE_URL)
        print(f"✅ Connected to database")

        bookings_created = []

        for i in range(count):
            # Get random bus
            bus_info = get_random_bus_and_route(conn)
            if not bus_info:
                print(f"❌ No available buses found")
                continue

            # Get available seat
            seat_number = get_available_seat(conn, bus_info['bus_id'])
            if not seat_number:
                print(f"❌ No seats available on bus {bus_info['bus_id']}")
                continue

            # Generate passenger info
            if use_ai and HUGGINGFACE_API_KEY:
                passenger_name = generate_realistic_name_with_ai()
            else:
                passenger_name = f"{random.choice(ZAMBIAN_FIRST_NAMES)} {random.choice(ZAMBIAN_LAST_NAMES)}"

            phone = generate_phone_number()

            # Create booking
            booking = create_booking(conn, bus_info, seat_number, passenger_name, phone)

            if booking:
                bookings_created.append(booking)
                print(f"✅ Booking {i+1}/{count}: {booking['ref']} - {booking['passenger']} - {booking['route']} (Seat {booking['seat']})")
            else:
                print(f"❌ Failed to create booking {i+1}/{count}")

        conn.close()

        print(f"\n📊 Summary: {len(bookings_created)}/{count} bookings created successfully")
        return bookings_created

    except Exception as e:
        print(f"❌ Database error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    # Default: generate 1-3 bookings per run
    # When called from cron, this creates realistic FOMO effect
    count = random.randint(1, 3)

    # Check if count is passed as argument
    if len(sys.argv) > 1:
        try:
            count = int(sys.argv[1])
        except ValueError:
            print(f"Invalid count: {sys.argv[1]}, using random count")

    print(f"🚀 Generating {count} booking(s) with AI...")
    generate_bookings(count, use_ai=True)
