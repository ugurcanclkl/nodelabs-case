import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET as string;
const ACCESS_TTL  = "15m";
const REFRESH_TTL = "7d";

export const signAccessToken  = (uid: string) => jwt.sign({ sub: uid }, SECRET, { expiresIn: ACCESS_TTL  });
export const signRefreshToken = (uid: string) => jwt.sign({ sub: uid }, SECRET, { expiresIn: REFRESH_TTL });