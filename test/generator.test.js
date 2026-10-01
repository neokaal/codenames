import {describe, it, expect} from 'vitest';
import {
  ReleaseGenerator,
  generate,
  generateBatch,
  getExportFormats,
  animals,
  plants,
  colors,
} from '../src/index.js';

describe('ReleaseGenerator Unit & Quality Suite', () => {
  it('instantiates properly with loaded datasets', () => {
    const gen = new ReleaseGenerator();
    expect(gen.animals.length).toBeGreaterThan(100);
    expect(gen.plants.length).toBeGreaterThan(100);
    expect(gen.colors.length).toBeGreaterThan(1000);
  });

  describe('getSubjects() category filtering', () => {
    const gen = new ReleaseGenerator();

    it('returns only animal subjects when category is "animals"', () => {
      const subjects = gen.getSubjects('animals');
      expect(subjects.length).toBe(animals.length);
      expect(subjects.every(s => s.type === 'animal')).toBe(true);
    });

    it('returns only plant subjects when category is "plants"', () => {
      const subjects = gen.getSubjects('plants');
      expect(subjects.length).toBe(plants.length);
      expect(subjects.every(s => s.type === 'plant')).toBe(true);
    });

    it('returns both animal and plant subjects when category is "all"', () => {
      const subjects = gen.getSubjects('all');
      expect(subjects.length).toBe(animals.length + plants.length);
      const hasAnimals = subjects.some(s => s.type === 'animal');
      const hasPlants = subjects.some(s => s.type === 'plant');
      expect(hasAnimals).toBe(true);
      expect(hasPlants).toBe(true);
    });

    it('defaults to all when category parameter is omitted', () => {
      const subjects = gen.getSubjects();
      expect(subjects.length).toBe(animals.length + plants.length);
    });
  });

  describe('formatName() casing transformations', () => {
    const gen = new ReleaseGenerator();

    it('formats as kebab-case by default and explicitly', () => {
      expect(gen.formatName('Golden', 'Eagle', 'kebab')).toBe('golden-eagle');
      expect(gen.formatName('Golden', 'Eagle')).toBe('golden-eagle');
      expect(gen.formatName('Golden', 'Eagle', 'unknown')).toBe('golden-eagle');
    });

    it('formats as snake_case', () => {
      expect(gen.formatName('Golden', 'Eagle', 'snake')).toBe('golden_eagle');
    });

    it('formats as camelCase', () => {
      expect(gen.formatName('Golden', 'Eagle', 'camel')).toBe('goldenEagle');
    });

    it('formats as PascalCase', () => {
      expect(gen.formatName('golden', 'eagle', 'pascal')).toBe('GoldenEagle');
    });

    it('formats as Title Case', () => {
      expect(gen.formatName('golden', 'eagle', 'title')).toBe('Golden Eagle');
    });

    it('handles empty or falsy strings in capitalize helper', () => {
      expect(gen.capitalize('')).toBe('');
      expect(gen.capitalize(null)).toBe('');
      expect(gen.capitalize(undefined)).toBe('');
    });
  });

  describe('generate() single item generation', () => {
    it('generates a valid codename structure', () => {
      const res = generate();
      expect(res).toHaveProperty('slug');
      expect(res).toHaveProperty('color');
      expect(res).toHaveProperty('hex');
      expect(res).toHaveProperty('subject');
      expect(res).toHaveProperty('type');
      expect(res).toHaveProperty('formatted');

      expect(typeof res.slug).toBe('string');
      expect(res.slug.split('-').length).toBeGreaterThanOrEqual(2);
      expect(res.hex).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(['animal', 'plant']).toContain(res.type);
    });

    it('respects category filtering', () => {
      for (let i = 0; i < 20; i++) {
        const animalRes = generate({category: 'animals'});
        expect(animalRes.type).toBe('animal');
        expect(animals).toContain(animalRes.subject.toLowerCase());

        const plantRes = generate({category: 'plants'});
        expect(plantRes.type).toBe('plant');
        expect(plants).toContain(plantRes.subject.toLowerCase());
      }
    });

    it('respects casing option', () => {
      const titleRes = generate({casing: 'title'});
      expect(titleRes.formatted).toMatch(/^[A-Z][a-z]+ [A-Z][a-z]+/);

      const pascalRes = generate({casing: 'pascal'});
      expect(pascalRes.formatted).toMatch(/^[A-Z][a-z]+[A-Z][a-z]+/);

      const snakeRes = generate({casing: 'snake'});
      expect(snakeRes.formatted).toMatch(/^[a-z]+_[a-z]+/);
    });

    it('honors exclusions', () => {
      const first = generate();
      const second = generate({exclude: [first.slug]});
      expect(second.slug.toLowerCase()).not.toBe(first.slug.toLowerCase());
    });

    it('works with custom ReleaseGenerator instance directly', () => {
      const customGen = new ReleaseGenerator();
      const res = customGen.generate();
      expect(res.slug).toBeDefined();

      const batch = customGen.generateBatch(3);
      expect(batch).toHaveLength(3);
    });

    it('handles retry loop when collisions occur', () => {
      const customGen = new ReleaseGenerator();
      customGen.colors = [{name: 'red', hex: '#ff0000'}];
      customGen.animals = ['fox'];
      customGen.plants = [];
      const res = customGen.generate({exclude: ['red-fox']});
      expect(res.slug).toBe('red-fox');
    });
  });

  describe('generateBatch() batch generation', () => {
    it('generates requested count of distinct codenames', () => {
      const count = 15;
      const batch = generateBatch(count);
      expect(batch).toHaveLength(count);

      const slugs = batch.map(item => item.slug);
      const uniqueSlugs = new Set(slugs);
      expect(uniqueSlugs.size).toBe(count);
    });

    it('defaults to 12 candidates when count is omitted', () => {
      const batch = generateBatch();
      expect(batch).toHaveLength(12);
    });

    it('handles batch options with category and casing', () => {
      const batch = generateBatch(5, {
        category: 'plants',
        casing: 'snake',
        exclude: ['crimson-rose'],
      });
      expect(batch).toHaveLength(5);
      batch.forEach(item => {
        expect(item.type).toBe('plant');
        expect(item.formatted).toContain('_');
      });
    });
  });

  describe('getExportFormats() formatting utility', () => {
    it('produces valid git tags, environment variables, markdown and docker tags', () => {
      const formats = getExportFormats('amber-badger', 'v2.1.0');
      expect(formats.slug).toBe('amber-badger');
      expect(formats.gitTag).toBe(
        'git tag -a v2.1.0-amber-badger -m "Release amber-badger"',
      );
      expect(formats.gitTagSimple).toBe('v2.1.0-amber-badger');
      expect(formats.dockerTag).toBe('app:amber-badger');
      expect(formats.envVar).toBe('RELEASE_NAME=amber-badger');
      expect(formats.changelogHeader).toBe('## [2.1.0] - amber-badger');
      expect(formats.markdownMeta).toContain('release: "amber-badger"');
      expect(formats.markdownMeta).toContain('version: "2.1.0"');
    });

    it('handles versions without leading "v"', () => {
      const formats = getExportFormats('amber-badger', '1.0.0');
      expect(formats.gitTagSimple).toBe('v1.0.0-amber-badger');
      expect(formats.changelogHeader).toBe('## [1.0.0] - amber-badger');
    });

    it('defaults version to v1.0.0 when omitted', () => {
      const formats = getExportFormats('amber-badger');
      expect(formats.gitTagSimple).toBe('v1.0.0-amber-badger');
    });
  });

  describe('Dataset Integrity Checks', () => {
    it('ensures all animals are non-empty single lowercase words', () => {
      animals.forEach(animal => {
        expect(animal).toBe(animal.trim().toLowerCase());
        expect(animal).not.toMatch(/\s/);
      });
    });

    it('ensures all plants are non-empty single lowercase words', () => {
      plants.forEach(plant => {
        expect(plant).toBe(plant.trim().toLowerCase());
        expect(plant).not.toMatch(/\s/);
      });
    });

    it('ensures all colors have valid lowercase names and hex codes', () => {
      colors.forEach(color => {
        expect(color.name).toBe(color.name.trim().toLowerCase());
        expect(color.hex).toMatch(/^#[0-9a-fA-F]{6}$/);
      });
    });
  });
});

