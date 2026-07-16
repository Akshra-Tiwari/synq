import { Application } from 'express';
import authRoutes         from './modules/auth/auth.routes';
import googleRoutes       from './modules/auth/google.routes';
import usersRoutes        from './modules/users/users.routes';
import postsRoutes        from './modules/posts/posts.routes';
import projectsRoutes     from './modules/projects/projects.routes';
import connectionsRoutes  from './modules/connections/connections.routes';
import messagesRoutes     from './modules/messages/messages.routes';
import notificationsRoutes from './modules/notifications/notifications.routes';
import adminRoutes        from './modules/admin/admin.routes';
import searchRoutes       from './modules/search/search.routes';

const API = '/api/v1';

export function mountRoutes(app: Application): void {
  app.use(`${API}/auth`,          authRoutes);
  app.use(`${API}/auth`,          googleRoutes);   // Google OAuth routes
  app.use(`${API}/users`,         usersRoutes);
  app.use(`${API}/posts`,         postsRoutes);
  app.use(`${API}/projects`,      projectsRoutes);
  app.use(`${API}/connections`,   connectionsRoutes);
  app.use(`${API}/messages`,      messagesRoutes);
  app.use(`${API}/notifications`, notificationsRoutes);
  app.use(`${API}/admin`,         adminRoutes);
  app.use(`${API}/search`,        searchRoutes);
}
