import "dotenv/config";

import { getPinecone } from "../src/server/pinecone";

async function main() {
  await getPinecone().createIndexForModel({
    name: process.env.API_PINECONE_INDEX_NAME!,
    cloud: "aws",
    region: "us-east-1",
    embed: {
      model: "llama-text-embed-v2",
      fieldMap: { text: "text" },
    },
    waitUntilReady: true,
  });
}

main();
