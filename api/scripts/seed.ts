import "dotenv/config";
import mongoose, { Types } from "mongoose";
import argon2 from "argon2";
import { faker } from "@faker-js/faker";

import User, { IUser } from "../src/models/User";
import Conversation from "../src/models/Conversation";
import Message from "../src/models/Message";

async function main() {
  await mongoose.connect(process.env.MONGO ?? "mongodb://mongo:27017/chat");

  const fresh = process.argv.includes("--fresh") || process.argv.includes("-f");
  if (fresh) {
    await Promise.all([
      User.deleteMany({ demo: true } as any),
      Conversation.deleteMany({ demo: true } as any),
      Message.deleteMany({ demo: true } as any),
    ]);
    console.log("🗑️  Eski demo verileri temizlendi");
  }

  const users: (IUser & { _id: Types.ObjectId })[] = [];
  for (let i = 0; i < 10; i++) {
    const passwordHash = await argon2.hash("secret");
    const u = await User.create({
      username: faker.internet.userName(),
      email: faker.internet.email(),
      passwordHash,
      isActive: true,
      demo: true,
    } as any);
    users.push(u);
  }

  for (let i = 0; i < users.length - 1; i += 2) {
    const [a, b] = [users[i]._id, users[i + 1]._id];
    const convo = await Conversation.create({
      members: [a, b],
      isGroup: false,
      demo: true,
    } as any);

    await Message.create({
      conversationId: convo._id,
      senderId: a,
      text: faker.hacker.phrase(),
      demo: true,
    } as any);
  }

  const groupMembers = users.slice(0, 4).map(u => u._id);
  const group = await Conversation.create({
    members: groupMembers,
    isGroup: true,
    name: "Demo Grup",
    demo: true,
  } as any);

  for (const m of groupMembers) {
    await Message.create({
      conversationId: group._id,
      senderId: m,
      text: faker.animal.cat(),
      demo: true,
    } as any);
  }

  console.log("✅ Seed tamam. Demo şifresi: 'secret'");
  process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });
