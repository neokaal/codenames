import {describe, it, expect, vi} from 'vitest';
import {runCli} from '../bin/cli.js';

describe('CLI Integration Suite (bin/cli.js)', () => {
  it('exits cleanly on --help', () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const exitCode = runCli(['--help']);
    expect(exitCode).toBe(0);
    expect(logSpy).toHaveBeenCalled();
    const output = logSpy.mock.calls[0][0];
    expect(output).toContain('Usage:');
    expect(output).toContain('codenames [options]');
    logSpy.mockRestore();
  });

  it('exits cleanly on -h', () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const exitCode = runCli(['-h']);
    expect(exitCode).toBe(0);
    logSpy.mockRestore();
  });

  it('exits cleanly on --version', () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const exitCode = runCli(['--version']);
    expect(exitCode).toBe(0);
    expect(logSpy).toHaveBeenCalledWith('0.1.0');
    logSpy.mockRestore();
  });

  it('generates a single codename with default options', () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const exitCode = runCli([]);
    expect(exitCode).toBe(0);
    expect(logSpy).toHaveBeenCalled();
    const result = logSpy.mock.calls[0][0];
    expect(result).toMatch(/^[a-z0-9]+-[a-z0-9]+/);
    logSpy.mockRestore();
  });

  it('generates a batch when -c / --count is specified', () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const exitCode = runCli(['-c', '3']);
    expect(exitCode).toBe(0);
    expect(logSpy).toHaveBeenCalledTimes(3);
    logSpy.mockRestore();
  });

  it('outputs raw JSON when --json is passed', () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const exitCode = runCli(['--json', '--category', 'plants']);
    expect(exitCode).toBe(0);
    const parsed = JSON.parse(logSpy.mock.calls[0][0]);
    expect(parsed.slug).toBeDefined();
    expect(parsed.type).toBe('plant');
    expect(parsed.hex).toBeDefined();
    logSpy.mockRestore();
  });

  it('outputs raw JSON batch when --json and -c are combined', () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const exitCode = runCli(['-c', '2', '--json']);
    expect(exitCode).toBe(0);
    const parsed = JSON.parse(logSpy.mock.calls[0][0]);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed).toHaveLength(2);
    logSpy.mockRestore();
  });

  it('outputs export snippets when --export is specified', () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const exitCode = runCli(['--export', 'v1.5.0']);
    expect(exitCode).toBe(0);
    expect(logSpy).toHaveBeenCalledTimes(4);
    logSpy.mockRestore();
  });

  it('outputs export snippets in JSON format', () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const exitCode = runCli(['--export', 'v1.5.0', '--json']);
    expect(exitCode).toBe(0);
    const parsed = JSON.parse(logSpy.mock.calls[0][0]);
    expect(parsed.codename).toBeDefined();
    expect(parsed.export).toBeDefined();
    expect(parsed.export.gitTag).toContain('v1.5.0');
    logSpy.mockRestore();
  });

  it('rejects invalid count argument', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const exitCode = runCli(['-c', 'not-a-number']);
    expect(exitCode).toBe(1);
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  it('rejects invalid category argument', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const exitCode = runCli(['--category', 'dragons']);
    expect(exitCode).toBe(1);
    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining('Invalid category'),
    );
    errorSpy.mockRestore();
  });

  it('rejects invalid casing argument', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const exitCode = runCli(['--casing', 'leet']);
    expect(exitCode).toBe(1);
    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining('Invalid casing'),
    );
    errorSpy.mockRestore();
  });

  it('rejects unknown flag', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const exitCode = runCli(['--bogus-flag']);
    expect(exitCode).toBe(1);
    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining('Unknown option'),
    );
    errorSpy.mockRestore();
  });
});
