import express from "express";
import http from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { initRabbit } from "./utils/rabbit";
import { registerSocketHandlers } from "./sockets";
import messageRoutes from "./routes/messages.routes";
import authRoutes from "./routes/auth.routes";
import chatRoutes from "./routes/chat.routes";
import presenceRoutes from "./routes/presence.routes";
import "./jobs/planMessages";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./docs/swagger";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import userRoutes from "./routes/user.routes";
import pinoHttp from "pino-http";
import { logger } from "./utils/logger";
import { ensureIndex } from "./utils/elastic"

dotenv.config();

const app = express();
app.use(express.json());
app.use(pinoHttp({ logger }));
app.use(helmet());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api/auth", authRoutes);
app.use("/api", messageRoutes);
app.use("/api", chatRoutes);
app.use("/api", presenceRoutes);
app.use("/api", userRoutes);

if (require.main === module) {
  const PORT = process.env.PORT ?? 3000;
  const httpServer = http.createServer(app);
  const io = new Server(httpServer, { cors: { origin: "*" } });

  registerSocketHandlers(io);

  httpServer.listen(PORT, async () => {
    await mongoose.connect(process.env.MONGO as string);
    await initRabbit();
    await ensureIndex();
    console.log(`API up @${PORT}`);
  });
}

export default app;
