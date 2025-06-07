// app/_libs/tikTokShop.ts

export async function callTikTokShopAPI<T = any>(
  path: string,
  body: Record<string, any>,
  options?: {
    accessToken?: string;
    version?: string;
  }
): Promise<T> {
  const baseUrl = 'https://open-api.tiktokglobalshop.com';
  const accessToken = options?.accessToken || process.env.TIKTOK_ACCESS_TOKEN!;
  const version = options?.version || '202309';

  const endpoint = `${baseUrl}/${path}`;

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Access-Token': accessToken,
      'TT-Request-Time': Math.floor(Date.now() / 1000).toString(),
      'TT-SDK-Version': version,
    },
    body: JSON.stringify(body),
  });

  const text = await res.text();

  if (!res.ok) {
    console.error('TikTok Shop API HTTP Error:', text);
    throw new Error(`TikTok Shop API HTTP error: ${res.status}`);
  }

  const json = JSON.parse(text);

  if (json.code !== 0) {
    console.error('TikTok Shop API Business Error:', json);
    throw new Error(`TikTok Shop API error: ${json.message}`);
  }

  return json.data;
}
