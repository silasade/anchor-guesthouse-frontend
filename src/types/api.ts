export type UserRole = 'GUEST' | 'STUDENT' | 'RECEPTIONIST' | 'ADMIN';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  studentId?: string;
  phoneNumber?: string;
}

export type RoomCategory = 'GUEST' | 'STUDENT';
export type RoomType = 'SINGLE' | 'DOUBLE' | 'TRIPLE';
export type RoomStatus = 'AVAILABLE' | 'RESERVED' | 'OCCUPIED' | 'MAINTENANCE';

export interface Room {
  _id: string;
  roomNumber: string;
  category: RoomCategory;
  roomType: RoomType;
  totalBedspaces: number;
  costPerNight: number;
  isAvailable: boolean;
  status: RoomStatus;
  createdAt: string;
  updatedAt: string;
}

export type ReservationStatus = 'RESERVED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'CANCELLED';

export interface Reservation {
  _id: string;
  room: Room | string;
  user: User | string;
  userCategory: RoomCategory;
  checkInDate: string;
  checkOutDate: string;
  totalNights: number;
  totalCost: number;
  status: ReservationStatus;
  reservedAt: string;
  checkedInAt?: string;
  checkedOutAt?: string;
  cancelledAt?: string;
  notes?: string;
}

export interface ReportSummary {
  totalReservations: number;
  checkedInCount: number;
  checkedOutCount: number;
  cancelledCount: number;
  totalRevenue: number;
}

export interface CategoryBreakdown {
  guest: {
    reservationsCount: number;
    revenue: number;
  };
  student: {
    reservationsCount: number;
    revenue: number;
  };
}

export interface RoomOccupancyReport {
  totalRooms: number;
  occupiedRooms: number;
  reservedRooms: number;
  availableRooms: number;
  occupancyRatePercentage: string;
}

export interface ReportData {
  period: 'day' | 'week' | 'month' | 'year' | 'custom';
  startDate: string;
  endDate: string;
  checkoutCutoffPolicy: string;
  summary: ReportSummary;
  categoryBreakdown: CategoryBreakdown;
  roomOccupancy: RoomOccupancyReport;
}
