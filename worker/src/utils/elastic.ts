import { Client } from "@elastic/elasticsearch";
import { logger } from "./logger";


export const es = new Client({
  node: process.env.ELASTIC_URL ?? "http://elastic:9200",
});

export async function ensureIndex() {
  const exists = await es.indices.exists({ index: "messages" });
  if (exists) return;

  await es.indices.create({
    index: "messages",
    mappings: {
      properties: {
        conversationId: { type: "keyword" },
        senderId:       { type: "keyword" },
        text:           { type: "text", analyzer: "standard" },
        createdAt:      { type: "date" },
      },
    },
  });
  logger.info("Elasticsearch index created: messages");
}
