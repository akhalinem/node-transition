#!/bin/bash

# Simple logging script for LOGS.md
# Usage: ./log.sh "Your log entry"

LOGS_FILE="LOGS.md"
TIMESTAMP=$(date "+%H:%M")
DATE_HEADER=$(date "+### %A, %B %-d")
MONTH_HEADER=$(date "+## %B %Y")

if [ -z "$1" ]; then
    echo "Usage: ./log.sh \"Your log entry\""
    echo ""
    echo "Examples:"
    echo "  ./log.sh \"Started event loop study\""
    echo "  ./log.sh \"Completed exercise 1\""
    exit 1
fi

# Check if month header exists, if not add it
if ! grep -q "^$MONTH_HEADER" "$LOGS_FILE"; then
    echo "" >> "$LOGS_FILE"
    echo "$MONTH_HEADER" >> "$LOGS_FILE"
    echo "" >> "$LOGS_FILE"
fi

# Check if today's date header exists, if not add it
if ! grep -q "^$DATE_HEADER" "$LOGS_FILE"; then
    echo "$DATE_HEADER" >> "$LOGS_FILE"
    echo "" >> "$LOGS_FILE"
fi

# Add the log entry
echo "**$TIMESTAMP** - $1" >> "$LOGS_FILE"

echo "✓ Logged to $LOGS_FILE"
