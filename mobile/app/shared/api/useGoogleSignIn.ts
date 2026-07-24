/**
 * Shared Google ID-token request (research R6) — identical wiring needed by both Log in and
 * Register, so it lives here once rather than duplicated in each screen.
 *
 * NOTE: per Expo's current authentication guidance, Expo Go cannot complete an OAuth/OIDC
 * redirect at all (no custom scheme support) — this flow only completes in a development build.
 * `promptAsync` is still safe to wire in Expo Go; pressing the button will just be unable to
 * redirect back into the app. See handoff-us4.md for the full note.
 */
import { useEffect } from 'react';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri, ResponseType, useAuthRequest, useAutoDiscovery } from 'expo-auth-session';
import { GOOGLE_OAUTH_CLIENT_ID } from './config';

WebBrowser.maybeCompleteAuthSession();

export function useGoogleSignIn(onIdToken: (idToken: string) => void) {
  const discovery = useAutoDiscovery('https://accounts.google.com');
  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: GOOGLE_OAUTH_CLIENT_ID,
      responseType: ResponseType.IdToken,
      scopes: ['openid', 'profile', 'email'],
      redirectUri: makeRedirectUri({ scheme: 'viego' }),
      extraParams: {
        // Google requires a nonce for the implicit id_token response type.
        nonce: Math.random().toString(36).slice(2),
      },
    },
    discovery,
  );

  useEffect(() => {
    if (response?.type === 'success' && response.params.id_token) {
      onIdToken(response.params.id_token);
    }
  }, [response, onIdToken]);

  return {
    ready: !!request,
    promptAsync,
  };
}
