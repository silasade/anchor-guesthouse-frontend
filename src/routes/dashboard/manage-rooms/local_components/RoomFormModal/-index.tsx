import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { InfoIcon, Loader2Icon } from "lucide-react";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  bedspacesForRoomType,
  roomSchema,
  type RoomSchemaInput,
  type RoomSchemaType,
} from "@/global_components/-formSchemas";
import { useCreateRoom } from "@/services/mutations/Room";
import { ROOM_TYPE_LABELS } from "@/utils/constants";

type RoomFormModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const DEFAULTS: RoomSchemaInput = {
  mode: "single",
  category: "GUEST",
  roomType: "SINGLE",
  costPerNight: 15000,
  roomNumber: "",
  numberOfRooms: 10,
  prefix: "",
};

/**
 * Wraps the dual-purpose `POST /rooms` endpoint. "Single" sends a `roomNumber`;
 * "Bulk" sends `numberOfRooms` and lets the API continue the numbering from the
 * highest existing suffix for the prefix.
 */
function RoomFormModal({ open, onOpenChange }: RoomFormModalProps) {
  const { mutateAsync: createRoom, isPending } = useCreateRoom();

  const form = useForm<RoomSchemaInput, unknown, RoomSchemaType>({
    resolver: zodResolver(roomSchema),
    mode: "onChange",
    defaultValues: DEFAULTS,
  });

  const { register, handleSubmit, watch, setValue, reset, formState } = form;
  const mode = watch("mode");
  const category = watch("category");
  const roomType = watch("roomType");

  useEffect(() => {
    if (open) reset(DEFAULTS);
  }, [open, reset]);

  // The API rejects mismatched pairings outright, so keep the room type in step
  // with the category the moment it changes.
  useEffect(() => {
    if (category === "GUEST" && roomType !== "SINGLE") {
      setValue("roomType", "SINGLE", { shouldValidate: true });
    }
    if (category === "STUDENT" && roomType === "SINGLE") {
      setValue("roomType", "DOUBLE", { shouldValidate: true });
    }
  }, [category, roomType, setValue]);

  const onSubmit = async (values: RoomSchemaType) => {
    try {
      await createRoom({
        category: values.category,
        roomType: values.roomType,
        costPerNight: values.costPerNight,
        ...(values.mode === "single"
          ? { roomNumber: values.roomNumber?.trim() }
          : {
              numberOfRooms: values.numberOfRooms,
              prefix: values.prefix?.trim() || undefined,
            }),
      });
      onOpenChange(false);
    } catch {
      // The mutation surfaces the API message through a toast.
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add rooms</DialogTitle>
          <DialogDescription>
            Create one room, or generate a numbered batch in a single request.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Tabs
            value={mode}
            onValueChange={(value) =>
              setValue("mode", value as RoomSchemaInput["mode"], {
                shouldValidate: true,
              })
            }
          >
            <TabsList className="w-full">
              <TabsTrigger value="single">Single room</TabsTrigger>
              <TabsTrigger value="bulk">Bulk generate</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={category}
                onValueChange={(value) =>
                  setValue("category", value as RoomSchemaInput["category"], {
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger id="category" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GUEST">Guest House</SelectItem>
                  <SelectItem value="STUDENT">Student Hostel</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="roomType">Room type</Label>
              <Select
                value={roomType}
                onValueChange={(value) =>
                  setValue("roomType", value as RoomSchemaInput["roomType"], {
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger id="roomType" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {category === "GUEST" ? (
                    <SelectItem value="SINGLE">
                      {ROOM_TYPE_LABELS.SINGLE}
                    </SelectItem>
                  ) : (
                    <>
                      <SelectItem value="DOUBLE">
                        {ROOM_TYPE_LABELS.DOUBLE}
                      </SelectItem>
                      <SelectItem value="TRIPLE">
                        {ROOM_TYPE_LABELS.TRIPLE}
                      </SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
              {formState.errors.roomType && (
                <p className="text-destructive text-xs">
                  {formState.errors.roomType.message}
                </p>
              )}
            </div>
          </div>

          {mode === "single" ? (
            <div className="space-y-2">
              <Label htmlFor="roomNumber">Room number</Label>
              <Input
                id="roomNumber"
                placeholder={category === "GUEST" ? "G-104" : "S-204"}
                aria-invalid={!!formState.errors.roomNumber}
                {...register("roomNumber")}
              />
              {formState.errors.roomNumber && (
                <p className="text-destructive text-xs">
                  {formState.errors.roomNumber.message}
                </p>
              )}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="numberOfRooms">How many rooms</Label>
                <Input
                  id="numberOfRooms"
                  type="number"
                  min={1}
                  max={200}
                  aria-invalid={!!formState.errors.numberOfRooms}
                  {...register("numberOfRooms")}
                />
                {formState.errors.numberOfRooms && (
                  <p className="text-destructive text-xs">
                    {formState.errors.numberOfRooms.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="prefix">Number prefix</Label>
                <Input
                  id="prefix"
                  placeholder={category === "GUEST" ? "G-" : "S-"}
                  {...register("prefix")}
                />
                <p className="text-muted-foreground text-xs">
                  Defaults to {category === "GUEST" ? "G-" : "S-"}
                </p>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="costPerNight">Cost per night</Label>
            <Input
              id="costPerNight"
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

          <Alert variant="info">
            <InfoIcon />
            <AlertDescription>
              <p>
                {ROOM_TYPE_LABELS[roomType]} rooms are created with{" "}
                {bedspacesForRoomType(roomType)} bedspace
                {bedspacesForRoomType(roomType) > 1 ? "s" : ""} each.
                {mode === "bulk" &&
                  " Numbering continues from the highest existing room for this prefix."}
              </p>
            </AlertDescription>
          </Alert>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !formState.isValid}>
              {isPending && <Loader2Icon className="animate-spin" />}
              {mode === "single" ? "Create room" : "Generate rooms"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default RoomFormModal;
