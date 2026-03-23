"use client";

export default function RootLoading() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white">
      <div className="relative animate-fade-in flex flex-col items-center">
        {/* CSS Reconstruction of the Carlaville Logo */}
        <div className="flex items-center text-4xl md:text-5xl font-extrabold tracking-tighter text-gray-900 select-none mb-8">
          Carla
          <div className="relative flex items-center justify-center ml-1">
             <div className="w-12 h-12 md:w-16 md:h-16 bg-primary rounded-full absolute"></div>
             <span className="relative text-white z-10">V</span>
          </div>
          ille
        </div>
        
        {/* Loading Progress Bar */}
        <div className="w-48 h-1 bg-gray-100 rounded-full overflow-hidden relative">
          <div className="absolute inset-0 bg-primary w-2/3 rounded-full animate-[loading_1.5s_ease-in-out_infinite]"></div>
        </div>
        
        <p className="mt-4 text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em]">
          Chargement Carlaville
        </p>
      </div>

      <style jsx global>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(0); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
