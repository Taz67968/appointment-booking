import swaggerJsdoc from 'swagger-jsdoc';

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Appointment REST API',
      version: '1.0.0',
      description: 'A simple REST API for managing user appointments, including authentication',
      contact: {
        name: 'API Support',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}/api`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT Bearer token **_only_**',
        },
      },
      schemas: {
        Client: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid', description: 'User ID' },
            firstName: { type: 'string', description: 'User\'s first name' },
            lastName: { type: 'string', description: 'User\'s last name' },
            email: { type: 'string', format: 'email', description: 'User\'s email address' },
          },
          required: ['id', 'firstName', 'lastName', 'email'],
        },
        Provider: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid', description: 'Provider ID' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            email: { type: 'string', format: 'email' },
            profession: { type: 'string' },
            description: { type: 'string' },
            booked: { type: 'boolean' },
          },
          required: ['id', 'firstName', 'lastName', 'email', 'profession', 'description'],
        },
        Appointment: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            appointmentid: { type: 'string', format: 'uuid' },
            title: { type: 'string' },
            description: { type: 'string', nullable: true },
            booked: { type: 'boolean', default: false },
          },
          required: ['id', 'appointmentid', 'title'],
        },
        Timeslot: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            workingDays: { type: 'string' },
            workingTime: { type: 'string' },
          },
          required: ['id', 'workingDays', 'workingTime'],
        },
        Error: {
          type: 'object',
          properties: {
            message: { type: 'string' },
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
  apis: ['./routes/appointment.js', './routes/auth.js', './routes/timeslot.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
export default swaggerSpec;
