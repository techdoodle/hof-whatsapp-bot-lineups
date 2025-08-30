const { createCanvas, loadImage, registerFont } = require('canvas');
const fs = require('fs');
const path = require('path');

// Register fonts
registerFont(path.join(__dirname, 'fonts', 'Asap-Bold.ttf'), { family: 'Asap', weight: 'bold' });
registerFont(path.join(__dirname, 'fonts', 'Asap-Medium.ttf'), { family: 'Asap', weight: 'medium' });
registerFont(path.join(__dirname, 'fonts', 'CormorantGaramond-Bold.ttf'), { family: 'Cormorant', weight: 'bold' });
registerFont(path.join(__dirname, 'fonts', 'Anton-Regular.ttf'), { family: 'Anton'});
registerFont(path.join(__dirname, 'fonts', 'bebas neue.ttf'), { family: 'Bebas Neue', weight: 'bold'});

const args = process.argv.slice(2);
const matchId = args[0];
const team1 = args[1];
const team2 = args[2];
const date = args[3];
const city = args[4];
const format = args[5];
const venue = args[6];
const team1Players = args[7] ? args[7].split(',').map(p => p.trim()) : [];
const team2Players = args[8] ? args[8].split(',').map(p => p.trim()) : [];
const time=args[9];
const templateNumber=args[10];

if(templateNumber==="1"){
(async () => {
  
    try {
    const templatePath = path.join(__dirname, 'templates', 'hof_lineup_template_july2025.png');
    const outputPath = path.join(__dirname, 'output', `${matchId}_final.png`);
    const template = await loadImage(templatePath);

    const canvas = createCanvas(template.width, template.height);
    const ctx = canvas.getContext('2d');

    ctx.drawImage(template, 0, 0);

    // City (Top-left)
    ctx.font = 'bold 18px Asap';
    ctx.fillStyle = 'black';
    ctx.fillText(city.trim(), 50, 55);

    // Team Names
    ctx.font = 'italic bold 39px Cormorant';
    ctx.textAlign = 'center';
    //ctx.fillText(team1.trim(), 280, 700); // Left hex center
    //ctx.fillText(team2.trim(), 815, 700); // Right hex center


    // Split names into 2 lines if space exists
    const team1Lines = team1.trim().split(' ');
    const team2Lines = team2.trim().split(' ');

    // Left hex
    if (team1Lines.length === 1) {
    ctx.fillText(team1Lines[0], 280, 700);
    } else {
    ctx.fillText(team1Lines[0], 280, 670);
    ctx.fillText(team1Lines.slice(1).join(' '), 280, 710);
    }

    // Right hex
    if (team2Lines.length === 1) {
    ctx.fillText(team2Lines[0], 814, 700);
    } else {
    ctx.fillText(team2Lines[0], 814, 670);
    ctx.fillText(team2Lines.slice(1).join(' '), 812, 710);
    }

    // Player font and line height based on format
    
    let fontSize, lineHeight;
    if (format.includes("5")) {
      fontSize = 80;
      lineHeight = 170;
    }else if (format.includes("6")) {
      fontSize = 73;
      lineHeight = 150;
    }else if (format.includes("7")) {
      fontSize = 80;
      lineHeight = 120;
    }else if (format.includes("8")) {
      fontSize = 76;
      lineHeight = 100;
    }else if (format.includes("9")) {
      fontSize = 68;
      lineHeight = 90;
    } else if (format.includes("10")) {
      fontSize = 64;
      lineHeight = 80;
    }else if (format.includes("11")) {
      fontSize = 60;
      lineHeight = 73;
    } else {
      fontSize = 26;
      lineHeight = 35;
    }
    ctx.font = `${fontSize}px Asap`;
    ctx.textAlign = 'center';
    

    // Team 1 Players
    let startY1 = 920;
    const startX1 = 280;
    team1Players.forEach((player, i) => {
      const text = player.trim();
      ctx.fillText(text, startX1, startY1 + i * lineHeight);
    });

    // Team 2 Players
    let startY2 = 920;
    const startX2 = 815;
    team2Players.forEach((player, i) => {
      const text = player.trim();
      ctx.fillText(text, startX2, startY2 + i * lineHeight);
    });

    // Venue, Date, Format (Bottom-left)
    ctx.font = 'bold 32px Asap';
    ctx.textAlign = 'left';
    ctx.fillText(`${venue.trim()}`, 160, 1800);
    ctx.fillText(`${date.trim()}`, 135, 1845);
    ctx.fillText(`${format.trim()}`, 180, 1885);

    const out = fs.createWriteStream(outputPath);
    const stream = canvas.createPNGStream();
    stream.pipe(out);
    out.on('finish', () => console.log(`Design saved at ${outputPath}`));

  }
  catch (err) {
    console.error("Error generating image:", err.message);
    console.log("template not found");
  }
  
  
    
})();
}

