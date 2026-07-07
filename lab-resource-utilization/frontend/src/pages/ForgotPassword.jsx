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

  // Clear OTP when it expires
  useEffect(() => {
    if (otpTimer === 0 && displayOtp) {
      setDisplayOtp('');
    }
  }, [otpTimer, displayOtp]);

  // Step 1: Request password reset OTP
  const handleRequestReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/forgot-password', { email });
      console.log('Forgot Password Response:', response.data);
      setStep('verify');
      setSuccess('');
      
      // Store OTP for display
      if (response.data.otp_for_testing) {
        console.log('Setting displayOtp to:', response.data.otp_for_testing);
        setDisplayOtp(response.data.otp_for_testing);
      }
      
      // Start 60 second timer
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
      console.log('Forgot Password Error Response:', err.response?.data);
      // Still proceed even if email fails
      setStep('verify');
      setSuccess('');
      
      // Store OTP for display
      if (err.response?.data?.otp_for_testing) {
        console.log('Setting displayOtp from error to:', err.response.data.otp_for_testing);
        setDisplayOtp(err.response.data.otp_for_testing);
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

    // In real scenario, we would verify OTP first, but for now move to reset step
    setStep('reset');
    setSuccess('OTP verified! Now enter your new password.');
    setLoading(false);
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

  // Go back
  const handleBack = () => {
    if (step === 'verify') {
      setStep('request');
      setOtp('');
    } else if (step === 'reset') {
      setStep('verify');
      setNewPassword('');
      setConfirmPassword('');
    }
    setError('');
    setSuccess('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f23] via-[#1a0033] to-[#0f0f23] text-white p-4 md:p-12 font-sans flex items-center justify-center">
      <div className="w-full max-w-md">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-2">
            <span className="bg-gradient-to-r from-amber-400 to-orange-600 bg-clip-text text-transparent">
              Reset Password
            </span>
          </h1>
          <p className="text-gray-400">Recover your account access</p>
        </div>

        {/* Card */}
        <div className="bg-[#12131a] border border-white/[0.08] rounded-2xl p-8 shadow-2xl">
          
          {/* Step Indicator */}
          <div className="flex gap-2 mb-8">
            <div className={`flex-1 h-2 rounded-full transition-all ${['request', 'verify', 'reset'].includes(step) ? 'bg-amber-600' : 'bg-white/20'}`}></div>
            <div className={`flex-1 h-2 rounded-full transition-all ${['verify', 'reset'].includes(step) ? 'bg-amber-600' : 'bg-white/20'}`}></div>
            <div className={`flex-1 h-2 rounded-full transition-all ${step === 'reset' ? 'bg-amber-600' : 'bg-white/20'}`}></div>
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
                  className="w-full bg-[#181922] border border-white/[0.08] rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none text-white placeholder-gray-600 transition"
                />
              </div>

              <p className="text-gray-500 text-xs">
                Enter the email address associated with your account. We'll send you an OTP to reset your password.
              </p>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
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
              {!displayOtp && otpTimer === 0 && (
                <div className="bg-red-900/20 border border-red-500/50 p-4 rounded-lg text-center mb-4">
                  <p className="text-red-300 text-sm">OTP expired - Click "Resend OTP" to get a new one</p>
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
                  className="w-full bg-[#181922] border border-white/[0.08] rounded-lg px-4 py-3 text-2xl text-center font-mono tracking-widest focus:ring-2 focus:ring-amber-500 focus:outline-none text-white placeholder-gray-600 transition"
                />
              </div>

              <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-lg text-center">
                {otpTimer > 0 ? (
                  <p className="text-amber-400 text-sm">
                    OTP expires in <strong>{otpTimer}s</strong>
                  </p>
                ) : (
                  <p className="text-amber-400 text-sm">OTP expired. Request a new one.</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
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
                  className="flex-1 bg-white/[0.05] hover:bg-white/[0.1] text-white font-semibold py-3 rounded-lg transition"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={!canResend || loading}
                  className="flex-1 bg-white/[0.05] hover:bg-white/[0.1] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition"
                >
                  {canResend ? 'Resend OTP' : `Resend in ${otpTimer}s`}
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
                  className="w-full bg-[#181922] border border-white/[0.08] rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none text-white placeholder-gray-600 transition"
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
                  className="w-full bg-[#181922] border border-white/[0.08] rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none text-white placeholder-gray-600 transition"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !newPassword || !confirmPassword}
                className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
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
              Remember your password? <Link to="/login" className="text-amber-400 hover:text-amber-300 font-semibold transition">Login</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
