'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';

// ✅ Use NEXT_PUBLIC_ prefix (Next.js does not expose REACT_APP_ vars)
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://appo.coinagesoft.com/api';

const Page = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
    const [slug, setSlug] = useState('');

  // ✅ Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
 // ✅ Get slug when page loads
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      setSlug(hostname);
      // Store in localStorage for use in other pages
    }
  }, []);
  // ✅ Toggle show/hide password
  const handleTogglePassword = () => setShowPassword((prev) => !prev);

  // ✅ Submit login
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {

      const response = await axios.post(`${API_URL}/admin/login`, formData);

      // ✅ Save token securely
      if (response.data?.token) {
        localStorage.setItem('token', response.data.token);
        router.push('/Dashboard');
      } else {
        setError('Invalid server response');
      }
    } catch (err) {
      console.error('Login error:', err);
      const msg = err.response?.data?.message || 'Invalid email or password';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="position-relative">
      <div className="authentication-wrapper authentication-basic px-4 p-sm-0">
        <div className="authentication-inner py-6 d-flex justify-content-center">
          <div className="card p-md-7 p-1" style={{ width: '500px' }}>
            <div className="card-body mt-1">
              <p
                className="mb-5 fs-4 fw-bolder text-center"
                style={{ color: 'black' }}
              >
                Log In
              </p>

              <form className="my-5" onSubmit={handleSubmit}>
                {/* Email Field */}
                <div className="form-floating form-floating-outline mb-4">
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    name="email"
                    placeholder="Enter your email"
                    autoFocus
                    style={{ borderColor: '#666cff' }}
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                  <label htmlFor="email">Email</label>
                </div>

                {/* Password Field */}
                <div className="mb-4">
                  <div className="form-password-toggle">
                    <div className="input-group input-group-merge">
                      <div className="form-floating form-floating-outline">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          id="password"
                          className="form-control"
                          name="password"
                          placeholder="••••••••••"
                          aria-describedby="password"
                          style={{ borderColor: '#666cff' }}
                          value={formData.password}
                          onChange={handleChange}
                          required
                        />
                        <label htmlFor="password">Password</label>
                      </div>
                      <span
                        className="input-group-text cursor-pointer"
                        onClick={handleTogglePassword}
                        style={{ cursor: 'pointer' }}
                      >
                        <i
                          className={
                            showPassword ? 'ri-eye-line' : 'ri-eye-off-line'
                          }
                        ></i>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <p className="text-danger mb-3 text-center fw-bold">{error}</p>
                )}

                {/* Remember + Forgot Password */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="remember-me"
                    />
                    <label
                      className="form-check-label"
                      htmlFor="remember-me"
                    >
                      Remember Me
                    </label>
                  </div>
                  <Link href="/ForgotPassword" className="text-primary">
                    Forgot Password?
                  </Link>
                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  className="btn btn-primary d-grid w-100 waves-effect waves-light"
                  disabled={loading}
                >
                  {loading ? 'Logging in...' : 'Log In'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Inline Style Fix */}
      <style jsx>{`
        .form-control:focus {
          box-shadow: none;
          border-color: #666cff;
        }
      `}</style>
    </div>
  );
};

export default Page;
