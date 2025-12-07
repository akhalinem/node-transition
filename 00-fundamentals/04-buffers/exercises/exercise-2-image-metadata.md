# Exercise 2: Image Metadata Extractor

**Difficulty**: ⭐⭐⭐  
**Time**: 45-60 minutes

## Goal

Build a tool that extracts metadata from image files (PNG, JPEG, GIF) by parsing their binary headers. This is how image libraries and file browsers get image information without loading the entire file.

## Background

Image files store metadata in their headers:

- **PNG**: Width, height, bit depth, color type
- **JPEG**: Width, height, quality
- **GIF**: Width, height, color table size

## File Format Specifications

### PNG Format

```
Offset | Size | Field           | Value
-------|------|-----------------|-------
0      | 8    | PNG Signature   | 89 50 4E 47 0D 0A 1A 0A
8      | 4    | IHDR Length     | 13 (always)
12     | 4    | IHDR Type       | "IHDR"
16     | 4    | Width           | Big-endian uint32
20     | 4    | Height          | Big-endian uint32
24     | 1    | Bit Depth       | uint8
25     | 1    | Color Type      | uint8
26     | 1    | Compression     | uint8
27     | 1    | Filter          | uint8
28     | 1    | Interlace       | uint8
```

### JPEG Format

```
Offset | Size | Field           | Value
-------|------|-----------------|-------
0      | 2    | SOI Marker      | FF D8
2      | 2    | APP0 Marker     | FF E0
4      | 2    | Length          | Big-endian uint16
6      | 5    | Identifier      | "JFIF\0"
...    | ...  | ...             | ...
[SOF]  | 2    | SOF Marker      | FF C0 (or FF C2)
[SOF+2]| 2    | Length          | Big-endian uint16
[SOF+4]| 1    | Precision       | uint8
[SOF+5]| 2    | Height          | Big-endian uint16
[SOF+7]| 2    | Width           | Big-endian uint16
```

### GIF Format

```
Offset | Size | Field           | Value
-------|------|-----------------|-------
0      | 3    | Signature       | "GIF"
3      | 3    | Version         | "87a" or "89a"
6      | 2    | Width           | Little-endian uint16
8      | 2    | Height          | Little-endian uint16
10     | 1    | Packed Fields   | uint8
11     | 1    | BG Color Index  | uint8
12     | 1    | Pixel Aspect    | uint8
```

## Tasks

### Part 1: File Type Detection

```javascript
// TODO: Implement detectImageType()
function detectImageType(buffer) {
  // Check PNG signature: 89 50 4E 47 0D 0A 1A 0A
  // Check JPEG signature: FF D8
  // Check GIF signature: "GIF"
  // Return 'png', 'jpeg', 'gif', or null
}
```

### Part 2: PNG Parser

```javascript
// TODO: Implement parsePNG()
function parsePNG(buffer) {
  // Validate PNG signature
  // Read IHDR chunk:
  //   - Width (offset 16, 4 bytes, big-endian)
  //   - Height (offset 20, 4 bytes, big-endian)
  //   - Bit depth (offset 24, 1 byte)
  //   - Color type (offset 25, 1 byte)
  // Return metadata object
}

// Color types
const PNG_COLOR_TYPES = {
  0: "Grayscale",
  2: "RGB",
  3: "Indexed",
  4: "Grayscale + Alpha",
  6: "RGBA",
};
```

### Part 3: JPEG Parser

```javascript
// TODO: Implement parseJPEG()
function parseJPEG(buffer) {
  // Validate JPEG signature (FF D8)
  // Find SOF marker (FF C0 or FF C2)
  //   - Search through file for marker
  // Read from SOF:
  //   - Height (SOF+5, 2 bytes, big-endian)
  //   - Width (SOF+7, 2 bytes, big-endian)
  //   - Components (SOF+9, 1 byte)
  // Return metadata object
}
```

### Part 4: GIF Parser

```javascript
// TODO: Implement parseGIF()
function parseGIF(buffer) {
  // Validate GIF signature
  // Read version (offset 3-5)
  // Read dimensions:
  //   - Width (offset 6, 2 bytes, little-endian)
  //   - Height (offset 8, 2 bytes, little-endian)
  // Parse packed fields (offset 10):
  //   - Global color table flag (bit 7)
  //   - Color resolution (bits 4-6)
  //   - Global color table size (bits 0-2)
  // Return metadata object
}
```

### Part 5: Main Extractor Function

