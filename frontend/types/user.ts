export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserLoginInput {
  email: string;
  password: string;
}

export interface UserRegisterInput extends UserLoginInput {
  name?: string;
}

export interface AuthResponse {
  success: boolean;
  data?: {
    token: string;
    user: User;
  };
  message?: string;
  error?: string;
}