/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { 
  CheckCircle2, 
  Target, 
  Users, 
  Lightbulb, 
  Search, 
  Calendar, 
  Clock, 
  LayoutDashboard, 
  ShieldCheck, 
  FileText,
  MousePointer2,
  Lock,
  Download
} from 'lucide-react';

export const AboutPage = () => (
  <div className="py-20 px-4">
    <div className="max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
        <h1 className="text-5xl font-display font-bold mb-6">About SmartPark</h1>
        <p className="text-xl text-slate-600 leading-relaxed">
          SmartPark is more than just a booking app; it's an intelligent ecosystem designed to solve the urban parking crisis. 
          Our mission is to reduce traffic congestion and carbon emissions by optimizing the way vehicles are parked.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
         <div className="space-y-6">
            <h2 className="text-3xl font-display font-bold text-indigo-600">Our Vision</h2>
            <p className="text-slate-600 leading-relaxed">
              We envision cities where parking is never a point of stress. By leveraging real-time data and AI, we bridge the gap between parking lot operators and drivers, ensuring every slot is utilized efficiently.
            </p>
         </div>
         <div className="space-y-6">
            <h2 className="text-3xl font-display font-bold text-indigo-600">Why Use Us?</h2>
            <p className="text-slate-600 leading-relaxed">
              Traditional parking is inefficient. SmartPark saves users an average of 15 minutes per trip by eliminating the search phase. For admins, we provide the tools to maximize occupancy and revenue with zero manual overhead.
            </p>
         </div>
      </div>

      <div className="bg-slate-900 rounded-[2rem] p-12 text-white relative overflow-hidden">
         <div className="relative z-10">
            <h3 className="text-2xl font-bold mb-8 text-center text-indigo-400 uppercase tracking-widest">Core Values</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
               {[
                 { icon: Target, label: 'Precision' },
                 { icon: Users, label: 'Community' },
                 { icon: Lightbulb, label: 'Innovation' },
                 { icon: ShieldCheck, label: 'Security' }
               ].map((v, i) => (
                 <div key={i} className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-full border border-slate-700 flex items-center justify-center text-indigo-400">
                       <v.icon />
                    </div>
                    <span className="font-bold">{v.label}</span>
                 </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  </div>
);

export const FeaturesPage = () => {
  const features = [
    { icon: Search, title: 'Real-time Search', desc: 'Find available parking slots instantly based on your destination.' },
    { icon: Target, title: 'Location Filtering', desc: 'Browse slots by specific city areas or proximity to landmarks.' },
    { icon: Calendar, title: 'DateTime Selection', desc: 'Schedule your parking in advance with precise timing.' },
    { icon: MousePointer2, title: 'Instant Booking', desc: 'One-tap booking process with immediate slot allocation.' },
    { icon: FileText, title: 'Detailed History', desc: 'Access your current and previous booking records at any time.' },
    { icon: LayoutDashboard, title: 'Powerful Dashboards', desc: 'Dedicated control centers for regular users.' },
    { icon: MessageSquare, title: 'Complaint Management', desc: 'Efficient support system to handle user queries and issues.' },
    { icon: Download, title: 'Smart Reports', desc: 'Downloadable PDF/CSV reports for bookings and slot usage.' },
    { icon: Lock, title: 'Secure Access', desc: 'Role-based access control ensuring your data stays private.' }
  ];

  function MessageSquare({ className }: { className?: string }) {
    return <FileText className={className} />;
  }

  return (
    <div className="py-20 px-4 bg-slate-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h1 className="text-5xl font-display font-bold mb-6">Platform Features</h1>
          <p className="text-slate-500 max-w-2xl mx-auto">Everything you need for a seamless parking experience, packed into one powerful app.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all"
            >
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-6">
                 <f.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">{f.title}</h3>
              <p className="text-slate-600 leading-relaxed text-sm">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const HowItWorksPage = () => (
  <div className="py-20 px-4">
    <div className="max-w-5xl mx-auto">
       <div className="text-center mb-20">
          <h1 className="text-5xl font-display font-bold mb-6">How SmartPark Works</h1>
          <p className="text-slate-500">Getting started is as easy as 1-2-3.</p>
       </div>

       <div className="space-y-12 relative">
          <div className="absolute left-8 top-0 bottom-0 w-px bg-slate-200 -z-10 hidden md:block" />
          {[
            { step: '01', title: 'Create Account', desc: 'Register as a user or admin. For users, add your vehicle details for faster booking.' },
            { step: '02', title: 'Search Location', desc: 'Select your target location, date, and time duration for parking.' },
            { step: '03', title: 'Reserve Slot', desc: 'Choose from available slots and book instantly. You\'ll receive a booking ID immediately.' },
            { step: '04', title: 'Navigate & Park', desc: 'Use the slot details to find your position and park securely.' },
            { step: '05', title: 'Manage & Track', desc: 'Admins monitor the entire system while users view their booking history.' }
          ].map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="flex items-start gap-8 group"
            >
               <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-display font-bold text-xl shadow-lg shadow-indigo-100 shrink-0 group-hover:scale-110 transition-transform">
                  {item.step}
               </div>
               <div className="pt-2">
                  <h3 className="text-2xl font-bold mb-2">{item.title}</h3>
                  <p className="text-slate-600 leading-relaxed max-w-2xl">{item.desc}</p>
               </div>
            </motion.div>
          ))}
       </div>
    </div>
  </div>
);

export const TermsPage = () => (
  <div className="py-20 px-4 flex justify-center">
    <div className="max-w-3xl prose prose-slate">
      <h1 className="text-4xl font-display font-bold mb-8">Terms & Conditions</h1>
      <div className="space-y-8 text-slate-600 leading-relaxed">
        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-4">1. User Responsibilities</h2>
          <p>Users must provide accurate information during registration. You are responsible for maintaining the confidentiality of your account credentials.</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-4">2. Booking Rules</h2>
          <p>Bookings are subject to availability. A confirmed booking guarantees a slot for the specified duration only. Overstaying may incur additional charges.</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-4">3. Cancellation Policy</h2>
          <p>Cancellations must be made at least 30 minutes before the scheduled start time for a full refund (if applicable).</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-4">4. System Usage</h2>
          <p>The SmartPark platform is provided "as is". We reserve the right to modify or terminate service for any user who violates our fair-usage policies.</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-4">5. Data Privacy</h2>
          <p>Your data is protected according to our Privacy Policy. We do not sell your personal information to third parties.</p>
        </section>
      </div>
    </div>
  </div>
);
