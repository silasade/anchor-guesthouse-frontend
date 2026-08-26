import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  RESERVATION_STATUS_LABELS,
  ROLE_LABELS,
  ROOM_CATEGORY_LABELS,
  ROOM_STATUS_LABELS,
} from "@/utils/constants";
import type { UserRole } from "@/utils/types/Auth.type";
import type { ReservationStatus } from "@/utils/types/Reservation.type";
import type { RoomCategory, RoomStatus } from "@/utils/types/Room.type";

type BadgeVariant = React.ComponentProps<typeof Badge>["variant"];

/**
 * The palette is monochrome, so status is carried by fill weight rather than
 * hue: solid reads as "active right now", outline as "pending", muted as
 * "closed". A dot marker gives each room status a second, redundant cue.
 * Cancellation is the one case that keeps a chromatic tint.
 */

const ROOM_STATUS_VARIANTS: Record<RoomStatus, BadgeVariant> = {
  AVAILABLE: "outline",
  RESERVED: "secondary",
  OCCUPIED: "default",
  MAINTENANCE: "soft-muted",
};

const ROOM_STATUS_DOTS: Record<RoomStatus, string> = {
  AVAILABLE: "bg-foreground/70",
  RESERVED: "bg-foreground/45",
  OCCUPIED: "bg-primary-foreground",
  MAINTENANCE: "bg-muted-foreground/60 ring-1 ring-muted-foreground/40",
};

const RESERVATION_STATUS_VARIANTS: Record<ReservationStatus, BadgeVariant> = {
  RESERVED: "outline",
  CHECKED_IN: "default",
  CHECKED_OUT: "soft-muted",
  CANCELLED: "soft-destructive",
};

const ROLE_VARIANTS: Record<UserRole, BadgeVariant> = {
  ADMIN: "default",
  RECEPTIONIST: "secondary",
  GUEST: "outline",
  STUDENT: "outline",
};

export function RoomStatusBadge({
  status,
  className,
}: {
  status: RoomStatus;
  className?: string;
}) {
  return (
    <Badge variant={ROOM_STATUS_VARIANTS[status]} className={className}>
      <span className={cn("size-1.5 rounded-full", ROOM_STATUS_DOTS[status])} />
      {ROOM_STATUS_LABELS[status]}
    </Badge>
  );
}

export function ReservationStatusBadge({
  status,
  className,
}: {
  status: ReservationStatus;
  className?: string;
}) {
  return (
    <Badge variant={RESERVATION_STATUS_VARIANTS[status]} className={className}>
      {RESERVATION_STATUS_LABELS[status]}
    </Badge>
  );
}

export function RoleBadge({
  role,
  className,
}: {
  role: UserRole;
  className?: string;
}) {
  return (
    <Badge variant={ROLE_VARIANTS[role]} className={className}>
      {ROLE_LABELS[role]}
    </Badge>
  );
}

export function CategoryBadge({
  category,
  className,
}: {
  category: RoomCategory;
  className?: string;
}) {
  return (
    <Badge
      variant={category === "GUEST" ? "outline" : "secondary"}
      className={className}
    >
      {ROOM_CATEGORY_LABELS[category]}
    </Badge>
  );
}
