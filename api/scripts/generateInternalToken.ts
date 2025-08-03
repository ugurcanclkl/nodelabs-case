import "dotenv/config";
import mongoose from "mongoose";
import User from "../src/models/User";
import { signAccessToken } from "../src/utils/jwt";

(async () => {
  const MONGO = process.env.MONGO ?? "mongodb://mongo:27017/chat";

  await mongoose.connect(MONGO);

  const { _id } = await User.findOneAndUpdate(
    { username: "system" },
    { $setOnInsert: { email: "system@bot.dev", passwordHash: "-" } },
    { upsert: true, new: true, projection: { _id: 1 } }
  ).lean();

  const token = signAccessToken(_id.toString());
  console.log(token);        // <-- stdout
  process.exit(0);
})();
