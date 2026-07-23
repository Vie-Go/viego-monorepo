import {
  register,
  login,
  AuthError,
  _resetForTests,
} from '../../app/shared/mock/explorerRepository';

describe('explorerRepository (mock)', () => {
  beforeEach(async () => {
    await _resetForTests();
  });

  describe('register', () => {
    it('creates a new account and returns a public explorer (no password hash)', async () => {
      const explorer = await register({
        displayName: 'Mai',
        email: 'mai@viego.app',
        password: 'secret6',
      });
      expect(explorer.id).toMatch(/^exp_/);
      expect(explorer.email).toBe('mai@viego.app');
      expect(explorer.displayName).toBe('Mai');
      expect(explorer.consentAcceptedAt).toBeTruthy();
      expect((explorer as Record<string, unknown>).passwordHash).toBeUndefined();
    });

    it('rejects a duplicate email (case/space-insensitive)', async () => {
      await register({ displayName: 'Mai', email: 'mai@viego.app', password: 'secret6' });
      await expect(
        register({ displayName: 'Other', email: '  MAI@viego.app ', password: 'other6' }),
      ).rejects.toMatchObject({ code: 'duplicate-email' } as Partial<AuthError>);
    });
  });

  describe('login', () => {
    beforeEach(async () => {
      await register({ displayName: 'Mai', email: 'mai@viego.app', password: 'secret6' });
    });

    it('authenticates a registered explorer with valid credentials', async () => {
      const explorer = await login({ email: 'mai@viego.app', password: 'secret6' });
      expect(explorer.email).toBe('mai@viego.app');
      expect((explorer as Record<string, unknown>).passwordHash).toBeUndefined();
    });

    it('normalizes email on login (case/space-insensitive)', async () => {
      const explorer = await login({ email: '  MAI@viego.app ', password: 'secret6' });
      expect(explorer.email).toBe('mai@viego.app');
    });

    it('rejects an unknown email with invalid-credentials', async () => {
      await expect(
        login({ email: 'nobody@viego.app', password: 'secret6' }),
      ).rejects.toMatchObject({ code: 'invalid-credentials' });
    });

    it('rejects a wrong password with invalid-credentials', async () => {
      await expect(
        login({ email: 'mai@viego.app', password: 'wrongpw' }),
      ).rejects.toMatchObject({ code: 'invalid-credentials' });
    });
  });
});
