/**
 * @openapi
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 *   schemas:
 *     Error:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           example: invalid_credentials
 *
 *     RegisterDto:
 *       type: object
 *       required: [username, email, password]
 *       properties:
 *         username:
 *           type: string
 *           example: alice
 *         email:
 *           type: string
 *           format: email
 *           example: alice@chat.dev
 *         password:
 *           type: string
 *           format: password
 *           example: secret123
 *
 *     LoginDto:
 *       allOf:
 *         - $ref: '#/components/schemas/RegisterDto'
 *       required: [email, password]
 *       properties:
 *         email:
 *           example: alice@chat.dev
 *
 *     RefreshDto:
 *       type: object
 *       required: [refreshToken]
 *       properties:
 *         refreshToken:
 *           type: string
 *           example: eyJhbGc...
 *
 *     TokenPair:
 *       type: object
 *       properties:
 *         accessToken:
 *           type: string
 *           example: eyJhbGc...
 *         refreshToken:
 *           type: string
 *           example: eyJhbGc...
 *
 *     User:
 *       type: object
 *       properties:
 *         _id:      { type: string, example: 60af... }
 *         username: { type: string, example: alice }
 *         email:    { type: string, example: alice@chat.dev }
 *
 *     Conversation:
 *       type: object
 *       properties:
 *         _id:       { type: string, example: 612f... }
 *         members:
 *           type: array
 *           items: { type: string }
 *           example: [612f..., 6130...]
 *         isGroup:   { type: boolean, example: false }
 *         name:      { type: string, nullable: true, example: null }
 *         updatedAt: { type: string, format: date-time, example: "2025-08-02T20:24:00Z" }
 *
 *     Message:
 *       type: object
 *       properties:
 *         _id:            { type: string }
 *         conversationId: { type: string }
 *         senderId:       { type: string }
 *         text:           { type: string, example: "Hello world!" }
 *         createdAt:      { type: string, format: date-time }
 *     CreateConversationDto:
 *       type: object
 *       required: [members, name]
 *       properties:
 *         members:
 *           type: array
 *           items: { type: string }
 *           example: ["612f...", "6130..."]
 *         name:
 *           type: string
 *           nullable: true
 *           example: "Project X"
 *
 *     SendMessageDto:
 *       type: object
 *       required: [conversationId, text]
 *       properties:
 *         conversationId:
 *           type: string
 *           example: 612f...
 *         text:
 *           type: string
 *           example: "Hey, did you push the latest commit?"
 *
 *     MessagesPage:
 *       type: array
 *       items:
 *         $ref: '#/components/schemas/Message'
 *     UpdateProfileDto:
 *       type: object
 *       properties:
 *         username:
 *           type: string
 *           example: "newHandle"
 *         avatarUrl:
 *           type: string
 *           format: uri
 *           example: "https://cdn.example.com/u/123.png"
 *       additionalProperties: false
 */
export {};
