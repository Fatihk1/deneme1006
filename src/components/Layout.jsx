import React from 'react';
import defaultBg from '../assets/backgrounds/bg2.jpg';

const Layout = ({ children }) => (
  <div
    className="min-h-screen w-full bg-cover bg-center bg-no-repeat bg-fixed"
    style={{ backgroundImage: `url(${defaultBg})` }}
  >
    {children}
  </div>
);

export default Layout;
