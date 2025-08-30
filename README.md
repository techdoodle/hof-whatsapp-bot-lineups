# WhatsApp Lineup Bot

A Node.js WhatsApp bot that automatically generates and sends sports team lineup images when lineup messages are posted in specific WhatsApp groups.

## Features

- **Automatic Detection**: Monitors WhatsApp groups for lineup messages
- **Multiple Templates**: Supports 4 different lineup image templates
- **Dynamic Formatting**: Adjusts font sizes and spacing based on team format (5v5, 6v6, 7v7, etc.)
- **City-Specific Templates**: Special templates for Gurgaon/Gurugram
- **Auto-Cleanup**: Deletes generated images after 15 seconds to save storage

## How It Works

### 1. Message Detection
The bot monitors a specific WhatsApp group for messages containing:
- `Type : Lineup` (case-insensitive)

### 2. Data Extraction
When a lineup message is detected, the bot parses:
- **Template Number**: Which design template to use (1-4)
- **Game Time**: When the match is scheduled
- **Date**: Match date
- **City**: Location of the match
- **Venue**: Specific venue name
- **Format**: Match format (5v5, 6v6, 7v7, 8v8, 9v9, 10v10, 11v11)
- **Team Names**: Extracted from "Team [Name]" lines
- **Player Lists**: All numbered players under each team

### 3. Image Generation
- Uses Canvas API to overlay text on template images
- Dynamically adjusts font sizes based on team format
- Positions player names and match details precisely
- Supports different layouts for different templates

### 4. Message Response
- Sends the generated image back to the same WhatsApp group
- Automatically deletes the image file after 15 seconds

## Project Structure

```
project-root/
├── index.js              # Main bot logic and WhatsApp integration
├── generateImage.js      # Image generation logic
├── package.json          # Project dependencies
├── fonts/               # Font files for text rendering
│   ├── Asap-Bold.ttf
│   ├── Asap-Medium.ttf
│   ├── CormorantGaramond-Bold.ttf
│   ├── Anton-Regular.ttf
│   └── bebas neue.ttf
├── templates/           # Template images
│   ├── hof_lineup_template_july2025.png
│   ├── hof_template2_gurugram.png
│   ├── hof_lineup_template_2.png
│   ├── template_3_gurgaon.png
│   ├── template_3.png
│   └── template_4.png
└── output/             # Temporary storage for generated images
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn package manager

### Installation Steps

1. **Clone/Download the project**
```bash
git clone <repository-url>
cd whatsapp-lineup-bot
```

2. **Install dependencies**
```bash
npm install
```

3. **Prepare directories**
Ensure these folders exist:
- `fonts/` - Add all required font files
- `templates/` - Add all template images
- `output/` - Will store generated images temporarily

4. **Configure Group ID**
   - Temporarily uncomment the group ID detection code in `index.js` (lines 23-29)
   - Run the bot and send a message in your target group
   - Copy the group ID from console
   - Update `GROUP_ID` variable in `index.js`
   - Comment out the detection code again

5. **Start the bot**
```bash
node index.js
```

6. **Scan QR Code**
   - A QR code will appear in your terminal
   - Scan it with WhatsApp on your phone
   - Wait for "WhatsApp Bot is ready!" message

## Message Format

The bot expects messages in this format:

```
Type : Lineup 1

Game Time: 7:00 PM
📅 Date: 25 Jan 2024
🏙️ City: Delhi
🏟️ Venue: Sports Complex
⚽ Format: 6v6

Main List:

Team Arsenal
1. John Smith
2. Mike Johnson
3. David Wilson
4. Chris Brown
5. Alex Davis
6. Tom Anderson

Team Chelsea  
1. Peter Parker
2. Bruce Wayne
3. Clark Kent
4. Tony Stark
5. Steve Rogers
6. Barry Allen

Waitlist:
7. Reserve Player
```

## Template Types

### Template 1
- Classic hex design
- Large player names in center
- Best for 5v5 to 11v11 formats
- File: `hof_lineup_template_july2025.png`

### Template 2
- Clean list format with numbering
- Special Gurgaon variant available
- Compact design for smaller formats
- Files: `hof_lineup_template_2.png`, `hof_template2_gurugram.png`

### Template 3
- Modern design with green accents
- Uppercase text styling
- Special Gurgaon variant available
- Files: `template_3.png`, `template_3_gurgaon.png`

### Template 4
- Specialized for 6v6 format only
- Unique hexagonal player positioning
- File: `template_4.png`

## Font Scaling Logic

The bot automatically adjusts font sizes based on team format:

| Format | Font Size | Line Height | Use Case |
|--------|-----------|-------------|-----------|
| 5v5    | 80px      | 170px       | Large text, few players |
| 6v6    | 73px      | 150px       | Medium-large text |
| 7v7    | 80px      | 120px       | Balanced sizing |
| 8v8    | 76px      | 100px       | Slightly smaller |
| 9v9    | 68px      | 90px        | Compact text |
| 10v10  | 64px      | 80px        | Small text |
| 11v11  | 60px      | 73px        | Smallest text |

## Configuration

### Key Variables to Modify

In `index.js`:
```javascript
// Target WhatsApp group ID
const GROUP_ID = '120363420076738705@g.us';

// Cleanup delay (milliseconds)
setTimeout(() => {
  // Delete file after 15 seconds
}, 15000);
```

In `generateImage.js`:
- Font paths and registrations
- Template file paths  
- Text positioning coordinates
- Color values and styling

## Troubleshooting

### Common Issues

1. **QR Code not appearing**
   - Check if port 3000 is available
   - Restart the application

2. **Bot not responding to messages**
   - Verify GROUP_ID is correct
   - Check message format matches expected pattern
   - Ensure "Type : Lineup" is present in message

3. **Images not generating**
   - Verify template files exist in `templates/` folder
   - Check font files are in `fonts/` folder
   - Ensure `output/` directory exists and is writable

4. **Font rendering issues**
   - Verify all font files are present
   - Check font file permissions
   - Restart bot after adding new fonts

### Debug Mode

To enable detailed logging, add console.log statements in:
- Message parsing sections
- Image generation functions
- File operations

### File Permissions

Ensure the bot has:
- Read access to `templates/` and `fonts/`
- Write access to `output/`
- Execute permissions for Node.js

## Maintenance

### Regular Tasks
- Monitor `output/` folder (should remain empty due to auto-cleanup)
- Check log files for errors
- Update template images as needed
- Backup font and template files

### Adding New Templates
1. Add template image to `templates/` folder
2. Create new condition in `generateImage.js`
3. Define text positioning coordinates
4. Test with sample data

### Modifying Text Positioning
- Use image editing software to identify pixel coordinates
- Update x,y values in `generateImage.js`
- Test with various team names and player counts

## Dependencies

- **whatsapp-web.js**: WhatsApp Web API wrapper
- **canvas**: HTML5 Canvas API for Node.js (image generation)
- **qrcode-terminal**: Display QR codes in terminal
- **jimp**: Image processing (backup/alternative)
- **puppeteer**: Headless browser (used by whatsapp-web.js)

## Security Notes

- Keep group IDs confidential
- Don't commit `.wwebjs_auth/` folder to version control
- Regularly update dependencies for security patches
- Monitor for unauthorized access to WhatsApp session

## Performance Considerations

- Bot processes one message at a time
- Image generation takes 2-5 seconds typically
- Memory usage increases with concurrent operations
- Consider restarting bot daily for optimal performance

---

**Note**: This bot is designed for sports lineup management. Ensure you have proper permissions to use it in WhatsApp groups and comply with WhatsApp's Terms of Service.