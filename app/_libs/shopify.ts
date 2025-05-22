 export async function callShopify(query: string, variables?: Record<string, any>) {
    const shop = process.env.SHOPIFY_STOREFRONT_ENDPOINT;
    const token = process.env.SHOPIFY_STOREFRONT_TOKEN;
  
    const endpoint = `https://${shop}.myshopify.com/api/2024-01/graphql.json`;
  
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': token!,
      },
      body: JSON.stringify({
        query,
        variables, // variablesがある場合はここに含める
      }),
    });
  
    const text = await res.text();
  
    if (!res.ok) {
      console.error('Shopify API error response:', text);
      throw new Error(`Shopify API error: ${res.status}`);
    }
  
    return JSON.parse(text);
  }
  