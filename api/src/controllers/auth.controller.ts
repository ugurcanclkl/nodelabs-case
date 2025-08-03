import { Request, Response } from "express";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import User from "../models/User";
import { signAccessToken, signRefreshToken } from "../utils/jwt";
import { blacklistToken, isBlacklisted } from "../utils/blacklist";

export async function register(req: Request, res: Response) {
  const { username, email, password } = req.body;
  if (await User.findOne({ email })) return res.status(409).json({ error: "email exists" });
  if (await User.findOne({ username })) return res.status(409).json({ error: "username exists" });

  const passwordHash = await argon2.hash(password);
  const user = await User.create({ username, email, passwordHash });

  res.json({
    accessToken:  signAccessToken(user._id.toString()),
    refreshToken: signRefreshToken(user._id.toString()),
  });
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  const ok   = user && await argon2.verify(user.passwordHash, password);
  if (!ok)
    return res.status(401).json({ error: "invalid credentials" });

  res.json({
    accessToken:  signAccessToken(user._id.toString()),
    refreshToken: signRefreshToken(user._id.toString()),
  });
}

export async function refresh(req: Request, res: Response) {
  const { refreshToken } = req.body;

  if (await isBlacklisted(refreshToken))
    return res.status(401).json({ error: "token_revoked" });

  try {
    const payload = jwt.verify(
      refreshToken,
      process.env.JWT_SECRET as string
    ) as any;

    const newAccess = signAccessToken(payload.sub);
    return res.json({ accessToken: newAccess });
  } catch {
    return res.status(401).json({ error: "bad_token" });
  }
}

export async function logout(req: Request, res: Response) {
  const { refreshToken } = req.body;
  if (refreshToken) {
    await blacklistToken(refreshToken, 604_800);
  }
  res.json({ ok: true });
}

export function me(req: Request, res: Response) {
  res.json(req.user);
}
