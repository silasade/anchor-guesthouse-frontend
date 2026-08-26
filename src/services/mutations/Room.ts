import { useMutation, useQueryClient } from "@tanstack/react-query";
import { requests } from "../api";
import { queryKeys } from "../queryKeys";
import { generateToast } from "@/lib/generateToast";
import type {
  CreateRoomPayload,
  CreateRoomResponse,
  RoomResponse,
  UpdateRoomPayload,
} from "@/utils/types/Room.type";

/**
 * Creates one room (`roomNumber`) or generates a sequential batch
 * (`numberOfRooms` + optional `prefix`). Admin only.
 */
const useCreateRoom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateRoomPayload) =>
      requests<CreateRoomResponse>("rooms", { method: "POST", body }),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rooms.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.reports.all });
      generateToast(
        "success",
        response.message ?? `${response.data.rooms.length} room(s) created.`,
      );
    },
    onError: (error: Error) => generateToast("error", error.message),
  });
};

const useUpdateRoom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      roomId,
      body,
    }: {
      roomId: string;
      body: UpdateRoomPayload;
    }) => requests<RoomResponse>(`rooms/${roomId}`, { method: "PUT", body }),
    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rooms.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.rooms.detail(variables.roomId),
      });
      generateToast("success", "Room updated.");
    },
    onError: (error: Error) => generateToast("error", error.message),
  });
};

const useDeleteRoom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (roomId: string) =>
      requests<null>(`rooms/${roomId}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rooms.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.reports.all });
      generateToast("success", "Room deleted.");
    },
    onError: (error: Error) => generateToast("error", error.message),
  });
};

export { useCreateRoom, useDeleteRoom, useUpdateRoom };
