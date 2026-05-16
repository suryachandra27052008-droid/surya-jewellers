/* eslint-disable @typescript-eslint/no-require-imports */
const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID || 'sd28lfuz',
  dataset: process.env.SANITY_DATASET || 'production',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
  apiVersion: '2023-05-03',
});

async function listProducts() {
  if (!process.env.SANITY_API_TOKEN) {
    console.error('Missing SANITY_API_TOKEN. Add it to your local environment before running this script.');
    process.exit(1);
  }

  try {
    const docs = await client.fetch('*[]{_id, _type, title, name}');
    console.log(JSON.stringify(docs, null, 2));
  } catch (err) {
    console.error(err);
  }
}

listProducts();
