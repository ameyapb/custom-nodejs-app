import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Node App API",
      version: "1.0.0",
      description: "Image resource management API with RBAC authentication",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        UserAccount: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            emailAddress: { type: "string" },
            assignedApplicationRole: {
              type: "string",
              enum: ["admin", "editor", "viewer"],
            },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Resource: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            userId: { type: "string", format: "uuid" },
            filename: { type: "string" },
            fileSizeBytes: { type: "integer" },
            mimeType: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Error: {
          type: "object",
          properties: {
            message: { type: "string" },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [
    "./src/routes/health.js",
    "./src/routes/serviceHealth.js",
    "./src/routes/authenticationRoutes.js",
    "./src/routes/resourceRoutes.js",
    "./src/routes/comfyRoutes.js",
  ],
};

export const swaggerSpec = swaggerJsdoc(options);
