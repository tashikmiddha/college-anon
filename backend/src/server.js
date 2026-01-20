import app from './app.js';
import { config } from './config/env.js';

const PORT = config.port;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

