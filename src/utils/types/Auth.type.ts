export const USER_ROLES = [
  "GUEST",
  "STUDENT",
  "RECEPTIONIST",
  "ADMIN",
] as const;

export type UserRole = (typeof USER_ROLES)[number];

export type User = {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  studentId?: string;
  phoneNumber?: string;
  createdAt?: string;
  updatedAt?: string;
};

/**
 * `/auth/register` and `/auth/login` return the user under an `id` key rather
 * than the Mongo `_id` used everywhere else, so the session user is normalised
 * before it reaches the rest of the app.
 */
export type AuthUserPayload = Omit<User, "_id"> & { id: string };

export type AuthResponse = {
  user: AuthUserPayload;
  token: string;
};

export type MeResponse = {
  user: User;
};

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
  studentId?: string;
  phoneNumber?: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};
