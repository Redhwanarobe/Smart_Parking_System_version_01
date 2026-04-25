/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Search, 
  History, 
  MessageSquare, 
  Car, 
  MapPin, 
  Calendar, 
  Clock, 
  ChevronRight, 
  LayoutDashboard,
  CheckCircle2,
  XCircle,
  Download,
  AlertCircle,
  ShieldCheck,
  FileText
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useApp } from './AppContext';
import { LOCATIONS, VEHICLE_TYPES } from './constants';
import { Booking, ParkingSlot, Complaint } from './types';
import { cn } from './lib/utils';

// --- Sub-components for User Dashboard ---

const UserSidebar = () => {
  const location = useLocation();
  const links = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
    { to: '/dashboard/search', icon: Search, label: 'Search Parking' },
    { to: '/dashboard/bookings', icon: Car, label: 'Current Bookings' },
    { to: '/dashboard/history', icon: History, label: 'History' },
    { to: '/dashboard/support', icon: MessageSquare, label: 'Support' }
  ];

  return (
    <div className="w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-64px)] hidden md:block shrink-0">
      <div className="p-6 space-y-2">
        {links.map((link) => {
          const isActive = location.pathname === link.to;
          return (
            <Link 
              key={link.to} 
              to={link.to}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
                isActive ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" : "text-slate-500 hover:bg-slate-50"
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

const DashboardOverview = () => {
  const { currentUser, bookings } = useApp();
  const activeBookings = bookings.filter(b => b.userId === currentUser?.id && b.status === 'active');
  
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-display font-bold">Hello, {currentUser?.fullName.split(' ')[0]}</h2>
        <p className="text-slate-500">Welcome back to your parking command center.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
           <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                 <Car className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active</span>
           </div>
           <div className="font-display font-bold text-4xl mb-1">{activeBookings.length}</div>
           <div className="text-sm text-slate-500">Current Bookings</div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
           <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
                 <CheckCircle2 className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Completed</span>
           </div>
           <div className="font-display font-bold text-4xl mb-1">{bookings.filter(b => b.userId === currentUser?.id && b.status === 'completed').length}</div>
           <div className="text-sm text-slate-500">Total Visits</div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
           <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                 <Clock className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Duration</span>
           </div>
           <div className="font-display font-bold text-4xl mb-1">
             {bookings.filter(b => b.userId === currentUser?.id).reduce((acc, curr) => acc + curr.duration, 0)}h
           </div>
           <div className="text-sm text-slate-500">Total Parking Time</div>
        </div>
      </div>

      <div className="bg-indigo-600 rounded-[2rem] p-8 text-white flex flex-col md:flex-row items-center justify-between gap-8">
         <div className="space-y-2">
            <h3 className="text-2xl font-bold">Fast Search</h3>
            <p className="text-indigo-100">Quickly find and book your favorite spots.</p>
         </div>
         <Link to="/dashboard/search" className="px-8 py-4 bg-white text-indigo-600 rounded-2xl font-bold hover:bg-slate-50 transition-all shadow-xl shadow-indigo-900/20">
            Start Search
         </Link>
      </div>
    </div>
  );
};

const ParkingSearch = () => {
  const { slots, addBooking, currentUser } = useApp();
  const [search, setSearch] = useState({
    location: '',
    date: new Date().toISOString().split('T')[0],
    time: '10:00',
    duration: 2,
    vehicleType: 'car'
  });
  const [results, setResults] = useState<ParkingSlot[]>([]);
  const [isSearched, setIsSearched] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const filtered = slots.filter(s => 
      s.location === search.location && 
      s.vehicleType === search.vehicleType &&
      s.isAvailable
    );
    setResults(filtered);
    setIsSearched(true);
  };

  const handleBook = async (slot: ParkingSlot) => {
    if (!currentUser) return;
    const newBooking: Booking = {
      id: Math.random().toString(36).substr(2, 9).toUpperCase(),
      userId: currentUser.id,
      slotId: slot.id,
      location: slot.location,
      slotNumber: slot.slotNumber,
      slotPosition: slot.position,
      startTime: `${search.date}T${search.time}:00`,
      endTime: new Date(new Date(`${search.date}T${search.time}:00`).getTime() + search.duration * 60 * 60 * 1000).toISOString(),
      duration: search.duration,
      totalPrice: slot.price * search.duration,
      status: 'active',
      createdAt: new Date().toISOString()
    };
    try {
      await addBooking(newBooking);
      setIsSearched(false);
      setResults([]);
      alert('Booking Successful! View it in Current Bookings.');
    } catch (error) {
      console.error('Booking failed:', error);
      alert('Booking failed. Please try again.');
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
        <h2 className="text-2xl font-display font-bold mb-6">Find Available Slots</h2>
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase ml-1 tracking-wider">Location</label>
            <select 
              value={search.location} 
              onChange={e => setSearch({...search, location: e.target.value})}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
              required
            >
              <option value="">Select Location</option>
              {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase ml-1 tracking-wider">Date</label>
            <input 
               type="date" 
               value={search.date} 
               onChange={e => setSearch({...search, date: e.target.value})}
               className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase ml-1 tracking-wider">Duration (Hours)</label>
            <input 
               type="number" 
               min="1"
               max="24"
               value={search.duration} 
               onChange={e => setSearch({...search, duration: parseInt(e.target.value)})}
               className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase ml-1 tracking-wider">Vehicle</label>
            <select 
              value={search.vehicleType} 
              onChange={e => setSearch({...search, vehicleType: e.target.value})}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
            >
              {VEHICLE_TYPES.map(v => <option key={v.value} value={v.value}>{v.label}</option>)}
            </select>
          </div>
          <div className="flex items-end">
             <button type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">
                <Search className="w-4 h-4" />
                Search
             </button>
          </div>
        </form>
      </div>

      {isSearched && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
           <h3 className="text-xl font-bold px-1">Available Slots ({results.length})</h3>
           {results.length > 0 ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.map((slot) => (
                  <div key={slot.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
                     <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                           <Car className="w-6 h-6" />
                        </div>
                        <div className="text-right">
                           <span className="text-2xl font-display font-black text-slate-900">${slot.price * search.duration}</span>
                           <div className="text-[10px] uppercase font-bold text-slate-400">Total Price</div>
                        </div>
                     </div>
                     <h4 className="font-bold text-lg mb-1">{slot.slotNumber}</h4>
                     <p className="text-xs text-slate-500 mb-4">{slot.position}</p>
                     <div className="flex items-center gap-2 text-xs font-bold text-slate-700 mb-6 pb-6 border-b border-slate-100">
                        <MapPin className="w-3 h-3 text-indigo-500" />
                        {slot.location}
                     </div>
                     <button 
                       onClick={() => handleBook(slot)}
                       className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-indigo-600 transition-all"
                     >
                       Book Now
                     </button>
                  </div>
                ))}
             </div>
           ) : (
             <div className="bg-white p-20 rounded-3xl border border-dashed border-slate-200 text-center">
                <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 font-medium">No available slots found for the selected criteria.</p>
             </div>
           )}
        </motion.div>
      )}
    </div>
  );
};

const CurrentBookings = () => {
    const { currentUser, bookings, updateBooking } = useApp();
    const active = bookings.filter(b => b.userId === currentUser?.id && b.status === 'active');

    const handleDownloadReceipt = (b: Booking) => {
        try {
            const doc = new jsPDF();
            
            // Brand Header
            doc.setFillColor(79, 70, 229); // indigo-600
            doc.rect(0, 0, 210, 40, 'F');
            
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(24);
            doc.setFont('helvetica', 'bold');
            doc.text('Smart Parking System', 20, 25);
            
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text('OFFICIAL PARKING RECEIPT', 20, 32);
            
            // Content
            doc.setTextColor(50, 50, 50);
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('Booking Details', 20, 55);
            
            autoTable(doc, {
                startY: 60,
                head: [['Description', 'Details']],
                body: [
                    ['Booking ID', `#${b.id}`],
                    ['Location', b.location],
                    ['Slot Number', b.slotNumber],
                    ['Position', b.slotPosition],
                    ['Vehicle Number', currentUser?.vehicleNumber || 'N/A'],
                    ['Start Time', new Date(b.startTime).toLocaleString()],
                    ['End Time', new Date(b.endTime).toLocaleString()],
                    ['Duration', `${b.duration} hours`],
                    ['Total Price', `$${b.totalPrice}`],
                    ['Status', b.status.toUpperCase()]
                ],
                theme: 'striped',
                headStyles: { fillColor: [79, 70, 229] }
            });
            
            // Footer
            const finalY = (doc as any).lastAutoTable?.finalY || 150;
            doc.setFontSize(10);
            doc.setTextColor(150, 150, 150);
            doc.text('Thank you for choosing our Smart Parking System!', 105, finalY + 20, { align: 'center' });
            doc.text('This is a computer-generated receipt.', 105, finalY + 25, { align: 'center' });

            doc.save(`receipt-${b.id}.pdf`);
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Failed to generate PDF. Please try again.');
        }
    };

    return (
        <div className="space-y-8">
            <h2 className="text-2xl font-display font-bold">Your Active Bookings</h2>
            {active.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {active.map(b => (
                        <div key={b.id} className="bg-white p-6 rounded-3xl border border-slate-200 relative overflow-hidden group">
                           <div className="absolute top-0 right-0 p-4">
                               <div className="px-2 py-1 bg-green-50 text-green-600 text-[10px] font-bold rounded-lg uppercase tracking-wider">Confirmed</div>
                           </div>
                           <div className="flex gap-4 mb-6">
                               <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center shrink-0">
                                   <Car className="w-8 h-8 text-slate-500" />
                               </div>
                               <div>
                                   <div className="text-xs font-bold text-slate-400 mb-1">BOOKING #{b.id}</div>
                                   <h3 className="font-bold text-xl">{b.location}</h3>
                                   <div className="flex flex-wrap gap-2 mt-1">
                                       <span className="text-sm text-slate-500">{b.slotNumber} • {b.slotPosition}</span>
                                       {currentUser?.vehicleNumber && (
                                           <span className="text-[10px] font-black bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded uppercase flex items-center gap-1">
                                               <Car className="w-2.5 h-2.5" />
                                               {currentUser.vehicleNumber}
                                           </span>
                                       )}
                                   </div>
                               </div>
                           </div>
                           <div className="grid grid-cols-2 gap-4 mb-8">
                               <div className="p-4 bg-slate-50 rounded-2xl">
                                   <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Start Time</div>
                                   <div className="text-sm font-bold">{new Date(b.startTime).toLocaleString()}</div>
                               </div>
                               <div className="p-4 bg-slate-50 rounded-2xl">
                                   <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">End Time</div>
                                   <div className="text-sm font-bold">{new Date(b.endTime).toLocaleString()}</div>
                               </div>
                           </div>
                           <div className="flex gap-3">
                               <button 
                                 onClick={async () => {
                                    if(confirm('Are you sure you want to cancel this booking?')) {
                                        try {
                                          await updateBooking(b.id, { status: 'cancelled' });
                                        } catch (error) {
                                          console.error('Cancel failed:', error);
                                        }
                                    }
                                 }}
                                 className="flex-1 py-3 border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors bg-white rounded-xl text-sm font-bold"
                               >
                                   Cancel Booking
                               </button>
                               <button 
                                 onClick={() => handleDownloadReceipt(b)}
                                 className="px-5 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center gap-2"
                                 title="Download Receipt"
                               >
                                   <Download className="w-4 h-4" />
                               </button>
                           </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white p-20 rounded-3xl border border-dashed border-slate-200 text-center">
                   <p className="text-slate-500">You have no active bookings at the moment.</p>
                   <Link to="/dashboard/search" className="mt-4 inline-block text-indigo-600 font-bold hover:underline">Find a slot →</Link>
                </div>
            )}
        </div>
    );
};

const BookingHistory = () => {
    const { currentUser, bookings } = useApp();
    // Show all user bookings in history, sorted by creation date
    const history = bookings
        .filter(b => b.userId === currentUser?.id)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const handleDownload = () => {
        if (history.length === 0) {
            alert('No history to download.');
            return;
        }

        try {
            const doc = new jsPDF();
            
            doc.setFontSize(20);
            doc.setTextColor(79, 70, 229);
            doc.setFont('helvetica', 'bold');
            doc.text('Parking Activity History', 20, 20);
            
            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);
            doc.setFont('helvetica', 'normal');
            doc.text(`User: ${currentUser?.fullName || 'N/A'}`, 20, 30);
            doc.text(`Vehicle: ${currentUser?.vehicleNumber || 'N/A'}`, 20, 35);
            doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 40);

            const tableData = history.map(b => [
                b.id,
                b.location,
                b.slotNumber,
                `${b.duration}h`,
                `$${b.totalPrice}`,
                b.status.toUpperCase(),
                new Date(b.createdAt).toLocaleDateString()
            ]);

            autoTable(doc, {
                startY: 50,
                head: [['ID', 'Location', 'Slot', 'Dur.', 'Price', 'Status', 'Date']],
                body: tableData,
                headStyles: { fillColor: [79, 70, 229] },
                styles: { fontSize: 8 }
            });

            const fileName = `parking-history-${(currentUser?.fullName || 'user').replace(/\s+/g, '-')}.pdf`;
            doc.save(fileName);
        } catch (error) {
            console.error('Error generating history PDF:', error);
            alert('Failed to generate history PDF. Please try again.');
        }
    };

    return (
        <div className="space-y-8 pb-12">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-display font-bold">Activity History</h2>
                <button 
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors"
                >
                    <Download className="w-4 h-4" />
                    Download All
                </button>
            </div>
            
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                <th className="px-6 py-4">Booking ID</th>
                                <th className="px-6 py-4">Vehicle</th>
                                <th className="px-6 py-4">Location</th>
                                <th className="px-6 py-4">Slot</th>
                                <th className="px-6 py-4">Duration</th>
                                <th className="px-6 py-4">Total Price</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Date</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {history.map(b => (
                                <tr key={b.id} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-mono font-bold text-slate-400">#{b.id}</td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-wider">{currentUser?.vehicleNumber || 'N/A'}</span>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-slate-900">{b.location}</td>
                                    <td className="px-6 py-4 text-slate-600 font-medium">{b.slotNumber}</td>
                                    <td className="px-6 py-4 text-slate-500">{b.duration}h</td>
                                    <td className="px-6 py-4 font-bold text-slate-900">${b.totalPrice}</td>
                                    <td className="px-6 py-4">
                                        <span className={cn(
                                            "px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider",
                                            b.status === 'active' ? "bg-blue-50 text-blue-600" :
                                            b.status === 'completed' ? "bg-green-50 text-green-600" : 
                                            "bg-red-50 text-red-600"
                                        )}>
                                            {b.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right text-slate-400 font-medium">
                                        {new Date(b.createdAt).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {history.length === 0 && (
                    <div className="py-20 text-center flex flex-col items-center gap-4">
                        <History className="w-12 h-12 text-slate-200" />
                        <p className="text-slate-500 font-medium">No booking activity found yet.</p>
                        <Link to="/dashboard/search" className="text-indigo-600 font-bold hover:underline">Find a slot to get started</Link>
                    </div>
                )}
            </div>
        </div>
    );
};

const SupportSection = () => {
    const { currentUser, addComplaint, complaints } = useApp();
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [bookingId, setBookingId] = useState('');
    
    const userComplaints = complaints.filter(c => c.userId === currentUser?.id);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) return;
        
        const newComplaint: Complaint = {
            id: Math.random().toString(36).substr(2, 6).toUpperCase(),
            userId: currentUser.id,
            subject,
            message,
            bookingId: bookingId || '',
            status: 'pending',
            createdAt: new Date().toISOString()
        };
        
        try {
          await addComplaint(newComplaint);
          setSubject('');
          setMessage('');
          setBookingId('');
          alert('Complaint submitted successfully!');
        } catch (error) {
          console.error('Complaint failed:', error);
          alert('Failed to submit complaint.');
        }
    };

    const handleDownloadTicket = (t: Complaint) => {
        try {
            const doc = new jsPDF();
            
            // Header
            doc.setFillColor(79, 70, 229);
            doc.rect(0, 0, 210, 40, 'F');
            
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(24);
            doc.setFont('helvetica', 'bold');
            doc.text('Support Ticket Report', 20, 25);
            
            doc.setFontSize(10);
            doc.text(`TICKET ID: #${t.id}`, 20, 32);
            
            // Info
            doc.setTextColor(50, 50, 50);
            doc.setFontSize(12);
            doc.text('Ticket Details', 20, 55);
            
            autoTable(doc, {
                startY: 60,
                body: [
                    ['Subject', t.subject],
                    ['Booking ID', t.bookingId || 'N/A'],
                    ['Status', t.status.toUpperCase()],
                    ['Created At', new Date(t.createdAt).toLocaleString()],
                    ['User Email', currentUser?.email || 'N/A']
                ],
                theme: 'grid',
                styles: { cellPadding: 5 }
            });

            // Message
            const finalY = (doc as any).lastAutoTable?.finalY || 100;
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('Original Message:', 20, finalY + 15);
            
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            const splitMessage = doc.splitTextToSize(t.message, 170);
            doc.text(splitMessage, 20, finalY + 22);

            // Admin Reply
            if (t.adminReply) {
                const messageHeight = splitMessage.length * 5;
                doc.setFontSize(12);
                doc.setFont('helvetica', 'bold');
                doc.text('Resolution / Admin Reply:', 20, finalY + 35 + messageHeight);
                
                doc.setFontSize(10);
                doc.setFont('helvetica', 'normal');
                const splitReply = doc.splitTextToSize(t.adminReply, 170);
                doc.text(splitReply, 20, finalY + 42 + messageHeight);
            }
            
            doc.save(`ticket-${t.id}.pdf`);
        } catch (error) {
            console.error('Error generating ticket PDF:', error);
            alert('Failed to generate PDF.');
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-12">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm h-fit">
                <h2 className="text-2xl font-display font-bold mb-6">Submit a Complaint</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500">Subject</label>
                        <input 
                          required 
                          value={subject}
                          onChange={e => setSubject(e.target.value)}
                          placeholder="What is the issue?"
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" 
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500">Booking ID (Optional)</label>
                        <input 
                          value={bookingId}
                          onChange={e => setBookingId(e.target.value)}
                          placeholder="#ABC123"
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" 
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500">Message</label>
                        <textarea 
                           required 
                           rows={4}
                           value={message}
                           onChange={e => setMessage(e.target.value)}
                           placeholder="Describe your problem in detail..."
                           className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none resize-none" 
                        />
                    </div>
                    <button type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all">Submit Support Ticket</button>
                </form>
            </div>

            <div className="space-y-6">
                {userComplaints.length > 0 && userComplaints.map(t => (
                    <div key={t.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-slate-50 rounded-lg text-[10px] font-bold text-slate-500">#{t.id}</div>
                                    <button 
                                        onClick={() => handleDownloadTicket(t)}
                                        className="p-2 bg-slate-50 text-slate-400 hover:text-indigo-600 rounded-lg transition-colors"
                                        title="Download Ticket PDF"
                                    >
                                        <Download className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                                <span className={cn(
                                    "px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider",
                                    t.status === 'pending' ? "bg-amber-50 text-amber-600" : t.status === 'solved' ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                                )}>
                                    {t.status}
                                </span>
                            </div>
                            <h4 className="font-bold mb-2">{t.subject}</h4>
                            <p className="text-sm text-slate-500 mb-4">{t.message}</p>
                            {t.adminReply && (
                                <div className="mt-4 pt-4 border-t border-slate-100">
                                    <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 mb-2">
                                        <ShieldCheck className="w-4 h-4" />
                                        Admin Reply
                                    </div>
                                    <p className="text-sm text-slate-600 bg-indigo-50/50 p-4 rounded-2xl">{t.adminReply}</p>
                                </div>
                            )}
                        </div>
                    ))
                }
            </div>
        </div>
    );
};

export default function UserDashboard() {
  const { currentUser } = useApp();

  return (
    <div className="flex bg-slate-50 min-h-[calc(100vh-64px)] overflow-hidden">
      <UserSidebar />
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-8">
        <motion.div
           initial={{ opacity: 0, x: 20 }}
           animate={{ opacity: 1, x: 0 }}
           transition={{ duration: 0.3 }}
           className="max-w-6xl mx-auto"
        >
          <Routes>
            <Route path="/" element={<DashboardOverview />} />
            <Route path="/search" element={<ParkingSearch />} />
            <Route path="/bookings" element={<CurrentBookings />} />
            <Route path="/history" element={<BookingHistory />} />
            <Route path="/support" element={<SupportSection />} />
          </Routes>
        </motion.div>
      </div>
    </div>
  );
}
