import swaggerAutogen from 'swagger-autogen';

const doc = {
  info: {
    title: 'Topamine API Documentation',
    version: '1.0.0',
    description:
      'Welcome to the official Topamine API documentation. This document provides a comprehensive overview of all available endpoints for developers to interact with the Topamine platform.',
  },
  host: 'topamun-backend.vercel.app',
  schemes: ['https'],
  securityDefinitions: {
    bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
    }
  },
  definitions: {
    StudentRegistration: {
        $firstName: "Ahmed",
        $lastName: "Ali",
        $email: "student@example.com",
        $password: "password123",
        $confirmPassword: "password123",
        $phone: "1234567890",
        $province: "Cairo",
        $role: "Student",
        $academicStage: "High School"
    },
    TeacherRegistration: {
        $firstName: "Fatima",
        $lastName: "Zahra",
        $email: "teacher@example.com",
        $password: "password123",
        $confirmPassword: "password123",
        $phone: "0987654321",
        $province: "Alexandria",
        $role: "Teacher",
        $subject: "Physics",
        certificate: "file"
    },
    Login: {
        $email: "user@example.com",
        $password: "password123"
    },
    ForgetCode: {
        $email: "user@example.com",
    },
    ResetPassword: {
        $email: "user@example.com",
        $forgetCode: "12345",
        $password: "newPassword123",
        $confirmPassword: "newPassword123"
    }
  }
};

const outputFile = './src/swagger-output.json';
const endpointsFiles = ['./src/index.router.js']; 

// Generate swagger.json
swaggerAutogen({openapi: '3.0.0'})(outputFile, endpointsFiles, doc); 