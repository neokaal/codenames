import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, '../src/data');

const animals = JSON.parse(fs.readFileSync(path.join(dataDir, 'animals.json'), 'utf-8'));
const plants = JSON.parse(fs.readFileSync(path.join(dataDir, 'plants.json'), 'utf-8'));
const colors = JSON.parse(fs.readFileSync(path.join(dataDir, 'colors.json'), 'utf-8'));

function assertSingleWord(str, label) {
  if (!/^[a-z]+$/.test(str)) {
    throw new Error(`Validation failed for ${label}: "${str}" is not a strict single lowercase word.`);
  }
}

let errors = 0;

animals.forEach(animal => {
  try {
    assertSingleWord(animal, 'animal');
  } catch (err) {
    console.error(err.message);
    errors++;
  }
});

plants.forEach(plant => {
  try {
    assertSingleWord(plant, 'plant');
  } catch (err) {
    console.error(err.message);
    errors++;
  }
});

colors.forEach(color => {
  try {
    assertSingleWord(color.name, 'color name');
    if (!/^#[0-9a-fA-F]{6}$/.test(color.hex)) {
      throw new Error(`Invalid hex code for ${color.name}: ${color.hex}`);
    }
  } catch (err) {
    console.error(err.message);
    errors++;
  }
});

if (errors > 0) {
  console.error(`❌ Validation failed with ${errors} error(s).`);
  process.exit(1);
} else {
  console.log(`✅ Validation passed!`);
  console.log(`- Animals: ${animals.length} single words`);
  console.log(`- Plants: ${plants.length} single words`);
  console.log(`- Colors: ${colors.length} single words with hex values`);
}
