import { Server, Socket } from "socket.io";
import { redis } from "../utils/redis";
import Message from "../models/Message";
import { jwtSocketAuth } from "../middleware/jwtSocketAuth";

export function registerSocketHandlers(io: Server) {

  io.use(jwtSocketAuth).on("connection", (socket: Socket) => {
    const userId = socket.data.userId as string;
    redis.sadd("onlineUsers", userId);
    io.emit("user_online", { userId });          // broadcast

    /* ---------- room join ---------- */
    socket.on("join_room", (roomId: string) => socket.join(`conversation:${roomId}`));

    /* ---------- typing UX ---------- */
    socket.on("typing",   (roomId: string) => socket.to(`conversation:${roomId}`)
                                                    .emit("typing", { conversationId:roomId, userId }));
    socket.on("stop_typing", (roomId: string) => socket.to(`conversation:${roomId}`)
                                                        .emit("stop_typing", { conversationId:roomId, userId }));

    /* ---------- send message ---------- */
    socket.on("send_message",
      async ({ roomId, text }: { roomId: string; text: string }) => {
        const msg = await Message.create({ conversationId: roomId, senderId: userId, text });
        io.to(`conversation:${roomId}`).emit("message_received", msg);
      });

    /* ---------- disconnect ---------- */
    socket.on("disconnect", async () => {
      await redis.srem("onlineUsers", userId);
      io.emit("user_offline", { userId });
    });
  });
}
