import type { Request, Response, NextFunction } from 'express'

export class EnsureAdminMiddleware {
    static handle(request: Request, response: Response, next: NextFunction) {
        const user = request.user

        if (!user) {
            return response.status(401).json({ error: 'Usuário não autenticado' })
        }

        if (user.role !== 'admin') {
            return response.status(403).json({ error: 'Acesso negado. Apenas administradores.' })
        }

        return next()
    }
}
