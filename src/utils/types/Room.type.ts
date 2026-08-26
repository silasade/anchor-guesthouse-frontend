import type { Timestamped } from "./common";

export const ROOM_CATEGORIES = ["GUEST", "STUDENT"] as const;
export const ROOM_TYPES = ["SINGLE", "DOUBLE", "TRIPLE"] as const;
export const ROOM_STATUSES = [
  "AVAILABLE",
  "RESERVED",
  "OCCUPIED",
  "MAINTENANCE",
] as const;

export type RoomCategory = (typeof ROOM_CATEGORIES)[number];
export type RoomType = (typeof ROOM_TYPES)[number];
export type RoomStatus = (typeof ROOM_STATUSES)[number];

export type Room = Timestamped & {
  roomNumber: string;
  category: RoomCategory;
  roomType: RoomType;
  totalBedspaces: number;
  costPerNight: number;
  isAvailable: boolean;
  status: RoomStatus;
};

export type RoomListResponse = {
  rooms: Room[];
};

export type RoomResponse = {
  room: Room;
};

/**
 * `POST /rooms` is dual-purpose. Passing `roomNumber` on its own creates a
 * single room; passing `numberOfRooms` generates a sequential batch off the
 * highest existing suffix for `prefix` (defaults to `G-` / `S-`).
 */
export type CreateRoomPayload = {
  category: RoomCategory;
  roomType: RoomType;
  costPerNight: number;
  roomNumber?: string;
  numberOfRooms?: number;
  prefix?: string;
  customBedspaces?: number;
};

export type CreateRoomResponse = {
  rooms: Room[];
  room: Room;
};

export type UpdateRoomPayload = Partial<
  Pick<
    Room,
    | "roomNumber"
    | "category"
    | "roomType"
    | "totalBedspaces"
    | "costPerNight"
    | "isAvailable"
    | "status"
  >
>;

export type RoomFilters = {
  category?: RoomCategory | "ALL";
  status?: RoomStatus | "ALL";
  isAvailable?: boolean;
  search?: string;
};
