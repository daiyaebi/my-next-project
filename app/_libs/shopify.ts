export async function callShopifyCart(query: string, variables?: Record<string, any>) {
    const shop = process.env.NEXT_PUBLIC_SHOPIFY_SHOP!;
    const token = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_API_TOKEN!;
  
    const endpoint = `https://${shop}.myshopify.com/api/2024-01/graphql.json`;
  
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': token,
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });
  
    const text = await res.text();
  
    if (!res.ok) {
      console.error('Shopify Cart API error response:', text);
      throw new Error(`Shopify Cart API error: ${res.status}`);
    }
  
    return JSON.parse(text);
  }  