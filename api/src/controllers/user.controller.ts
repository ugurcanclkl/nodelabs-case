import { Request, Response } from "express";
import argon2 from "argon2";
import User from "../models/User";

export async function updateMe(req: Request, res: Response) {
  const userId = req.user!._id;
  const { username, email, password } = req.body;

  // e-posta veya kullanıcı adı başka biri tarafından kullanılıyor mu?
  if (email && await User.exists({ email, _id: { $ne: userId } }))
    return res.status(409).json({ error: "email_exists" });

  if (username && await User.exists({ username, _id: { $ne: userId } }))
    return res.status(409).json({ error: "username_exists" });

  const update: any = {};
  if (username) update.username = username;
  if (email)    update.email    = email;
  if (password) update.passwordHash = await argon2.hash(password);

  const me = await User.findByIdAndUpdate(userId, update, { new: true })
                       .select("-passwordHash");   // hide hash
  res.json(me);
}