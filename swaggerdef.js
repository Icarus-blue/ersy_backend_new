import swaggerJsDoc from 'swagger-jsdoc'

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'ERSY website Backend API',
            version: '1.0.0',
            description: 'ERSY website Backend API',
        },
    },
    // Path to the API docs
    apis: ['./routes/*.js'], // Assuming your endpoints are defined in the routes directory
};

const swaggerSpec = swaggerJsDoc(swaggerOptions);

export default swaggerSpec;
