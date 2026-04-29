export interface User {
  id: number;
  username: string;
  fullName: string;
  email: string;
  role: 'SuperAdmin' | 'Admin' | 'User';
  language: string;
  themeColor: string;
  isDarkMode: boolean;
  isApproved: boolean;
  avatarUrl?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
