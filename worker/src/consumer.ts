import dotenv from "dotenv";
import mongoose from "mongoose";
import amqp, { ConsumeMessage } from "amqplib";
import { io as ioClient, Socket } from "socket.io-client";
import Message from "./models/Message";
import AutoMessage from "./models/AutoMessage"; 
import { logger } from "./utils/logger";
import { es } from "./utils/elastic";

dotenv.config();

const RABBIT = process.env.RABBITMQ_URL ?? "amqp://rabbitmq:5672";
const MONGO  = process.env.MONGO        ?? "mongodb://mongo:27017/chat";
const API_URL = process.env.API_URL     ?? "http://api:3000"; 
const SERVICE_JWT = process.env.INTERNAL_TOKEN ?? "";         

(async () => {
  /* ---------- Mongo ---------- */
  await mongoose.connect(MONGO);
  console.log("Mongo connected (worker)");
  logger.info("🐢 Mongo connected (worker)");

  /* ---------- Socket.IO ---------- */
  const socket: Socket = ioClient(API_URL, {
    auth: { token: SERVICE_JWT },
    reconnectionAttempts: 5,
  });

  socket.on("connect",   () => console.log("📡 worker → API socket connected"));
  socket.on("connect_error", (err) => console.error("socket error", err.message));

  /* ---------- RabbitMQ ---------- */
  const conn    = await amqp.connect(RABBIT);
  const channel = await conn.createChannel();
  await channel.assertQueue("message_sending_queue", { durable: true });
  console.log("Worker consuming message_sending_queue");
  logger.info("🐇 Worker consuming message_sending_queue");

  /* ---------- Consume ---------- */
  channel.consume("message_sending_queue", async (msg: ConsumeMessage | null) => {
    if (!msg) return;

    const job = JSON.parse(msg.content.toString()) as {
      _id:          string;
      senderId:     string;
      receiverId:   string;
      text:         string;
      conversationId: string;
    };

    const saved = await Message.create({
      conversationId: job.conversationId,
      senderId:       job.senderId,
      text:           job.text,
    });

    await es.index({
      index:  "messages",
      id:     saved._id.toString(),
      refresh:"wait_for",
      document: {
        conversationId: saved.conversationId,
        senderId:       saved.senderId,
        text:           saved.text,
        createdAt:      saved.createdAt,
      },
    });

    await AutoMessage.findByIdAndUpdate(job._id, { isSent: true });

    socket.emit("message_received", saved);

    channel.ack(msg);
    console.log(`auto-msg → ${job.receiverId} delivered`);
    logger.info(
      { receiver: job.receiverId, conversationId: job.conversationId },
      "auto-msg delivered",
    );
  });
})();
