import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import fs from 'node:fs/promises';

vi.mock('node:fs/promises');
vi.mock('../auth/server.js', () => ({
  stopCallbackServer: vi.fn(),
}));
vi.mock('../auth/tokens.js', () => ({
  clearTokens: vi.fn(() => Promise.resolve()),
}));
vi.mock('./prompts.js', () => ({
  collectCredentials: vi.fn(() => Promise.resolve({
    clientId: 'client-id',
    clientSecret: 'client-secret',
    callbackPort: 54321,
  })),
  selectCompany: vi.fn(() => Promise.resolve({
    selected: { id: 123, name: 'Test Company', display_name: 'Test Company', role: 'admin' },
    all: [{ id: 123, name: 'Test Company', display_name: 'Test Company', role: 'admin' }],
  })),
  configureMcpIntegration: vi.fn(() => Promise.resolve()),
}));
vi.mock('./oauth-flow.js', () => ({
  performOAuth: vi.fn(() => Promise.resolve({ accessToken: 'test-access-token' })),
}));
vi.mock('./configuration.js', () => ({
  saveConfig: vi.fn(() => Promise.resolve()),
}));

const mockFs = vi.mocked(fs);
const originalConfigFilePath = process.env.CONFIG_FILE_PATH;

describe('cli/configure', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    mockFs.unlink.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    if (originalConfigFilePath !== undefined) {
      process.env.CONFIG_FILE_PATH = originalConfigFilePath;
    } else {
      delete process.env.CONFIG_FILE_PATH;
    }
  });

  it('should clear config using CONFIG_FILE_PATH when force is enabled', async () => {
    process.env.CONFIG_FILE_PATH = '/tmp/custom-config.json';

    const { configure } = await import('./index.js');
    await configure({ force: true });

    expect(mockFs.unlink).toHaveBeenCalledWith('/tmp/custom-config.json');
  });
});
