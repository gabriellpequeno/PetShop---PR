export type UserRole = "admin" | "comum";

export interface IUser {
  id: number;
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface IUserCreate extends Omit<IUser, "id"> {}

export interface ILoginResponse {
  token: string;
  user: {
    name: string;
    role: UserRole;
  };
}
