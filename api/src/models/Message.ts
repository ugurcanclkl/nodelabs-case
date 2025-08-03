import { Schema, model, Types } from "mongoose";

export interface IMessage {
  conversationId: Types.ObjectId;
  senderId: Types.ObjectId;
  text: string;
}

export interface MessageDoc extends IMessage, Document {
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<MessageDoc>(
  { conversationId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    senderId:       { type: Schema.Types.ObjectId, ref: "User", required: true },
    text:           { type: String },
  },
  { timestamps: true }
);

messageSchema.index({ text: "text" });

export default model<MessageDoc>("Message", messageSchema);