import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";

export async function authGuard(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const hdr = req.headers.authorization;
  if (!hdr?.startsWith("Bearer "))
    return res.status(401).json({ error: "missing token" });

  try {
    const payload = jwt.verify(
      hdr.slice(7),
      process.env.JWT_SECRET as string
    ) as { sub: string };

    const user = await User.findById(payload.sub).select("-passwordHash");
    if (!user) throw new Error("user gone");

    req.user = user;
    next();
  } catch {
    res.status(401).json({ error: "bad token" });
  }
}
