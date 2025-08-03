// User.ts
import { Schema, model } from "mongoose";

export interface IUser {
  username: string;
  email: string;
  passwordHash: string;
  isActive: boolean;
}

const schema = new Schema<IUser>(
  {
    username: { type: String, unique: true, required: true },
    email:    { type: String, unique: true, required: true },
    passwordHash: { type: String, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default model<IUser>("User", schema);
