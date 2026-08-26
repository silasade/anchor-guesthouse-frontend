import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import SearchInput from "@/global_components/SearchInput";
import {
  ROOM_CATEGORY_LABELS,
  ROOM_STATUS_LABELS,
} from "@/utils/constants";
import {
  ROOM_CATEGORIES,
  ROOM_STATUSES,
  type RoomCategory,
  type RoomStatus,
} from "@/utils/types/Room.type";

type RoomFilterBarProps = {
  search: string;
  onSearchChange: (value: string) => void;
  category: RoomCategory | "ALL";
  onCategoryChange: (value: RoomCategory | "ALL") => void;
  status: RoomStatus | "ALL";
  onStatusChange: (value: RoomStatus | "ALL") => void;
  /** Hidden when the signed-in role may only ever see one category. */
  showCategoryFilter?: boolean;
};

function RoomFilterBar({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  status,
  onStatusChange,
  showCategoryFilter = true,
}: RoomFilterBarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <SearchInput
        value={search}
        onChange={onSearchChange}
        placeholder="Search by room number…"
        className="sm:max-w-xs"
      />

      {showCategoryFilter && (
        <Select
          value={category}
          onValueChange={(value) =>
            onCategoryChange(value as RoomCategory | "ALL")
          }
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All categories</SelectItem>
            {ROOM_CATEGORIES.map((item) => (
              <SelectItem key={item} value={item}>
                {ROOM_CATEGORY_LABELS[item]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <Select
        value={status}
        onValueChange={(value) => onStatusChange(value as RoomStatus | "ALL")}
      >
        <SelectTrigger className="w-full sm:w-44">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All statuses</SelectItem>
          {ROOM_STATUSES.map((item) => (
            <SelectItem key={item} value={item}>
              {ROOM_STATUS_LABELS[item]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export default RoomFilterBar;
