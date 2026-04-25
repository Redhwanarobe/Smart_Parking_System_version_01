/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ParkingSlot } from './types';

export const LOCATIONS = [
  'Independent University of Bangladesh',
  'Center Point',
  'Jamuna Future Park'
];

export const VEHICLE_TYPES = [
  { value: 'car', label: 'Car' },
  { value: 'bike', label: 'Bike' }
];

export const INITIAL_SLOTS: ParkingSlot[] = [
  {
    id: '1',
    slotNumber: 'A-101',
    position: 'Level 1, Section A',
    location: 'Independent University of Bangladesh',
    vehicleType: 'car',
    isAvailable: true,
    price: 15,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: '2',
    slotNumber: 'A-102',
    position: 'Level 1, Section A',
    location: 'Independent University of Bangladesh',
    vehicleType: 'car',
    isAvailable: false,
    price: 15,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: '3',
    slotNumber: 'B-201',
    position: 'Level 2, Section B',
    location: 'Center Point',
    vehicleType: 'bike',
    isAvailable: true,
    price: 10,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: '4',
    slotNumber: 'C-301',
    position: 'Level 3, Section C',
    location: 'Jamuna Future Park',
    vehicleType: 'car',
    isAvailable: true,
    price: 20,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: '5',
    slotNumber: 'D-105',
    position: 'Level 1, Section D',
    location: 'Jamuna Future Park',
    vehicleType: 'bike',
    isAvailable: true,
    price: 15,
    lastUpdated: new Date().toISOString(),
  }
];
