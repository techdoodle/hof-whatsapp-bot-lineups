# HOF WhatsApp Bot - Lineup, MVP & Team Pic Generator

A comprehensive WhatsApp bot and web application for generating HOF (Hall of Fame) lineup designs, MVP designs, and team pic designs.

## Features

### 🏆 Lineup Generator
- Generate lineup designs from WhatsApp messages
- Extract team information, player names, and match details
- Support for multiple templates and cities
- No image upload required

### 🏆 MVP Generator
- Generate MVP designs with player photos
- Form-based input (no WhatsApp message parsing required)
- Image upload functionality for player photos
- Input fields for: MVP name, city, venue, date, format, game time
- Customizable templates

### 👥 Team Pic Generator
- Generate team pic designs with team photos
- Extract match information from WhatsApp messages
- Image upload functionality for team photos
- Professional team presentation designs

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

3. Start the web application:
```bash
npm start
```

4. Start the WhatsApp bot:
```bash
npm run start:bot
```

## Usage

### Web Application

1. Open your browser and navigate to `http://localhost:3000`
2. Select the type of design you want to generate:
   - **Lineup**: For team lineup designs
   - **MVP**: For MVP player designs
   - **Team Pic**: For team photo designs

3. Fill in the required information:
   - Template number
   - City
   - **For Lineup/Team Pic**: Paste WhatsApp message
   - **For MVP**: Fill in form fields (player name, venue, date, format, game time)
   - Upload image (for MVP and Team Pic)

4. Click "Generate Design" to create your design

### WhatsApp Bot

The bot automatically monitors WhatsApp messages and generates designs based on message content:

#### Lineup Messages
- Must contain "Type : lineup" in the message
- Extracts team information and player lists
- No image required

#### MVP Messages
- Must contain "Type : mvp" in the message
- Must include an image attachment
- Extracts MVP player information
- Player name should be marked with "(MVP)" in the message

**Note**: For the web application, MVP generation uses form inputs instead of WhatsApp message parsing.

#### Team Pic Messages
- Must contain "Type : team pic" in the message
- Must include an image attachment
- Extracts match information

## Message Formats

### Lineup Message Format
```
🥅HOF PICK-UP GAMES🥅

📅Date: 30/08/2025, Saturday GAME
Venue: Bengaluru Football Turf, Hennur Cross
⚽Format: 6v6 ⚽ 
⌚Game Time: 8:00PM- 9:00 PM
City: Bengaluru

>🔥🔥 MAIN LIST🔥🔥

Team black
1. Charan
2. Player2
3. Player3

Team white
1. Player4 (GK)
2. Player5
3. Player6
```

### MVP Message Format
```
🥅HOF PICK-UP GAMES🥅

📅Date: 30/08/2025, Saturday GAME
Venue: Bengaluru Football Turf, Hennur Cross
⚽Format: 6v6 ⚽ 
⌚Game Time: 8:00PM- 9:00 PM
City: Bengaluru

>🔥🔥 MAIN LIST🔥🔥

Team black
1. Charan
2. Player2
3. Player3

Team white
1. Player4 (GK)
2. Vishakh (MVP)
3. Player6
```

### Team Pic Message Format
```
🥅HOF PICK-UP GAMES🥅

📅Date: 30/08/2025, Saturday GAME
Venue: Bengaluru Football Turf, Hennur Cross
⚽Format: 6v6 ⚽ 
⌚Game Time: 8:00PM- 9:00 PM
City: Bengaluru

>🔥🔥 MAIN LIST🔥🔥

Team black
1. Charan
2. Player2
3. Player3

Team white
1. Player4 (GK)
2. Player5
3. Player6
```

## Templates

The application supports multiple templates:

- **Template 1**: Modern Hex Design
- **Template 2**: Classic Design
- **Template 3**: Modern Design
- **Template 4**: 6v6 Special (6v6 format only)

Special templates are available for Gurgaon/Gurugram cities.

## File Structure

```
hof-whatsapp-bot-lineups/
├── index.js                 # WhatsApp bot main file
├── webapp.js               # Web application server
├── generateImage.js        # Lineup image generator
├── generateImageMvpTeam.js # MVP/Team Pic image generator
├── public/
│   └── index.html         # Web interface
├── templates/             # Design templates
├── fonts/                 # Font files
├── output/               # Generated images
├── media/                # Uploaded images
└── package.json
```

## Configuration

### WhatsApp Bot Configuration

1. Update the `GROUP_ID` in `index.js` with your target WhatsApp group ID
2. Run the bot and scan the QR code with WhatsApp Web
3. The bot will automatically process messages from the specified group

### Web Application Configuration

The web application runs on port 3000 by default. You can change this by setting the `PORT` environment variable.

## Dependencies

- `whatsapp-web.js`: WhatsApp Web API client
- `express`: Web framework
- `canvas`: Image generation
- `multer`: File upload handling
- `qrcode-terminal`: QR code display

## Troubleshooting

### Common Issues

1. **Bot not connecting**: Make sure you have a stable internet connection and scan the QR code within the time limit
2. **Image generation fails**: Check that all required fonts and templates are present in the respective directories
3. **File upload issues**: Ensure the media directory has write permissions

### Logs

Check the console output for detailed error messages and processing information.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Support

For support and questions, please contact the development team.
