import colors from './data/colors.js';
import animals from './data/animals.js';
import plants from './data/plants.js';

/**
 * Valid category options for subject selection.
 * @typedef {'all' | 'animals' | 'plants'} Category
 */

/**
 * Valid string casing format options.
 * @typedef {'kebab' | 'snake' | 'camel' | 'pascal' | 'title'} Casing
 */

/**
 * Options for codename generation.
 * @typedef {Object} GenerateOptions
 * @property {Category} [category='all'] - Subject category filter
 * @property {Casing} [casing='kebab'] - Output string casing format
 * @property {string[]} [exclude=[]] - Slugs or names to exclude from generation
 */

/**
 * Formatted export strings for various tooling integrations.
 * @typedef {Object} ExportFormats
 * @property {string} slug - Raw hyphenated slug
 * @property {string} gitTag - Annotated git tag command
 * @property {string} gitTagSimple - Tag name only
 * @property {string} markdownMeta - Frontmatter YAML representation
 * @property {string} changelogHeader - Markdown heading for changelog entry
 * @property {dockerTag} dockerTag - Suggested Docker image tag
 * @property {string} envVar - Suggested shell environment variable assignment
 */

/**
 * Generated codename result object.
 * @typedef {Object} Codename
 * @property {string} slug - Raw hyphenated slug (e.g. 'indigo-falcon')
 * @property {string} color - Color name
 * @property {string} hex - Hex color code
 * @property {string} subject - Subject name
 * @property {'animal' | 'plant'} type - Subject category type
 * @property {string} formatted - Codename rendered in chosen casing format
 */

export class ReleaseGenerator {
  constructor() {
    this.colors = colors;
    this.animals = animals;
    this.plants = plants;
  }

  /**
   * Get subject items based on category.
   * @param {Category} [category='all']
   * @returns {Array<{name: string, type: 'animal' | 'plant'}>}
   */
  getSubjects(category = 'all') {
    if (category === 'animals') {
      return this.animals.map(name => ({name, type: 'animal'}));
    }
    if (category === 'plants') {
      return this.plants.map(name => ({name, type: 'plant'}));
    }

    const animList = this.animals.map(name => ({name, type: 'animal'}));
    const plantList = this.plants.map(name => ({name, type: 'plant'}));
    return [...animList, ...plantList];
  }

  /**
   * Pick random element from an array.
   * @template T
   * @param {T[]} arr
   * @returns {T}
   */
  getRandomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  /**
   * Generate a single release codename.
   * @param {GenerateOptions} [options={}]
   * @returns {Codename}
   */
  generate({category = 'all', casing = 'kebab', exclude = []} = {}) {
    const subjects = this.getSubjects(category);
    let attempts = 0;
    let selectedColor, selectedSubject, slug;

    const excludeSet = new Set(exclude.map(e => e.toLowerCase()));

    do {
      selectedColor = this.getRandomElement(this.colors);
      selectedSubject = this.getRandomElement(subjects);
      slug = `${selectedColor.name}-${selectedSubject.name}`;
      attempts++;
    } while (excludeSet.has(slug) && attempts < 100);

    return {
      slug,
      color: selectedColor.name,
      hex: selectedColor.hex,
      subject: selectedSubject.name,
      type: selectedSubject.type,
      formatted: this.formatName(
        selectedColor.name,
        selectedSubject.name,
        casing,
      ),
    };
  }

  /**
   * Generate a batch of unique release codenames.
   * @param {number} [count=12]
   * @param {GenerateOptions} [options={}]
   * @returns {Codename[]}
   */
  generateBatch(
    count = 12,
    {category = 'all', casing = 'kebab', exclude = []} = {},
  ) {
    const results = [];
    const used = new Set(exclude.map(e => e.toLowerCase()));

    for (let i = 0; i < count; i++) {
      const item = this.generate({category, casing, exclude: Array.from(used)});
      used.add(item.slug);
      results.push(item);
    }
    return results;
  }

  /**
   * Apply casing format to color and subject.
   * @param {string} colorStr
   * @param {string} subjectStr
   * @param {Casing} [casing='kebab']
   * @returns {string}
   */
  formatName(colorStr, subjectStr, casing = 'kebab') {
    const color = colorStr.toLowerCase();
    const subject = subjectStr.toLowerCase();

    switch (casing) {
      case 'title':
        return `${this.capitalize(color)} ${this.capitalize(subject)}`;
      case 'camel':
        return `${color}${this.capitalize(subject)}`;
      case 'pascal':
        return `${this.capitalize(color)}${this.capitalize(subject)}`;
      case 'snake':
        return `${color}_${subject}`;
      case 'kebab':
      default:
        return `${color}-${subject}`;
    }
  }

  /**
   * Generate export snippets for release management tooling.
   * @param {string} slug
   * @param {string} [version='v1.0.0']
   * @returns {ExportFormats}
   */
  getExportFormats(slug, version = 'v1.0.0') {
    const cleanVer = version.startsWith('v') ? version : `v${version}`;
    const numVer = cleanVer.replace(/^v/, '');

    return {
      slug,
      gitTag: `git tag -a ${cleanVer}-${slug} -m "Release ${slug}"`,
      gitTagSimple: `${cleanVer}-${slug}`,
      markdownMeta: `release: "${slug}"\nversion: "${numVer}"`,
      changelogHeader: `## [${numVer}] - ${slug}`,
      dockerTag: `app:${slug}`,
      envVar: `RELEASE_NAME=${slug}`,
    };
  }

  /**
   * Capitalize first letter of string.
   * @param {string} str
   * @returns {string}
   */
  capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }
}

// Module-level singleton instance for convenient functional usage
const defaultGenerator = new ReleaseGenerator();

/**
 * Generate a single release codename using default generator.
 * @param {GenerateOptions} [options={}]
 * @returns {Codename}
 */
export function generate(options) {
  return defaultGenerator.generate(options);
}

/**
 * Generate a batch of unique release codenames.
 * @param {number} [count=12]
 * @param {GenerateOptions} [options={}]
 * @returns {Codename[]}
 */
export function generateBatch(count, options) {
  return defaultGenerator.generateBatch(count, options);
}

/**
 * Export formats helper.
 * @param {string} slug
 * @param {string} [version='v1.0.0']
 * @returns {ExportFormats}
 */
export function getExportFormats(slug, version) {
  return defaultGenerator.getExportFormats(slug, version);
}

export {colors, animals, plants};
