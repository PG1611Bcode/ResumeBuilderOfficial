const http = require('http');
const app = require('./app');
const port = process.env.PORT || 4000;

// In local execution, start HTTP server; in Vercel serverless environment, export app
if (require.main === module || !process.env.VERCEL) {
  const server = http.createServer(app);
  server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

module.exports = app;