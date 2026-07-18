const { PrismaClient } = require('./node_modules/@prisma/client');
const prisma = new PrismaClient();

const desc = `ABOUT THIS ITEM
✅ POWERFUL 80W SOUND: Enjoy room-filling audio with 80W RMS (160W peak) output for movies, music, and gaming.
✅ 2.1 CHANNEL SURROUND: Dual full-range drivers combined with a powerful wired subwoofer create a wider soundstage and deep, punchy bass.
✅ HDMI ARC CONNECTIVITY: Connect directly to your TV using HDMI ARC for high-quality digital audio, single remote control operation, and easy plug-and-play installation.
✅ MULTIPLE INPUT OPTIONS: Seamlessly connect via Bluetooth 5.0, HDMI ARC, Optical Input, USB Flash Drive, AUX (3.5mm), or Line-In.
✅ ADVANCED DSP & EQ MODES: Built-in Digital Signal Processor enhances clarity, while 4 dedicated EQ modes (Movie, Music, News, 3D) customize the sound to your content.
✅ CUSTOM AUDIO CONTROL: A bright LED display and full-function wireless remote let you effortlessly adjust bass, treble, input sources, and volume.

<strong>PRODUCT DETAILS / SPECIFICATIONS</strong>
Audio Channels: 2.1 Channel
RMS Output: 80W (160W Peak)
Subwoofer: Wired 5.25-inch
Soundbar Drivers: Dual 2.25-inch
Bluetooth: Version 5.0 (Up to 10m range)
Frequency Response: 55Hz – 20kHz
Signal-to-Noise Ratio: ≥66dB
Dimensions (Soundbar): 550 × 76 × 64 mm
Dimensions (Subwoofer): 115 × 250 × 420 mm
Power Supply: AC 110–240V, 50/60Hz

<strong>WHAT'S IN THE BOX</strong>
- 1 × Zoook Studio Blast Soundbar
- 1 × Wired Subwoofer
- 1 × Remote Control
- 1 × Power Cable
- 1 × AUX Cable
- 1 × User Manual & Certificate of Authenticity

With its combination of powerful sound, versatile connectivity, customizable audio settings, and stylish design, the Zoook Studio Blast delivers an engaging entertainment experience for everyday use.`;

async function updateDesc() {
  await prisma.product.updateMany({
    where: { name: 'ZOOK STUDIO BLAST' },
    data: { description: desc }
  });
  console.log('Amazon-style description updated');
}

updateDesc();
