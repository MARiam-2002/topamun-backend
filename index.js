import "./config/env.config.js";
import express from "express";
import { bootstrap } from "./src/index.router.js";
import { initializeDatabase } from "./DB/connection.js";
import fs from 'fs';
import path from 'path';
import { 
  globalErrorHandling, 
  handleNotFound,
  handleUncaughtException,
  handleUnhandledRejection,
  handleSIGTERM
} from "./src/utils/error-handling.js";

// Handle uncaught exceptions
handleUncaughtException();

const app = express();

// Load swagger specification
let swaggerSpec;
try {
  swaggerSpec = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), './swagger-spec.json'), 'utf8'));
} catch (error) {
  console.error('❌ Error loading swagger specification:', error.message);
  swaggerSpec = { info: { title: 'API Documentation', version: '1.0.0' } };
}

// Initialize database connection
await initializeDatabase();

// Serve swagger spec as JSON
app.get('/api-docs.json', (req, res) => {
  res.json(swaggerSpec);
});

// Serve comprehensive API documentation with custom styling
app.get('/api-docs', (req, res) => {
  const html = `
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>توثيق API منصة توبامين</title>
      <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui.css" />
      <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700&display=swap" rel="stylesheet">
      <style>
        /* Custom CSS to match Topamun theme */
        :root {
          --topamun-primary: #4A90E2;
          --topamun-secondary: #7BB3F0;
          --topamun-accent: #2C5AA0;
          --topamun-light: #E8F4FD;
          --topamun-dark: #1E3A8A;
          --topamun-success: #10B981;
          --topamun-warning: #F59E0B;
          --topamun-error: #EF4444;
          --topamun-gray: #6B7280;
          --topamun-light-gray: #F3F4F6;
        }

        * {
          font-family: 'Cairo', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;
        }

        body {
          background: linear-gradient(135deg, var(--topamun-light) 0%, #ffffff 100%) !important;
          margin: 0;
          padding: 0;
          direction: rtl;
        }

        /* Header styling */
        .swagger-ui .topbar {
          background: linear-gradient(135deg, var(--topamun-primary) 0%, var(--topamun-accent) 100%) !important;
          padding: 20px 0 !important;
          box-shadow: 0 4px 20px rgba(74, 144, 226, 0.3) !important;
        }

        .swagger-ui .topbar .topbar-wrapper {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .swagger-ui .topbar .topbar-wrapper::before {
          content: "🎓 توثيق API منصة توبامين التعليمية";
          color: white;
          font-size: 28px;
          font-weight: 700;
          display: block;
          margin-bottom: 8px;
        }

        .swagger-ui .topbar .topbar-wrapper::after {
          content: "دليل شامل لجميع واجهات برمجة التطبيقات مع أمثلة تطبيقية";
          color: rgba(255, 255, 255, 0.9);
          font-size: 16px;
          font-weight: 400;
          display: block;
        }

        /* Info section */
        .swagger-ui .info {
          background: white !important;
          border-radius: 16px !important;
          padding: 30px !important;
          margin: 20px 0 !important;
          box-shadow: 0 8px 32px rgba(74, 144, 226, 0.1) !important;
          border: 2px solid var(--topamun-light) !important;
        }

        .swagger-ui .info .title {
          color: var(--topamun-primary) !important;
          font-size: 32px !important;
          font-weight: 700 !important;
          margin-bottom: 15px !important;
          text-align: center !important;
        }

        .swagger-ui .info .description {
          color: var(--topamun-gray) !important;
          font-size: 16px !important;
          line-height: 1.6 !important;
          text-align: center !important;
        }

        /* Operations styling */
        .swagger-ui .opblock {
          border-radius: 12px !important;
          margin: 20px 0 !important;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1) !important;
          border: 1px solid var(--topamun-light) !important;
          overflow: hidden !important;
        }

        .swagger-ui .opblock.opblock-post {
          border-color: var(--topamun-success) !important;
        }

        .swagger-ui .opblock.opblock-get {
          border-color: var(--topamun-primary) !important;
        }

        .swagger-ui .opblock.opblock-patch {
          border-color: var(--topamun-warning) !important;
        }

        .swagger-ui .opblock.opblock-delete {
          border-color: var(--topamun-error) !important;
        }

        .swagger-ui .opblock .opblock-summary {
          padding: 20px !important;
          background: white !important;
          border-bottom: 1px solid var(--topamun-light) !important;
        }

        .swagger-ui .opblock .opblock-summary-path {
          font-weight: 600 !important;
          font-size: 16px !important;
          color: var(--topamun-dark) !important;
        }

        .swagger-ui .opblock .opblock-summary-description {
          color: var(--topamun-gray) !important;
          font-size: 14px !important;
          margin-top: 8px !important;
        }

        /* Method badges */
        .swagger-ui .opblock .opblock-summary-method {
          border-radius: 8px !important;
          padding: 8px 16px !important;
          font-weight: 600 !important;
          font-size: 12px !important;
          text-transform: uppercase !important;
          letter-spacing: 0.5px !important;
        }

        .swagger-ui .opblock.opblock-post .opblock-summary-method {
          background: var(--topamun-success) !important;
        }

        .swagger-ui .opblock.opblock-get .opblock-summary-method {
          background: var(--topamun-primary) !important;
        }

        .swagger-ui .opblock.opblock-patch .opblock-summary-method {
          background: var(--topamun-warning) !important;
        }

        /* Response styling */
        .swagger-ui .responses-inner {
          background: var(--topamun-light-gray) !important;
          border-radius: 8px !important;
          padding: 20px !important;
        }

        .swagger-ui .response-col_status {
          font-weight: 600 !important;
          color: var(--topamun-dark) !important;
        }

        /* Parameters styling */
        .swagger-ui .parameters-container {
          background: white !important;
          border-radius: 8px !important;
          padding: 20px !important;
          margin: 15px 0 !important;
        }

        .swagger-ui .parameter__name {
          font-weight: 600 !important;
          color: var(--topamun-primary) !important;
        }

        .swagger-ui .parameter__type {
          color: var(--topamun-accent) !important;
          font-weight: 500 !important;
        }

        /* Try it out button */
        .swagger-ui .btn.try-out__btn {
          background: var(--topamun-primary) !important;
          color: white !important;
          border: none !important;
          border-radius: 8px !important;
          padding: 10px 20px !important;
          font-weight: 600 !important;
          transition: all 0.3s ease !important;
        }

        .swagger-ui .btn.try-out__btn:hover {
          background: var(--topamun-accent) !important;
          transform: translateY(-2px) !important;
          box-shadow: 0 4px 12px rgba(74, 144, 226, 0.3) !important;
        }

        /* Execute button */
        .swagger-ui .btn.execute {
          background: var(--topamun-success) !important;
          color: white !important;
          border: none !important;
          border-radius: 8px !important;
          padding: 12px 24px !important;
          font-weight: 600 !important;
          transition: all 0.3s ease !important;
        }

        .swagger-ui .btn.execute:hover {
          background: #059669 !important;
          transform: translateY(-2px) !important;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3) !important;
        }

        /* Models section */
        .swagger-ui .model-container {
          background: white !important;
          border-radius: 8px !important;
          border: 1px solid var(--topamun-light) !important;
          margin: 15px 0 !important;
        }

        .swagger-ui .model .model-title {
          color: var(--topamun-primary) !important;
          font-weight: 600 !important;
        }

        /* Scrollbar styling */
        ::-webkit-scrollbar {
          width: 8px;
        }

        ::-webkit-scrollbar-track {
          background: var(--topamun-light-gray);
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb {
          background: var(--topamun-primary);
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: var(--topamun-accent);
        }

        /* Custom additions */
        .swagger-ui .wrapper {
          max-width: 1200px !important;
          margin: 0 auto !important;
          padding: 0 20px !important;
        }

        /* Status code colors */
        .swagger-ui .response-col_status {
          font-weight: 600 !important;
        }

        .swagger-ui .response-col_status[data-code="200"],
        .swagger-ui .response-col_status[data-code="201"] {
          color: var(--topamun-success) !important;
        }

        .swagger-ui .response-col_status[data-code="400"],
        .swagger-ui .response-col_status[data-code="401"],
        .swagger-ui .response-col_status[data-code="403"],
        .swagger-ui .response-col_status[data-code="404"],
        .swagger-ui .response-col_status[data-code="409"],
        .swagger-ui .response-col_status[data-code="500"] {
          color: var(--topamun-error) !important;
        }

        /* Custom info box */
        .custom-info-box {
          background: linear-gradient(135deg, var(--topamun-primary), var(--topamun-secondary)) !important;
          color: white !important;
          padding: 25px !important;
          border-radius: 12px !important;
          margin: 20px 0 !important;
          text-align: center !important;
          box-shadow: 0 8px 32px rgba(74, 144, 226, 0.3) !important;
        }

        .custom-info-box h3 {
          margin: 0 0 15px 0 !important;
          font-size: 20px !important;
          font-weight: 700 !important;
        }

        .custom-info-box p {
          margin: 0 !important;
          font-size: 16px !important;
          opacity: 0.9 !important;
          line-height: 1.5 !important;
        }

        /* Authentication info */
        .auth-info {
          background: var(--topamun-light) !important;
          border: 2px solid var(--topamun-primary) !important;
          border-radius: 12px !important;
          padding: 20px !important;
          margin: 20px 0 !important;
        }

        .auth-info h4 {
          color: var(--topamun-primary) !important;
          margin: 0 0 10px 0 !important;
          font-size: 18px !important;
          font-weight: 600 !important;
        }

        .auth-info p {
          color: var(--topamun-gray) !important;
          margin: 0 !important;
          font-size: 14px !important;
          line-height: 1.5 !important;
        }

        /* Code examples styling */
        .swagger-ui .highlight-code {
          background: var(--topamun-dark) !important;
          border-radius: 8px !important;
          border: 1px solid var(--topamun-primary) !important;
        }

        .swagger-ui pre {
          background: var(--topamun-dark) !important;
          color: #E5E7EB !important;
          border-radius: 8px !important;
          padding: 15px !important;
          font-size: 14px !important;
          line-height: 1.4 !important;
        }

        /* Tags styling */
        .swagger-ui .opblock-tag {
          background: var(--topamun-primary) !important;
          color: white !important;
          border-radius: 8px !important;
          padding: 15px 20px !important;
          margin: 20px 0 !important;
          font-size: 18px !important;
          font-weight: 600 !important;
          box-shadow: 0 4px 16px rgba(74, 144, 226, 0.2) !important;
        }

        .swagger-ui .opblock-tag:hover {
          background: var(--topamun-accent) !important;
          transform: translateY(-2px) !important;
          box-shadow: 0 6px 20px rgba(74, 144, 226, 0.3) !important;
        }

        /* Footer */
        .api-footer {
          background: var(--topamun-dark) !important;
          color: white !important;
          text-align: center !important;
          padding: 30px 20px !important;
          margin-top: 50px !important;
        }

        .api-footer h4 {
          margin: 0 0 10px 0 !important;
          font-size: 18px !important;
          font-weight: 600 !important;
        }

        .api-footer p {
          margin: 0 !important;
          opacity: 0.8 !important;
          font-size: 14px !important;
        }

        /* Responsive design */
        @media (max-width: 768px) {
          .swagger-ui .wrapper {
            padding: 0 15px !important;
          }
          
          .swagger-ui .info {
            padding: 20px !important;
          }
          
          .swagger-ui .info .title {
            font-size: 24px !important;
          }
          
          .custom-info-box {
            padding: 20px !important;
          }
          
          .custom-info-box h3 {
            font-size: 18px !important;
          }
        }
      </style>
    </head>
    <body>
      <div class="custom-info-box">
        <h3>🎓 مرحباً بك في توثيق API منصة توبامين التعليمية</h3>
        <p>دليل شامل ومتكامل لجميع واجهات برمجة التطبيقات مع أمثلة تطبيقية وحالات استخدام مختلفة لتسهيل عملية التطوير</p>
      </div>
      
      <div class="auth-info">
        <h4>🔐 معلومات التوثيق والأمان</h4>
        <p><strong>نوع التوثيق:</strong> Bearer Token (JWT)</p>
        <p><strong>رأس الطلب:</strong> Authorization: Bearer YOUR_TOKEN_HERE</p>
        <p><strong>مدة صلاحية الرمز:</strong> 7 أيام</p>
        <p><strong>ملاحظة:</strong> يجب تسجيل الدخول أولاً للحصول على الرمز المميز</p>
      </div>

      <div id="swagger-ui"></div>

      <div class="api-footer">
        <h4>منصة توبامين التعليمية</h4>
        <p>جميع الحقوق محفوظة © 2024 | تم تطوير هذا التوثيق بعناية فائقة لتسهيل عملية التطوير</p>
      </div>

      <script src="https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui-bundle.js"></script>
      <script src="https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui-standalone-preset.js"></script>
      <script>
        window.onload = function() {
          const ui = SwaggerUIBundle({
            url: '/api-docs.json',
            dom_id: '#swagger-ui',
            deepLinking: true,
            presets: [
              SwaggerUIBundle.presets.apis,
              SwaggerUIStandalonePreset
            ],
            plugins: [
              SwaggerUIBundle.plugins.DownloadUrl
            ],
            layout: "StandaloneLayout",
            defaultModelsExpandDepth: 2,
            defaultModelExpandDepth: 2,
            docExpansion: "list",
            operationsSorter: "alpha",
            tagsSorter: "alpha",
            filter: true,
            showRequestHeaders: true,
            showCommonExtensions: true,
            tryItOutEnabled: true,
            requestInterceptor: (request) => {
              // Add custom headers or modify requests if needed
              console.log('Request:', request);
              return request;
            },
            responseInterceptor: (response) => {
              // Handle responses
              console.log('Response:', response);
              return response;
            }
          });
          
          // Add custom JavaScript for enhanced functionality
          setTimeout(() => {
            // Add Arabic text to some elements
            const tryItButtons = document.querySelectorAll('.try-out__btn');
            tryItButtons.forEach(btn => {
              if (btn.textContent.includes('Try it out')) {
                btn.textContent = 'جرب الآن';
              }
              if (btn.textContent.includes('Cancel')) {
                btn.textContent = 'إلغاء';
              }
            });

            const executeButtons = document.querySelectorAll('.execute');
            executeButtons.forEach(btn => {
              if (btn.textContent.includes('Execute')) {
                btn.textContent = 'تنفيذ';
              }
            });

            // Add helpful tooltips
            const endpoints = document.querySelectorAll('.opblock-summary');
            endpoints.forEach(endpoint => {
              endpoint.addEventListener('click', function() {
                setTimeout(() => {
                  const parameterInputs = document.querySelectorAll('input[placeholder=""], textarea[placeholder=""]');
                  parameterInputs.forEach(input => {
                    const paramName = input.closest('tr')?.querySelector('.parameter__name')?.textContent;
                    if (paramName) {
                      switch(paramName) {
                        case 'email':
                          input.placeholder = 'example@topamun.com';
                          break;
                        case 'password':
                          input.placeholder = 'كلمة مرور قوية';
                          break;
                        case 'firstName':
                          input.placeholder = 'أحمد';
                          break;
                        case 'lastName':
                          input.placeholder = 'محمد';
                          break;
                        case 'phone':
                          input.placeholder = '01234567890';
                          break;
                        case 'governorate':
                          input.placeholder = 'القاهرة';
                          break;
                        case 'gradeLevel':
                          input.placeholder = 'المرحلة الثانوية';
                          break;
                        case 'subject':
                          input.placeholder = 'الرياضيات';
                          break;
                      }
                    }
                  });
                }, 100);
              });
            });
          }, 1000);
        };
      </script>
    </body>
    </html>
  `;
  res.send(html);
});

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const { healthCheck } = await import('./DB/connection.js');
    const dbHealth = await healthCheck();
    
    res.status(200).json({
      success: true,
      message: 'Server is running',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: dbHealth,
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      message: 'Service unavailable',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// Setup API routes
bootstrap(app, express);

// Handle favicon requests
app.get('/favicon.ico', (req, res) => {
  res.status(204).end();
});

app.get('/favicon.png', (req, res) => {
  res.status(204).end();
});

// Handle 404 errors for unmatched routes
app.all("*", handleNotFound);

// Global error handler
app.use(globalErrorHandling);

// Start server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
  console.log(`🔍 Health Check: http://localhost:${PORT}/health`);
});

// Handle unhandled promise rejections
handleUnhandledRejection(server);

// Handle SIGTERM
handleSIGTERM(server);

export default app;