else if (templateNumber==="2"){
  (async () => {
  
    try {
      let templatePath;
    if(city.includes("Gurgaon" || "Gurugram")){
      templatePath = path.join(__dirname, 'templates', 'hof_template2_gurugram.png');
    }
    else{
      templatePath = path.join(__dirname, 'templates', 'hof_lineup_template_2.png');
    }  
    
    const outputPath = path.join(__dirname, 'output', `${matchId}_final.png`);
    const template = await loadImage(templatePath);

    const canvas = createCanvas(template.width, template.height);
    const ctx = canvas.getContext('2d');

    ctx.drawImage(template, 0, 0);

    // City (Top-left)
    ctx.font = 'bold 20px Asap';
    ctx.fillStyle = 'white';
    ctx.fillText(city.trim(), 30, 310);

    // Team Names
    ctx.font = 'italic bold 40px Bebas Neue';
    ctx.textAlign = 'left';
    //ctx.fillText(team1.trim(), 280, 700); // Left hex center
    //ctx.fillText(team2.trim(), 815, 700); // Right hex center


    // Split names into 2 lines if space exists
    //const team1Lines = team1.trim().split(' ');
    //const team2Lines = team2.trim().split(' ');

    // Left hex
    //if (team1Lines.length === 1) {
    //ctx.fillText(team1Lines[0], 280, 700);
    //} else {
    //ctx.fillText(team1Lines[0], 280, 670);
    //ctx.fillText(team1Lines.slice(1).join(' '), 280, 710);
    //}
    ctx.fillText(team1.trim(), 30, 365);

    /*
    if (team2Lines.length === 1) {
    ctx.fillText(team2Lines[0], 814, 700);
    } else {
    ctx.fillText(team2Lines[0], 814, 670);
    ctx.fillText(team2Lines.slice(1).join(' '), 812, 710);
    }*/
   ctx.fillText(team2.trim(), 30, 785);

    // Player font and line height based on format
    
    let fontSize, lineHeight;
    if (format.includes("5")) {
      fontSize = 20;
      lineHeight = 40;
    }else if (format.includes("6")) {
      fontSize = 20;
      lineHeight = 40;
    }else if (format.includes("7")) {
      fontSize = 20;
      lineHeight = 35;
    }else if (format.includes("8")) {
      fontSize = 20;
      lineHeight = 30;
    }else if (format.includes("9")) {
      fontSize = 18;
      lineHeight = 28;
    } else if (format.includes("10")) {
      fontSize = 18;
      lineHeight = 25;
    }else if (format.includes("11")) {
      fontSize = 18;
      lineHeight = 23;
    } else {
      fontSize = 26;
      lineHeight = 35;
    }
    ctx.font = `bold ${fontSize}px Bebas Neue`;
    ctx.textAlign = 'left';
    

    // Team 1 Players
    let startY1 = 415;
    const startX1 = 45;
    team1Players.forEach((player, i) => {
      const text = `${i+1}. `+player.trim();
      ctx.fillText(text, startX1, startY1 + i * lineHeight);
    });

    // Team 2 Players
    let startY2 = 835;
    const startX2 = 45;
    team2Players.forEach((player, i) => {
      const text = `${i+1}. `+player.trim();
      ctx.fillText(text, startX2, startY2 + i * lineHeight);
    });

    // Venue, Date, Format (Bottom-left)
    ctx.font = 'bold 18px Asap';
    ctx.textAlign = 'left';
    ctx.fillText(`${venue.trim()}`, 30, 280);
    if(format.includes("10") || format.includes("11")){
      ctx.fillText(` ${time.trim()}`, 105, 250);
    }
    else {
      ctx.fillText(` ${time.trim()}`, 85, 250);
    }
    ctx.fillText(`${format.trim()} |`, 30, 250);

    const out = fs.createWriteStream(outputPath);
    const stream = canvas.createPNGStream();
    stream.pipe(out);
    out.on('finish', () => console.log(`Design saved at ${outputPath}`));

  }
  catch (err) {
    console.error("Error generating image:", err.message);
    console.log("template not found");
  }
  
  
    
})();
}

