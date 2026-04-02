const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'sd28lfuz',
  dataset: 'production',
  token: 'REMOVED_SANITY_TOKEN',
  useCdn: false,
  apiVersion: '2023-05-03',
});

async function listProducts() {
  try {
    const docs = await client.fetch('*[]{_id, _type, title, name}');
    console.log(JSON.stringify(docs, null, 2));
  } catch (err) {
    console.error(err);
  }
}

listProducts();
