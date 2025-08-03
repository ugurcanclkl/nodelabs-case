import { Request, Response } from "express";
import { Types } from "mongoose";
import Conversation, { ConversationDoc } from "../models/Conversation";
import Message from "../models/Message";
import { Server } from "socket.io";
import { getCached, invalidate } from "../services/cache";
import { es } from "../utils/elastic";

const io: Server = require("../sockets").io; 

export async function createConversation(req: Request, res: Response) {
    const userId = req.user!._id;
    const { members, name } = req.body;

    if (!members.includes(String(userId))) members.push(String(userId));

    if (members.length === 2) {
    const existing = await Conversation.findOne({ members: { $all: members, $size: 2 } });
    if (existing) return res.json(existing);
    }

    const convo = await Conversation.create({ members, isGroup: members.length > 2, name });
    res.status(201).json(convo);
}

export async function listConversations(req: Request, res: Response) {
    const myId = req.user!._id;

    const rooms = await Conversation.find({ members: myId })
    .sort({ updatedAt: -1 })
    .lean();

    res.json(rooms);
}

export async function sendMessage(req: Request, res: Response) {
  const senderId = req.user!._id as Types.ObjectId;
  const { conversationId, text } = req.body;

  const convo = await Conversation.findById(conversationId);

  if (!convo || !convo.members.some(id => id.equals(senderId)))
    return res.status(403).json({ error: "not_in_conversation" });

  const msg = await Message.create({ conversationId, senderId, text });

  convo.updatedAt = new Date();
  await convo.save();

   await es.index({
    index:  "messages",
    id:     msg._id.toString(),
    refresh:"wait_for",
    document: {
      conversationId,
      senderId,
      text,
      createdAt: msg.createdAt,
    },
  });

  await invalidate(`messages:${conversationId}:*`);
  io.to(`conversation:${conversationId}`).emit("message_received", msg);

  return res.status(201).json(msg);
}

export async function getMessages(req: Request, res: Response) {
  const { conversationId } = req.params;
  const { after, limit = 20 } = req.query as any;

  const cacheKey = `messages:${conversationId}:${after ?? "first"}:${limit}`;

  const msgs = await getCached(cacheKey, async () => {
    const filter: any = { conversationId };
    if (after) filter._id = { $gt: after };
    return Message.find(filter).sort({ _id: 1 }).limit(Number(limit));
  });

  res.json(msgs);
}
