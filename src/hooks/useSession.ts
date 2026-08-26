import { useMemo } from "react";
import { useGetSession } from "@/services/queries/Auth";
import { getToken } from "@/lib/auth";
import { ROLE_BOOKABLE_CATEGORY, STAFF_ROLES } from "@/utils/constants";
import type { User, UserRole } from "@/utils/types/Auth.type";
import type { RoomCategory } from "@/utils/types/Room.type";

export type Session = {
  user: User | null;
  isAuthenticated: boolean;
  /** True while the token is being exchanged for a user on first paint. */
  isLoading: boolean;
  role: UserRole | null;
  isAdmin: boolean;
  isReceptionist: boolean;
  /** Admin or Receptionist — the roles the front desk and ledger are gated on. */
  isStaff: boolean;
  /** The one room category this user is allowed to reserve, if any. */
  bookableCategory: RoomCategory | null;
  /** Convenience guard for arbitrary role lists. */
  hasRole: (...roles: UserRole[]) => boolean;
};

/**
 * The single place the UI asks "who is signed in and what may they do".
 * Everything downstream — nav items, route guards, action buttons — reads
 * from here rather than re-deriving role rules.
 */
export function useSession(): Session {
  const hasToken = !!getToken();
  const { data, isLoading, isFetching } = useGetSession();

  return useMemo(() => {
    const user = data?.data.user ?? null;
    const role = user?.role ?? null;

    return {
      user,
      isAuthenticated: !!user,
      isLoading: hasToken && !user && (isLoading || isFetching),
      role,
      isAdmin: role === "ADMIN",
      isReceptionist: role === "RECEPTIONIST",
      isStaff: !!role && STAFF_ROLES.includes(role),
      bookableCategory: role ? (ROLE_BOOKABLE_CATEGORY[role] ?? null) : null,
      hasRole: (...roles: UserRole[]) => !!role && roles.includes(role),
    };
  }, [data, hasToken, isLoading, isFetching]);
}
