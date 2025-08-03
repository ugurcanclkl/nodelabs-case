import cron from "node-cron";
import User from "../models/User";
import Conversation from "../models/Conversation";
import AutoMessage from "../models/AutoMessage";

cron.schedule("0 2 * * *", async () => {                
  const users = await User.find({ isActive: true }).select("_id");
  const ids   = users.map(u => u._id.toString());


  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }

  for (let i = 0; i < ids.length - 1; i += 2) {
    const [a, b] = [ids[i], ids[i + 1]];


    let convo = await Conversation.findOne({ members: { $all: [a, b], $size:2 }});
    if (!convo) convo = await Conversation.create({ members: [a, b] });

    await AutoMessage.create({
      senderId: a,
      receiverId: b,
      conversationId: convo._id,
      text: "Selam!",
      sendDate: new Date(),       
    });
  }
  console.log("AutoMessage planner ran");
});
