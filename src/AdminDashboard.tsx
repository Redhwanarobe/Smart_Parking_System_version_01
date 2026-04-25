/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  LayoutDashboard, 
  Database, 
  MapPin, 
  Car, 
  Users, 
  MessageSquare, 
  FileText, 
  Plus, 
  Search, 
  Download, 
  Edit, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  MoreVertical,
  BarChart3,
  TrendingUp,
  Clock,
  Calendar,
  Mail,
  Phone
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useApp } from './AppContext';
import { ParkingSlot, Booking, User, Complaint, UserRole } from './types';
import { LOCATIONS, VEHICLE_TYPES } from './constants';
import { cn } from './lib/utils';

// --- Sub-components for Admin Dashboard ---

const AdminSidebar = () => {
  const location = useLocation();
  const links = [
    { to: '/admin', icon: LayoutDashboard, label: 'Overview' },
    { to: '/admin/slots', icon: Database, label: 'Slots' },
    { to: '/admin/bookings', icon: Car, label: 'Bookings' },
    { to: '/admin/users', icon: Users, label: 'Users' },
    { to: '/admin/complaints', icon: MessageSquare, label: 'Complaints' },
    { to: '/admin/reports', icon: FileText, label: 'Reports' }
  ];

  return (
    <div className="w-64 bg-slate-900 border-r border-slate-800 min-h-[calc(100vh-64px)] hidden md:block shrink-0">
      <div className="p-6 space-y-2">
        {links.map((link) => {
          const isActive = location.pathname === link.to;
          return (
            <Link 
              key={link.to} 
              to={link.to}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
                isActive ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/40" : "text-slate-400 hover:text-white hover:bg-slate-800"
              )}
            >
              <link.icon className="w-5 h-5" />
              {link.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

const AdminOverview = () => {
    const { slots, bookings, users, complaints } = useApp();
    
    const stats = [
        { label: 'Total Slots', value: slots.length, icon: Database, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        { label: 'Available', value: slots.filter(s => s.isAvailable).length, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
        { label: 'Booked', value: slots.filter(s => !s.isAvailable).length, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
        { label: 'Total Revenue', value: `$${bookings.reduce((acc, b) => acc + b.totalPrice, 0)}`, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' }
    ];

    const chartData = [
        { name: 'Mon', bookings: 40 },
        { name: 'Tue', bookings: 30 },
        { name: 'Wed', bookings: 65 },
        { name: 'Thu', bookings: 45 },
        { name: 'Fri', bookings: 90 },
        { name: 'Sat', bookings: 120 },
        { name: 'Sun', bookings: 85 },
    ];

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-display font-bold">Admin Insights</h2>
                <div className="flex gap-2">
                    <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-slate-200 text-xs font-bold uppercase tracking-wider">
                        <Calendar className="w-4 h-4" />
                        Last 7 Days
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {stats.map((s, i) => (
                    <motion.div 
                      key={i} 
                      whileHover={{ scale: 1.02 }}
                      className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm"
                    >
                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-4", s.bg, s.color)}>
                            <s.icon className="w-6 h-6" />
                        </div>
                        <div className="font-display font-black text-3xl mb-1">{s.value}</div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">{s.label}</div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                   <h3 className="font-bold text-lg mb-6">Booking Activity</h3>
                   <div className="h-64">
                       <ResponsiveContainer width="100%" height="100%">
                           <AreaChart data={chartData}>
                               <defs>
                                   <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                                       <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                                       <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                                   </linearGradient>
                               </defs>
                               <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                               <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                               <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                               <Tooltip 
                                 contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                               />
                               <Area type="monotone" dataKey="bookings" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorBookings)" />
                           </AreaChart>
                       </ResponsiveContainer>
                   </div>
                </div>

                <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-xl">
                   <h3 className="font-bold text-lg mb-6 text-indigo-400">System Distribution</h3>
                   <div className="space-y-6">
                      {[
                        { label: 'Total Users', value: users.length, icon: Users },
                        { label: 'Pending Complaints', value: complaints.filter(c => c.status === 'pending').length, icon: MessageSquare },
                        { label: 'Active Sessions', value: 12, icon: Clock }
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
                           <div className="flex items-center gap-4">
                              <item.icon className="w-5 h-5 text-indigo-400" />
                              <span className="font-medium">{item.label}</span>
                           </div>
                           <span className="font-display font-bold text-xl">{item.value}</span>
                        </div>
                      ))}
                   </div>
                </div>
            </div>
        </div>
    );
};

const SlotManagement = () => {
    const { slots, addSlot, deleteSlot } = useApp();
    const [isAdding, setIsAdding] = useState(false);
    const [newSlot, setNewSlot] = useState({
        slotNumber: '',
        position: '',
        location: LOCATIONS[0],
        vehicleType: 'car' as any,
        isAvailable: true,
        price: 10
    });

    const handleDeleteSlot = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this parking slot?')) {
            try {
              await deleteSlot(id);
            } catch (error) {
              console.error('Delete slot failed:', error);
            }
        }
    };

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        const slot: ParkingSlot = {
            id: Math.random().toString(36).substr(2, 6).toUpperCase(),
            ...newSlot,
            lastUpdated: new Date().toISOString()
        };
        try {
          await addSlot(slot);
          setIsAdding(false);
        } catch (error) {
          console.error('Add slot failed:', error);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-display font-bold">Space Management</h2>
                <button 
                  onClick={() => setIsAdding(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all"
                >
                    <Plus className="w-5 h-5" />
                    New Slot
                </button>
            </div>

            {isAdding && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
                >
                    <div className="bg-white p-8 rounded-[2rem] w-full max-w-lg shadow-2xl relative">
                        <button onClick={() => setIsAdding(false)} className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-lg">
                            <XCircle className="w-6 h-6 text-slate-400" />
                        </button>
                        <h3 className="text-2xl font-display font-bold mb-8">Create New Parking Slot</h3>
                        <form onSubmit={handleAdd} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Slot ID</label>
                                    <input required placeholder="eg. A-205" value={newSlot.slotNumber} onChange={e => setNewSlot({...newSlot, slotNumber: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Price ($/hr)</label>
                                    <input required type="number" value={newSlot.price} onChange={e => setNewSlot({...newSlot, price: parseInt(e.target.value)})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase">Location</label>
                                <select value={newSlot.location} onChange={e => setNewSlot({...newSlot, location: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none appearance-none">
                                    {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase">Position Details</label>
                                <input required placeholder="eg. Level 2, North Wing" value={newSlot.position} onChange={e => setNewSlot({...newSlot, position: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase">Vehicle Type</label>
                                <div className="flex gap-2">
                                    {VEHICLE_TYPES.map(v => (
                                        <button 
                                          key={v.value} 
                                          type="button"
                                          onClick={() => setNewSlot({...newSlot, vehicleType: v.value as any})}
                                          className={cn(
                                            "flex-1 py-2 rounded-xl text-sm font-bold border transition-all",
                                            newSlot.vehicleType === v.value ? "bg-indigo-600 border-indigo-600 text-white" : "bg-white border-slate-200 text-slate-500 hover:border-indigo-400"
                                          )}
                                        >
                                            {v.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <button type="submit" className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-lg hover:shadow-xl transition-all">Create Slot</button>
                        </form>
                    </div>
                </motion.div>
            )}

            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            <th className="px-8 py-5">Slot Info</th>
                            <th className="px-8 py-5">Location</th>
                            <th className="px-8 py-5">Vehicle</th>
                            <th className="px-8 py-5">Price</th>
                            <th className="px-8 py-5">Status</th>
                            <th className="px-8 py-5 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {slots.map(s => (
                            <tr key={s.id} className="border-t border-slate-50 hover:bg-slate-50/50 transition-colors">
                                <td className="px-8 py-6">
                                    <div className="font-bold text-slate-900">{s.slotNumber}</div>
                                    <div className="text-[10px] text-slate-400 uppercase">{s.position}</div>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-indigo-400" />
                                        <span className="font-medium text-slate-600">{s.location}</span>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <span className="px-2 py-1 bg-slate-100 rounded-lg text-[10px] font-bold text-slate-500 uppercase tracking-wider">{s.vehicleType}</span>
                                </td>
                                <td className="px-8 py-6 font-bold text-slate-900">${s.price}/hr</td>
                                <td className="px-8 py-6">
                                    <div className={cn(
                                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase",
                                        s.isAvailable ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                                    )}>
                                        <div className={cn("w-1.5 h-1.5 rounded-full", s.isAvailable ? "bg-green-500" : "bg-amber-500")} />
                                        {s.isAvailable ? 'Available' : 'Occupied'}
                                    </div>
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <div className="flex justify-end gap-2 text-slate-400">
                                        <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors hover:text-indigo-600"><Edit className="w-4 h-4" /></button>
                                        <button onClick={() => handleDeleteSlot(s.id)} className="p-2 hover:bg-red-50 rounded-lg transition-colors hover:text-red-600" title="Delete Slot"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const BookingManagement = () => {
    const { bookings, updateBooking, users } = useApp();
    
    const getUserVehicle = (userId: string) => {
        const user = users.find(u => u.id === userId);
        return user?.vehicleNumber || 'N/A';
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-display font-bold">Booking Logs</h2>
                <div className="flex gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input placeholder="Search bookings..." className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm" />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            <th className="px-8 py-5">Booking ID</th>
                            <th className="px-8 py-5">Space Info</th>
                            <th className="px-8 py-5">Vehicle No</th>
                            <th className="px-8 py-5">Schedule</th>
                            <th className="px-8 py-5">Price</th>
                            <th className="px-8 py-5">Status</th>
                            <th className="px-8 py-5 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {bookings.map(b => (
                            <tr key={b.id} className="border-t border-slate-50">
                                <td className="px-8 py-6 font-bold text-indigo-600">#{b.id}</td>
                                <td className="px-8 py-6">
                                    <div className="font-bold">{b.location}</div>
                                    <div className="text-[10px] text-slate-400 uppercase">{b.slotNumber}</div>
                                </td>
                                <td className="px-8 py-6">
                                    <span className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-wider">{getUserVehicle(b.userId)}</span>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="text-xs text-slate-600">{new Date(b.startTime).toLocaleString()}</div>
                                    <div className="text-[10px] text-slate-400">{b.duration}h duration</div>
                                </td>
                                <td className="px-8 py-6 font-bold">${b.totalPrice}</td>
                                <td className="px-8 py-6">
                                    <span className={cn(
                                        "px-2 py-1 rounded-md text-[10px] font-bold uppercase",
                                        b.status === 'active' ? "bg-green-100 text-green-700" : b.status === 'completed' ? "bg-slate-100 text-slate-600" : "bg-red-100 text-red-700"
                                    )}>{b.status}</span>
                                </td>
                                <td className="px-8 py-6 text-right">
                                    {b.status === 'active' && (
                                        <button 
                                          onClick={async () => {
                                            try {
                                              await updateBooking(b.id, { status: 'completed' });
                                            } catch (error) {
                                              console.error('Update booking failed:', error);
                                            }
                                          }}
                                          className="text-xs font-bold text-indigo-600 hover:underline"
                                        >
                                            Mark Completed
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const UserManager = () => {
    const { users, updateUser, deleteUser } = useApp();
    const [editingUser, setEditingUser] = useState<User | null>(null);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (editingUser) {
            try {
              await updateUser(editingUser.id, editingUser);
              setEditingUser(null);
            } catch (error) {
              console.error('Update user failed:', error);
            }
        }
    };

    const handleDeleteUser = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            try {
              await deleteUser(id);
            } catch (error) {
              console.error('Delete user failed:', error);
            }
        }
    };

    return (
        <div className="space-y-8">
            <h2 className="text-2xl font-display font-bold">User Directory</h2>

            {editingUser && (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
                >
                    <div className="bg-white p-8 rounded-[2rem] w-full max-w-lg shadow-2xl relative">
                        <button onClick={() => setEditingUser(null)} className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-lg">
                            <XCircle className="w-6 h-6 text-slate-400" />
                        </button>
                        <h3 className="text-2xl font-display font-bold mb-8">Edit User Profile</h3>
                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Full Name</label>
                                <input 
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                                    value={editingUser.fullName}
                                    onChange={e => setEditingUser({...editingUser, fullName: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Email Address</label>
                                <input 
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                                    type="email"
                                    value={editingUser.email}
                                    onChange={e => setEditingUser({...editingUser, email: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Phone Number</label>
                                <input 
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                                    value={editingUser.phone}
                                    onChange={e => setEditingUser({...editingUser, phone: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Vehicle Number</label>
                                <input 
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                                    value={editingUser.vehicleNumber || ''}
                                    onChange={e => setEditingUser({...editingUser, vehicleNumber: e.target.value})}
                                />
                            </div>
                            <button type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:shadow-xl transition-all mt-4">Save Changes</button>
                        </form>
                    </div>
                </motion.div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {users.map(u => (
                    <div key={u.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                        <div className="flex gap-4 mb-6">
                            <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-display font-black text-xl">
                                {u.fullName.charAt(0)}
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">{u.fullName}</h3>
                                <p className="text-xs text-slate-400 uppercase font-bold tracking-widest">{u.role}</p>
                            </div>
                        </div>
                        <div className="space-y-3 mb-6">
                            <div className="flex items-center gap-3 text-sm text-slate-500">
                                <Mail className="w-4 h-4" />
                                <span className="truncate">{u.email}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-slate-500">
                                <Phone className="w-4 h-4" />
                                {u.phone}
                            </div>
                            {u.vehicleNumber && (
                                <div className="flex items-center gap-3 text-sm text-slate-500">
                                    <Car className="w-4 h-4" />
                                    {u.vehicleNumber}
                                </div>
                            )}
                        </div>
                        <div className="flex gap-2">
                             <button 
                                onClick={() => setEditingUser(u)}
                                className="flex-1 py-2 bg-slate-50 hover:bg-slate-100 rounded-xl text-xs font-bold transition-colors"
                             >
                                Edit Profile
                             </button>
                             <button 
                                onClick={() => handleDeleteUser(u.id)}
                                className="px-4 py-2 bg-slate-50 hover:bg-red-50 hover:text-red-600 rounded-xl text-xs font-bold transition-colors"
                             >
                                Delete
                             </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const ComplaintManager = () => {
    const { complaints, updateComplaint } = useApp();
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyText, setReplyText] = useState('');

    const handleReply = async (id: string) => {
        try {
          await updateComplaint(id, { adminReply: replyText, status: 'solved' });
          setReplyingTo(null);
          setReplyText('');
        } catch (error) {
          console.error('Reply failed:', error);
        }
    };

    return (
        <div className="space-y-8">
            <h2 className="text-2xl font-display font-bold">Feedback Tickets</h2>
            <div className="space-y-4">
                {complaints.map(cat => (
                    <div key={cat.id} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                    "w-3 h-3 rounded-full",
                                    cat.status === 'pending' ? "bg-amber-400" : cat.status === 'solved' ? "bg-green-500" : "bg-red-500"
                                )} />
                                <h4 className="font-bold text-lg">{cat.subject}</h4>
                            </div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase">TIKET #{cat.id}</div>
                        </div>
                        <p className="text-slate-600 mb-6 bg-slate-50 p-6 rounded-2xl italic leading-relaxed">"{cat.message}"</p>
                        
                        {cat.adminReply ? (
                            <div className="bg-indigo-50/50 p-6 rounded-2xl">
                                <div className="text-xs font-bold text-indigo-600 mb-2 uppercase tracking-widest">Your Resolution</div>
                                <p className="text-sm text-slate-700">{cat.adminReply}</p>
                            </div>
                        ) : replyingTo === cat.id ? (
                            <div className="space-y-4">
                                <textarea 
                                  value={replyText}
                                  onChange={e => setReplyText(e.target.value)}
                                  placeholder="Type your reply here..."
                                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none"
                                />
                                <div className="flex gap-2">
                                    <button onClick={() => handleReply(cat.id)} className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold">Send Reply</button>
                                    <button onClick={() => setReplyingTo(null)} className="px-6 py-2 bg-slate-200 rounded-xl font-bold">Cancel</button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex gap-2">
                                <button onClick={() => setReplyingTo(cat.id)} className="px-6 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold">Reply & Solve</button>
                                <button onClick={() => updateComplaint(cat.id, { status: 'rejected' })} className="px-6 py-3 border border-slate-200 text-slate-500 rounded-xl text-sm font-bold">Reject</button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

const Reports = () => {
    const { bookings, slots, users, complaints } = useApp();

    const generateRevenuePDF = () => {
        const doc = new jsPDF();
        doc.setFillColor(79, 70, 229);
        doc.rect(0, 0, 210, 40, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text('Monthly Revenue Report', 20, 25);
        doc.setFontSize(10);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 32);

        const totalRevenue = bookings.reduce((sum, b) => sum + b.totalPrice, 0);
        
        doc.setTextColor(50, 50, 50);
        doc.setFontSize(12);
        doc.text(`Summary Overview`, 20, 55);
        
        autoTable(doc, {
            startY: 60,
            body: [
                ['Total Bookings', bookings.length.toString()],
                ['Total Completed', bookings.filter(b => b.status === 'completed').length.toString()],
                ['Total Revenue', `$${totalRevenue}`],
                ['Average Transaction', `$${(totalRevenue / (bookings.length || 1)).toFixed(2)}`]
            ],
            theme: 'grid'
        });

        doc.text('Detailed Booking Ledger', 20, (doc as any).lastAutoTable.finalY + 15);
        
        autoTable(doc, {
            startY: (doc as any).lastAutoTable.finalY + 20,
            head: [['ID', 'User ID', 'Slot', 'Duration', 'Price', 'Status']],
            body: bookings.map(b => [b.id, b.userId, b.slotNumber, `${b.duration}h`, `$${b.totalPrice}`, b.status.toUpperCase()]),
            headStyles: { fillColor: [79, 70, 229] }
        });

        doc.save('revenue-report.pdf');
    };

    const generateOccupancyPDF = () => {
        const doc = new jsPDF();
        doc.setFillColor(16, 185, 129); // emerald-500
        doc.rect(0, 0, 210, 40, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text('Slot Occupancy Analysis', 20, 25);
        doc.setFontSize(10);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 32);

        const occupied = slots.filter(s => !s.isAvailable).length;
        const total = slots.length;
        const rate = ((occupied / (total || 1)) * 100).toFixed(1);

        doc.setTextColor(50, 50, 50);
        doc.text(`Real-time Occupancy: ${rate}%`, 20, 55);

        autoTable(doc, {
            startY: 65,
            head: [['Location', 'Total Slots', 'Occupied', 'Available', 'Rate']],
            body: LOCATIONS.map(loc => {
                const locSlots = slots.filter(s => s.location === loc);
                const occ = locSlots.filter(s => !s.isAvailable).length;
                const tot = locSlots.length;
                const r = ((occ / (tot || 1)) * 100).toFixed(1);
                return [loc, tot, occ, tot - occ, `${r}%`];
            }),
            headStyles: { fillColor: [16, 185, 129] }
        });

        doc.save('occupancy-report.pdf');
    };

    const generateUserPDF = () => {
        const doc = new jsPDF();
        doc.setFillColor(30, 41, 59); // slate-800
        doc.rect(0, 0, 210, 40, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text('User Directory & Activity', 20, 25);
        doc.setFontSize(10);
        doc.text(`Total Users: ${users.length}`, 20, 32);

        autoTable(doc, {
            startY: 50,
            head: [['Name', 'Email', 'Role', 'Vehicle', 'Complaints']],
            body: users.map(u => {
                const userComplaints = complaints.filter(c => c.userId === u.id).length;
                return [u.fullName, u.email, u.role, u.vehicleNumber || 'N/A', userComplaints];
            }),
            headStyles: { fillColor: [30, 41, 59] }
        });

        doc.save('user-ledger.pdf');
    };

    const reports = [
        { title: 'Revenue & Transaction History', size: 'Live Data', type: 'PDF', handler: generateRevenuePDF, color: 'indigo' },
        { title: 'Real-time Occupancy Audit', size: 'Live Data', type: 'PDF', handler: generateOccupancyPDF, color: 'emerald' },
        { title: 'User Management Ledger', size: 'Live Data', type: 'PDF', handler: generateUserPDF, color: 'slate' }
    ];

    return (
        <div className="space-y-8">
            <h2 className="text-2xl font-display font-bold">Generated Reports</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {reports.map((rep, i) => (
                    <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm group">
                        <div className="flex items-center gap-6">
                            <div className={cn(
                                "w-16 h-16 rounded-2xl flex items-center justify-center transition-all",
                                rep.color === 'indigo' ? "bg-indigo-50 text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white" :
                                rep.color === 'emerald' ? "bg-emerald-50 text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white" :
                                "bg-slate-50 text-slate-400 group-hover:bg-slate-900 group-hover:text-white"
                            )}>
                                <FileText className="w-8 h-8" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-lg mb-1">{rep.title}</h3>
                                <div className="flex items-center gap-4 text-xs text-slate-400 font-bold uppercase tracking-widest">
                                    <span>{new Date().toLocaleDateString()}</span>
                                    <div className="w-1 h-1 bg-slate-200 rounded-full" />
                                    <span>{rep.type}</span>
                                </div>
                            </div>
                            <button 
                                onClick={rep.handler}
                                className="p-4 bg-slate-50 group-hover:bg-indigo-50 text-indigo-600 rounded-2xl transition-all"
                                title="Download Report"
                            >
                                <Download className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default function AdminDashboard() {
  const { currentUser } = useApp();

  return (
    <div className="flex bg-slate-50 min-h-[calc(100vh-64px)] overflow-hidden">
      <AdminSidebar />
      <div className="flex-1 overflow-y-auto px-4 md:px-10 py-10">
        <motion.div
           initial={{ opacity: 0, scale: 0.98 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ duration: 0.3 }}
           className="max-w-7xl mx-auto"
        >
          <Routes>
            <Route path="/" element={<AdminOverview />} />
            <Route path="/slots" element={<SlotManagement />} />
            <Route path="/bookings" element={<BookingManagement />} />
            <Route path="/users" element={<UserManager />} />
            <Route path="/complaints" element={<ComplaintManager />} />
            <Route path="/reports" element={<Reports />} />
          </Routes>
        </motion.div>
      </div>
    </div>
  );
}
