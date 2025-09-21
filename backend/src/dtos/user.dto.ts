export interface CreateUserDto {
  name: string;
  email: string;
  phone?: string;
  password: string;
  role?: string;
  isActive?: boolean;
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  role?: string;
  isActive?: boolean;
  lastLoginAt?: Date;
}

export interface UserResponseDto {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponseDto {
  user: Omit<UserResponseDto, 'passwordHash'>;
  token: string;
}
