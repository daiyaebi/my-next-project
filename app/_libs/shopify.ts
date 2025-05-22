export async function callShopify(query: string) {
    const shop = process.env.NEXT_PUBLIC_SHOPIFY_SHOP;
    const token = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_API_TOKEN;
  
    const endpoint = `https://${shop}.myshopify.com/api/2024-01/graphql.json`;
  
    console.log('Calling Shopify endpoint:', endpoint);
    console.log('Using token:', !!token);
  
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': token!,
      },
      body: JSON.stringify({ query }),
    });
  
    const text = await res.text();
    console.log('Response Status:', res.status);
    console.log('Response Text:', text);
  
    if (!res.ok) {
      throw new Error(`Shopify API error: ${res.status}`);
    }
  
    return JSON.parse(text);
  }
  