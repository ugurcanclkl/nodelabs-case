import mongoose from "mongoose";
import Message from "../src/models/Message";
import { es, ensureIndex } from "../src/utils/elastic";

await mongoose.connect(process.env.MONGO!);
await ensureIndex();

const cursor = Message.find().cursor();
for await (const m of cursor) {
  await es.index({
    index: "messages",
    id: m._id.toString(),
    document: {
      conversationId: m.conversationId,
      senderId: m.senderId,
      text: m.text,
      createdAt: m.createdAt,
    },
  });
  process.stdout.write(".");
}
console.log("\nDone"); process.exit(0);
