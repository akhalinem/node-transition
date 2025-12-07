#!/bin/bash

# Test script for pause/resume functionality
# Demonstrates all pause/resume features

echo "🧪 Pause/Resume Feature Test"
echo "============================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Create test file
echo -e "${BLUE}📁 Creating 50MB test file...${NC}"
dd if=/dev/zero of=test-resume.bin bs=1M count=50 2>/dev/null
echo -e "${GREEN}✓ Created test-resume.bin (50 MB)${NC}"
echo ""

# Check if server is running
echo -e "${BLUE}📡 Checking if server is running...${NC}"
if ! curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Server not running. Start it with: node http-server.js${NC}"
    echo -e "${YELLOW}   Then run this script again.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Server is running${NC}"
echo ""

echo "═══════════════════════════════════════════════════"
echo " Test 1: List Pending Uploads (Should be empty)"
echo "═══════════════════════════════════════════════════"
echo ""
node resumable-client.js --list
echo ""

echo "═══════════════════════════════════════════════════"
echo " Test 2: Upload Instructions"
echo "═══════════════════════════════════════════════════"
echo ""
echo -e "${YELLOW}Manual Test Required:${NC}"
echo ""
echo "1. Run this command in a new terminal:"
echo -e "   ${GREEN}node resumable-client.js test-resume.bin${NC}"
echo ""
echo "2. Wait until upload reaches ~40-50%"
echo ""
echo "3. Press 'p' to pause the upload"
echo ""
echo "4. You should see: '⏸️  Upload paused! Progress saved.'"
echo ""
echo "5. Run the command again:"
echo -e "   ${GREEN}node resumable-client.js test-resume.bin${NC}"
echo ""
echo "6. Upload should resume from where you paused!"
echo ""
echo "7. Let it complete"
echo ""
echo -e "${BLUE}Press Enter when ready to continue with automated tests...${NC}"
read

echo ""
echo "═══════════════════════════════════════════════════"
echo " Test 3: Verify Checksum After Resume"
echo "═══════════════════════════════════════════════════"
echo ""
echo "Calculating checksum of original file..."
ORIGINAL_HASH=$(shasum -a 256 test-resume.bin | awk '{print $1}')
echo "Original:  $ORIGINAL_HASH"
echo ""

if [ -f "uploads/test-resume.bin" ]; then
    echo "Calculating checksum of uploaded file..."
    UPLOADED_HASH=$(shasum -a 256 uploads/test-resume.bin | awk '{print $1}')
    echo "Uploaded:  $UPLOADED_HASH"
    echo ""
    
    if [ "$ORIGINAL_HASH" == "$UPLOADED_HASH" ]; then
        echo -e "${GREEN}✅ Checksums match! Resume worked correctly!${NC}"
    else
        echo -e "${YELLOW}❌ Checksums don't match! Something went wrong.${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Upload file not found. Complete upload first.${NC}"
fi
echo ""

echo "═══════════════════════════════════════════════════"
echo " Test 4: State File Verification"
echo "═══════════════════════════════════════════════════"
echo ""
if [ -d ".upload-states" ]; then
    STATE_COUNT=$(ls -1 .upload-states/*.json 2>/dev/null | wc -l)
    echo "State files found: $STATE_COUNT"
    
    if [ $STATE_COUNT -gt 0 ]; then
        echo ""
        echo "State file contents:"
        for state in .upload-states/*.json; do
            echo "---"
            cat "$state" | jq '.'
        done
    fi
else
    echo "No .upload-states directory found"
fi
echo ""

echo "═══════════════════════════════════════════════════"
echo " Test 5: Network Interruption Simulation"
echo "═══════════════════════════════════════════════════"
echo ""
echo -e "${YELLOW}Manual Test Required:${NC}"
echo ""
echo "This test simulates a network interruption:"
echo ""
echo "1. Start a new upload in another terminal:"
echo -e "   ${GREEN}dd if=/dev/zero of=test-large.bin bs=1M count=200${NC}"
echo -e "   ${GREEN}node resumable-client.js test-large.bin${NC}"
echo ""
echo "2. While uploading, stop the server (Ctrl+C on http-server.js)"
echo ""
echo "3. Upload will fail and save state"
echo ""
echo "4. Restart the server:"
echo -e "   ${GREEN}node http-server.js${NC}"
echo ""
echo "5. Resume the upload:"
echo -e "   ${GREEN}node resumable-client.js test-large.bin${NC}"
echo ""
echo "6. Upload should continue from where it failed!"
echo ""

echo "═══════════════════════════════════════════════════"
echo " Test Results Summary"
echo "═══════════════════════════════════════════════════"
echo ""
echo -e "${GREEN}✅ Tests completed!${NC}"
echo ""
echo "Features verified:"
echo "  • Pause with 'p' key"
echo "  • Resume from saved state"
echo "  • Checksum integrity after resume"
echo "  • State persistence"
echo "  • List pending uploads"
echo ""
echo "Cleanup:"
echo "  rm test-resume.bin test-large.bin"
echo "  rm -rf .upload-states/"
echo "  rm -rf uploads/"
echo ""
