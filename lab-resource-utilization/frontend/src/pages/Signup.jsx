import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const Signup = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState('register'); // 'register' | 'verify-otp'
  
  // Step 1: Registration
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'RESEARCHER'
  });
  
  // Step 2: OTP Verification
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState('');
  const [displayOtp, setDisplayOtp] = useState(''); // For showing OTP on page
  
  // UI States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [otpTimer, setOtpTimer] = useState(0);
  const [canResend, setCanResend] = useState(false);

  const roles = ['RESEARCHER', 'LAB_MANAGER', 'LAB_TECHNICIAN', 'DEPARTMENT_HEAD', 'INSTITUTION_ADMIN'];

  // Handle registration form input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  // Step 1: Request OTP
  const handleSignupRequest = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validate password before sending
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      setError('Password must contain: 8+ chars, uppercase, lowercase, number, special character');
      setLoading(false);
      return;
    }

    try {
      const response = await api.post('/auth/signup', formData);
      setEmail(formData.email);
      setStep('verify-otp');
      
      // Store OTP for display
      console.log('📡 FULL Response:', JSON.stringify(response.data, null, 2));
      console.log('🔑 Response keys:', Object.keys(response.data));
      console.log('📦 otp_for_testing value:', response.data.otp_for_testing);
      console.log('📦 otp_for_testing type:', typeof response.data.otp_for_testing);
      
      if (response.data.otp_for_testing) {
        console.log('✅ OTP FOUND - Setting state to:', response.data.otp_for_testing);
        setDisplayOtp(response.data.otp_for_testing);
      } else {
        console.log('❌ OTP NOT FOUND in response');
      }
      
      setSuccess('');
      
    } catch (err) {
      console.log('❌ ERROR Response:', err.response?.data);
      console.log('Error status:', err.response?.status);
      // Still proceed even if email fails
      setSuccess('');
      setEmail(formData.email);
      setStep('verify-otp');
      
      // Store OTP for display (if available in response)
      if (err.response?.data?.otp_for_testing) {
        console.log('✅ OTP FOUND IN ERROR - Setting state to:', err.response.data.otp_for_testing);
        setDisplayOtp(err.response.data.otp_for_testing);
      } else {
        console.log('❌ OTP NOT IN ERROR RESPONSE');
      }
      // Start timer even if email fails
      setOtpTimer(60);
      setCanResend(false);
      const timer = setInterval(() => {
        setOtpTimer(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (otp.length !== 6) {
      setError('OTP must be 6 digits');
      setLoading(false);
      return;
    }

    try {
      const response = await api.post('/auth/signup/verify', {
        email: email,
        otp: otp
      });

      setSuccess('Account created successfully! Redirecting to login...');
      setDisplayOtp(''); // Clear the OTP from display once verified
      
      // Store token temporarily to show welcome message
      localStorage.setItem('welcomeUser', response.data.name);
      
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/signup/resend', { email });
      console.log('Resend Response:', response.data);
      if (response.data.otp_for_testing) {
        console.log('Setting displayOtp to NEW OTP:', response.data.otp_for_testing);
        setDisplayOtp(response.data.otp_for_testing); // Set new OTP
      }
      setSuccess('');
      setOtp(''); // Clear old OTP input
      setOtpTimer(60);
      setCanResend(false);

      const timer = setInterval(() => {
        setOtpTimer(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      console.log('Resend Error Response:', err.response?.data);
      setSuccess('');
      if (err.response?.data?.otp_for_testing) {
        console.log('Setting displayOtp from error to NEW OTP:', err.response.data.otp_for_testing);
        setDisplayOtp(err.response.data.otp_for_testing); // Set new OTP from error response
      }
      setOtp(''); // Clear old OTP input
      setOtpTimer(60);
      setCanResend(false);

      const timer = setInterval(() => {
        setOtpTimer(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } finally {
      setLoading(false);
    }
  };

  // Go back to registration
  const handleBackToRegistration = () => {
    setStep('register');
    setOtp('');
    setError('');
    setSuccess('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f23] via-[#1a0033] to-[#0f0f23] text-white p-4 md:p-12 font-sans flex items-center justify-center">
      <div className="w-full max-w-md">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-2">
            <span className="bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
              Lab Resource
            </span>
          </h1>
          <p className="text-gray-400">Create your account to get started</p>
        </div>

        {/* Card */}
        <div className="bg-[#12131a] border border-white/[0.08] rounded-2xl p-8 shadow-2xl">
          
          {/* Step Indicator */}
          <div className="flex gap-2 mb-8">
            <div className={`flex-1 h-2 rounded-full transition-all ${step === 'register' ? 'bg-purple-600' : 'bg-white/20'}`}></div>
            <div className={`flex-1 h-2 rounded-full transition-all ${step === 'verify-otp' ? 'bg-purple-600' : 'bg-white/20'}`}></div>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-sm flex gap-2">
              <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>{success}</span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm flex gap-2">
              <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Step 1: Registration */}
          {step === 'register' && (
            <form onSubmit={handleSignupRequest} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                  required
                  className="w-full bg-[#181922] border border-white/[0.08] rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none text-white placeholder-gray-600 transition"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="john@example.com"
                  required
                  className="w-full bg-[#181922] border border-white/[0.08] rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none text-white placeholder-gray-600 transition"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter password"
                  required
                  className="w-full bg-[#181922] border border-white/[0.08] rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none text-white placeholder-gray-600 transition"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Example: <span className="text-gray-400">Test@1234</span> (Min 8 chars, uppercase, lowercase, number, special character)
                </p>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full bg-[#181922] border border-white/[0.08] rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none text-white transition"
                >
                  {roles.map(r => (
                    <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={loading || !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/.test(formData.password)}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sending OTP...
                  </>
                ) : (
                  'Continue'
                )}
              </button>
            </form>
          )}

          {/* Step 2: OTP Verification */}
          {step === 'verify-otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              {/* Display OTP for testing - ALWAYS SHOW IF AVAILABLE */}
              {displayOtp ? (
                <div className="bg-blue-900/20 border border-blue-500/50 p-4 rounded-lg text-center mb-4">
                  <p className="text-blue-200 text-2xl font-mono font-bold tracking-widest">{displayOtp}</p>
                  <p className="text-blue-300 text-sm mt-2">OTP sent</p>
                </div>
              ) : otpTimer === 0 ? (
                <div className="bg-red-900/20 border border-red-500/50 p-4 rounded-lg text-center mb-4">
                  <p className="text-red-300 text-sm">OTP expired - Click "Resend OTP" to get a new one</p>
                </div>
              ) : (
                <div className="bg-yellow-900/20 border border-yellow-500/50 p-4 rounded-lg text-center mb-4">
                  <p className="text-yellow-300 text-sm">⚠️ No OTP received - Check browser console (F12) for debugging</p>
                </div>
              )}

              <div>
                <label className="block text-sm text-gray-400 mb-2">Enter OTP</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.slice(0, 6))}
                  placeholder="000000"
                  maxLength="6"
                  required
                  className="w-full bg-[#181922] border border-white/[0.08] rounded-lg px-4 py-3 text-2xl text-center font-mono tracking-widest focus:ring-2 focus:ring-purple-500 focus:outline-none text-white placeholder-gray-600 transition"
                />
              </div>

              <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-lg text-center">
                <p className="text-amber-400 text-sm">
                  Enter the 6-digit OTP sent to your email
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify & Create Account'
                )}
              </button>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleBackToRegistration}
                  className="w-full bg-white/[0.05] hover:bg-white/[0.1] text-white font-semibold py-3 rounded-lg transition"
                >
                  Back
                </button>
              </div>
            </form>
          )}

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-white/[0.08] text-center">
            <p className="text-gray-400 text-sm">
              Already have an account? <Link to="/login" className="text-purple-400 hover:text-purple-300 font-semibold transition">Login</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
