const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const path = require('path');
const fs = require('fs');
const { MessageMedia } = require('whatsapp-web.js');
const { exec } = require('child_process');

const client = new Client({
    authStrategy: new LocalAuth()
});

client.on('qr', qr => {
    console.log('Scan this QR code with your WhatsApp:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('WhatsApp Bot is ready!');
});

//copy and paste your required group id from console to the GROUP_ID variable
const GROUP_ID = '120363420076738705@g.us';
const GROUP_ID_ch = '120363421963082693@g.us'; // so that msg extraction takes place from specific group

// Ensure media directory exists
const mediaFolder = path.join(__dirname, 'media');
if (!fs.existsSync(mediaFolder)) {
    fs.mkdirSync(mediaFolder, { recursive: true });
}

client.on('message', async msg => {
  // Ignore if not from our target group
  if (msg.from !== GROUP_ID) return;

  const body = msg.body.trim();
  
  // Check for different message types
  const isLineup = body.toLowerCase().includes('type : lineup');
  const isMvp = body.toLowerCase().includes('type : mvp');
  const isTeamPic = body.toLowerCase().includes('type : team pic');
  
  if (!isLineup && !isMvp && !isTeamPic) return;

  console.log('\nMessage Detected!');
  console.log('Type:', isLineup ? 'Lineup' : isMvp ? 'MVP' : 'Team Pic');

  const lines = body.split('\n');

  // Handle Lineup messages (no image required)
  if (isLineup) {
    await handleLineupMessage(msg, lines);
  }
  // Handle MVP and Team Pic messages (image required)
  else if (isMvp || isTeamPic) {
    await handleImageMessage(msg, lines, isMvp ? 'mvp' : 'team_pic');
  }
});

async function handleLineupMessage(msg, lines) {
  console.log('Processing Lineup Message...');

  //data object
  const data = {
    matchId: '', // Will be generated from team names
    city: '',
    time:'',
    templateNumber:'',
    date: '',
    venue: '',
    format:'',
    team1: '',
    team2: '',
    team1Players: [],
    team2Players: [],
  };

  let currentTeam = null;
  let inMainList = false;
  let mainListDone=false;

  for (let i = 0; i < lines.length; i++) {
    const trimmedLine = lines[i].trim();
    if (!trimmedLine) continue;

    console.log(`Processing line ${i}: "${trimmedLine}"`);

    //if not in main list yet
    if(!inMainList && !mainListDone){
        //extract template type
        if (trimmedLine.toLowerCase().includes('type :')) {
          const templateMatch = trimmedLine.match(/type\s*:\s*(?:lineup\s*)?(\d+)/i);
          if (templateMatch) {
            data.templateNumber = templateMatch[1].trim(); // Only the number like "1", "2"
          }
        }

        // Extract time
        if (trimmedLine.toLowerCase().includes('game time:')) {
        const timeMatch = trimmedLine.match(/game time:\s*(.+)/i);
        if (timeMatch) {
            data.time = timeMatch[1].trim();
        }
        }
        
        // Extract date (handle emojis before "Date:")
        if (trimmedLine.toLowerCase().includes('date:')) {
        const dateMatch = trimmedLine.match(/date:\s*(.+)/i);
        if (dateMatch) {
            data.date = dateMatch[1].trim();
        }
        }

        //extract city
        if (trimmedLine.toLowerCase().includes('city:')) {
        const cityMatch = trimmedLine.match(/city:\s*(.+)/i);
        if (cityMatch) {
            data.city = cityMatch[1].trim();
        }
        }

        // Extract venue
        if (trimmedLine.toLowerCase().includes('venue:')) {
            const venueMatch=trimmedLine.match(/venue:\s*(.+)/i);
        if (venueMatch) {
            data.venue = venueMatch[1].trim();
        }
        }
        
        // Extract format
        if (trimmedLine.toLowerCase().includes('format:')) {
            const formatMatch=trimmedLine.match(/format:\s*(.+)/i);
            if(formatMatch){
                data.format = formatMatch[1].trim();
            }
        
        }

        // Check if we've reached the main list section
        if (trimmedLine.toLowerCase().includes('main list')) {
        inMainList = true;
        currentTeam = null;
        continue;
        }
    }
    // Only process team assignments if we're in the main list section
    if (inMainList) {
      // Check for team headers (e.g., "Team KFC (Black Jersey)")
      if (trimmedLine.toLowerCase().startsWith('team ')) {
        // Extract team name from the line (e.g., "Team KFC (Black Jersey)" -> "KFC")
        const teamMatch = trimmedLine.match(/^team\s+(.+?)(?:\s*\(|$)/i);
        if (teamMatch) {
          const teamName = teamMatch[1].trim();
          
          if (!data.team1) {
            data.team1 = teamName;
            currentTeam = 'team1';
            console.log(`Set Team 1: ${data.team1}`);
          } else if (!data.team2) {
            data.team2 = teamName;
            currentTeam = 'team2';
            console.log(`Set Team 2: ${data.team2}`);
          }
        }
        continue;
      }

      // Check for waitlist section (stop processing players)
      if (trimmedLine.toLowerCase().includes('waitlist') || trimmedLine.toLowerCase().includes('__')) {
        mainListDone=true;
        inMainList = false;
        currentTeam = null;
        break; // Stop processing entirely once we hit waitlist
      }

      // Process player names (lines starting with numbers)
if (currentTeam && /^\d+\./.test(trimmedLine)) {
  // 1. Remove leading number and dot (e.g., "1. ")
  let playerName = trimmedLine.replace(/^\d+\.\s*/, '').trim();

  // 2. Remove parentheses and content inside them (e.g., "(goalkeeper)")
  playerName = playerName.replace(/\s*\([^)]*\)/g, '').trim();

  // 3. Keep letters, numbers, spaces, + and -
  playerName = playerName.replace(/[^\w\s+-]/g, '').trim();

  if (playerName) {
    console.log(`Found player for ${currentTeam}: "${playerName}"`);
    if (currentTeam === 'team1') {
      data.team1Players.push(playerName);
    } else if (currentTeam === 'team2') {
      data.team2Players.push(playerName);
    }
  }
}
    }//main list over
  }//msg read

  // Generate match ID after extracting team names
  if (data.team1 && data.team2) {
    data.matchId = `${data.team1}_vs_${data.team2}_${data.city}_${data.templateNumber}`;
    console.log(`Generated Match ID: ${data.matchId}`);
  }

  console.log('Parsed Data:', data);

  // Validate required data
  if (!data.team1 || !data.team2 || !data.date || !data.time || !data.templateNumber || !data.venue || !data.format || !data.city || !Array.isArray(data.team1Players) || data.team1Players.length === 0 ||
  !Array.isArray(data.team2Players) || data.team2Players.length === 0) {
    console.error('Missing required match data');
    return;
  }

  // Generate image with parsed data
  const {matchId, team1, team2, date, venue, city, format, team1Players, team2Players ,time, templateNumber} = data;

  const command = `node generateImage.js "${matchId}" "${team1}" "${team2}" "${date}" "${city}" "${format}" "${venue}" "${team1Players.join(',')}" "${team2Players.join(',')}" "${time}" "${templateNumber}"`;

  console.log("Generating lineup design...");

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error running generateImage.js: ${error.message}`);
      return;
    }

    console.log(stdout);
    
    const finalImagePath = `./output/${matchId}_final.png`;
    if (fs.existsSync(finalImagePath)) {
      const mediaToSend = MessageMedia.fromFilePath(finalImagePath);
      client.sendMessage(msg.from, mediaToSend);
      console.log("Sent final design to WhatsApp group.");

      // Delete the file after 15 seconds
      setTimeout(() => {
        try {
          fs.unlinkSync(finalImagePath);
          console.log(`Deleted file: ${finalImagePath}`);
        } catch (err) {
          console.error(`Error deleting file: ${err.message}`);
        }
      }, 15000);
    } else {
      console.error("Output image not found.");
    }
  });
}

async function handleImageMessage(msg, lines, type) {
  console.log(`Processing ${type} Message...`);

  // Check if message has media
  if (!msg.hasMedia) {
    console.error('No image attached, skipping.');
    return;
  }

  let data = {};
  
  if (type === 'mvp') {
    data = { 
      matchId: '', 
      city: '', 
      venue: '', 
      time: '', 
      date: '', 
      format: '', 
      playerName: '', 
      imageUrl: '', 
      templateNumber: '' 
    };

    for (let line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;

      if (trimmedLine.toLowerCase().includes('type :')) {
        const m = trimmedLine.match(/type\s*:\s*(?:mvp\s*)?(\d+)/i);
        if (m) data.templateNumber = m[1].trim();
      }
      if (trimmedLine.toLowerCase().includes('game time:')) {
        const m = trimmedLine.match(/game time:\s*(.+)/i);
        if (m) data.time = m[1].trim();
      }
      if (trimmedLine.toLowerCase().includes('date:')) {
        const m = trimmedLine.match(/date:\s*(.+)/i);
        if (m) data.date = m[1].trim();
      }
      if (trimmedLine.toLowerCase().includes('city:')) {
        const m = trimmedLine.match(/city:\s*(.+)/i);
        if (m) data.city = m[1].trim();
      }
      if (trimmedLine.toLowerCase().includes('venue:')) {
        const m = trimmedLine.match(/venue:\s*(.+)/i);
        if (m) data.venue = m[1].trim();
      }
      if (trimmedLine.toLowerCase().includes('format:')) {
        const m = trimmedLine.match(/format:\s*(.+)/i);
        if (m) data.format = m[1].trim();
      }
      if (trimmedLine.toLowerCase().includes('(mvp')) {
        let m = trimmedLine.split('(mvp)')[0].trim();
        m = m.match(/^\d+\.\s*([A-Za-z\s]+)/);
        if (m) {
          data.playerName = m[1].trim();
          break;
        }
      }
    }

    if (!data.playerName || !data.city || !data.date || !data.format || !data.time || !data.venue) {
      console.error('Missing required MVP data, skipping message.');
      return;
    }

    data.matchId = `${data.playerName}_${data.city}_mvp`;
    console.log('MVP Match ID:', data.matchId);
  } else if (type === 'team_pic') {
    data = { 
      matchId: '', 
      city: '', 
      venue: '', 
      time: '', 
      date: '', 
      format: '', 
      imageUrl: '', 
      templateNumber: ''
    };

    for (let line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;

      if (trimmedLine.toLowerCase().includes('type :')) {
        const m = trimmedLine.match(/type\s*:\s*(?:team pic\s*)?(\d+)/i);
        if (m) data.templateNumber = m[1].trim();
      }
      if (trimmedLine.toLowerCase().includes('game time:')) {
        const m = trimmedLine.match(/game time:\s*(.+)/i);
        if (m) data.time = m[1].trim();
      }
      if (trimmedLine.toLowerCase().includes('date:')) {
        const m = trimmedLine.match(/date:\s*(.+)/i);
        if (m) data.date = m[1].trim();
      }
      if (trimmedLine.toLowerCase().includes('city:')) {
        const m = trimmedLine.match(/city:\s*(.+)/i);
        if (m) data.city = m[1].trim();
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

    if (!data.city || !data.date || !data.format || !data.time || !data.venue) {
      console.error('Missing required team pic data, skipping message.');
      return;
    }

    data.matchId = `${data.city}_${data.venue}_teampic`;
    console.log('Team Pic Match ID:', data.matchId);
  }

  // Download media
  try {
    const media = await msg.downloadMedia();
    const filename = `${data.matchId}.jpg`;
    const savedMediaPath = path.join(mediaFolder, filename);
    fs.writeFileSync(savedMediaPath, media.data, 'base64');
    data.imageUrl = savedMediaPath;
    console.log('Media saved:', savedMediaPath);
  } catch (error) {
    console.error('Error downloading media:', error);
    return;
  }

  console.log('Parsed Data:', data);

  // Run generateImage.js for MVP/Team Pic
  let command = '';
  if (type === 'mvp') {
    const {matchId, date, venue, city, format, time, templateNumber, imageUrl, playerName} = data;
    command = `node generateImageMvpTeam.js "${matchId}" "${date}" "${venue}" "${city}" "${format}" "${time}" "${templateNumber}" "${imageUrl}" "${playerName}"`;
    console.log('Executing MVP command:', command);
  } else {
    const {matchId, date, venue, city, format, time, templateNumber, imageUrl} = data;
    command = `node generateImageMvpTeam.js "${matchId}" "${date}" "${venue}" "${city}" "${format}" "${time}" "${templateNumber}" "${imageUrl}"`;
    console.log('Executing Team Pic command:', command);
  }

  exec(command, (error, stdout) => {
    if (error) {
      console.error('generateImageMvpTeam.js error:', error.message);
      return;
    }
    console.log('Generator output:', stdout);

    const finalImagePath = path.join(__dirname, 'output', `${data.matchId}_final.png`);
    if (!fs.existsSync(finalImagePath)) {
      console.error('Final image not found:', finalImagePath);
      return;
    }

    const mediaToSend = MessageMedia.fromFilePath(finalImagePath);
    client.sendMessage(msg.from, mediaToSend).then(() => {
      console.log('Sent final design to group.');

      // Delete after 30s
      setTimeout(() => {
        try {
          if (fs.existsSync(finalImagePath)) {
            fs.unlinkSync(finalImagePath);
            console.log('Deleted final image.');
          }
          if (fs.existsSync(data.imageUrl)) {
            fs.unlinkSync(data.imageUrl);
            console.log('Deleted original media.');
          }
        } catch (err) {
          console.error('Deletion error:', err.message);
        }
      }, 30000);
    });
  });
}

client.initialize();