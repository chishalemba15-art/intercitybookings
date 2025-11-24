#!/bin/bash
# Wrapper script for booking generator cron job

# Load environment variables
if [ -f ~/.booking-generator-env ]; then
    source ~/.booking-generator-env
fi

# Set working directory
cd "$(dirname "$0")"

# Run the generator
python3 generate-bookings-ai.py "$@"

# Exit with the same status as the Python script
exit $?
