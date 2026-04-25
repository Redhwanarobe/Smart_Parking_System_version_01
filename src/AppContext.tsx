/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, ParkingSlot, Booking, Complaint } from './types';
import { INITIAL_SLOTS } from './constants';
import { auth, db } from './lib/firebase';
import { onAuthStateChanged, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc,
  query,
  where,
  addDoc,
  getDocs
} from 'firebase/firestore';

interface AppState {
  users: User[];
  slots: ParkingSlot[];
  bookings: Booking[];
  complaints: Complaint[];
  currentUser: User | null;
  loading: boolean;
  setCurrentUser: (user: User | null) => void;
  updateSlots: (newSlots: ParkingSlot[]) => void;
  addSlot: (slot: ParkingSlot) => Promise<void>;
  addBooking: (booking: Booking) => Promise<void>;
  updateBooking: (id: string, updates: Partial<Booking>) => Promise<void>;
  addComplaint: (complaint: Complaint) => Promise<void>;
  updateComplaint: (id: string, updates: Partial<Complaint>) => Promise<void>;
  registerUser: (user: User) => Promise<void>;
  deleteSlot: (id: string) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  updateUser: (id: string, updates: Partial<User>) => Promise<void>;
  logout: () => Promise<void>;
}

declare global {
  interface Window {
    __adminChecked?: boolean;
  }
}

