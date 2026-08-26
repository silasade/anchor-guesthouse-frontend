import { useQuery } from "@tanstack/react-query";
import { requests } from "../api";
import { queryKeys } from "../queryKeys";
import type {
  RoomFilters,
  RoomListResponse,
  RoomResponse,
} from "@/utils/types/Room.type";

/**
 * `GET /rooms` supports `category`, `status` and `isAvailable`. The free-text
 * `search` filter has no server-side counterpart, so it is applied client-side
 * by the consuming route.
 */
export const useGetRooms = (filters: RoomFilters = {}, enabled = true) => {
  const { category, status, isAvailable } = filters;

  return useQuery({
    queryKey: queryKeys.rooms.list({ category, status, isAvailable }),
    queryFn: () =>
      requests<RoomListResponse>("rooms", {
        query: { category, status, isAvailable },
      }),
    enabled,
    select: (response) => response.data.rooms,
  });
};

export const useGetRoom = (roomId: string) => {
  return useQuery({
    queryKey: queryKeys.rooms.detail(roomId),
    queryFn: () => requests<RoomResponse>(`rooms/${roomId}`),
    enabled: !!roomId,
    select: (response) => response.data.room,
  });
};
