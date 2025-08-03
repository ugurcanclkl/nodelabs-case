import { z } from "zod";
import { Types } from "mongoose";

const objectId = z
  .string()
  .refine((v) => Types.ObjectId.isValid(v), { message: "Geçersiz ObjectId" });

export const createConversationSchema = z.object({
  members: z.array(objectId).min(2, "En az 2 üye gerekir"),  // includes current user!
  name:    z.string().min(1).optional(),                    // only for group chat
});

export const sendMessageSchema = z.object({
  conversationId: objectId,
  text:           z.string().min(1, "Boş mesaj gönderilemez"),
});

export const getMessagesSchema = z.object({
  params: z.object({ conversationId: objectId }),
  query:  z.object({
    after: objectId.optional(),
    limit: z.coerce.number().min(1).max(100).default(20).optional(),
  }),
});

export type CreateConvDTO  = z.infer<typeof createConversationSchema>;
export type SendMsgDTO     = z.infer<typeof sendMessageSchema>;
export type GetMessagesDTO = z.infer<typeof getMessagesSchema>;
