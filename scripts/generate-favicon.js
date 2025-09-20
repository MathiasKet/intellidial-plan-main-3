import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { promises as fs } from 'fs';
import { existsSync, mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ensure public directory exists
const publicDir = join(__dirname, '../public');
if (!existsSync(publicDir)) {
  mkdirSync(publicDir, { recursive: true });
}

// Source image path
const sourceImage = join(__dirname, '../src/assets/ai-caller-hero.jpg');

// Output paths
const outputFiles = [
  { path: join(publicDir, 'favicon.ico'), size: 32 },
  { path: join(publicDir, 'favicon-16x16.png'), size: 16 },
  { path: join(publicDir, 'favicon-32x32.png'), size: 32 },
  { path: join(publicDir, 'apple-touch-icon.png'), size: 180 },
  { path: join(publicDir, 'android-chrome-192x192.png'), size: 192 },
  { path: join(publicDir, 'android-chrome-512x512.png'), size: 512 },
];

// Create a web manifest
const manifest = {
  name: 'AI Caller CRM',
  short_name: 'AI Caller',
  icons: [
    {
      src: '/android-chrome-192x192.png',
      sizes: '192x192',
      type: 'image/png',
    },
    {
      src: '/android-chrome-512x512.png',
      sizes: '512x512',
      type: 'image/png',
    },
  ],
  theme_color: '#ffffff',
  background_color: '#ffffff',
  display: 'standalone',
};

// Write the web manifest
await fs.writeFile(
  join(publicDir, 'site.webmanifest'),
  JSON.stringify(manifest, null, 2)
);

// Generate favicon files
try {
  await Promise.all(
    outputFiles.map(async ({ path: outputPath, size }) => {
      try {
        await sharp(sourceImage)
          .resize(size, size, {
            fit: 'cover',
            position: 'center',
          })
          .toFile(outputPath);
        console.log(`Generated: ${outputPath.replace(process.cwd(), '')}`);
      } catch (err) {
        console.error(`Error generating ${outputPath}:`, err);
      }
    })
  );
  
  console.log('\nFavicon generation complete!');
  console.log('Files have been saved to the public directory.');
} catch (err) {
  console.error('Error generating favicons:', err);
  process.exit(1);
}
