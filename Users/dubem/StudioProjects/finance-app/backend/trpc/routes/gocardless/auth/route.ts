import { publicProcedure } from '../../../create-context';
// import { kv } from '@vercel/kv';
// Using in-memory storage for now
const kv = {
  get: async (key: string) => {
    return null;
  },
  set: async (key: string, value: any) => {
    return null;
  }
};

async function generateNewToken() {
  console.log('Generating new token...');
  const secretId = process.env.GOCARDLESS_SECRET_ID;
  const secretKey = process.env.GOCARDLESS_SECRET_KEY;

  if (!secretId || !secretKey) {
    throw new Error('GoCardless credentials not configured');
  }

  const response = await fetch('https://bankaccountdata.gocardless.com/api/v2/token/new/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      secret_id: secretId,
      secret_key: secretKey,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to generate new token: ${response.statusText}`);
  }

  const data = await response.json();
  const expiresAt = new Date(Date.now() + data.expires_in * 1000).toISOString();

  await kv.set('gocardless:token', JSON.stringify({
    access: data.access,
    refresh: data.refresh,
    expires_at: expiresAt,
  }));

  return { accessToken: data.access, refreshToken: data.refresh || '' };
}

export const getTokenProcedure = publicProcedure.query(async () => {
  try {
    const storedToken = await kv.get('gocardless:token');
    let existingToken: { access: string; refresh?: string; expires_at?: string } | null = null;

    if (storedToken && typeof storedToken === 'string') {
      try {
        existingToken = JSON.parse(storedToken);
      } catch (parseError) {
        console.error('Failed to parse stored token:', parseError);
      }
    } else if (storedToken) {
      existingToken = storedToken as { access: string; refresh?: string; expires_at?: string };
    }

    if (existingToken && existingToken.expires_at && new Date(existingToken.expires_at) > new Date()) {
      return { accessToken: existingToken.access, refreshToken: existingToken.refresh || '' };
    }

    if (existingToken && existingToken.refresh) {
      console.log('Token expired, refreshing...');
      const refreshResponse = await fetch('https://bankaccountdata.gocardless.com/api/v2/token/refresh/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ refresh: existingToken.refresh }),
      });

      if (!refreshResponse.ok) {
        console.error('Failed to refresh token, generating new token...');
        return await generateNewToken();
      }

      const refreshData = await refreshResponse.json();
      const newExpiresAt = new Date(Date.now() + refreshData.expires_in * 1000).toISOString();

      await kv.set('gocardless:token', JSON.stringify({
        access: refreshData.access,
        refresh: refreshData.refresh,
        expires_at: newExpiresAt,
      }));

      return { accessToken: refreshData.access, refreshToken: refreshData.refresh };
    }

    return await generateNewToken();
  } catch (error) {
    console.error('Failed to authenticate with GoCardless:', error);
    throw new Error(`Failed to authenticate with GoCardless: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
});
