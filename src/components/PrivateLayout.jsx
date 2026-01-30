// frontend/src/components/PrivateLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom'; // <-- ADD THIS
import Navigation from './Navigation'; // optional sidebar/navigation

const PrivateLayout = () => {
  return (
    <div className="flex min-h-screen">
      <Navigation />
      <main className="flex-1 p-6 bg-background-light">
        {/* Nested private route content will render here */}
        <Outlet />
      </main>
    </div>
  );
};

export default PrivateLayout;

