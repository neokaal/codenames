/**
 * Valid subject category options.
 */
export type Category = 'all' | 'animals' | 'plants';

/**
 * Valid string casing format options.
 */
export type Casing = 'kebab' | 'snake' | 'camel' | 'pascal' | 'title';

/**
 * Subject category type.
 */
export type SubjectType = 'animal' | 'plant';

/**
 * Subject item with name and category type.
 */
export interface Subject {
  name: string;
  type: SubjectType;
}

/**
 * Color data item with name and hex code.
 */
export interface Color {
  name: string;
  hex: string;
}

/**
 * Configuration options for generating codenames.
 */
export interface GenerateOptions {
  /**
   * Filter subject by category ('all', 'animals', 'plants').
   * @default 'all'
   */
  category?: Category;

  /**
   * String formatting casing style.
   * @default 'kebab'
   */
  casing?: Casing;

  /**
   * List of slugs to exclude from generation.
   * @default []
   */
  exclude?: string[];
}

/**
 * Generated codename item representation.
 */
export interface Codename {
  /**
   * Raw hyphenated slug (e.g. 'indigo-falcon').
   */
  slug: string;

  /**
   * Name of the selected color.
   */
  color: string;

  /**
   * Hex color value (e.g. '#4b0082').
   */
  hex: string;

  /**
   * Name of the selected subject.
   */
  subject: string;

  /**
   * Subject type category ('animal' | 'plant').
   */
  type: SubjectType;

  /**
   * Codename formatted according to selected casing.
   */
  formatted: string;
}

/**
 * Export snippet templates for CI/CD and release tooling.
 */
export interface ExportFormats {
  slug: string;
  gitTag: string;
  gitTagSimple: string;
  markdownMeta: string;
  changelogHeader: string;
  dockerTag: string;
  envVar: string;
}

/**
 * Release codename generator engine.
 */
export declare class ReleaseGenerator {
  colors: Color[];
  animals: string[];
  plants: string[];

  constructor();

  /**
   * Get subject items according to category filter.
   */
  getSubjects(category?: Category): Subject[];

  /**
   * Pick a random element from an array.
   */
  getRandomElement<T>(arr: T[]): T;

  /**
   * Generate a single release codename.
   */
  generate(options?: GenerateOptions): Codename;

  /**
   * Generate a batch of unique release codenames.
   */
  generateBatch(count?: number, options?: GenerateOptions): Codename[];

  /**
   * Apply casing formatting to color and subject strings.
   */
  formatName(colorStr: string, subjectStr: string, casing?: Casing): string;

  /**
   * Generate export snippets for release management tooling.
   */
  getExportFormats(slug: string, version?: string): ExportFormats;

  /**
   * Capitalize first character of string.
   */
  capitalize(str: string): string;
}

/**
 * Generate a single release codename using the default generator.
 */
export declare function generate(options?: GenerateOptions): Codename;

/**
 * Generate a batch of unique release codenames using the default generator.
 */
export declare function generateBatch(
  count?: number,
  options?: GenerateOptions,
): Codename[];

/**
 * Generate export snippets for release management tooling.
 */
export declare function getExportFormats(
  slug: string,
  version?: string,
): ExportFormats;

export declare const colors: Color[];
export declare const animals: string[];
export declare const plants: string[];
