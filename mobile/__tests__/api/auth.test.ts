import * as authTokenStore from '../../app/shared/api/authTokenStore';
import {
  requestEmailChallenge,
  signInWithEmailCode,
  signInWithGoogle,
  refresh,
  getMe,
  updatePreferences,
  Session,
} from '../../app/shared/api/auth';

jest.mock('../../app/shared/api/authTokenStore');
const mockedTokenStore = authTokenStore as jest.Mocked<typeof authTokenStore>;

const SESSION: Session = {
  accessToken: 'access.jwt',
  refreshToken: 'refresh.jwt',
  explorer: {
    id: 'exp_1',
    handle: 'mai',
    displayName: 'mai',
    homeProvince: null,
    preferences: { language: 'vi', theme: 'light' },
  },
};

function mockFetchOnce(body: unknown, status = 200) {
  (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  });
}

function lastCall() {
  const [url, init] = (globalThis.fetch as jest.Mock).mock.calls[0];
  return { url: url as string, init: init as RequestInit & { headers: Record<string, string> } };
}

describe('shared/api/auth', () => {
  beforeEach(() => {
    globalThis.fetch = jest.fn();
    mockedTokenStore.getAccessToken.mockResolvedValue(null);
  });

  it('requestEmailChallenge posts to /auth/email/challenge, unauthenticated', async () => {
    mockFetchOnce(undefined, 202);
    await requestEmailChallenge('mai@viego.app');

    const { url, init } = lastCall();
    expect(url).toContain('/auth/email/challenge');
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body as string)).toEqual({ email: 'mai@viego.app' });
    expect(init.headers.Authorization).toBeUndefined();
  });

  it('signInWithEmailCode posts email+code and returns the Session', async () => {
    mockFetchOnce(SESSION);
    const session = await signInWithEmailCode('mai@viego.app', '123456');

    expect(session).toEqual(SESSION);
    const { url, init } = lastCall();
    expect(url).toContain('/auth/email');
    expect(JSON.parse(init.body as string)).toEqual({ email: 'mai@viego.app', code: '123456' });
  });

  it('signInWithGoogle posts the ID token and returns the Session', async () => {
    mockFetchOnce(SESSION);
    const session = await signInWithGoogle('id.token.value');

    expect(session).toEqual(SESSION);
    const { url, init } = lastCall();
    expect(url).toContain('/auth/google');
    expect(JSON.parse(init.body as string)).toEqual({ token: 'id.token.value' });
  });

  it('refresh sends the given refresh token as the Bearer header', async () => {
    mockFetchOnce(SESSION);
    const session = await refresh('old.refresh.token');

    expect(session).toEqual(SESSION);
    const { url, init } = lastCall();
    expect(url).toContain('/auth/refresh');
    expect(init.headers.Authorization).toBe('Bearer old.refresh.token');
  });

  it('getMe attaches the access token and returns the Explorer', async () => {
    mockedTokenStore.getAccessToken.mockResolvedValue('access.jwt');
    mockFetchOnce(SESSION.explorer);
    const explorer = await getMe();

    expect(explorer).toEqual(SESSION.explorer);
    const { url, init } = lastCall();
    expect(url).toContain('/explorers/me');
    expect(init.headers.Authorization).toBe('Bearer access.jwt');
  });

  it('updatePreferences PUTs the new preferences and returns them', async () => {
    mockedTokenStore.getAccessToken.mockResolvedValue('access.jwt');
    mockFetchOnce({ language: 'en', theme: 'dark' });
    const updated = await updatePreferences({ language: 'en', theme: 'dark' });

    expect(updated).toEqual({ language: 'en', theme: 'dark' });
    const { url, init } = lastCall();
    expect(url).toContain('/explorers/me/preferences');
    expect(init.method).toBe('PUT');
    expect(JSON.parse(init.body as string)).toEqual({ language: 'en', theme: 'dark' });
  });
});