const AppContext = createContext<AppState | undefined>(undefined);

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [slots, setSlots] = useState<ParkingSlot[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            setCurrentUser(userDoc.data() as User);
          } else {
            // Fallback for missing admin doc - allow them into the app so seeding can occur
            if (firebaseUser.email === 'admin@gmail.com') {
               setCurrentUser({
                  id: firebaseUser.uid,
                  email: firebaseUser.email,
                  fullName: 'System Admin',
                  role: 'admin',
                  phone: '0000000000',
                  vehicleNumber: 'ADMIN-01',
                  createdAt: new Date().toISOString()
               });
            } else {
               setCurrentUser(null);
            }
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Firestore Listeners
  useEffect(() => {
    if (!currentUser) {
      setBookings([]);
      setComplaints([]);
      if (loading) return; // Wait for auth to settle
    }

    // Slots (Public)
    const unsubSlots = onSnapshot(collection(db, 'slots'), (snapshot) => {
      const slotsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ParkingSlot));
      setSlots(slotsData);
    }, (error) => {
      console.warn('Slots listener error:', error);
    });

    // We MUST have a user AND not be in a loading state to proceed with private listeners
    if (loading || !currentUser) {
      setBookings([]);
      setComplaints([]);
      const unsubNoop = () => {};
      return currentUser ? unsubSlots : () => { unsubSlots(); unsubNoop(); };
    }

    // Users (Admin only)
    let unsubUsers = () => {};
    const isAdminUser = currentUser?.role === 'admin' || currentUser?.email === 'admin@gmail.com';
    
    if (isAdminUser) {
      unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
        setUsers(snapshot.docs.map(doc => doc.data() as User));
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'users');
      });
    }

    // Bookings
    const bookingsQuery = isAdminUser 
      ? collection(db, 'bookings')
      : query(collection(db, 'bookings'), where('userId', '==', currentUser.id));
    
    const unsubBookings = onSnapshot(bookingsQuery, (snapshot) => {
      setBookings(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'bookings');
    });

    // Complaints
    const complaintsQuery = isAdminUser
      ? collection(db, 'complaints')
      : query(collection(db, 'complaints'), where('userId', '==', currentUser.id));
    
    const unsubComplaints = onSnapshot(complaintsQuery, (snapshot) => {
      setComplaints(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Complaint)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'complaints');
    });

    return () => {
      unsubSlots();
      unsubUsers();
      unsubBookings();
      unsubComplaints();
    };
  }, [currentUser, loading]);

  const updateSlots = async (newSlots: ParkingSlot[]) => {
    // This is used for bulk updates if needed
    for (const s of newSlots) {
      await setDoc(doc(db, 'slots', s.id), s);
    }
  };

  const addSlot = async (slot: ParkingSlot) => {
    try {
      await setDoc(doc(db, 'slots', slot.id), slot);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `slots/${slot.id}`);
    }
  };

  const addBooking = async (booking: Booking) => {
    try {
      await setDoc(doc(db, 'bookings', booking.id), booking);
      // update slot availability
      const slotRef = doc(db, 'slots', booking.slotId);
      await updateDoc(slotRef, { isAvailable: false, lastUpdated: new Date().toISOString() });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `bookings/${booking.id}`);
    }
  };

  const updateBooking = async (id: string, updates: Partial<Booking>) => {
    try {
      const bRef = doc(db, 'bookings', id);
      const bDoc = await getDoc(bRef);
      if (!bDoc.exists()) return;
      const booking = bDoc.data() as Booking;

      await updateDoc(bRef, updates);
      
      // If cancelled or completed, free up the slot
      if (updates.status === 'cancelled' || updates.status === 'completed') {
        const slotRef = doc(db, 'slots', booking.slotId);
        await updateDoc(slotRef, { isAvailable: true, lastUpdated: new Date().toISOString() });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `bookings/${id}`);
    }
  };

  const addComplaint = async (complaint: Complaint) => {
    try {
      await setDoc(doc(db, 'complaints', complaint.id), complaint);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `complaints/${complaint.id}`);
    }
  };

  const updateComplaint = async (id: string, updates: Partial<Complaint>) => {
    try {
      await updateDoc(doc(db, 'complaints', id), updates);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `complaints/${id}`);
    }
  };

  const registerUser = async (user: User) => {
    try {
      await setDoc(doc(db, 'users', user.id), user);
      setCurrentUser(user);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.id}`);
    }
  };

  const updateUser = async (id: string, updates: Partial<User>) => {
    try {
      await updateDoc(doc(db, 'users', id), updates);
      if (currentUser?.id === id) {
        setCurrentUser(prev => prev ? { ...prev, ...updates } : null);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${id}`);
    }
  };

  const deleteSlot = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'slots', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `slots/${id}`);
    }
  };

  const deleteUser = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'users', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `users/${id}`);
    }
    // Note: This doesn't delete from Firebase Auth, only from Firestore
  };

  const logout = async () => {
    await signOut(auth);
  };

  // Seed Admin and Initial Data
  useEffect(() => {
    const seedSystem = async () => {
      const adminEmail = 'admin@gmail.com';
      const adminPass = 'adminn';
      
      try {
        // 1. Handle Admin User Document
        if (currentUser && currentUser.email === adminEmail) {
           const adminRef = doc(db, 'users', currentUser.id);
           const adminDoc = await getDoc(adminRef);
           
           if (!adminDoc.exists() || adminDoc.data().role !== 'admin') {
              await setDoc(adminRef, {
                id: currentUser.id,
                fullName: 'System Admin',
                email: adminEmail,
                phone: '0000000000',
                role: 'admin',
                vehicleNumber: 'ADMIN-01',
                createdAt: new Date().toISOString()
              }, { merge: true });
              console.log('Admin document verified/created.');
           }

           // 2. Handle Initial Slots Seeding (If empty)
           const slotsSnapshot = await getDocs(collection(db, 'slots'));
           if (slotsSnapshot.empty) {
              console.log('Seeding initial parking slots...');
              for (const s of INITIAL_SLOTS) {
                await setDoc(doc(db, 'slots', s.id), s);
              }
              console.log('Initial slots seeded successfully.');
           }
           return;
        }

        // One-time check for Auth existence. If not exists, create.
        if (!window.__adminChecked) {
          window.__adminChecked = true;
          try {
            await createUserWithEmailAndPassword(auth, adminEmail, adminPass);
          } catch (e: any) {
             // Already exists or other error, ignore
          }
        }
      } catch (err: any) {
        console.error('System seed failed:', err);
      }
    };

    seedSystem();
  }, [currentUser]);

  return (
    <AppContext.Provider value={{
      users, slots, bookings, complaints, currentUser, loading,
      setCurrentUser, updateSlots, addSlot, addBooking, updateBooking,
      addComplaint, updateComplaint, registerUser, deleteSlot, deleteUser, updateUser, logout
    }}>
      {children}
    </AppContext.Provider>
  );
};


export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