else if (templateNumber==="3"){
  (async () => {
  
    try {
    let templatePath;
    if(city.includes("Gurgaon" || "Gurugram")){
      templatePath = path.join(__dirname, 'templates', 'template_3_gurgaon.png');
    }
    else{
      templatePath = path.join(__dirname, 'templates', 'template_3.png');
    }  
    
    const outputPath = path.join(__dirname, 'output', `${matchId}_final.png`);
    const template = await loadImage(templatePath);

    const canvas = createCanvas(template.width, template.height);
    const ctx = canvas.getContext('2d');

    ctx.drawImage(template, 0, 0);

    // City (Top-left)
    
    ctx.fillStyle = '#00ff57';
    

    // Team Names
    ctx.font = 'bold 55px asap';
    ctx.textAlign = 'center';
    const team1Text = `${team1.trim()}`.toUpperCase(); 
    const team2Text = ` ${team2.trim()}`.toUpperCase(); 
    //ctx.fillText(team1.trim(), 280, 700); // Left hex center
    //ctx.fillText(team2.trim(), 815, 700); // Right hex center


    // Split names into 2 lines if space exists
    //const team1Lines = team1.trim().split(' ');
    //const team2Lines = team2.trim().split(' ');

    // Left hex
    //if (team1Lines.length === 1) {
    //ctx.fillText(team1Lines[0], 280, 700);
    //} else {
    //ctx.fillText(team1Lines[0], 280, 670);
    //ctx.fillText(team1Lines.slice(1).join(' '), 280, 710);
    //}
    ctx.fillText(team1Text, 540, 515);

    /*
    if (team2Lines.length === 1) {
    ctx.fillText(team2Lines[0], 814, 700);
    } else {
    ctx.fillText(team2Lines[0], 814, 670);
    ctx.fillText(team2Lines.slice(1).join(' '), 812, 710);
    }*/
   ctx.fillText(team2Text, 540, 1115);

    // Player font and line height based on format
    ctx.fillStyle = 'white';
    let fontSize, lineHeight;
    if (format.includes("5")) {
      fontSize = 40;
      lineHeight = 80;
    }else if (format.includes("6")) {
      fontSize = 40;
      lineHeight = 80;
    }else if (format.includes("7")) {
      fontSize = 40;
      lineHeight = 70;
    }else if (format.includes("8")) {
      fontSize = 40;
      lineHeight = 60;
    }else if (format.includes("9")) {
      fontSize = 40;
      lineHeight = 50;
    } else if (format.includes("10")) {
      fontSize = 40;
      lineHeight = 48;
    }else if (format.includes("11")) {
      fontSize = 35;
      lineHeight = 40;
    } else {
      fontSize = 26;
      lineHeight = 35;
    }
    ctx.font = `bold ${fontSize}px asap`;
    ctx.textAlign = 'left';
    

    // Team 1 Players
    let startY1 = 590;
    const startX1 = 430;//540 w/o no.
    team1Players.forEach((player, i) => {
      const text = `${i+1}. `+player.trim();
      ctx.fillText(text, startX1, startY1 + i * lineHeight);
    });

    // Team 2 Players
    let startY2 = 1190;
    const startX2 = 430;
    team2Players.forEach((player, i) => {
      const text = `${i+1}. `+player.trim();
      ctx.fillText(text, startX2, startY2 + i * lineHeight);
    });

    // Venue, Date, Format (Bottom-left)
    ctx.font = 'bold 20px asap';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#';
    const venueText = `${venue.trim()}`.toUpperCase(); 
    const timeText = ` ${time.trim()}`.toUpperCase();  
    const formatText = `${format.trim()}`.toUpperCase();
    const cityText = `${city.trim()}`.toUpperCase();
    ctx.fillText(`${venueText} | ${formatText} | ${timeText} | ${cityText}`, 538,402);
  

    const out = fs.createWriteStream(outputPath);
    const stream = canvas.createPNGStream();
    stream.pipe(out);
    out.on('finish', () => console.log(`Design saved at ${outputPath}`));

  }
  catch (err) {
    console.error("Error generating image:", err.message);
    console.log("template not found");
  }
  
  
    
})();
}
  else if (templateNumber==="4" && format.includes("6")){
    (async () => {
    
      try {
      let templatePath;
      
      templatePath = path.join(__dirname, 'templates', 'template_4.png');
      
      
      const outputPath = path.join(__dirname, 'output', `${matchId}_final.png`);
      const template = await loadImage(templatePath);

      const canvas = createCanvas(template.width, template.height);
      const ctx = canvas.getContext('2d');

      ctx.drawImage(template, 0, 0);

      ctx.fillStyle = '#00ff57';
      // Venue, Date, Format (Bottom-left)
      ctx.font = 'bold 20px asap';
      ctx.textAlign = 'center';
      const venueText = `${venue.trim()}`.toUpperCase(); 
      const timeText = ` ${time.trim()}`.toUpperCase();  
      const formatText = `${format.trim()}`.toUpperCase();
      const cityText = `${city.trim()}`.toUpperCase();
      ctx.fillText(`${venueText} | ${formatText} | ${timeText} | ${cityText}`, 691,544);

      
      // Team Names
      const team1Text = `${team1.trim()}`.toUpperCase(); 
      const team2Text = ` ${team2.trim()}`.toUpperCase(); 

        //team 1 name
      ctx.fillStyle = 'white';
      ctx.font = 'bold 25px asap';
      ctx.textAlign = 'center';
      ctx.fillText(team1Text, 502, 405);

      //team 2 name
    ctx.fillStyle = 'black';
      ctx.font = 'italic bold 25px asap';
      ctx.textAlign = 'center';
    ctx.fillText(team2Text, 890, 405);

      

      // Team 1 Players
      ctx.fillStyle = 'white';
      ctx.font = 'bold 18px asap';
      ctx.textAlign = 'center';
    // Player 1
  if (team1Players[0]) {
      ctx.fillText(`${team1Players[0].trim()}`, 697, 790); 
  }

  // Player 2
  if (team1Players[1]) {
      ctx.fillText(`${team1Players[1].trim()}`, 520,929); 
  }

  // Player 3
  if (team1Players[2]) {
      ctx.fillText(`${team1Players[2].trim()}`, 869,929); 
  }

  // Player 4
  if (team1Players[3]) {
      ctx.fillText(`${team1Players[3].trim()}`, 697,1026); 
  }

  // Player 5
  if (team1Players[4]) {
      ctx.fillText(`${team1Players[4].trim()}`, 520,1123); 
  }

  // Player 6
  if (team1Players[5]) {
      ctx.fillText(`${team1Players[5].trim()}`, 869, 1123); 
  }
      

      // Team 2 Players
      // Player 1
  if (team2Players[0]) {
      ctx.fillText(`${team2Players[0].trim()}`, 520, 1288); 
  }

  // Player 2
  if (team2Players[1]) {
      ctx.fillText(`${team2Players[1].trim()}`, 697,1288); 
  }

  // Player 3
  if (team2Players[2]) {
      ctx.fillText(`${team2Players[2].trim()}`, 869,1288); 
  }

  // Player 4
  if (team2Players[3]) {
      ctx.fillText(`${team2Players[3].trim()}`, 520,1458); 
  }

  // Player 5
  if (team2Players[4]) {
      ctx.fillText(`${team2Players[4].trim()}`, 869,1458); 
  }

  // Player 6
  if (team2Players[5]) {
      ctx.fillText(`${team2Players[5].trim()}`, 697, 1614); 
  }

      

      const out = fs.createWriteStream(outputPath);
      const stream = canvas.createPNGStream();
      stream.pipe(out);
      out.on('finish', () => console.log(`Design saved at ${outputPath}`));

    }
    catch (err) {
      console.error("Error generating image:", err.message);
      console.log("template not found");
    }
    
    
      
  })();
  }
  else{
    console.log("No template found");
  }
