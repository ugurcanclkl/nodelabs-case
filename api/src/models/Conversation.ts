import { Schema, model, Types, Document } from "mongoose";

export interface IConversation {
  members: Types.ObjectId[];
  isGroup: boolean;
  name?: string;
}

export interface ConversationDoc extends IConversation, Document {
  createdAt: Date;
  updatedAt: Date;
}

const conversationSchema = new Schema<ConversationDoc>(
  {
    members: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
    isGroup: { type: Boolean, default: false },
    name:    { type: String },
  },
  { timestamps: true }
);

conversationSchema.index({ members: 1 });

export default model<ConversationDoc>("Conversation", conversationSchema);
