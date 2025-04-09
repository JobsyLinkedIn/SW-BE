import swaggerAutogen from 'swagger-autogen';

const doc = {
  info: {
    title: 'API Documentation',
    description: 'API Documentation for the application',
    version: '1.0.0',
  },
  host: process.env.PORT ? `localhost:${process.env.PORT}` : 'localhost:3000',
  basePath: '/',
};

const outputFile = './swagger_output.json';
const endpointsFiles = ['./server.js'];

swaggerAutogen()(outputFile, endpointsFiles, doc).then(() => {
  import('./server.js');
});
