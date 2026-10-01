# @neokaal/codenames

Generate two-word human-readable, memorable, random code-names for naming releases, builds, machines etc.

```bash
npx @neokaal/codenames
# sapphire-badger
```

Available as a library and a command line tool on npm. See detailed documentation below.

## Table of Contents

- [@neokaal/codenames](#neokaalcodenames)
  - [Table of Contents](#table-of-contents)
  - [Installation](#installation)
    - [Library](#library)
    - [CLI](#cli)
  - [CLI](#cli-1)
    - [Usage](#usage)
    - [Options](#options)
  - [API Reference](#api-reference)
    - [Imports](#imports)
    - [generate(options)](#generateoptions)
      - [Parameters](#parameters)
      - [Returns](#returns)
      - [Example](#example)
    - [generateBatch(count, options)](#generatebatchcount-options)
      - [Parameters](#parameters-1)
      - [Returns](#returns-1)
      - [Example](#example-1)
    - [getExportFormats(slug, version)](#getexportformatsslug-version)
      - [Parameters](#parameters-2)
      - [Returns](#returns-2)
      - [Example](#example-2)
    - [ReleaseGenerator](#releasegenerator)
  - [TypeScript Support](#typescript-support)
  - [License](#license)

## Installation

### Library

```bash
npm install @neokaal/codenames
```

### CLI

Execute directly via npx:

```bash
npx @neokaal/codenames
```

Or install globally:

```bash
npm install -g @neokaal/codenames
```

## CLI

### Usage

Generate a single codename:

```bash
npx @neokaal/codenames
# sapphire-badger
```

Generate multiple codenames:

```bash
npx @neokaal/codenames -c 3 --casing pascal
# CrimsonLotus
# EmeraldFalcon
# AmberFox
```

Filter by subject category:

```bash
npx @neokaal/codenames --category plants --casing snake
# lavender_willow
```

Output formatted JSON:

```bash
npx @neokaal/codenames --json
# {
#   "slug": "ultramarine-falcon",
#   "color": "ultramarine",
#   "hex": "#4166f5",
#   "subject": "falcon",
#   "type": "animal",
#   "formatted": "ultramarine-falcon"
# }
```

Generate release export strings:

```bash
npx @neokaal/codenames --export v1.2.0
# Codename: indigo-alder
# Git Tag:  git tag -a v1.2.0-indigo-alder -m "Release indigo-alder"
# Docker:   app:indigo-alder
# Env Var:  RELEASE_NAME=indigo-alder
```

### Options

| Flag | Type | Description | Default |
| :--- | :--- | :--- | :--- |
| `-c, --count <number>` | integer | Number of items to generate | `1` |
| `--category <type>` | string | Subject filter: `all`, `animals`, `plants` | `all` |
| `--casing <format>` | string | Output casing: `kebab`, `snake`, `camel`, `pascal`, `title` | `kebab` |
| `--json` | boolean | Output raw JSON | `false` |
| `--export [version]` | string | Output release tooling snippets for the given version tag | `v1.0.0` |
| `-v, --version` | boolean | Print package version | |
| `-h, --help` | boolean | Print help text | |

## API Reference

The package ships with dual CommonJS (CJS) and ES Module (ESM) builds.

### Imports

ESM:

```javascript
import { generate, generateBatch, getExportFormats, ReleaseGenerator } from '@neokaal/codenames';
```

CJS:

```javascript
const { generate, generateBatch, getExportFormats, ReleaseGenerator } = require('@neokaal/codenames');
```

### generate(options)

Generates a single codename object.

#### Parameters

- `options` (optional `object`):
  - `category` (`'all' | 'animals' | 'plants'`, default: `'all'`): Subject category filter.
  - `casing` (`'kebab' | 'snake' | 'camel' | 'pascal' | 'title'`, default: `'kebab'`): String format of `formatted` property.
  - `exclude` (`string[]`, default: `[]`): Array of slugs to exclude.

#### Returns

An object implementing `Codename`:

| Property | Type | Description |
| :--- | :--- | :--- |
| `slug` | `string` | Hyphen-separated lowercase slug (e.g. `'indigo-falcon'`). |
| `color` | `string` | Name of the selected color. |
| `hex` | `string` | Hexadecimal color code (e.g. `'#4b0082'`). |
| `subject` | `string` | Name of the selected subject. |
| `type` | `'animal' | 'plant'` | Subject category. |
| `formatted` | `string` | String formatted according to the `casing` option. |

#### Example

```javascript
const item = generate({ category: 'plants', casing: 'pascal' });
console.log(item.formatted); // 'IndigoAlder'
```

### generateBatch(count, options)

Generates an array of unique codename objects.

#### Parameters

- `count` (optional `number`, default: `12`): Number of unique codenames to return.
- `options` (optional `object`): Identical to `generate(options)`.

#### Returns

An array of `Codename` objects.

#### Example

```javascript
const items = generateBatch(3, { casing: 'snake' });
items.forEach(item => console.log(item.formatted));
```

### getExportFormats(slug, version)

Generates pre-formatted strings for release tooling and configuration files (git tags, docker tags, environment variables, markdown metadata, and changelog headers).

#### Parameters

- `slug` (`string`, required): Hyphen-separated codename slug.
- `version` (`string`, optional, default: `'v1.0.0'`): Target version string.

#### Returns

An `ExportFormats` object containing formatted release strings:
- `slug`: Raw slug.
- `gitTag`: Annotated git tag command.
- `gitTagSimple`: Tag name only.
- `dockerTag`: Container tag suggestion.
- `envVar`: Shell environment variable assignment.
- `changelogHeader`: Markdown header snippet.
- `markdownMeta`: YAML frontmatter snippet.

#### Example

```javascript
const formats = getExportFormats('amber-badger', 'v2.1.0');
console.log(formats.gitTag); // git tag -a v2.1.0-amber-badger -m "Release amber-badger"
```

### ReleaseGenerator

The class used internally by `generate` and `generateBatch`. Can be instantiated directly when state isolation is required.

```javascript
import { ReleaseGenerator } from '@neokaal/codenames';

const generator = new ReleaseGenerator();
const item = generator.generate({ category: 'animals' });
```

## TypeScript Support

TypeScript declarations are bundled with the package. Types can be imported directly:

```typescript
import type {
  Category,
  Casing,
  SubjectType,
  Subject,
  Color,
  GenerateOptions,
  Codename,
  ExportFormats,
} from '@neokaal/codenames';
```

## License

Apache-2.0. See [LICENSE](LICENSE) for the full text.
