import { z } from "zod";
import { ROOM_TYPE_BEDSPACES } from "@/utils/constants";

/**
 * Client-side mirrors of the Zod schemas the API validates with, plus the extra
 * rules the API enforces imperatively in its controllers and service layer
 * (category/role pairing, guest-vs-student room types, date ordering). Catching
 * those here turns a 400 round trip into inline field feedback.
 */

export const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginSchemaType = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Confirm your password"),
    // Self-service sign-up is limited to the two booking roles. Staff accounts
    // are provisioned by an administrator, never through this form.
    role: z.enum(["GUEST", "STUDENT"]),
    studentId: z.string().optional(),
    phoneNumber: z.string().optional(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  })
  .refine(
    (values) => values.role !== "STUDENT" || !!values.studentId?.trim(),
    {
      path: ["studentId"],
      message: "Student ID is required for student accounts",
    },
  );

export type RegisterSchemaType = z.infer<typeof registerSchema>;

export const reservationSchema = z
  .object({
    checkInDate: z.string().min(1, "Check-in date is required"),
    checkOutDate: z.string().min(1, "Check-out date is required"),
    notes: z.string().max(500, "Notes cannot exceed 500 characters").optional(),
  })
  .refine(
    (values) => new Date(values.checkOutDate) > new Date(values.checkInDate),
    {
      path: ["checkOutDate"],
      message: "Check-out must be after check-in",
    },
  );

export type ReservationSchemaType = z.infer<typeof reservationSchema>;

export const roomSchema = z
  .object({
    /** `single` posts a `roomNumber`; `bulk` posts `numberOfRooms` + `prefix`. */
    mode: z.enum(["single", "bulk"]),
    category: z.enum(["GUEST", "STUDENT"]),
    roomType: z.enum(["SINGLE", "DOUBLE", "TRIPLE"]),
    costPerNight: z.coerce
      .number()
      .min(1, "Cost per night must be greater than zero"),
    roomNumber: z.string().optional(),
    numberOfRooms: z.coerce.number().optional(),
    prefix: z.string().optional(),
  })
  .refine(
    (values) => values.category !== "GUEST" || values.roomType === "SINGLE",
    {
      path: ["roomType"],
      message: "Guest house rooms must be SINGLE rooms",
    },
  )
  .refine(
    (values) => values.category !== "STUDENT" || values.roomType !== "SINGLE",
    {
      path: ["roomType"],
      message: "Student hostel rooms must be DOUBLE or TRIPLE bedspaces",
    },
  )
  .refine(
    (values) => values.mode !== "single" || !!values.roomNumber?.trim(),
    {
      path: ["roomNumber"],
      message: "Room number is required",
    },
  )
  .refine(
    (values) =>
      values.mode !== "bulk" ||
      (!!values.numberOfRooms && values.numberOfRooms >= 1),
    {
      path: ["numberOfRooms"],
      message: "Generate at least one room",
    },
  )
  .refine(
    (values) => values.mode !== "bulk" || (values.numberOfRooms ?? 0) <= 200,
    {
      path: ["numberOfRooms"],
      message: "Generate at most 200 rooms at a time",
    },
  );

/**
 * `z.coerce.number()` widens the *input* type to `unknown` (a number input hands
 * back a string), so forms are typed on the input shape and `handleSubmit`
 * receives the coerced output shape.
 */
export type RoomSchemaInput = z.input<typeof roomSchema>;
export type RoomSchemaType = z.output<typeof roomSchema>;

export const updateRoomSchema = z.object({
  roomNumber: z.string().min(1, "Room number is required"),
  costPerNight: z.coerce
    .number()
    .min(1, "Cost per night must be greater than zero"),
  status: z.enum(["AVAILABLE", "RESERVED", "OCCUPIED", "MAINTENANCE"]),
  isAvailable: z.boolean(),
});

export type UpdateRoomSchemaInput = z.input<typeof updateRoomSchema>;
export type UpdateRoomSchemaType = z.output<typeof updateRoomSchema>;

/** Bedspace count the API will derive for a given room type. */
export function bedspacesForRoomType(roomType: RoomSchemaType["roomType"]) {
  return ROOM_TYPE_BEDSPACES[roomType];
}
