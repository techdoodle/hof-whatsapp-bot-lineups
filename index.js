const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');


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


const fs = require('fs');
const { MessageMedia } = require('whatsapp-web.js');



/* UNCOMMENT THIS FUNCTION, AND COMMENT OUT THE FIRST LINE OF THE NEXT FUNCTION -> if (msg.from !== GROUP_ID) return; AND SEND A MSG ON THE GROUP WHOSE ID YOU WANT USING ANOTHER NUMBER (NOT THE ONE YOU ARE LOGGED IN WITH) TO GET THE REQUIRED GROUP'S ID
AND REPLACE IT IN ABOVE GROUP_ID VARIABLE, */
/*
client.on('message', async msg => {
  console.log(`Received message from: ${msg.from}`);
  const chat = await msg.getChat();
  console.log(`Chat name: ${chat.name}`);
  console.log(`Chat ID: ${chat.id._serialized}`);
});
*/

//copy and paste your required group id from console to the GROUP_ID variable
<<<<<<< HEAD
const GROUP_ID = '120363420076738705@g.us';
const GROUP_ID_ch = '120363421963082693@g.us'; // so that msg extraction takes place from specific group
=======
const GROUP_ID = '120363420076738705@g.us'; // so that msg extraction takes place from specific group
>>>>>>> dcaa0f2 (initial commit for template 1)

//AFTER GETTIG THE GROUP ID PLEASE COMMENT OUT THE FUNCTION ABOVE AND UNCOMMENT THE LINE->if (msg.from !== GROUP_ID) return; IN THE FUNCTION BELOW TO READ MESSAGES FROM YOUR REQUIRED GROUP ONLY

client.on('message', async msg => {
  // Ignore if not from our target group
  if (msg.from !== GROUP_ID) return;

  const body = msg.body.trim();
  
  // New detection logic: Type 
  if (!body.toLowerCase().includes('type : lineup')) return;

  console.log('\nMatch Message Detected!\n');

  const lines = body.split('\n');

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
  const { exec } = require('child_process');

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
});

client.initialize();