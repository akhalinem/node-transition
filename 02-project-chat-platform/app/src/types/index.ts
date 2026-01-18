export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface AuthResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    username: string;
    display_name: string;
  };
}

export interface AuthPayload {
  userId: string;
  iat?: number;
  exp?: number;
}
