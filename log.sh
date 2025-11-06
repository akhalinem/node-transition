#!/bin/bash

# Interactive logging script for LOGS.md
# Usage: ./log.sh

LOGS_FILE="LOGS.md"

# Colors for better UX
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

add_log_entry() {
    local entry="$1"
    local timestamp=$(date "+%H:%M")
    local date_header=$(date "+### %A, %B %-d")
    local month_header=$(date "+## %B %Y")
    
    # Check if month header exists, if not add it
    if ! grep -q "^$month_header" "$LOGS_FILE"; then
        echo "" >> "$LOGS_FILE"
        echo "$month_header" >> "$LOGS_FILE"
        echo "" >> "$LOGS_FILE"
    fi
    
    # Check if today's date header exists, if not add it
    if ! grep -q "^$date_header" "$LOGS_FILE"; then
        echo "$date_header" >> "$LOGS_FILE"
        echo "" >> "$LOGS_FILE"
    fi
    
    # Add the log entry
    echo "**$timestamp** - $entry" >> "$LOGS_FILE"
    echo -e "${GREEN}✓${NC} Logged: ${BLUE}$timestamp${NC} - $entry"
}

# Welcome message
clear
echo -e "${YELLOW}📝 Interactive Logger${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo "Type your log entries (one per line)"
echo "Press Ctrl+C to exit"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Interactive loop
while true; do
    echo -n "> "
    read -r entry
    
    # Skip empty entries
    if [ -z "$entry" ]; then
        continue
    fi
    
    add_log_entry "$entry"
done
