const express = require('express');
const path = require('path');
const { exec } = require('child_process');
const fs = require('fs');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3000;

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, 'media');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '.jpg');
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Middleware
app.use(express.json());
app.use(express.static('public'));
app.use('/output', express.static('output'));
app.use('/media', express.static('media'));

// Ensure output directory exists
if (!fs.existsSync('./output')) {
    fs.mkdirSync('./output', { recursive: true });
}

// Function to parse WhatsApp message (without template and city)
function parseWhatsAppMessage(messageText) {
    const lines = messageText.split('\n');
    const data = {
        matchId: '',
        time: '',
        date: '',
        venue: '',
        format: '',
        team1: '',
        team2: '',
        team1Players: [],
        team2Players: [],
    };

    let currentTeam = null;
    let inMainList = false;
    let mainListDone = false;

    for (let i = 0; i < lines.length; i++) {
        const trimmedLine = lines[i].trim();
        if (!trimmedLine) continue;

        // Extract date
        if (trimmedLine.toLowerCase().includes('date:')) {
            const dateMatch = trimmedLine.match(/date:\s*(.+)/i);
            if (dateMatch) {
                data.date = dateMatch[1].trim();
            }
        }

        // Extract venue
        if (trimmedLine.toLowerCase().includes('venue:')) {
            const venueMatch = trimmedLine.match(/venue:\s*(.+)/i);
            if (venueMatch) {
                data.venue = venueMatch[1].trim();
            }
        }

        // Extract format
        if (trimmedLine.toLowerCase().includes('format:')) {
            const formatMatch = trimmedLine.match(/format:\s*(.+)/i);
            if (formatMatch) {
                data.format = formatMatch[1].trim();
            }
        }

        // Extract game time
        if (trimmedLine.toLowerCase().includes('game time:')) {
            const timeMatch = trimmedLine.match(/game time:\s*(.+)/i);
            if (timeMatch) {
                data.time = timeMatch[1].trim();
            }
        }

        // Check if we've reached the main list section
        if (trimmedLine.toLowerCase().includes('main list') || trimmedLine.includes('🔥🔥 MAIN LIST🔥🔥')) {
            inMainList = true;
            currentTeam = null;
            continue;
        }

        // Only process team assignments if we're in the main list section
        if (inMainList) {
            // Check for team headers (e.g., "Team black", "Team white")
            if (trimmedLine.toLowerCase().startsWith('team ')) {
                const teamMatch = trimmedLine.match(/^team\s+(.+?)(?:\s*\(|$)/i);
                if (teamMatch) {
                    const teamName = teamMatch[1].trim();
                    
                    if (!data.team1) {
                        data.team1 = teamName;
                        currentTeam = 'team1';
                    } else if (!data.team2) {
                        data.team2 = teamName;
                        currentTeam = 'team2';
                    }
                }
                continue;
            }

            // Check for waitlist section (stop processing players)
            if (trimmedLine.toLowerCase().includes('waitlist') || trimmedLine.includes('__')) {
                mainListDone = true;
                inMainList = false;
                currentTeam = null;
                break;
            }

            // Process player names (lines starting with numbers)
            if (currentTeam && /^\d+\./.test(trimmedLine)) {
                // Remove leading number and dot (e.g., "1. ")
                let playerName = trimmedLine.replace(/^\d+\.\s*/, '').trim();

                // Remove parentheses and content inside them (e.g., "(GK)")
                playerName = playerName.replace(/\s*\([^)]*\)/g, '').trim();

                // Keep letters, numbers, spaces, + and -
                playerName = playerName.replace(/[^\w\s+-]/g, '').trim();

                // Skip empty names or placeholder names like "+1", "+2", etc.
                if (playerName && !playerName.match(/^\+\d+$/)) {
                    if (currentTeam === 'team1') {
                        data.team1Players.push(playerName);
                    } else if (currentTeam === 'team2') {
                        data.team2Players.push(playerName);
                    }
                }
            }
        }
    }

    return data;
}

