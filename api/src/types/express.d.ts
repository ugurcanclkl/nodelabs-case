import { Types } from "mongoose";

declare global {
  namespace Express {
    interface UserPayload {
      _id: Types.ObjectId;
      username: string;
      email: string;
    }
    interface Request {
      user?: UserPayload;
    }
  }
}