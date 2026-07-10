import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState('request'); // 'request' | 'verify' | 'reset'
  
  // Step 1: Request OTP
  const [email, setEmail] = useState('');
  const [displayOtp, setDisplayOtp] = useState(''); // For showing OTP on page
  
  // Step 2: Verify OTP & Step 3: Reset Password
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // UI States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [otpTimer, setOtpTimer] = useState(0);
  const [canResend, setCanResend] = useState(false);
  const [otpExpiryTimer, setOtpExpiryTimer] = useState(0);

  useEffect(() => {
    if (otpExpiryTimer > 0) {
      const timer = setTimeout(() => setOtpExpiryTimer(otpExpiryTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpExpiryTimer]);

  // Step 1: Request password reset OTP
  const handleRequestReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/forgot-password', { email });
      console.log('===== FORGOT PASSWORD RESPONSE =====');
      console.log('Full response:', response);
      console.log('Response data:', response.data);
      console.log('otp_for_testing:', response.data.otp_for_testing);
      console.log('====================================');
      setStep('verify');
      setSuccess('');
      
      // Store OTP for display
      if (response.data.otp_for_testing) {
        console.log('✅ Setting displayOtp to:', response.data.otp_for_testing);
        setDisplayOtp(response.data.otp_for_testing);
      } else {
        console.log('❌ No otp_for_testing in response!');
      }
      
      // Start 60 second timer
      setOtpTimer(60);
      setCanResend(false);
      setOtpExpiryTimer(300);
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
      console.log('===== FORGOT PASSWORD ERROR =====');
      console.log('Error response:', err.response?.data);
      console.log('otp_for_testing:', err.response?.data?.otp_for_testing);
      console.log('==================================');
      // Still proceed even if email fails
      setStep('verify');
      setSuccess('');
      
      // Store OTP for display
      if (err.response?.data?.otp_for_testing) {
        console.log('✅ Setting displayOtp from error to:', err.response.data.otp_for_testing);
        setDisplayOtp(err.response.data.otp_for_testing);
      } else {
        console.log('❌ No otp_for_testing in error response!');
      }
      
      // Start timer
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
      await api.post('/auth/forgot-password/verify', { email, otp });
      setStep('reset');
      setSuccess('OTP verified! Now enter your new password.');
    } catch (err) {
      let msg = err.response?.data?.message || 'Invalid OTP. Please try again.';
      if (msg.includes('Invalid OTP')) {
        msg = 'Invalid OTP';
      } else if (msg.includes('expired')) {
        msg = 'OTP has expired';
      } else if (msg.includes('400 BAD_REQUEST')) {
        msg = msg.replace('400 BAD_REQUEST "', '').replace('"', '').trim();
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validation
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      setLoading(false);
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      setError('Password must contain uppercase, lowercase, number, and special character');
      setLoading(false);
      return;
    }

    try {
      await api.post('/auth/reset-password', {
        email,
        otp,
        newPassword
      });

      setSuccess('Password reset successfully! Redirecting to login...');
      
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/forgot-password/resend', { email });
      console.log('Resend Response:', response.data);
      if (response.data.otp_for_testing) {
        console.log('Setting displayOtp to NEW OTP:', response.data.otp_for_testing);
        setDisplayOtp(response.data.otp_for_testing); // Set new OTP
      }
      setSuccess('');
      setOtp(''); // Clear old OTP input
      setOtpTimer(60);
      setCanResend(false);
      setOtpExpiryTimer(300);

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
      setOtpExpiryTimer(300);

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

  // Go back
  const handleBack = () => {
    if (step === 'verify') {
      setStep('request');
      setOtp('');
      setOtpExpiryTimer(0);
    } else if (step === 'reset') {
      setStep('verify');
      setNewPassword('');
      setConfirmPassword('');
    }
    setError('');
    setSuccess('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0d0e12] px-4 relative overflow-hidden font-sans">
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-purple-900/20 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-violet-900/20 blur-[120px] pointer-events-none"></div>
      <div className="w-full max-w-md">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
            Reset Password
          </h1>
          <p className="text-gray-400">Recover your account access</p>
        </div>

        {/* Card */}
        <div className="bg-white/[0.03] backdrop-blur-md border border-white/[0.08] rounded-2xl p-8 shadow-2xl relative z-10 transition-all duration-300 hover:border-purple-500/30">
          
          {/* Step Indicator */}
          <div className="flex gap-2 mb-8">
            <div className={`flex-1 h-2 rounded-full transition-all ${['request', 'verify', 'reset'].includes(step) ? 'bg-purple-600' : 'bg-white/20'}`}></div>
            <div className={`flex-1 h-2 rounded-full transition-all ${['verify', 'reset'].includes(step) ? 'bg-purple-600' : 'bg-white/20'}`}></div>
            <div className={`flex-1 h-2 rounded-full transition-all ${step === 'reset' ? 'bg-purple-600' : 'bg-white/20'}`}></div>
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

          {/* Step 1: Request OTP */}
          {step === 'request' && (
            <form onSubmit={handleRequestReset} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  required
                  className="w-full bg-[#16171d] border border-white/[0.08] rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none text-white placeholder-gray-600 transition"
                />
              </div>

              <p className="text-gray-500 text-xs">
                Enter the email address associated with your account. We'll send you an OTP to reset your password.
              </p>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Reset OTP'
                )}
              </button>
            </form>
          )}

          {/* Step 2: Verify OTP */}
          {step === 'verify' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              {/* Display OTP for testing if available */}
              {displayOtp && (
                <div className="bg-blue-900/20 border border-blue-500/50 p-4 rounded-lg text-center mb-4">
                  <p className="text-blue-200 text-2xl font-mono font-bold tracking-widest">{displayOtp}</p>
                  <p className="text-blue-300 text-sm mt-2">OTP sent</p>
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
                  className="w-full bg-[#16171d] border border-white/[0.08] rounded-lg px-4 py-3 text-2xl text-center font-mono tracking-widest focus:ring-2 focus:ring-purple-500 focus:outline-none text-white placeholder-gray-600 transition"
                />
              </div>

              <div className="bg-red-500/10 border border-red-500/20 text-red-300 p-3 rounded-lg text-center text-sm">
                {otpExpiryTimer > 0 ? (
                  <p>⏳ OTP expires in {Math.floor(otpExpiryTimer / 60)}:{(otpExpiryTimer % 60).toString().padStart(2, '0')}</p>
                ) : (
                  <p>⏳ OTP has expired. Please request a new one.</p>
                )}
              </div>              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2"
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
                  onClick={handleBack}
                  className="w-full bg-white/[0.05] hover:bg-white/[0.1] text-white font-semibold py-3 rounded-lg transition"
                >
                  Back
                </button>
              </div>
            </form>
          )}

          {/* Step 3: Reset Password */}
          {step === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                  className="w-full bg-[#16171d] border border-white/[0.08] rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none text-white placeholder-gray-600 transition"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Example: <span className="text-gray-400">Password@123</span> (Min 8 chars, uppercase, lowercase, number, special character)
                </p>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  required
                  className="w-full bg-[#16171d] border border-white/[0.08] rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none text-white placeholder-gray-600 transition"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !newPassword || !confirmPassword}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Resetting...
                  </>
                ) : (
                  'Reset Password'
                )}
              </button>

              <button
                type="button"
                onClick={handleBack}
                className="w-full bg-white/[0.05] hover:bg-white/[0.1] text-white font-semibold py-3 rounded-lg transition"
              >
                Back
              </button>
            </form>
          )}

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-white/[0.08] text-center">
            <p className="text-gray-400 text-sm">
              Remember your password? <Link to="/login" className="text-purple-400 hover:text-purple-300 font-semibold transition">Login</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
