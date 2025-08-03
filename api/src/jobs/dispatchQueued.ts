import cron from "node-cron";
import AutoMessage from "../models/AutoMessage";
import { channel } from "../utils/rabbit";

cron.schedule("* * * * *", async () => {
  const due = await AutoMessage.find({ sendDate:{ $lte:new Date() }, isQueued:false });
  due.forEach(async (doc) => {
    channel.sendToQueue("message_sending_queue",
      Buffer.from(JSON.stringify(doc.toObject()))); 
    doc.isQueued = true;
    await doc.save();
  });
  if (due.length) console.log(`📮 queued ${due.length} auto-messages`);
});