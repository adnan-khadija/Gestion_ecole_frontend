"use client";

export const LoadingSpinner = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen ">
      {/* Cercle animé */}
      <div className="w-16 h-16 border-4 border-t-[#A52A2A] border-r-[#D4A017] border-b-transparent border-l-transparent rounded-full animate-spin"></div>
      
      {/* Texte */}
      <p className="mt-4 text-lg font-medium text-[#2C2C2C]">Chargement...</p>
    </div>
  );
};