function parseMvpMessage(message) {
    const data = {};
    
    // Extract city
    const cityMatch = message.match(/City:\s*([^\n]+)/i);
    if (cityMatch) {
        data.city = cityMatch[1].trim();
    }
    
    // Extract game time
    const timeMatch = message.match(/Game Time:\s*([^\n]+)/i);
    if (timeMatch) {
        data.time = timeMatch[1].trim();
    }
    
    // Extract date
    const dateMatch = message.match(/Date:\s*([^\n]+)/i);
    if (dateMatch) {
        data.date = dateMatch[1].trim();
    }
    
    // Extract format
    const formatMatch = message.match(/Format:\s*([^\n]+)/i);
    if (formatMatch) {
        data.format = formatMatch[1].trim();
    }
    
    // Extract venue
    const venueMatch = message.match(/Venue:\s*([^\n]+)/i);
    if (venueMatch) {
        data.venue = venueMatch[1].trim();
    }
    
    // Extract MVP player name (look for player with (mvp) tag)
    const mvpMatch = message.match(/(\d+\.\s*[^(]+)\s*\(mvp\)/i);
    if (mvpMatch) {
        data.playerName = mvpMatch[1].replace(/^\d+\.\s*/, '').trim();
    }
    
    return data;
}

function parseTeamPicMessage(message) {
    const lines = message.split('\n');
    const data = {
        matchId: '',
        city: '',
        venue: '',
        time: '',
        date: '',
        format: '',
        templateNumber: ''
    };

    for (let line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine) continue;

        if (trimmedLine.toLowerCase().includes('game time:')) {
            const m = trimmedLine.match(/game time:\s*(.+)/i);
            if (m) data.time = m[1].trim();
        }
        if (trimmedLine.toLowerCase().includes('date:')) {
            const m = trimmedLine.match(/date:\s*(.+)/i);
            if (m) data.date = m[1].trim();
        }
        if (trimmedLine.toLowerCase().includes('venue:')) {
            const m = trimmedLine.match(/venue:\s*(.+)/i);
            if (m) data.venue = m[1].trim();
        }
        if (trimmedLine.toLowerCase().includes('format:')) {
            const m = trimmedLine.match(/format:\s*(.+)/i);
            if (m) data.format = m[1].trim();
        }
    }

    return data;
}

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/generate-lineup', upload.none(), async (req, res) => {
    try {
        const { templateNumber, city, messageText } = req.body;

        if (!templateNumber || !city || !messageText || !messageText.trim()) {
            return res.status(400).json({ 
                error: 'Please provide template number, city, and message text.' 
            });
        }

        // Parse the WhatsApp message (without template and city)
        const data = parseWhatsAppMessage(messageText);

        // Add template and city from dropdowns
        data.templateNumber = templateNumber;
        data.city = city;

        // Generate match ID after extracting team names
        if (data.team1 && data.team2) {
            data.matchId = `${data.team1}_vs_${data.team2}_${data.city}_${data.templateNumber}`;
        }

        // Validate required data
        if (!data.team1 || !data.team2 || !data.date || !data.time || !data.templateNumber || 
            !data.venue || !data.format || !data.city || 
            !Array.isArray(data.team1Players) || data.team1Players.length === 0 ||
            !Array.isArray(data.team2Players) || data.team2Players.length === 0) {
            return res.status(400).json({ 
                error: 'Could not extract all required information from the message. Please check the format and try again.',
                extractedData: data
            });
        }

        // Build command for generateImage.js
        const command = `node generateImage.js "${data.matchId}" "${data.team1}" "${data.team2}" "${data.date}" "${data.city}" "${data.format}" "${data.venue}" "${data.team1Players.join(',')}" "${data.team2Players.join(',')}" "${data.time}" "${data.templateNumber}"`;

        console.log("Generating lineup design...");

        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error running generateImage.js: ${error.message}`);
                return res.status(500).json({ 
                    error: 'Failed to generate image. Please try again.',
                    extractedData: data
                });
            }

            console.log(stdout);
            
            const finalImagePath = `./output/${data.matchId}_final.png`;
            if (fs.existsSync(finalImagePath)) {
                res.json({ 
                    success: true, 
                    imageUrl: `/output/${data.matchId}_final.png`,
                    matchId: data.matchId,
                    extractedData: data
                });
            } else {
                res.status(500).json({ 
                    error: 'Image generation completed but file not found.',
                    extractedData: data
                });
            }
        });

    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).json({ 
            error: 'Internal server error. Please try again.' 
        });
    }
});

app.post('/generate-mvp', upload.single('image'), async (req, res) => {
    try {
        const { city, venue, date, format, time, playerName } = req.body;

        if (!city || !venue || !date || !format || !time || !playerName || !playerName.trim()) {
            return res.status(400).json({ 
                error: 'Please provide all required fields: city, venue, date, format, game time, and player name.' 
            });
        }

        if (!req.file) {
            return res.status(400).json({ 
                error: 'Please upload an image for the MVP.' 
            });
        }

        // Create data object from form inputs with default template
        const data = {
            templateNumber: '1', // Default template for MVP
            city: city,
            venue: venue,
            date: date,
            format: format,
            time: time,
            playerName: playerName,
            imageUrl: req.file.path,
            matchId: `${playerName}_${city}_mvp`
        };

        console.log('MVP Data:', data);

        // Build command for generateImageMvpTeam.js
        const command = `node generateImageMvpTeam.js "${data.matchId}" "${data.date}" "${data.venue}" "${data.city}" "${data.format}" "${data.time}" "${data.templateNumber}" "${data.imageUrl}" "${data.playerName}"`;

        console.log("Generating MVP design...");

        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error running generateImageMvpTeam.js: ${error.message}`);
                return res.status(500).json({ 
                    error: 'Failed to generate image. Please try again.',
                    extractedData: data
                });
            }

            console.log(stdout);
            
            const finalImagePath = `./output/${data.matchId}_final.png`;
            if (!fs.existsSync(finalImagePath)) {
                return res.status(500).json({ 
                    error: 'Image generation completed but file not found.',
                    extractedData: data
                });
            }

            res.json({ 
                success: true, 
                imageUrl: `/output/${data.matchId}_final.png`,
                matchId: data.matchId,
                extractedData: data
            });
        });

    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).json({ 
            error: 'Internal server error. Please try again.' 
        });
    }
});

