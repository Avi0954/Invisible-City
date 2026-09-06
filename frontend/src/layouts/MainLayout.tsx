import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../components/common/Header';
import { Footer } from '../components/common/Footer';

export const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-surface font-body-md text-body-md text-on-surface antialiased selection:bg-secondary-container selection:text-on-secondary-container">
      <Header />
      <main className="w-full pt-16 bg-surface flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};


