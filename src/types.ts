/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  vehicleNumber?: string;
  address?: string;
  city?: string;
  createdAt: string;
}

export interface ParkingSlot {
  id: string;
  slotNumber: string;
  position: string;
  location: string;
  vehicleType: 'car' | 'bike';
  isAvailable: boolean;
  price: number;
  lastUpdated: string;
}

export type BookingStatus = 'active' | 'completed' | 'cancelled';

export interface Booking {
  id: string;
  userId: string;
  slotId: string;
  location: string;
  slotNumber: string;
  slotPosition: string;
  startTime: string;
  endTime: string;
  duration: number; // in hours
  totalPrice: number;
  status: BookingStatus;
  createdAt: string;
}

export type ComplaintStatus = 'pending' | 'solved' | 'rejected';

export interface Complaint {
  id: string;
  userId: string;
  bookingId?: string;
  subject: string;
  message: string;
  status: ComplaintStatus;
  adminReply?: string;
  createdAt: string;
}
