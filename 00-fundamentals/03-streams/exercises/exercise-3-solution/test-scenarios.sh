#!/bin/bash

# Test Scenarios for Exercise 3 Upload Server
# Run these tests to verify all features work correctly

echo "🧪 Exercise 3 - Upload Server Test Scenarios"
echo "=============================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test 1: Create test files
echo -e "${BLUE}📁 Test 1: Creating test files...${NC}"
echo "Hello World" > test-small.txt
dd if=/dev/zero of=test-medium.bin bs=1M count=50 2>/dev/null
echo -e "${GREEN}✓ Created test-small.txt (12 bytes)${NC}"
echo -e "${GREEN}✓ Created test-medium.bin (50 MB)${NC}"
echo ""

# Test 2: Check if server is running
echo -e "${BLUE}📡 Test 2: Checking if server is running...${NC}"
if curl -s http://localhost:3000/upload > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Server is running on port 3000${NC}"
else
    echo -e "${YELLOW}⚠ Server not running. Start it with: node http-server.js${NC}"
    echo -e "${YELLOW}⚠ Some tests will be skipped${NC}"
fi
echo ""

# Test 3: Small file upload
echo -e "${BLUE}📤 Test 3: Testing small file upload...${NC}"
echo "Run: node test-client.js test-small.txt"
echo "Expected: Quick upload with 100% completion"
echo ""

# Test 4: Medium file upload with progress
echo -e "${BLUE}📊 Test 4: Testing medium file upload with progress...${NC}"
echo "Run: node test-client.js test-medium.bin"
echo "Expected: Progress bar, speed calculation, ETA"
echo ""

# Test 5: Retry logic (server down)
echo -e "${BLUE}🔄 Test 5: Testing retry logic...${NC}"
echo "1. Stop the server (Ctrl+C on http-server.js)"
echo "2. Run: node test-client.js test-small.txt"
echo "Expected: 3 retry attempts with delays: 1s, 2s, 4s"
echo "Then: 'Upload failed after 3 retries' message"
echo ""

# Test 6: Size validation
echo -e "${BLUE}📏 Test 6: Testing file size validation...${NC}"
echo "Creating 150MB file (exceeds 100MB limit)..."
dd if=/dev/zero of=test-large.bin bs=1M count=150 2>/dev/null
echo -e "${GREEN}✓ Created test-large.bin (150 MB)${NC}"
echo "Run: node test-client.js test-large.bin"
echo "Expected: 'FILE_TOO_LARGE' error, may retry based on config"
echo ""

# Test 7: Upload cancellation
echo -e "${BLUE}⚠️  Test 7: Testing upload cancellation...${NC}"
echo "1. Run: node test-client.js test-medium.bin"
echo "2. Press Ctrl+C during upload"
echo "Expected: 'Upload cancelled by user' message, clean exit"
echo ""

# Test 8: Checksum verification
echo -e "${BLUE}🔐 Test 8: Testing checksum verification...${NC}"
echo "Run: node test-client.js test-small.txt"
echo "Expected output should include:"
echo "  Server SHA256: <checksum>"
echo "  Client SHA256: <checksum>"
echo "  ✓ Checksums match! File integrity verified."
echo ""
echo "Verify manually:"
echo "  shasum -a 256 test-small.txt"
echo "  shasum -a 256 uploads/test-small.txt"
echo "Both should match"
echo ""

# Test 9: Web UI test
echo -e "${BLUE}🌐 Test 9: Testing Web UI...${NC}"
echo "1. Open html-client.html in a browser"
echo "2. Drag and drop test-medium.bin"
echo "3. Click 'Upload File'"
echo "Expected: Progress bar, speed, ETA, success message"
echo ""

# Test 10: Concurrent uploads
echo -e "${BLUE}⚡ Test 10: Testing concurrent uploads...${NC}"
echo "Run in 3 separate terminals simultaneously:"
echo "  Terminal 1: node test-client.js test-small.txt"
echo "  Terminal 2: node test-client.js test-medium.bin"
echo "  Terminal 3: node test-client.js test-small.txt"
echo "Expected: All complete successfully"
echo ""

# Test 11: cURL upload
echo -e "${BLUE}📡 Test 11: Testing cURL upload...${NC}"
echo "Run: curl -X POST -H 'X-Filename: curl-test.txt' --data-binary @test-small.txt http://localhost:3000/upload"
echo "Expected: SSE progress events in response"
echo ""

# Cleanup instructions
echo -e "${YELLOW}🧹 Cleanup:${NC}"
echo "To remove test files:"
echo "  rm test-*.txt test-*.bin"
echo "  rm -rf uploads/"
echo ""

echo -e "${GREEN}✅ Test scenarios ready!${NC}"
echo "Start the server first: node http-server.js"
echo "Then run the test commands above"
echo ""
