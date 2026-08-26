import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon, TriangleAlertIcon } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  updateRoomSchema,
  type UpdateRoomSchemaInput,
  type UpdateRoomSchemaType,
} from "@/global_components/-formSchemas";
import { useUpdateRoom } from "@/services/mutations/Room";
import { ROOM_STATUS_LABELS, ROOM_TYPE_LABELS } from "@/utils/constants";
import { ROOM_STATUSES, type Room } from "@/utils/types/Room.type";

type EditRoomModalProps = {
  room: Room | null;
  onOpenChange: (open: boolean) => void;
};

/**
 * Category and room type are intentionally read-only: changing them would
 * desync `totalBedspaces`, which the API derives at creation time only.
 */
function EditRoomModal({ room, onOpenChange }: EditRoomModalProps) {
  const { mutateAsync: updateRoom, isPending } = useUpdateRoom();

  const form = useForm<UpdateRoomSchemaInput, unknown, UpdateRoomSchemaType>({
    resolver: zodResolver(updateRoomSchema),
    mode: "onChange",
    defaultValues: {
      roomNumber: "",
      costPerNight: 0,
      status: "AVAILABLE",
      isAvailable: true,
    },
  });

  const { register, handleSubmit, reset, setValue, watch, formState } = form;
  const status = watch("status");

  useEffect(() => {
    if (room) {
      reset({
        roomNumber: room.roomNumber,
        costPerNight: room.costPerNight,
        status: room.status,
        isAvailable: room.isAvailable,
      });
    }
  }, [room, reset]);

  const onSubmit = async (values: UpdateRoomSchemaType) => {
    if (!room) return;
    try {
      await updateRoom({
        roomId: room._id,
        body: {
          roomNumber: values.roomNumber.trim(),
          costPerNight: values.costPerNight,
          status: values.status,
          // Availability is a function of status; keeping them derived avoids
          // rooms that read "Available" but cannot be booked.
          isAvailable: values.status === "AVAILABLE",
        },
      });
      onOpenChange(false);
    } catch {
      // The mutation surfaces the API message through a toast.
    }
  };

  const isOccupied = room?.status === "OCCUPIED";

  return (
    <Dialog open={!!room} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit {room?.roomNumber}</DialogTitle>
          <DialogDescription>
            {room ? ROOM_TYPE_LABELS[room.roomType] : ""} ·{" "}
            {room?.totalBedspaces} bedspace
            {(room?.totalBedspaces ?? 0) > 1 ? "s" : ""}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-roomNumber">Room number</Label>
            <Input
              id="edit-roomNumber"
              aria-invalid={!!formState.errors.roomNumber}
              {...register("roomNumber")}
            />
            {formState.errors.roomNumber && (
              <p className="text-destructive text-xs">
                {formState.errors.roomNumber.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-costPerNight">Cost per night</Label>
            <Input
              id="edit-costPerNight"
              type="number"
              min={1}
              aria-invalid={!!formState.errors.costPerNight}
              {...register("costPerNight")}
            />
            {formState.errors.costPerNight && (
              <p className="text-destructive text-xs">
                {formState.errors.costPerNight.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-status">Status</Label>
            <Select
              value={status}
              onValueChange={(value) =>
                setValue("status", value as UpdateRoomSchemaInput["status"], {
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger id="edit-status" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROOM_STATUSES.map((item) => (
                  <SelectItem key={item} value={item}>
                    {ROOM_STATUS_LABELS[item]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isOccupied && (
            <Alert variant="warning">
              <TriangleAlertIcon />
              <AlertDescription>
                <p>
                  Someone is currently checked into this room. Changing its
                  status here will not check them out — do that from the front
                  desk.
                </p>
              </AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2Icon className="animate-spin" />}
              Save changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default EditRoomModal;
