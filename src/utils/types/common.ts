/**
 * Every endpoint of the Guest House & Student Hostel API answers with the same
 * envelope. `count` is only present on the list endpoints (`/rooms`,
 * `/reservations`, `/reservations/my-reservations`).
 */
export type APIResponse<T> = {
  success: boolean;
  message?: string;
  count?: number;
  data: T;
};

/** Shape returned by the Zod validation middleware on a 400 response. */
export type APIValidationError = {
  success: false;
  message: string;
  errors?: { field: string; message: string }[];
};

/** Identity fields Mongoose adds to every persisted document. */
export type Timestamped = {
  _id: string;
  createdAt: string;
  updatedAt: string;
};
