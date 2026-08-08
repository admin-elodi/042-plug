import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

// Resolve directory relative to where this script is executed
const IMAGES_DIR = path.resolve('src/assets/images');
const SRC_DIR = path.resolve('src');

async function processImages(dirPath) {
  let entries;
  try {
    entries = await fs.readdir(dirPath, { withFileTypes: true });
  } catch (err) {
    console.error(`❌ Could not read directory: ${dirPath}`);
    console.error(`Please check that the folder 'src/assets/images' exists relative to your project root.`);
    return;
  }

  let count = 0;

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      await processImages(fullPath);
    } else if (/\.(png|jpe?g|avif)$/i.test(entry.name)) {
      const outputPath = fullPath.replace(/\.[^.]+$/, '.webp');

      try {
        // 1. Convert to WebP
        await sharp(fullPath).webp({ quality: 80 }).toFile(outputPath);
        console.log(`✅ Created: ${path.basename(outputPath)}`);

        // 2. Remove original image file
        await fs.unlink(fullPath);
        console.log(`🗑️ Removed old file: ${entry.name}`);

        count++;
      } catch (err) {
        console.error(`❌ Failed to convert ${entry.name}:`, err.message);
      }
    }
  }

  if (count === 0 && dirPath === IMAGES_DIR) {
    console.log(`⚠️ No PNG/JPG/JPEG files found in ${IMAGES_DIR}.`);
  }
}

async function run() {
  console.log(`📁 Target image folder: ${IMAGES_DIR}`);
  console.log('🚀 Converting image files to .webp...\n');

  await processImages(IMAGES_DIR);

  console.log('\n🎉 Image conversion process finished!');
}

run().catch(console.error);