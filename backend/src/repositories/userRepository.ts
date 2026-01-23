import db from "../utils/database.js";
import { IUser, IUserCreate } from "../types/User.js";

class UserRepository {
  public findByEmail(email: string): Promise<IUser | null> {
    return new Promise((resolve, reject) => {
      db.get(
        "SELECT * FROM users WHERE email = ?",
        [email],
        (err: Error | null, row: IUser) => {
          if (err) return reject(err);
          resolve(row || null);
        },
      );
    });
  }

  public save(user: IUserCreate): Promise<void> {
    return new Promise((resolve, reject) => {
      const { name, email, password, role } = user;
      const sql = "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)";

      db.run(sql, [name, email, password, role], (err: Error | null) => {
        if (err) return reject(err);
        resolve();
      });
    });
  }
}

export default new UserRepository();
