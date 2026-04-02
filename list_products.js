const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'sd28lfuz',
  dataset: 'production',
  token: 'skeEQ0ogGPgPHyb8wwBTPbbUHsIfOoFVXerpFuWGguR9nauSDJ30M7lwv3kUIBSLU1Um6CXKEwQ7akn8NePdWLqpgbcZFzAGebnhLkE7P5GMBqDh3p6Z6p7w34ek4VrJW1OHjxfFBNNhXZwYdHJe0UvsDWxbYz8iMN60JTLgmTA52p7piNNS',
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
