const { createCanvas, loadImage, registerFont } = require('canvas');
const fs = require('fs');
const path = require('path');

// Register fonts
registerFont(path.join(__dirname, 'fonts', 'Asap-Bold.ttf'), { family: 'Asap', weight: 'bold' });
registerFont(path.join(__dirname, 'fonts', 'Asap-Medium.ttf'), { family: 'Asap', weight: 'medium' });
registerFont(path.join(__dirname, 'fonts', 'CormorantGaramond-Bold.ttf'), { family: 'Cormorant', weight: 'bold' });
registerFont(path.join(__dirname, 'fonts', 'Anton-Regular.ttf'), { family: 'Anton'});
registerFont(path.join(__dirname, 'fonts', 'bebas neue.ttf'), { family: 'Bebas Neue', weight: 'bold'});
registerFont(path.join(__dirname, 'fonts', 'Neue.ttf'), { family: 'Neue', weight: 'bold'});

const args = process.argv.slice(2);
const matchId = args[0];
const date = args[1];
const venue = args[2];
const city = args[3];
const format = args[4];
const time = args[5];
const templateNumber = args[6];
const imageUrl = args[7];
const playerName = args[8] || '';

// Check if this is an MVP request (has playerName) or Team Pic request (no playerName)
const isMvpRequest = playerName && playerName.trim() !== '';

if (templateNumber === "1" && isMvpRequest) {
  // MVP Template
  (async () => {
    try {
      let templatePath = path.join(__dirname, 'templates', 'newtemplate_1.png');
      
      const outputPath = path.join(__dirname, 'output', `${matchId}_final.png`);
      const template = await loadImage(templatePath);

      const canvas = createCanvas(template.width, template.height);
      const ctx = canvas.getContext('2d');

      ctx.drawImage(template, 0, 0);

      // Add Player Image
      if (fs.existsSync(imageUrl)) {
        const playerImage = await loadImage(imageUrl);

        const frameWidth = 666.2;   // bounding box width
        const frameHeight = 933.3;  // bounding box height
        const frameX = 215.9;       // top-left of bounding box
        const frameY = 524.4;       // top-left of bounding box

        // Scale to cover (maintain aspect ratio)
        const scale = Math.max(frameWidth / playerImage.width, frameHeight / playerImage.height);
        const drawWidth = playerImage.width * scale;
        const drawHeight = playerImage.height * scale;

        ctx.save();

        // Move origin to center of frame
        ctx.translate(frameX + frameWidth / 2, frameY + frameHeight / 2);

        // Create clipping area
        ctx.beginPath();
        ctx.rect(-frameWidth / 2, -frameHeight / 2, frameWidth, frameHeight);
        ctx.clip();

        // Draw image centered in the clipped area
        ctx.drawImage(
          playerImage,
          -drawWidth / 2,
          -drawHeight / 2,
          drawWidth,
          drawHeight
        );

        ctx.restore();
      } else {
        console.warn("⚠️ Player image not found at:", imageUrl);
      }

      // Add text overlays
      ctx.font = 'bold 50px asap';
      ctx.textAlign = 'center';

      ctx.fillStyle = '#007b23';
      const playerText = `${playerName.trim()}`.toUpperCase(); 
      ctx.fillText(`${playerText}`, 540, 1578);

      const venueText = `${venue.trim()}`.toUpperCase(); 
      const timeText = ` ${time.trim()}`.toUpperCase();  
      const dateText = ` ${date.trim()}`.toUpperCase();
      const formatText = `${format.trim()}`.toUpperCase();
      const cityText = `${city.trim()}`.toUpperCase();
      
      ctx.font = 'bold 30px asap';
      ctx.fillStyle = 'white';
      ctx.fillText(`${venueText} | ${cityText}`, 545, 1675);
      ctx.fillText(`${dateText} | ${timeText}`, 545, 1720);
      ctx.fillText(`${formatText}`, 545, 1765);

      const out = fs.createWriteStream(outputPath);
      const stream = canvas.createPNGStream();
      stream.pipe(out);
      out.on('finish', () => console.log(`MVP Design saved at ${outputPath}`));

    } catch (err) {
      console.error("Error generating MVP image:", err.message);
      console.log("template not found");
    }
  })();
} else if (templateNumber === "1" && !isMvpRequest) {
  // Team Pic Template
  (async () => {
    try {
      let templatePath = path.join(__dirname, 'templates', 'teamtemplate_1.png');
      
      const outputPath = path.join(__dirname, 'output', `${matchId}_final.png`);
      const template = await loadImage(templatePath);

      const canvas = createCanvas(template.width, template.height);
      const ctx = canvas.getContext('2d');

      ctx.drawImage(template, 0, 0);

      // Add team Image
      if (fs.existsSync(imageUrl)) {
        const teamImage = await loadImage(imageUrl);

        const frameWidth = 790.7;   // bounding box width
        const frameHeight = 577;    // bounding box height
        const frameX = 144.3;       // top-left of bounding box
        const frameY = 781.8;       // top-left of bounding box
        
        // Scale to cover (keep aspect ratio)
        const scale = Math.max(frameWidth / teamImage.width, frameHeight / teamImage.height);
        const drawWidth = teamImage.width * scale;
        const drawHeight = teamImage.height * scale;
        const rotationAngle = 4.3 * Math.PI / 180;
        
        ctx.save();
        ctx.translate(frameX + frameWidth / 2, frameY + frameHeight / 2);
        ctx.rotate(rotationAngle);

        // Create rotated clipping area
        ctx.beginPath();
        ctx.rect(-frameWidth / 2, -frameHeight / 2, frameWidth, frameHeight);
        ctx.clip();

        // Draw image centered
        ctx.drawImage(teamImage, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);

        ctx.restore();
      } else {
        console.warn("⚠️ Team image not found at:", imageUrl);
      }

      // Add text overlays
      ctx.font = 'bold 50px asap';
      ctx.textAlign = 'center';

      const venueText = `${venue.trim()}`.toUpperCase(); 
      const timeText = ` ${time.trim()}`.toUpperCase();  
      const dateText = ` ${date.trim()}`.toUpperCase();
      const formatText = `${format.trim()}`.toUpperCase();
      const cityText = `${city.trim()}`.toUpperCase();
      
      ctx.fillStyle = 'white';
      ctx.fillText(`${cityText} GAME`, 545, 666);
      ctx.fillText(`${venueText}`, 545, 1570);
      ctx.fillText(`${dateText} | ${timeText}`, 545, 1630);
      ctx.fillText(`${formatText}`, 545, 1690);

      const out = fs.createWriteStream(outputPath);
      const stream = canvas.createPNGStream();
      stream.pipe(out);
      out.on('finish', () => console.log(`Team Pic Design saved at ${outputPath}`));

    } catch (err) {
      console.error("Error generating team pic image:", err.message);
      console.log("template not found");
    }
  })();
} else {
  console.log("No template found for template number:", templateNumber);
}
