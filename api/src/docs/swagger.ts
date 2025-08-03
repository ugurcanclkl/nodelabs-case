import swaggerJSDoc from "swagger-jsdoc";

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title:  "Nodelabs Chat API",
      version:"1.0.0",
      description: "Real-time messaging backend (REST & Socket.IO)"
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      }
    },
    security: [{ bearerAuth: [] }]
  },

  apis: [
    "./src/routes/**/*.ts",
    "./src/controllers/**/*.ts",
    "./src/models/**/*.ts",
    "./src/docs/schemas.ts"
  ]
};

export const swaggerSpec = swaggerJSDoc(options);
