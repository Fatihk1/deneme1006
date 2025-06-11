import React from 'react';
import { useNavigate } from 'react-router-dom';
import bg1 from '../assets/backgrounds/bg1.jpg';

const UserTypeSelection = () => {
  const navigate = useNavigate();

  const handleUserTypeSelect = (userType) => {
    navigate('/auth', { state: { userType } });
  };

  return (
    <div
      className="min-h-screen w-full flex items-start justify-center"
      style={{
        backgroundImage: `url(${bg1})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div
        className="flex flex-col items-center w-full"
        style={{
          marginTop: '20vh',
        }}
      >
        <div
          className="rounded-2xl bg-white/30 backdrop-blur-md p-6 mb-0 flex flex-col items-center"
          style={{
            width: '80vw',
            maxWidth: 600,
          }}
        >
          <h1 className="text-3xl font-extrabold text-center mb-4 text-gray-800 tracking-tight">
            ISG Sende'ye Hoş Geldiniz
          </h1>
          <p className="text-gray-700 text-center text-lg">
            Lütfen kullanıcı tipinizi seçin
          </p>
        </div>
        <div style={{ height: '5vh' }} />
        <div className="space-y-4 flex flex-col items-center w-full">
          <button
            onClick={() => handleUserTypeSelect('employer')}
            className="py-4 px-6 bg-gray-500/85 hover:bg-gray-600/90 text-white rounded-2xl border border-gray-400 shadow-md font-bold text-xl flex items-center justify-center transition-all duration-300"
            style={{ width: '60vw', maxWidth: 400 }}
          >
            <span className="mr-2">👨‍💼</span>
            İşveren veya İşveren Vekili
          </button>
          <button
            onClick={() => handleUserTypeSelect('expert')}
            className="py-4 px-6 bg-gray-500/85 hover:bg-gray-600/90 text-white rounded-2xl border border-gray-400 shadow-md font-bold text-xl flex items-center justify-center transition-all duration-300"
            style={{ width: '60vw', maxWidth: 400 }}
          >
            <span className="mr-2">👨‍🔬</span>
            ISG Uzmanı
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserTypeSelection; 