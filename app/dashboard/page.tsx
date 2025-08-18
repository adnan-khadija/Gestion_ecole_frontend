'use client';


export default  function page() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-4">Dashboard</h1>
      <p className="text-lg text-gray-700">Welcome to the dashboard!</p>
      <div className="mt-8">    
        <img src="/images/logo.png" alt="Logo" className="w-32 h-32 rounded-full shadow-lg" />
      </div>
      <p className="mt-4 text-gray-500">This is a placeholder for your dashboard content.</p>
    </div>
  );
}     
