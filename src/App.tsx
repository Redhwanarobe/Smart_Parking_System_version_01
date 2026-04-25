/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Car, 
  Search, 
  Calendar, 
  Clock, 
  History, 
  MessageSquare, 
  LayoutDashboard, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  ShieldCheck, 
  MapPin,
  CheckCircle2,
  BarChart3,
  Users,
  Database
} from 'lucide-react';

import { AppProvider, useApp } from './AppContext';
import { cn } from './lib/utils';
import { 
  AboutPage, 
  FeaturesPage, 
  HowItWorksPage, 
  TermsPage 
} from './InfoPages';
import { 
  LoginPage, 
  SignUpPage 
} from './AuthPages';
import UserDashboard from './UserDashboard';
import AdminDashboard from './AdminDashboard';

// --- Components ---

const ProtectedRoute = ({ children, adminOnly = false }: { children: React.ReactNode, adminOnly?: boolean }) => {
  const { currentUser, loading } = useApp();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!loading) {
      if (!currentUser) {
        navigate('/login');
      } else if (adminOnly) {
        // Double check admin status by email or role
        const isAdmin = currentUser.role === 'admin' || currentUser.email === 'admin@gmail.com';
        if (!isAdmin) {
          navigate('/dashboard');
        }
      }
    }
  }, [currentUser, loading, navigate, adminOnly]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <motion.div 
          animate={{ rotate: 360 }} 
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
        >
          <Clock className="w-10 h-10 text-indigo-600" />
        </motion.div>
      </div>
    );
  }

  if (!currentUser) return null;
  
  if (adminOnly) {
    const isAdmin = currentUser.role === 'admin' || currentUser.email === 'admin@gmail.com';
    if (!isAdmin) return null;
  }

  return <>{children}</>;
};

