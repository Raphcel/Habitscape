const swaggerJSDoc = require('swagger-jsdoc');

const { PORT, NODE_ENV } = require('./env');

const definition = {
  openapi: '3.0.3',
  info: {
    title: 'Habitscape API',
    version: '1.0.0',
    description:
      'RESTful API for Habitscape — AI-powered personal health & habit tracker. ' +
      'Built with Express.js + PostgreSQL (raw SQL). ' +
      'All protected endpoints require a Bearer JWT token.',
    contact: {
      name: 'Habitscape Dev Team',
    },
  },
  servers: [
    {
      url: `http://localhost:${PORT}/api/v1`,
      description: 'Local development server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Paste your JWT token (without "Bearer " prefix)',
      },
    },
    schemas: {
      // ─── Common ──────────────────────────────────────────────────────────
      SuccessResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'OK' },
          data: { type: 'object' },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Something went wrong' },
        },
      },
      ValidationErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Validation failed' },
          errors: {
            type: 'object',
            additionalProperties: {
              type: 'array',
              items: { type: 'string' },
            },
            example: {
              email: ['Invalid email address'],
              password: ['Password must be at least 8 characters'],
            },
          },
        },
      },
      // ─── User ─────────────────────────────────────────────────────────────
      User: {
        type: 'object',
        properties: {
          id:              { type: 'string', format: 'uuid', example: 'a1b2c3d4-...' },
          name:            { type: 'string', example: 'Rafif Farras' },
          email:           { type: 'string', format: 'email', example: 'rafif@example.com' },
          calorie_goal:    { type: 'integer', example: 2200 },
          protein_goal_g:  { type: 'integer', example: 150 },
          carbs_goal_g:    { type: 'integer', example: 250 },
          fat_goal_g:      { type: 'integer', example: 70 },
          created_at:      { type: 'string', format: 'date-time' },
          updated_at:      { type: 'string', format: 'date-time' },
        },
      },
      AuthResponse: {
        type: 'object',
        properties: {
          token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
          user:  { $ref: '#/components/schemas/User' },
        },
      },
    },
  },
};

const options = {
  definition,
  // Scan all route files for JSDoc @swagger comments
  apis: ['./src/modules/**/*.routes.js'],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
