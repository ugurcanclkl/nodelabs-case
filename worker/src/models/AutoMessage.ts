import { Schema, model, Types, Document } from "mongoose";

export interface IAutoMessage {
  senderId:    Types.ObjectId;
  receiverId:  Types.ObjectId;
  conversationId: Types.ObjectId;
  text:        string;
  sendDate:    Date;
  isQueued:    boolean;
  isSent:      boolean;
}

export interface AutoMessageDoc extends IAutoMessage, Document {}

const schema = new Schema<AutoMessageDoc>(
  {
    senderId:       { type: Schema.Types.ObjectId, ref: "User", required: true },
    receiverId:     { type: Schema.Types.ObjectId, ref: "User", required: true },
    conversationId: { type: Schema.Types.ObjectId, ref: "Conversation", required: true },
    text:     String,
    sendDate: Date,
    isQueued: { type: Boolean, default: false },
    isSent:   { type: Boolean, default: false },
  },
  { timestamps: true }
);

schema.index({ sendDate: 1, isQueued: 1, isSent: 1 });

export default model<AutoMessageDoc>("AutoMessage", schema);