const Navbar = () => {
  const { currentUser, logout } = useApp();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = React.useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-bottom border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="p-2 bg-indigo-600 rounded-lg group-hover:bg-indigo-700 transition-colors">
              <Car className="w-6 h-6 text-white" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight">SmartPark</span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <Link to="/" className="hover:text-indigo-600 transition-colors">Home</Link>
            <Link to="/features" className="hover:text-indigo-600 transition-colors">Features</Link>
            <Link to="/how-it-works" className="hover:text-indigo-600 transition-colors">How it Works</Link>
            <Link to="/about" className="hover:text-indigo-600 transition-colors">About</Link>
            
            {currentUser ? (
              <div className="flex items-center gap-4 ml-4 pl-4 border-l border-slate-200">
                 {(currentUser.role === 'admin' || currentUser.email === 'admin@gmail.com') && (
                   <Link 
                     to="/admin" 
                     className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full hover:bg-indigo-100 transition-colors"
                   >
                     <ShieldCheck className="w-4 h-4" />
                     <span>Admin Panel</span>
                   </Link>
                 )}
                 <Link 
                    to={(currentUser.role === 'admin' || currentUser.email === 'admin@gmail.com') ? "/admin" : "/dashboard"} 
                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Dashboard</span>
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                    title="Logout"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
              </div>
            ) : (
              <div className="flex items-center gap-4 ml-4">
                <Link to="/login" className="px-4 py-2 hover:text-indigo-600 transition-colors">Login</Link>
                <Link to="/signup" className="px-6 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-all font-semibold shadow-lg shadow-indigo-200">
                  Sign Up Free
                </Link>
              </div>
            )}
          </div>

          <div className="md:hidden flex items-center">
             <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-slate-600">
                {isOpen ? <X /> : <Menu />}
             </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-bottom border-slate-200 overflow-hidden"
          >
            <div className="px-4 py-6 space-y-4 flex flex-col items-center">
              <Link to="/" onClick={() => setIsOpen(false)} className="text-lg font-medium">Home</Link>
              <Link to="/features" onClick={() => setIsOpen(false)} className="text-lg font-medium">Features</Link>
              <Link to="/how-it-works" onClick={() => setIsOpen(false)} className="text-lg font-medium">How it Works</Link>
              <Link to="/about" onClick={() => setIsOpen(false)} className="text-lg font-medium">About</Link>
              {currentUser ? (
                <>
                  {(currentUser.role === 'admin' || currentUser.email === 'admin@gmail.com') && (
                    <Link to="/admin" onClick={() => setIsOpen(false)} className="text-lg font-medium text-amber-600">Admin Panel</Link>
                  )}
                  <Link to={(currentUser.role === 'admin' || currentUser.email === 'admin@gmail.com') ? "/admin" : "/dashboard"} onClick={() => setIsOpen(false)} className="text-lg font-medium text-indigo-600">Dashboard</Link>
                  <button onClick={handleLogout} className="text-lg font-medium text-red-500">Logout</button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setIsOpen(false)} className="text-lg font-medium">Login</Link>
                  <Link to="/signup" onClick={() => setIsOpen(false)} className="w-full text-center py-3 bg-indigo-600 text-white rounded-xl font-bold">Sign Up Free</Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const Footer = () => (
  <footer className="bg-slate-900 text-slate-400 py-12 px-4">
    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
      <div className="col-span-1 md:col-span-1">
        <div className="flex items-center gap-2 text-white mb-6">
          <Car className="w-6 h-6 text-indigo-400" />
          <span className="font-display font-bold text-xl tracking-tight">SmartPark</span>
        </div>
        <p className="text-sm leading-relaxed">
          Revolutionizing the way you park. Find, book, and manage your parking slots instantly with our AI-powered smart system.
        </p>
      </div>
      <div>
        <h4 className="text-white font-bold mb-6">Product</h4>
        <ul className="space-y-4 text-sm">
          <li><Link to="/features" className="hover:text-white transition-colors">Features</Link></li>
          <li><Link to="/how-it-works" className="hover:text-white transition-colors">How it works</Link></li>
          <li><Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
        </ul>
      </div>
      <div>
        <h4 className="text-white font-bold mb-6">Company</h4>
        <ul className="space-y-4 text-sm">
          <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
          <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
          <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
        </ul>
      </div>
      <div>
        <h4 className="text-white font-bold mb-6">Newsletter</h4>
        <p className="text-sm mb-4">Stay updated with our latest news and features.</p>
        <div className="flex gap-2">
          <input 
            type="email" 
            placeholder="Email address" 
            className="flex-1 bg-slate-800 border-none rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500" 
          />
          <button className="bg-indigo-600 text-white rounded-lg px-4 py-2 text-sm font-bold hover:bg-indigo-700 transition-colors">
            Join
          </button>
        </div>
      </div>
    </div>
    <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-slate-800 text-center text-xs">
      &copy; {new Date().getFullYear()} SmartPark. All rights reserved.
    </div>
  </footer>
);

// --- Pages ---

// Split these out later if they get big
const Home = () => (
  <div>
    {/* Hero Section */}
    <section className="relative overflow-hidden pt-20 pb-32 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <motion.div
           initial={{ opacity: 0, x: -50 }}
           animate={{ opacity: 1, x: 0 }}
           transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
             <ShieldCheck className="w-4 h-4" />
             Smart parking System
          </div>
          <h1 className="text-6xl md:text-7xl font-display font-bold leading-[1.1] text-slate-900 mb-8">
            Park Smarter, <br/><span className="text-indigo-600">Not Harder.</span>
          </h1>
          <p className="text-xl text-slate-600 mb-10 leading-relaxed max-w-lg">
            Real-time availability, instant bookings, and seamless navigation. 
            Join thousands of users who have upgraded their parking experience.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/dashboard/search" className="px-8 py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 hover:-translate-y-1 text-center">
              Start Booking Now
            </Link>
            <Link to="/how-it-works" className="px-8 py-4 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-lg hover:bg-slate-50 transition-all shadow-sm text-center">
              Learn More
            </Link>
          </div>
          
          <div className="mt-12 flex items-center gap-6 saturate-0 opacity-50">
             <div className="flex flex-col">
                <span className="font-display font-black text-2xl">50k+</span>
                <span className="text-[10px] uppercase font-bold tracking-widest">Active Users</span>
             </div>
             <div className="w-px h-10 bg-slate-200" />
             <div className="flex flex-col">
                <span className="font-display font-black text-2xl">100+</span>
                <span className="text-[10px] uppercase font-bold tracking-widest">Premium Locations</span>
             </div>
             <div className="w-px h-10 bg-slate-200" />
             <div className="flex flex-col">
                <span className="font-display font-black text-2xl">99.9%</span>
                <span className="text-[10px] uppercase font-bold tracking-widest">Uptime</span>
             </div>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.8 }}
          className="relative"
        >
          <div className="relative z-10 bg-white p-4 rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
             <img 
               src="https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&q=80&w=1200" 
               alt="Smart Parking" 
               className="rounded-2xl w-full aspect-[4/3] object-cover"
               referrerPolicy="no-referrer"
             />
             <div className="absolute top-8 right-8 bg-indigo-600 text-white p-6 rounded-2xl shadow-xl animate-bounce">
                <div className="flex flex-col items-center">
                   <CheckCircle2 className="w-8 h-8 mb-2" />
                   <span className="text-xs font-bold uppercase">Slot Verified</span>
                </div>
             </div>
          </div>
          <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-indigo-200/50 rounded-full blur-3xl -z-10" />
          <div className="absolute -top-10 -right-10 w-64 h-64 bg-slate-200/50 rounded-full blur-3xl -z-10" />
        </motion.div>
      </div>
    </section>

    {/* Benefits / Features */}
    <section className="py-24 bg-white border-y border-slate-100 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
           <h2 className="text-4xl font-display font-bold mb-4">Master Your Movement</h2>
           <p className="text-slate-500 max-w-2xl mx-auto">Our platform provides end-to-end solutions for modern urban parking challenges.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: Search, title: 'Real-time Search', text: 'Instantly find available parking slots near your destination with live updates.' },
            { icon: Clock, title: 'Instant Booking', text: 'Secure your spot in seconds. No more driving around in circles looking for space.' },
            { icon: BarChart3, title: 'Smart Analytics', text: 'Admins get deep insights into lot usage, revenue, and peak hour trends.' }
          ].map((item, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -8 }}
              className="p-8 rounded-3xl bg-slate-50 border border-slate-100"
            >
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm mb-6">
                <item.icon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-4">{item.title}</h3>
              <p className="text-slate-600 leading-relaxed">{item.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* CTA section */}
    <section className="py-24 px-4">
       <div className="max-w-5xl mx-auto bg-slate-900 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">Ready to redefine your commute?</h2>
            <p className="text-slate-400 text-lg mb-10 max-w-2xl mx-auto">
              Join the future of urban mobility today. SmartPark is free to start for individual users.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
               <Link to="/dashboard" className="px-10 py-4 bg-white text-slate-900 rounded-xl font-black hover:bg-slate-100 transition-all">Go to Dasboard</Link>
            </div>
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-indigo-600/10 blur-[100px]" />
       </div>
    </section>
  </div>
);

// Main App Component with Providers
export default function App() {
  return (
    <AppProvider>
      <Router>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1">
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={<Home />} />
                
                {/* Auth Routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignUpPage />} />

                {/* Info Pages */}
                <Route path="/about" element={<AboutPage />} />
                <Route path="/features" element={<FeaturesPage />} />
                <Route path="/how-it-works" element={<HowItWorksPage />} />
                <Route path="/terms" element={<TermsPage />} />

                {/* Dashboard Routes */}
                <Route 
                  path="/dashboard/*" 
                  element={
                    <ProtectedRoute>
                      <UserDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/*" 
                  element={
                    <ProtectedRoute adminOnly>
                      <AdminDashboard />
                    </ProtectedRoute>
                  } 
                />
              </Routes>
            </AnimatePresence>
          </main>
          <Footer />
        </div>
      </Router>
    </AppProvider>
  );
}
