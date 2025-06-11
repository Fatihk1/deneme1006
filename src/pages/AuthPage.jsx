import React, { useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import bg2 from '../assets/backgrounds/bg2.jpg';

const userTypeLabels = {
  employer: 'İşveren veya İşveren Vekili',
  expert: 'ISG Uzmanı',
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const EyeIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} width={22} height={22}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12s3.75-7.5 9.75-7.5 9.75 7.5 9.75 7.5-3.75 7.5-9.75 7.5S2.25 12 2.25 12z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
  </svg>
);

const AuthPage = () => {
  const [showRegister, setShowRegister] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const initialUserType = location.state?.userType || 'employer';
  const [userType, setUserType] = useState(initialUserType);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [shake, setShake] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Refs for focus
  const nameRef = useRef();
  const emailRef = useRef();
  const phoneRef = useRef();
  const passwordRef = useRef();
  const password2Ref = useRef();

  // Validations
  const isPhoneValid = /^5\d{2} \d{3} \d{2} \d{2}$/.test(phone);
  const isEmailValid = emailRegex.test(email);
  const isPasswordValid = password.length >= 4;
  const isPasswordMatch = password === password2 && password2.length > 0;
  const isNameValid = name.trim().length > 2;

  const isFormValid = isNameValid && isEmailValid && isPhoneValid && isPasswordValid && isPasswordMatch;

  // Titreme ve focus fonksiyonu
  const triggerShake = (field) => {
    setShake((prev) => ({ ...prev, [field]: true }));
    setTimeout(() => setShake((prev) => ({ ...prev, [field]: false })), 500);
    switch (field) {
      case 'name': nameRef.current?.focus(); break;
      case 'email': emailRef.current?.focus(); break;
      case 'phone': phoneRef.current?.focus(); break;
      case 'password': passwordRef.current?.focus(); break;
      case 'password2': password2Ref.current?.focus(); break;
      default: break;
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!isNameValid) return triggerShake('name');
    if (!isEmailValid) return triggerShake('email');
    if (!isPhoneValid) return triggerShake('phone');
    if (!isPasswordValid) return triggerShake('password');
    if (!isPasswordMatch) return triggerShake('password2');

    try {
      setLoading(true);
      setError(null);

      // Telefon numarası daha önce kullanılmış mı kontrol et
      const { data: phoneExists, error: phoneCheckError } = await supabase
        .from('users')
        .select('id')
        .eq('phone', phone)
        .maybeSingle();
      if (phoneExists) {
        setError('Bu telefon numarası ile zaten bir hesap var.');
        setLoading(false);
        return;
      }
      if (phoneCheckError) throw phoneCheckError;

      // Supabase Auth ile kayıt
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            phone,
            user_type: userType
          }
        }
      });

      if (authError) throw authError;

      // Users tablosuna kullanıcı bilgilerini ekle
      const { error: profileError } = await supabase
        .from('users')
        .insert([
          {
            id: authData.user.id,
            name,
            email,
            phone,
            user_type: userType
          }
        ]);

      if (profileError) throw profileError;

      alert('Kayıt başarılı! Artık giriş yapabilirsiniz.');
      setShowRegister(false);
    } catch (error) {
      setError(error.message);
      console.error('Kayıt hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      // Başarılı giriş sonrası yönlendirme
      navigate('/dashboard');
    } catch (error) {
      setError(error.message);
      console.error('Giriş hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  // Telefon inputunda sadece rakam kabul et ve otomatik boşluk ekle (3-3-2-2 blok)
  const handlePhoneChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 10) value = value.slice(0, 10);
    let formatted = '';
    if (value.length > 0) formatted += value.slice(0, 3);
    if (value.length > 3) formatted += ' ' + value.slice(3, 6);
    if (value.length > 6) formatted += ' ' + value.slice(6, 8);
    if (value.length > 8) formatted += ' ' + value.slice(8, 10);
    setPhone(formatted);
  };

  // Border renklerini belirle
  const getInputBorder = (valid, value, field) => {
    if (value.length === 0) return 'border-gray-300';
    if (valid) return 'border-green-500';
    if (shake[field]) return 'border-red-500 animate-shake';
    return 'border-red-500';
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        backgroundImage: `url(${bg2})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="bg-white/30 p-8 rounded-2xl shadow-2xl w-full max-w-md" style={{backdropFilter: 'blur(8px)'}}>
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        {!showRegister ? (
          <>
            <h2 className="text-2xl font-bold text-center mb-6">Giriş Yap</h2>
            <form className="space-y-4" onSubmit={handleLogin}>
              <input
                type="email"
                placeholder="E-posta"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Şifre"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 pr-10"
                  required
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 p-0 m-0 bg-transparent border-none outline-none focus:outline-none focus:ring-0 focus:border-none"
                  tabIndex={-1}
                  onMouseDown={() => setShowPassword(true)}
                  onMouseUp={() => setShowPassword(false)}
                  onMouseLeave={() => setShowPassword(false)}
                  style={{ background: 'none', boxShadow: 'none', outline: 'none', border: 'none' }}
                >
                  <EyeIcon />
                </button>
              </div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition duration-200 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
              </button>
            </form>
            <div className="mt-6 flex justify-between items-center">
              <button
                className="text-gray-600 hover:underline font-semibold"
                onClick={() => navigate('/')}
              >
                Geri
              </button>
              <span>
                Hesabınız yok mu?
                <button
                  className="ml-2 text-blue-600 hover:underline font-semibold"
                  onClick={() => setShowRegister(true)}
                >
                  Kayıt Ol
                </button>
              </span>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-center mb-6">Kayıt Ol</h2>
            <form className="space-y-4" onSubmit={handleRegister} autoComplete="off">
              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-1">Kullanıcı Tipi</label>
                <select
                  className="w-full px-4 py-2 border rounded-lg bg-gray-100 text-gray-700 font-bold border-gray-300"
                  value={userType}
                  onChange={e => setUserType(e.target.value)}
                >
                  <option value="employer">İşveren veya İşveren Vekili</option>
                  <option value="expert">ISG Uzmanı</option>
                </select>
              </div>
              <input
                ref={nameRef}
                type="text"
                placeholder="Ad Soyad"
                value={name}
                onChange={e => setName(e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none ${getInputBorder(isNameValid, name, 'name')}`}
              />
              <input
                ref={emailRef}
                type="email"
                placeholder="E-posta"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none ${getInputBorder(isEmailValid, email, 'email')}`}
              />
              <div className="flex items-center gap-2">
                <span className="px-3 py-2 bg-gray-200 border border-gray-300 rounded-l-lg select-none">+90</span>
                <input
                  ref={phoneRef}
                  type="text"
                  placeholder="5xx xxx xx xx"
                  value={phone}
                  onChange={handlePhoneChange}
                  maxLength={13}
                  className={`w-full px-4 py-2 border rounded-r-lg focus:outline-none ${getInputBorder(isPhoneValid, phone, 'phone')}`}
                />
              </div>
              <div className="relative">
                <input
                  ref={passwordRef}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Şifre (en az 4 karakter)"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none pr-10 ${getInputBorder(isPasswordValid, password, 'password')}`}
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 p-0 m-0 bg-transparent border-none outline-none focus:outline-none focus:ring-0 focus:border-none"
                  tabIndex={-1}
                  onMouseDown={() => setShowPassword(true)}
                  onMouseUp={() => setShowPassword(false)}
                  onMouseLeave={() => setShowPassword(false)}
                  style={{ background: 'none', boxShadow: 'none', outline: 'none', border: 'none' }}
                >
                  <EyeIcon />
                </button>
              </div>
              <div className="relative">
                <input
                  ref={password2Ref}
                  type={showPassword2 ? 'text' : 'password'}
                  placeholder="Şifre Tekrar"
                  value={password2}
                  onChange={e => setPassword2(e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none pr-10 ${getInputBorder(isPasswordMatch, password2, 'password2')}`}
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 p-0 m-0 bg-transparent border-none outline-none focus:outline-none focus:ring-0 focus:border-none"
                  tabIndex={-1}
                  onMouseDown={() => setShowPassword2(true)}
                  onMouseUp={() => setShowPassword2(false)}
                  onMouseLeave={() => setShowPassword2(false)}
                  style={{ background: 'none', boxShadow: 'none', outline: 'none', border: 'none' }}
                >
                  <EyeIcon />
                </button>
              </div>
              <button
                type="submit"
                className={`w-full py-2 rounded-lg font-semibold transition duration-200 ${isFormValid ? 'bg-green-600 hover:bg-green-700 text-white cursor-pointer' : 'bg-gray-300 text-gray-400 cursor-not-allowed'}`}
                disabled={!isFormValid}
                onClick={e => {
                  if (!isFormValid) {
                    e.preventDefault();
                    if (!isNameValid) return triggerShake('name');
                    if (!isEmailValid) return triggerShake('email');
                    if (!isPhoneValid) return triggerShake('phone');
                    if (!isPasswordValid) return triggerShake('password');
                    if (!isPasswordMatch) return triggerShake('password2');
                  }
                }}
              >
                Kayıt Ol
              </button>
            </form>
            <div className="mt-6 text-center">
              <button
                className="text-gray-600 hover:underline font-semibold"
                onClick={() => setShowRegister(false)}
              >
                Geri Dön
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// Tailwind animate-shake
// tailwind.config.js dosyanıza ekleyin:
// module.exports = { ... , theme: { extend: { keyframes: { shake: { '0%, 100%': { transform: 'translateX(0)' }, '20%, 60%': { transform: 'translateX(-8px)' }, '40%, 80%': { transform: 'translateX(8px)' }, }, }, }, animation: { shake: 'shake 0.5s', }, }, }, ... }

export default AuthPage; 