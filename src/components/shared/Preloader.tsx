
'use client';

import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';

export default function Preloader() {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

    useEffect(() => {
    const timer = setInterval(() => 
      {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          setLoading(false)
          return 100;
        }
        return prev + 1;
      });
    }, 0);

    return () => clearInterval(timer);
  }, []);

  return (
    <div
      className={`fixed inset-0 z-60 flex flex-col items-center justify-center dark:bg-black/80 bg-white/80 backdrop-blur-3xl transition-opacity duration-1000 ${
        loading ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      {/* --- Layered Aurora BG --- */}
      <div className="absolute top-0 left-0 w-full h-[500px] opacity-40 blur-[120px] bg-gradient-to-r dark:from-purple-400/60 from-purple-300/40 via-blue-800/10 dark:to-green-700 to-green-600/70 rounded-full" />
      <div className="absolute bottom-20 right-0 w-[300px] h-[300px] dark:bg-purple-400/30 bg-purple-300/20 blur-[120px] rounded-full" />
                      
       <div className="animate-spin rounded-full h-18 w-18 border-b-3 border-orange-500 mx-auto mb-12"/>


      <div className="flex relative dark:text-white text-black justify-center  [transform:scaleX(1.7)] pointer-events-none  select-none  items-center ">
        <p className='text-4xl font-extrabold text-shadow-md text-shadow-orange-500 bg-clip-text '>SARAGEA</p>
      </div>
        {/* Reflected Mirror */}
       <div  className="mt-[3px] text-xl sect-title font-extrabold flex text-primary opacity-50 pointer-events-none  select-none [transform:scaleX(1.9)_scaleY(-1)] [mask-image:linear-gradient(to_bottom,rgba(0,0,0,0.4),transparent)] ">
         <p className='text-4xl font-extrabold text-shadow-md  bg-clip-text text-shadow-orange-500 animate-pulse  '>SARAGEA</p>
       </div>


          <p className=" absolute bottom-10 dark:text-green-100 text-green-500 pointer-events-none  select-none text-sm">
            {progress < 30 && "Initializing secure connection..."}
            {progress >= 30 && progress < 60 && (
              <span className='flex items-center gap-1 '>Loading AI <Sparkles size={13} className='fill-amber-200 text-amber-400'/> automation systems...</span>
            )}
            {progress >= 60 && progress < 90 && "Securing payments protocols..."}
            {progress >= 90 && "Almost ready..."}
          </p>
    </div>
  );

}
