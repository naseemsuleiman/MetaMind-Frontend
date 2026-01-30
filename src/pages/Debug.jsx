import React, { useEffect } from 'react';

const Debug = () => {
  useEffect(() => {
    console.log('=== DEBUG INFO ===');
    console.log('Local Storage:');
    console.log('admin_token:', localStorage.getItem('admin_token'));
    console.log('admin_data:', localStorage.getItem('admin_data'));
    console.log('access_token:', localStorage.getItem('access_token'));
    console.log('user_data:', localStorage.getItem('user_data'));
    console.log('==================');
  }, []);

  const clearStorage = () => {
    localStorage.clear();
    console.log('Storage cleared');
    window.location.reload();
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Debug Page</h1>
      <button 
        onClick={clearStorage}
        className="bg-red-500 text-white px-4 py-2 rounded"
      >
        Clear Local Storage
      </button>
      <div className="mt-4">
        <p>Check console for localStorage contents</p>
      </div>
    </div>
  );
};

export default Debug;