app.post('/generate-team-pic', upload.single('image'), async (req, res) => {
    try {
        const { city, messageText } = req.body;

        if (!city || !messageText || !messageText.trim()) {
            return res.status(400).json({ 
                error: 'Please provide city and message text.' 
            });
        }

        if (!req.file) {
            return res.status(400).json({ 
                error: 'Please upload an image for the team pic.' 
            });
        }

        // Parse the WhatsApp message
        const data = parseTeamPicMessage(messageText);

        // Add template and city from form with default template
        data.templateNumber = '1'; // Default template for team pic
        data.city = city;
        data.imageUrl = req.file.path;

        // Generate match ID
        data.matchId = `${data.city}_${data.venue}_teampic`;

        // Validate required data
        if (!data.date || !data.time || !data.venue || !data.format) {
            return res.status(400).json({ 
                error: 'Could not extract all required information from the message. Please check the format and try again.',
                extractedData: data
            });
        }

        // Build command for generateImageMvpTeam.js
        const command = `node generateImageMvpTeam.js "${data.matchId}" "${data.date}" "${data.venue}" "${data.city}" "${data.format}" "${data.time}" "${data.templateNumber}" "${data.imageUrl}"`;

        console.log("Generating team pic design...");

        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error running generateImageMvpTeam.js: ${error.message}`);
                return res.status(500).json({ 
                    error: 'Failed to generate image. Please try again.',
                    extractedData: data
                });
            }

            console.log(stdout);
            
            const finalImagePath = `./output/${data.matchId}_final.png`;
            if (!fs.existsSync(finalImagePath)) {
                return res.status(500).json({ 
                    error: 'Image generation completed but file not found.',
                    extractedData: data
                });
            }

            res.json({ 
                success: true, 
                imageUrl: `/output/${data.matchId}_final.png`,
                matchId: data.matchId,
                extractedData: data
            });
        });

    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).json({ 
            error: 'Internal server error. Please try again.' 
        });
    }
});

app.listen(PORT, () => {
    console.log(`Web app running on http://localhost:${PORT}`);
    console.log('Open your browser and navigate to the URL above to use the lineup generator.');
});
