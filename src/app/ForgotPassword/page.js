'use client';
import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const ForgotPassword = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Step 1: Verify Email
  const handleCheckEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await axios.post(`https://appo.coinagesoft.com/api/public-landing/check-email`, { email });
      if (res.data.success) {
        setEmailVerified(true);
        setMessage('Email verified. Please enter a new password.');
      } else {
        setError('Email not found');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error verifying email');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Reset Password (directly)
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(`https://appo.coinagesoft.com/api/public-landing/reset-password`, {
        email,
        newPassword,
      });

      if (res.data.success) {
        setMessage(res.data.message || 'Password reset successfully');
        setTimeout(() => router.push('/Login'), 2000);
      } else {
        setError('Failed to reset password');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error resetting password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="authentication-wrapper authentication-basic px-4 p-sm-0">
      <div className="authentication-inner py-6 d-flex justify-content-center">
        <div className="card p-md-7 p-1" style={{ width: '500px' }}>
          <div className="card-body mt-1">
            <p className="mb-5 fs-4 fw-bolder text-center" style={{ color: 'black' }}>Reset Password</p>

            {!emailVerified ? (
              <form onSubmit={handleCheckEmail}>
                <div className="form-floating form-floating-outline mb-5">
                  <input
                    type="email"
                    className="form-control "
                    id="email"
                    placeholder="Enter your registered email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{ borderColor: '#666cff' }}
                  />
                  <label htmlFor="email">Email</label>
                </div>

                {error && <p className="text-danger text-center">{error}</p>}
                {message && <p className="text-success text-center">{message}</p>}

                <button type="submit" className="btn btn-primary d-grid w-100 waves-effect waves-light" disabled={loading}>
                  {loading ? 'Checking...' : 'Verify Email'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword}>
                {/* New Password Field */}
                <div className="mb-5">
                  <div className="form-password-toggle">
                    <div className="input-group input-group-merge">
                      <div className="form-floating form-floating-outline">
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          className="form-control"
                          id="newPassword"
                          placeholder="New Password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          required
                          style={{ borderColor: '#666cff' }}
                        />
                        <label htmlFor="newPassword">New Password</label>
                      </div>
                      <span
                        className="input-group-text cursor-pointer"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        <i className={showNewPassword ? 'ri-eye-line' : 'ri-eye-off-line'}></i>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Confirm Password Field */}
                <div className="mb-5">
                  <div className="form-password-toggle">
                    <div className="input-group input-group-merge">
                      <div className="form-floating form-floating-outline">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          className="form-control"
                          id="confirmPassword"
                          placeholder="Confirm Password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          style={{ borderColor: '#666cff' }}
                        />
                        <label htmlFor="confirmPassword">Confirm Password</label>
                      </div>
                      <span
                        className="input-group-text cursor-pointer"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        <i className={showConfirmPassword ? 'ri-eye-line' : 'ri-eye-off-line'}></i>
                      </span>
                    </div>
                  </div>
                </div>

                {error && <p className="text-danger text-center">{error}</p>}
                {message && <p className="text-success text-center">{message}</p>}

                <button type="submit" className="btn btn-primary d-grid w-100 waves-effect waves-light" disabled={loading}>
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Inline CSS for focus styling */}
      <style jsx>{`
        .form-control:focus {
          box-shadow: none;
          border-color: #666cff;
        }
        .cursor-pointer {
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

export default ForgotPassword;
