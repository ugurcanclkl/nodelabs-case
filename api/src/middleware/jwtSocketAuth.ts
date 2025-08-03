import { Socket } from "socket.io";
import jwt from "jsonwebtoken";

export function jwtSocketAuth(socket: Socket, next: (err?: Error) => void) {
  const token =
    socket.handshake.auth?.token ||
    socket.handshake.query?.token ||
    socket.handshake.headers['auth-token'];

  if (!token) return next(new Error('missing token'));

  try {
    const payload = jwt.verify(token as string, process.env.JWT_SECRET as string) as any;
    socket.data.userId = payload.sub;
    next();
  } catch (e) {
    next(new Error('bad token'));
  }
}