import "dotenv/config";

import { getIndex } from "../src/server/pinecone";

const query = process.argv[2] ?? "What did Gaurav work on at Feast?";

async function main() {
  const response = await getIndex().searchRecords({
    query: {
      topK: 5,
      inputs: { text: query },
    },
  });

  response.result.hits.forEach((hit) => {
    console.log("hit", hit);
  });
}

main();
