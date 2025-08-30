# HOF Lineup Generator

A professional lineup design generator for sports matches. This project includes both a WhatsApp bot and a standalone web application.

## Features

- 🎨 Generate professional lineup designs
- 📱 WhatsApp bot integration (original)
- 🌐 Web application interface (new)
- 🎯 Support for multiple formats (5v5, 6v6, 7v7, 8v8, 9v9, 10v10, 11v11)
- 🎭 Multiple template designs
- 📥 Download generated images

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd hof-whatsapp-bot-lineups
```

2. Install dependencies:
```bash
npm install
```

## Usage

### Web Application (Recommended)

The web app eliminates the need for WhatsApp and provides a simple interface with dropdown selections.

1. Start the web server:
```bash
npm start
# or
./start-webapp.sh
# or
node webapp.js
```

2. Open your browser and navigate to:
```
http://localhost:3000
```

3. **Select template and city** from the dropdown menus, then **paste your WhatsApp message** in the text area. The app will automatically extract all the required information including:
   - Date and game time
   - Venue
   - Format (5v5, 6v6, etc.)
   - Team names
   - Player names for both teams

4. Click "Generate Lineup Design" to create your image

5. Download the generated image

**Example WhatsApp message format:**
```
🥅HOF PICK-UP GAMES🥅

📅Date: 30/08/2025, Saturday GAME
Venue: Bengaluru Football Turf, Hennur Cross
⚽Format: 6v6 ⚽ 
⌚Game Time: 8:00PM- 9:00 PM

>🔥🔥 MAIN LIST🔥🔥

Team black
1. Charan
2. +1
3. +2

Team white
1. Juniad bhaiya (GK)
2. Vishakh 
3. Edwin

Waitlist 
1. 
2. 
```

**Note:** Template and City are now selected from dropdown menus, so you don't need to include "Type : Lineup X" or "City: X" in your message.

### WhatsApp Bot (Original)

If you prefer to use the WhatsApp bot:

1. Run the bot:
```bash
npm run start:bot
# or
node index.js
```

2. Scan the QR code with your WhatsApp
3. Send a message in the configured group with the format:
```
Type : Lineup 1
Game Time: 7:00 PM
Date: 15th December
City: New York
Venue: Central Park
Format: 5v5

Main List
Team KFC (Black Jersey)
1. John Doe
2. Jane Smith
3. Bob Johnson
4. Alice Brown
5. Charlie Wilson

Team McDonald's (White Jersey)
1. David Lee
2. Sarah Kim
3. Mike Chen
4. Lisa Wang
5. Tom Davis

Waitlist
...
```

## Project Structure

```
hof-whatsapp-bot-lineups/
├── index.js              # WhatsApp bot (original)
├── webapp.js             # Web application server
├── generateImage.js      # Image generation logic
├── public/
│   └── index.html        # Web interface
├── templates/            # Image templates
├── fonts/               # Custom fonts
├── output/              # Generated images
└── package.json
```

## Templates

- **Template 1**: Modern design with hexagonal team sections
- **Template 2**: Classic design with side-by-side team layouts
- **Template 3**: Modern design with green accents
- **Template 4**: Special 6v6 format only design

**Special City Templates:**
- **Gurgaon/Gurugram**: Get special template variants for Templates 2 and 3

## Supported Formats

- 5v5
- 6v6
- 7v7
- 8v8
- 9v9
- 10v10
- 11v11

## Dependencies

- `express`: Web server framework
- `canvas`: Image generation
- `whatsapp-web.js`: WhatsApp bot functionality
- `puppeteer`: Browser automation
- `jimp`: Image processing

## License

ISC
