import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const Signup = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState('email'); // 'email' | 'verify-email-otp' | 'details' | 'final-verify'
  
  // Step 1: Email
  const [email, setEmail] = useState('');
  
  // Step 2: Verify Email OTP
  const [emailOtp, setEmailOtp] = useState('');
  const [displayEmailOtp, setDisplayEmailOtp] = useState('');
  
  // Step 3: Account details
  const [formData, setFormData] = useState({
    name: '',
    password: '',
    role: 'RESEARCHER'
  });
  
  // Generate random password example
  const generatePasswordExample = () => {
    const examples = [
      'Test@1234',
      'SecurePass@2024',
      'MyPassword@99',
      'StrongP@ss123',
      'ValidPass@456',
      'Sample@7890',
      'Example@2025',
      'Password@123',
      'MySecret@456',
      'Secure@9999'
    ];
    return examples[Math.floor(Math.random() * examples.length)];
  };
  
  const [passwordExample] = useState(generatePasswordExample());
  
  // Step 4: Final OTP Verification
  const [finalOtp, setFinalOtp] = useState('');
  const [displayFinalOtp, setDisplayFinalOtp] = useState('');
  
  // UI States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  const roles = ['RESEARCHER', 'LAB_MANAGER', 'LAB_TECHNICIAN', 'DEPARTMENT_HEAD', 'INSTITUTION_ADMIN'];

  // Handle form input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  // Step 1: Send verification OTP to email
  const handleSendVerificationOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    try {
      const response = await api.post('/auth/send-verification-otp', { email });
      
      // Email OTP sent successfully
      setStep('verify-email-otp');
      setDisplayEmailOtp(response.data.otp_for_testing || '');
      setSuccess('');
      
      // Start 30-second resend cooldown
      setResendCooldown(30);
      const timer = setInterval(() => {
        setResendCooldown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
    } catch (err) {
      if (err.response?.status === 409) {
        setError('This email is already in use.');
      } else {
        setError(err.response?.data?.message || 'Please enter a valid email address.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify email OTP (just validation, no account creation yet)
  const handleVerifyEmailOtp = async (e) => {
    e.preventDefault();
    
    if (emailOtp.length !== 6) {
      setError('OTP must be 6 digits');
      return;
    }

    // Move to account details step
    setStep('details');
    setError('');
    setSuccess('');
  };

  // Step 3: Submit account details
  const handleSubmitAccountDetails = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validate password
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      setError('Password must contain: 8+ chars, uppercase, lowercase, number, special character');
      setLoading(false);
      return;
    }

    try {
      // Submit account details along with the OTP verification
      const signupData = {
        email: email,
        name: formData.name,
        password: formData.password,
        role: formData.role
      };
      
      // First verify the email OTP and create account
      const verifyResponse = await api.post('/auth/signup/verify', {
        email: email,
        otp: emailOtp
      });

      setSuccess('Account created successfully! Redirecting to login...');
      
      // Store token temporarily to show welcome message
      localStorage.setItem('welcomeUser', verifyResponse.data.name);
      
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
    } catch (err) {
      if (err.response?.data?.message?.includes('expired')) {
        setError('OTP has expired. Please request a new OTP.');
        setStep('email'); // Go back to start
      } else if (err.response?.data?.message?.includes('Invalid')) {
        setError('Invalid OTP. Please try again.');
        setStep('verify-email-otp'); // Go back to OTP verification
      } else {
        setError(err.response?.data?.message || 'Failed to create account. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Resend email verification OTP
  const handleResendEmailOtp = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/send-verification-otp', { email });
      
      setDisplayEmailOtp(response.data.otp_for_testing || '');
      setSuccess('New OTP sent to your email');
      setEmailOtp('');
      
      // Start 30-second resend cooldown
      setResendCooldown(30);
      const timer = setInterval(() => {
        setResendCooldown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Navigation handlers
  const handleBackFromEmailOtp = () => {
    setStep('email');
    setEmailOtp('');
    setDisplayEmailOtp('');
    setError('');
    setSuccess('');
  };

  const handleBackFromDetails = () => {
    setStep('verify-email-otp');
    setFormData({ name: '', password: '', role: 'RESEARCHER' });
    setError('');
    setSuccess('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0d0e12] px-4 md:p-12 relative overflow-hidden font-sans text-white">
      {/* Background Neon Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-purple-900/20 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-violet-900/20 blur-[120px] pointer-events-none"></div>
      <div className="w-full max-w-md relative z-10">
        
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
          
          {/* Step Indicator */}
          <div className="flex gap-2 mb-8">
            <div className={`flex-1 h-2 rounded-full transition-all ${['email', 'verify-email-otp', 'details'].includes(step) ? 'bg-purple-600' : 'bg-white/20'}`}></div>
            <div className={`flex-1 h-2 rounded-full transition-all ${['verify-email-otp', 'details'].includes(step) ? 'bg-purple-600' : 'bg-white/20'}`}></div>
            <div className={`flex-1 h-2 rounded-full transition-all ${step === 'details' ? 'bg-purple-600' : 'bg-white/20'}`}></div>
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
            <form onSubmit={handleSendVerificationOtp} className="space-y-4">
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
                We'll send a verification code to your email to confirm it's valid
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

          {/* Step 2: Verify Email OTP */}
          {step === 'verify-email-otp' && (
            <form onSubmit={handleVerifyEmailOtp} className="space-y-4">
              <div className="mb-4 p-3 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-lg text-sm text-center">
                <p className="font-mono">{email}</p>
              </div>

              {/* Display OTP for testing */}
              {displayEmailOtp && (
                <div className="bg-blue-900/20 border border-blue-500/50 p-4 rounded-lg text-center mb-4">
                  <p className="text-blue-200 text-2xl font-mono font-bold tracking-widest">{displayEmailOtp}</p>
                  <p className="text-blue-300 text-sm mt-2">OTP sent</p>
                </div>
              )}

              <div>
                <label className="block text-sm text-gray-400 mb-2">Enter OTP</label>
                <input
                  type="text"
                  value={emailOtp}
                  onChange={(e) => {
                    setEmailOtp(e.target.value.slice(0, 6));
                    setError('');
                  }}
                  placeholder="000000"
                  maxLength="6"
                  required
                  className="w-full bg-[#181922] border border-white/[0.08] rounded-lg px-4 py-3 text-2xl text-center font-mono tracking-widest focus:ring-2 focus:ring-purple-500 focus:outline-none text-white placeholder-gray-600 transition"
                />
              </div>

              <button
                type="submit"
                disabled={loading || emailOtp.length !== 6}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all duration-300 shadow-lg shadow-purple-500/20 active:scale-[0.98] disabled:opacity-50 cursor-pointer text-center flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Continue'
                )}
              </button>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleBackFromEmailOtp}
                  className="flex-1 bg-white/[0.05] hover:bg-white/[0.1] text-white font-semibold py-3 rounded-lg transition"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleResendEmailOtp}
                  disabled={loading || resendCooldown > 0}
                  className="flex-1 bg-white/[0.05] hover:bg-white/[0.1] disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition"
                >
                  {loading ? 'Sending...' : resendCooldown > 0 ? `Resend (${resendCooldown}s)` : 'Resend OTP'}
                </button>
              </div>
            </form>
          )}

          {/* Step 3: Account Details & Create Account */}
          {step === 'details' && (
            <form onSubmit={handleSubmitAccountDetails} className="space-y-4">
              <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-sm text-center">
                <p className="font-mono">{email}</p>
                <p className="text-xs mt-1">✓ Email verified</p>
              </div>

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
                  Example: <span className="text-gray-400">{passwordExample}</span> (Min 8 chars, uppercase, lowercase, number, special character)
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
                onClick={handleBackFromDetails}
                className="w-full bg-white/[0.05] hover:bg-white/[0.1] text-white font-semibold py-3 rounded-lg transition"
              >
                Back
              </button>
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
