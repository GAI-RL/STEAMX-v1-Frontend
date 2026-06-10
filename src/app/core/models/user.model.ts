// What a User looks like
export interface User {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  subscription_tier: string;
  first_login_at?: string;
}

// Login form data
export interface LoginRequest {
  email: string;
  password: string;
}

// Registration form data
export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
}

// What backend sends after successful login
export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}