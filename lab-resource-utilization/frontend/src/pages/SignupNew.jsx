import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const SignupNew = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState('email'); // 'email' | 'otp' | 'password'
  
  // Step 1: Email
  const [email, setEmail] = useState('');
  
  // Step 2: OTP Verification
  const [otp, setOtp] = useState('');
  const [displayOtp, setDisplayOtp] = useState(''); // For testing
  const [countdown, setCountdown] = useState(0);
  const [otpExpiryTimer, setOtpExpiryTimer] = useState(0);
  
  // Step 3: Password & Profile
  const [fullName, setFullName] = useState('');
  const [universityId, setUniversityId] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('');
  const [institution, setInstitution] = useState('');
  const [role, setRole] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // UI States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Countdown timer for resend OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Countdown timer for OTP expiry
  useEffect(() => {
    if (otpExpiryTimer > 0) {
      const timer = setTimeout(() => setOtpExpiryTimer(otpExpiryTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpExpiryTimer]);

  // Email validation
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Password validation
  const isValidPassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };

  // Step 1: Validate email and send OTP to email
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const trimmedEmail = email.trim().toLowerCase();

    if (!isValidEmail(trimmedEmail)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    try {
      const availabilityResponse = await api.post('/auth/check-email', { email: trimmedEmail });
      if (availabilityResponse.data?.available === false) {
        setError('This email is already in use.');
        setLoading(false);
        return;
      }

      const response = await api.post('/auth/send-verification-otp', { email: trimmedEmail });

      setEmail(trimmedEmail);
      setStep('otp');
      setDisplayOtp(response.data.otp_for_testing || ''); // For development
      setCountdown(30); // 30-second countdown
      setOtpExpiryTimer(300); // 5-minute expiry countdown
      setSuccess('OTP sent to your email');

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      if (err.response?.status === 409 || err.response?.data?.message?.includes('already in use')) {
        setError('This email is already in use.');
      } else {
        setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (otp.length !== 6) {
      setError('OTP must be 6 digits');
      setLoading(false);
      return;
    }

    try {
      // Verify OTP (just check, don't create account yet)
      await api.post('/auth/verify-otp-only', {
        email: email,
        otp: otp
      });
      
      setStep('password');
      setSuccess('Email verified! Please set your password');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      const serverMessage = err.response?.data?.message || '';
      if (serverMessage.toLowerCase().includes('expired')) {
        setError('OTP has expired. Please request a new OTP.');
      } else if (serverMessage.toLowerCase().includes('invalid')) {
        setError('Invalid OTP. Please try again.');
      } else {
        setError(serverMessage || 'Failed to verify OTP. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (countdown > 0) return;
    
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/send-verification-otp', { email });
      
      setDisplayOtp(response.data.otp_for_testing || '');
      setOtp('');
      setCountdown(30);
      setOtpExpiryTimer(300);
      setSuccess('New OTP sent to your email');
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Create account with password
  const handleCreateAccount = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validate password
    if (!isValidPassword(password)) {
      setError('Password must be at least 8 characters with uppercase, lowercase, number, and special character');
      setLoading(false);
      return;
    }

    // Validate password match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      // Create account
      const response = await api.post('/auth/signup/complete', {
        email,
        password,
        name: fullName,
        universityId,
        age: age ? parseInt(age) : null,
        gender,
        phone,
        department,
        institution,
        role
      });

      setSuccess('Account created successfully! Redirecting to login...');
      
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
    } catch (err) {
      const serverMessage = err.response?.data?.message || err.response?.data?.error;
      const fieldErrors = err.response?.data?.errors;
      if (fieldErrors && typeof fieldErrors === 'object') {
        const firstField = Object.values(fieldErrors)[0];
        setError(firstField || serverMessage || 'Failed to create account. Please try again.');
      } else {
        setError(serverMessage || 'Failed to create account. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Navigation handlers
  const handleBackFromOtp = () => {
    setStep('email');
    setOtp('');
    setDisplayOtp('');
    setCountdown(0);
    setOtpExpiryTimer(0);
    setError('');
    setSuccess('');
  };

  const handleBackFromPassword = () => {
    setStep('otp');
    setPassword('');
    setConfirmPassword('');
    setError('');
    setSuccess('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0d0e12] px-4 md:p-12 relative overflow-hidden font-sans text-white">
      {/* Background Neon Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-purple-900/20 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-violet-900/20 blur-[120px] pointer-events-none"></div>
      <div className={`w-full relative z-10 transition-all duration-500 ${step === 'password' ? 'max-w-2xl' : 'max-w-md'}`}>
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-2">
            <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
              Lab Resource
            </span>
          </h1>
          <p className="text-gray-400">Create your account to get started</p>
        </div>

        {/* Card */}
        <div className="bg-white/[0.03] backdrop-blur-md border border-white/[0.08] rounded-2xl p-8 shadow-2xl transition-all duration-300 hover:border-purple-500/30">
          
          {/* Back Button */}
          <div className="mb-6">
            <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-white/10 transition-all w-fit">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Home
            </Link>
          </div>

          {/* Step Indicator */}
          <div className="flex gap-2 mb-8">
            <div className={`flex-1 h-2 rounded-full transition-all ${['email', 'otp', 'password'].includes(step) ? 'bg-purple-600' : 'bg-white/20'}`}></div>
            <div className={`flex-1 h-2 rounded-full transition-all ${['otp', 'password'].includes(step) ? 'bg-purple-600' : 'bg-white/20'}`}></div>
            <div className={`flex-1 h-2 rounded-full transition-all ${step === 'password' ? 'bg-purple-600' : 'bg-white/20'}`}></div>
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

          {/* Step 1: Email Entry */}
          {step === 'email' && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  placeholder="john@example.com"
                  required
                  className="w-full bg-[#181922] border border-white/[0.08] rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none text-white placeholder-gray-600 transition"
                />
              </div>

              <p className="text-gray-500 text-xs">
                We'll send a verification code to confirm your email address
              </p>

              <button
                type="submit"
                disabled={loading || !email}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all duration-300 shadow-lg shadow-purple-500/20 active:scale-[0.98] disabled:opacity-50 cursor-pointer text-center flex items-center justify-center gap-2"
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
          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="mb-4 p-3 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-lg text-sm text-center">
                <p className="font-mono">{email}</p>
              </div>

              {/* Display OTP for testing */}
              {displayOtp && (
                <div className="bg-blue-900/20 border border-blue-500/50 p-4 rounded-lg text-center mb-4">
                  <p className="text-blue-200 text-2xl font-mono font-bold tracking-widest">{displayOtp}</p>
                  <p className="text-blue-300 text-sm mt-2">OTP (Development Mode)</p>
                </div>
              )}

              <div>
                <label className="block text-sm text-gray-400 mb-2">Enter 6-Digit OTP</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value.slice(0, 6));
                    setError('');
                  }}
                  placeholder="000000"
                  maxLength="6"
                  required
                  className="w-full bg-[#181922] border border-white/[0.08] rounded-lg px-4 py-3 text-2xl text-center font-mono tracking-widest focus:ring-2 focus:ring-purple-500 focus:outline-none text-white placeholder-gray-600 transition"
                />
              </div>

              <div className="bg-red-500/10 border border-red-500/20 text-red-300 p-3 rounded-lg text-center text-sm">
                {otpExpiryTimer > 0 ? (
                  <p>⏰ OTP expires in {Math.floor(otpExpiryTimer / 60)}:{(otpExpiryTimer % 60).toString().padStart(2, '0')}</p>
                ) : (
                  <p>⏰ OTP has expired. Please request a new one.</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all duration-300 shadow-lg shadow-purple-500/20 active:scale-[0.98] disabled:opacity-50 cursor-pointer text-center flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify OTP'
                )}
              </button>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleBackFromOtp}
                  className="flex-1 bg-white/[0.05] hover:bg-white/[0.1] text-white font-semibold py-3 rounded-lg transition"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={loading || countdown > 0}
                  className="flex-1 bg-white/[0.05] hover:bg-white/[0.1] disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition"
                >
                  {countdown > 0 ? `Resend (${countdown}s)` : 'Resend OTP'}
                </button>
              </div>
            </form>
          )}

          {/* Step 3: Password Setup */}
          {step === 'password' && (
            <form onSubmit={handleCreateAccount} className="space-y-4">
              <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-sm text-center">
                <p className="font-mono">{email}</p>
                <p className="text-xs mt-1">✓ Email verified</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter full name"
                    required
                    className="w-full bg-[#181922] border border-white/[0.08] rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none text-white placeholder-gray-600 transition"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    University ID
                  </label>

                  <input
                      type="text"
                      value={universityId}
                      onChange={(e) => setUniversityId(e.target.value)}
                      placeholder="Enter University ID"
                      required
                      className="w-full bg-[#181922] border border-white/[0.08] rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none text-white placeholder-gray-600 transition"
                  />
                </div>



                <div>
                  <label className="block text-sm text-gray-400 mb-2">Age</label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '') {
                        setAge('');
                      } else if (Number(val) >= 0) {
                        setAge(val);
                      }
                    }}
                    min="0"
                    placeholder="Enter age"
                    className="w-full bg-[#181922] border border-white/[0.08] rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none text-white placeholder-gray-600 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full bg-[#181922] border border-white/[0.08] rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none text-white transition"
                  >
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter phone number"
                    className="w-full bg-[#181922] border border-white/[0.08] rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none text-white placeholder-gray-600 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Department</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="Enter department"
                    className="w-full bg-[#181922] border border-white/[0.08] rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none text-white placeholder-gray-600 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Institution</label>
                  <input
                    type="text"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    placeholder="Enter institution"
                    className="w-full bg-[#181922] border border-white/[0.08] rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none text-white placeholder-gray-600 transition"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-400 mb-2">Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    required
                    className="w-full bg-[#181922] border border-white/[0.08] rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none text-white transition"
                  >
                    <option value="" disabled>Select Role</option>
                    <option value="RESEARCHER">Researcher</option>
                    <option value="LAB_TECHNICIAN">Lab Technician</option>
                    <option value="LAB_MANAGER">Lab Manager</option>
                    <option value="DEPARTMENT_HEAD">Department Head</option>
                    <option value="INSTITUTION_ADMIN">Institution Admin</option>
                    <option value="SYSTEM_ADMIN">System Administrator</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setError('');
                      }}
                      placeholder="Enter password"
                      required
                      className="w-full bg-[#181922] border border-white/[0.08] rounded-lg px-4 py-3 pr-10 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none text-white placeholder-gray-600 transition"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Min 8 chars, upper, lower, number, special char
                  </p>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Confirm Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setError('');
                      }}
                      placeholder="Confirm password"
                      required
                      className="w-full bg-[#181922] border border-white/[0.08] rounded-lg px-4 py-3 pr-10 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none text-white placeholder-gray-600 transition"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={
                    loading ||
                    !fullName ||
                    !universityId ||
                    !password ||
                    !confirmPassword ||
                    password !== confirmPassword ||
                    !role
                }
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all duration-300 shadow-lg shadow-purple-500/20 active:scale-[0.98] disabled:opacity-50 cursor-pointer text-center flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>

              <button
                type="button"
                onClick={handleBackFromPassword}
                className="w-full bg-white/[0.05] hover:bg-white/[0.1] text-white font-semibold py-3 rounded-lg transition"
              >
                Back
              </button>
            </form>
          )}

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-white/[0.08] text-center">
            <p className="text-gray-400 text-sm">
              Already have an account? <Link to="/login" className="text-purple-400 hover:text-purple-300 font-semibold transition">Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupNew;