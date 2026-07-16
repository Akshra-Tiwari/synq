import 'dotenv/config';
import http from 'http';
import passport from 'passport';
import app from './app';
import { connectDatabase } from './config/database';
import { initSocketServer } from './sockets/socket.server';
import { initPassport }     from './config/passport';
import { env } from './config/env';

const PORT = env.PORT;

async function bootstrap() {
  try {
    await connectDatabase();

    // Init Passport (Google OAuth — optional)
    initPassport();
    app.use(passport.initialize());

    const httpServer = http.createServer(app);
    initSocketServer(httpServer);

    httpServer.listen(PORT, () => {
      console.log(`\n🚀  Synq API running on port ${PORT}`);
      console.log(`📡  Environment: ${env.NODE_ENV}`);
      console.log(`🌐  Frontend: ${env.FRONTEND_URL}\n`);
    });

    process.on('SIGTERM', () => { httpServer.close(() => process.exit(0)); });
    process.on('SIGINT',  () => { httpServer.close(() => process.exit(0)); });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

bootstrap();