```javascript
// TODO: Implement extractMetadata()
function extractMetadata(filePath) {
  // Read first 1024 bytes (enough for headers)
  // Detect file type
  // Parse based on type
  // Return formatted metadata
}
```

### Part 6: Batch Processing

```javascript
// TODO: Implement processDirectory()
function processDirectory(dirPath) {
  // Read all files in directory
  // Filter for image files
  // Extract metadata from each
  // Display results in table format
}
```

## Expected Output

```
Analyzing: photo.jpg
📷 JPEG Image
   Dimensions: 1920 x 1080
   Components: 3 (RGB)
   Size: 245,832 bytes

Analyzing: logo.png
🖼️  PNG Image
   Dimensions: 256 x 256
   Bit Depth: 8
   Color Type: RGBA
   Size: 12,543 bytes

Analyzing: animation.gif
🎬 GIF Image
   Dimensions: 320 x 240
   Version: GIF89a
   Colors: 256
   Size: 89,432 bytes

Summary:
┌───────────┬───────┬────────┬──────────────┐
│ File      │ Type  │ Size   │ Dimensions   │
├───────────┼───────┼────────┼──────────────┤
│ photo.jpg │ JPEG  │ 240 KB │ 1920 x 1080  │
│ logo.png  │ PNG   │ 12 KB  │ 256 x 256    │
│ animation │ GIF   │ 87 KB  │ 320 x 240    │
└───────────┴───────┴────────┴──────────────┘
```

## Bonus Challenges

1. **BMP Support**: Add Windows Bitmap format
2. **EXIF Data**: Extract EXIF from JPEG (camera, date, GPS)
3. **Thumbnail Extraction**: Extract JPEG thumbnail
4. **Streaming**: Process files without loading entire file
5. **Corruption Detection**: Validate checksums
6. **Animated GIF**: Count frames in animated GIF
7. **PNG Chunks**: Parse all PNG chunks (tEXt, tIME, etc.)
8. **WebP Support**: Add WebP format

## Advanced: EXIF Parser

```javascript
// BONUS: Extract EXIF data from JPEG
function extractEXIF(buffer) {
  // Find APP1 marker (FF E1)
  // Read EXIF data:
  //   - Camera make/model
  //   - Date taken
  //   - GPS coordinates
  //   - Exposure settings
}
```

## Testing

Create test images:

```javascript
// Create tiny PNG (1x1 pixel)
const pngData = Buffer.from([
  0x89,
  0x50,
  0x4e,
  0x47,
  0x0d,
  0x0a,
  0x1a,
  0x0a, // PNG signature
  0x00,
  0x00,
  0x00,
  0x0d, // IHDR length
  0x49,
  0x48,
  0x44,
  0x52, // "IHDR"
  0x00,
  0x00,
  0x00,
  0x01, // Width: 1
  0x00,
  0x00,
  0x00,
  0x01, // Height: 1
  0x08,
  0x06,
  0x00,
  0x00,
  0x00, // 8-bit RGBA
  // ... rest of PNG data
]);

fs.writeFileSync("test.png", pngData);
```

Or download real images:

```bash
# Download sample images
curl -o test.jpg https://via.placeholder.com/150
curl -o test.png https://via.placeholder.com/150.png
curl -o test.gif https://via.placeholder.com/150.gif
```

## Verification

```bash
# Compare with system tools
file test.jpg
identify test.jpg  # ImageMagick
exiftool test.jpg  # EXIF tool

# Your tool should match!
node exercise-2-solution.js test.jpg
```

## Hints

1. Read only first 1-2KB (headers are at start)
2. Use big-endian for PNG/JPEG, little-endian for GIF
3. JPEG markers are scattered - need to search
4. Packed fields use bit operations
5. Validate signatures before parsing

## Common Mistakes

- ❌ Loading entire file (wasteful for metadata)
- ❌ Wrong endianness (PNG/JPEG use BE, GIF uses LE)
- ❌ Assuming marker positions (JPEG varies)
- ❌ Not validating file signatures
- ❌ Forgetting to handle truncated files

## Success Criteria

- ✅ Detects all three formats correctly
- ✅ Extracts dimensions accurately
- ✅ Handles real-world image files
- ✅ Validates file signatures
- ✅ Efficient (doesn't load entire file)
- ✅ Reports errors clearly

## Real-World Application

This is exactly how:

- File browsers show image dimensions
- Image libraries read metadata
- Photo organizers extract EXIF
- CDNs optimize images
- Build tools process assets

Good luck! 📸
