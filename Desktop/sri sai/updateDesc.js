const { PrismaClient } = require('./node_modules/@prisma/client');
const prisma = new PrismaClient();

const desc = `ZOOOK STUDIO BLAST 80W 2.1CH SOUNDBAR
The Zoook Studio Blast 80W 2.1CH Soundbar is a premium home entertainment system designed to deliver powerful, room-filling audio for movies, music, sports, and gaming. Featuring an 80W RMS output (160W Peak Power), a dedicated wired subwoofer, advanced DSP technology, and multiple connectivity options including HDMI ARC, this soundbar provides an immersive cinematic experience while maintaining a sleek and modern design. It is suitable for TVs ranging from 32 to 65 inches and complements any contemporary living room setup.

KEY FEATURES
• Powerful 80W RMS Audio Output: 160W Peak Power, rich stereo sound with deep, punchy bass from the wired subwoofer.
• 2.1 Channel Surround Sound: Dual full-range drivers with a powerful subwoofer for a wider soundstage.
• HDMI ARC Connectivity: High-quality digital audio, single remote control operation, easy plug-and-play.
• Multiple Connectivity Options: Bluetooth 5.0, HDMI ARC, Optical, USB, AUX, and Line-In.
• Advanced DSP Technology: Enhances sound clarity, optimizing dialogue, bass, and treble.
• Four Equalizer Modes: Movie, Music, News, and 3D modes.
• Bass & Treble Controls: Customize sound profile.
• LED Display & Remote: Bright front display and full-function wireless remote.

TECHNICAL SPECIFICATIONS
• Channels: 2.1 Channel
• RMS Output: 80W (160W Peak)
• Subwoofer: Wired 5.25-inch
• Drivers: Dual 2.25-inch
• Bluetooth: Version 5.0 (Up to 10m range)
• Frequency Response: 55Hz – 20kHz

BOX CONTENTS
• 1 × Soundbar, 1 × Wired Subwoofer, 1 × Remote, 1 × Power Cable, 1 × AUX Cable, User Manual`;

async function updateDesc() {
  await prisma.product.updateMany({
    where: { name: 'ZOOK STUDIO BLAST' },
    data: { description: desc }
  });
  console.log('Description updated');
}

updateDesc();
