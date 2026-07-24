import * as SecureStore from 'expo-secure-store';
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from '../../app/shared/api/authTokenStore';

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

const mockedSecureStore = SecureStore as jest.Mocked<typeof SecureStore>;

describe('authTokenStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('getAccessToken reads the access-token key', async () => {
    mockedSecureStore.getItemAsync.mockResolvedValue('access.jwt');
    await expect(getAccessToken()).resolves.toBe('access.jwt');
    expect(mockedSecureStore.getItemAsync).toHaveBeenCalledWith('viego.auth.accessToken');
  });

  it('getRefreshToken reads the refresh-token key', async () => {
    mockedSecureStore.getItemAsync.mockResolvedValue('refresh.jwt');
    await expect(getRefreshToken()).resolves.toBe('refresh.jwt');
    expect(mockedSecureStore.getItemAsync).toHaveBeenCalledWith('viego.auth.refreshToken');
  });

  it('setTokens writes both tokens', async () => {
    await setTokens('access.jwt', 'refresh.jwt');
    expect(mockedSecureStore.setItemAsync).toHaveBeenCalledWith('viego.auth.accessToken', 'access.jwt');
    expect(mockedSecureStore.setItemAsync).toHaveBeenCalledWith('viego.auth.refreshToken', 'refresh.jwt');
  });

  it('clearTokens removes both tokens', async () => {
    await clearTokens();
    expect(mockedSecureStore.deleteItemAsync).toHaveBeenCalledWith('viego.auth.accessToken');
    expect(mockedSecureStore.deleteItemAsync).toHaveBeenCalledWith('viego.auth.refreshToken');
  });
});
