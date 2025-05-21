export const callShopify = async (
    query: string,
    variables?: Record<string, any>,
    storefront = true
  ) => {
    const endpoint = storefront
      ? process.env.SHOPIFY_STOREFRONT_ENDPOINT!
      : process.env.SHOPIFY_ADMIN_ENDPOINT!;
    const token = storefront
      ? process.env.SHOPIFY_STOREFRONT_TOKEN!
      : process.env.SHOPIFY_ADMIN_TOKEN!;
  
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        [storefront
          ? 'X-Shopify-Storefront-Access-Token'
          : 'X-Shopify-Access-Token']: token,
      },
      body: JSON.stringify({ query, variables }),
    });
  
    const data = await res.json();
    return data;
  };
  