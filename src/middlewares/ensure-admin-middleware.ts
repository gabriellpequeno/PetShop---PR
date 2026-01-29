import type { Request, Response, NextFunction } from 'express';


export class EnsureAdminMiddleware {
  static handle(request: Request, response: Response, next: NextFunction) {
    const user = request.user;

    // Verifica se o usuário está autenticado
    if (!user) {
      return response.status(401).json({ 
        message: 'Usuário não autenticado' 
      });
    }

    // Verifica se o usuário tem role admin
    if (user.role !== 'admin') {
      return response.status(403).json({ 
        message: 'Acesso negado. Esta ação requer privilégios de administrador.' 
      });
    }

    // Usuário é admin, pode prosseguir
    return next();
  }
}