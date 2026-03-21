"use client";

import { useEffect, useState } from 'react';
import { 
  User as UserIcon, 
  Mail, 
  Shield, 
  Bell, 
  Lock,
  ArrowRight,
  Save,
  Trash2,
  AlertCircle
} from 'lucide-react';

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem('carlaville_user');
    if (userData) setUser(JSON.parse(userData));
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-24 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-1000">
      
      {/* Premium Header */}
      <div className="relative overflow-hidden group">
        <div className="absolute inset-0 bg-neutral-900 rounded-[3.5rem] shadow-2xl">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]"></div>
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-red-600/10 rounded-full blur-[100px] -ml-32 -mb-32"></div>
        </div>

        <div className="relative z-10 p-12 lg:p-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 backdrop-blur-md rounded-full border border-white/10 mb-6 text-white/40">
             <Shield className="w-3 h-3" />
             <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400">Compte Sécurisé</span>
          </div>
          <h1 className="text-6xl font-black text-white tracking-tighter mb-4 leading-tight">Vos <span className="text-red-600">Paramètres</span></h1>
          <p className="text-white/50 text-lg font-medium max-w-xl leading-relaxed">
            Configurez vos préférences personnelles et gérez la sécurité de votre accès Carlaville.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* Profile Section */}
        <div className="lg:col-span-2 space-y-10">
          <section className="bg-white p-10 lg:p-14 rounded-[3.5rem] border border-gray-100 shadow-[0_30px_70px_-20px_rgba(0,0,0,0.06)] relative overflow-hidden group">
            <h2 className="text-3xl font-black text-neutral-900 tracking-tighter mb-10 flex items-center gap-4">
              <UserIcon className="w-8 h-8 text-red-600" />
              Profil Utilisateur
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
               <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-2">Nom Complet</label>
                  <div className="relative">
                     <UserIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                     <input 
                       type="text" 
                       defaultValue={user?.name} 
                       className="w-full pl-16 pr-6 py-5 bg-gray-50 border-none rounded-[1.5rem] focus:ring-2 focus:ring-red-500/20 transition-all font-bold text-neutral-900"
                     />
                  </div>
               </div>
               <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-2">Adresse E-mail</label>
                  <div className="relative">
                     <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                     <input 
                       type="email" 
                       defaultValue={user?.email || 'mon-email@carlaville.ma'} 
                       disabled
                       className="w-full pl-16 pr-6 py-5 bg-gray-100 border-none rounded-[1.5rem] font-bold text-gray-400 cursor-not-allowed"
                     />
                  </div>
               </div>
            </div>

            <div className="mt-14 pt-10 border-t border-gray-50 flex items-center justify-between">
               <p className="text-xs font-medium text-gray-400 max-w-sm">Note : L'adresse e-mail est utilisée pour votre authentification et ne peut être modifiée.</p>
               <button className="bg-neutral-900 text-white font-black px-10 py-5 rounded-2xl flex items-center gap-3 transition-all hover:bg-neutral-800 active:scale-95 shadow-xl">
                  <Save className="w-5 h-5 text-red-600" />
                  Mettre à jour
               </button>
            </div>
          </section>

          <section className="bg-white p-10 lg:p-14 rounded-[3.5rem] border border-gray-100 shadow-[0_30px_70px_-20px_rgba(0,0,0,0.06)]">
            <h2 className="text-3xl font-black text-neutral-900 tracking-tighter mb-10 flex items-center gap-4">
              <Lock className="w-8 h-8 text-neutral-400" />
              Sécurité & Mot de passe
            </h2>
            
            <div className="space-y-8 max-w-md">
               <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-2">Ancien mot de passe</label>
                  <input type="password" placeholder="••••••••" className="w-full px-8 py-5 bg-gray-50 border-none rounded-[1.5rem] focus:ring-2 focus:ring-red-500/20 font-bold" />
               </div>
               <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-2">Nouveau mot de passe</label>
                  <input type="password" placeholder="••••••••" className="w-full px-8 py-5 bg-gray-50 border-none rounded-[1.5rem] focus:ring-2 focus:ring-red-500/20 font-bold" />
               </div>
               <button className="text-[10px] font-black text-red-600 uppercase tracking-[0.3em] flex items-center gap-2 hover:gap-4 transition-all">
                  Changer maintenant <ArrowRight className="w-4 h-4" />
               </button>
            </div>
          </section>
        </div>

        {/* Sidebar Preferences */}
        <div className="space-y-10">
          <div className="bg-neutral-900 p-10 rounded-[3.5rem] shadow-2xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-48 h-48 bg-red-600/10 rounded-full blur-[50px] -mr-24 -mt-24 group-hover:bg-red-600/20 transition-all"></div>
             <h3 className="text-xl font-black text-white tracking-tight mb-8 relative z-10 flex items-center gap-3">
               <Bell className="w-5 h-5 text-red-600" />
               Notifications
             </h3>
             <div className="space-y-6 relative z-10">
                {[
                  { id: 'n1', label: 'Alertes Réservation', desc: 'Confirmations et changements.' },
                  { id: 'n2', label: 'Offres Commerciales', desc: 'Promotions exclusives.' },
                  { id: 'n3', label: 'Service Client', desc: 'Support en temps réel.' }
                ].map(pref => (
                  <label key={pref.id} className="flex items-start justify-between gap-4 cursor-pointer group/item">
                     <div>
                        <p className="text-sm font-black text-white mb-0.5">{pref.label}</p>
                        <p className="text-[10px] text-white/30 font-medium leading-tight">{pref.desc}</p>
                     </div>
                     <input type="checkbox" defaultChecked className="mt-1 w-6 h-6 rounded-lg bg-white/5 border-white/10 text-red-600 focus:ring-red-500/20" />
                  </label>
                ))}
             </div>
          </div>

          <div className="bg-red-50/50 p-10 rounded-[3.5rem] border border-red-100/50">
             <div className="flex items-center gap-4 mb-6">
                <AlertCircle className="w-8 h-8 text-red-600" />
                <h3 className="text-xl font-black text-neutral-900 tracking-tight">Zone de danger</h3>
             </div>
             <p className="text-sm font-medium text-gray-500 mb-8 leading-relaxed">
               La suppression de votre compte est définitive. Toutes vos données seront effacées.
             </p>
             <button className="w-full py-5 rounded-[1.5rem] border-2 border-red-200 text-red-600 font-black text-[10px] uppercase tracking-widest hover:bg-red-600 hover:text-white hover:border-red-600 transition-all shadow-sm flex items-center justify-center gap-3 group">
                <Trash2 className="w-4 h-4 transition-transform group-hover:scale-110" />
                Supprimer mon compte
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
