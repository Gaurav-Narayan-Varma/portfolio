import "dotenv/config";

import { getIndex } from "../src/server/pinecone";

async function main() {
  const stats = await getIndex().describeIndexStats();

  console.log(stats);
}

main();
