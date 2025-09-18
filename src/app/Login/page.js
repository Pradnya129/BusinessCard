'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
const API_URL = process.env.REACT_APP_API_URL;
const Page = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(`https://appo.coinagesoft.com/api/admin/login`, formData);
       console.log(response);
      // Save token or user data
           localStorage.setItem('token', response.data.token);
           router.push('/Dashboard'); 

      // Redirect to dashboard or home
    } catch (err) {
      console.log(err.message);
      setError('Invalid email or password');
    }
  };

  return (
    <div className="position-relative">
      <div className="authentication-wrapper authentication-basic px-4 p-sm-0">
        <div className="authentication-inner py-6 d-flex justify-content-center">
          <div className="card p-md-7 p-1" style={{ width: '500px' }}>
            <div className="card-body mt-1">
              <p className="mb-5 fs-4 fw-bolder text-center  mb-5" style={{ color: 'black' }}>Log In</p>

              <form className="my-5" onSubmit={handleSubmit}>
                {/* Email Field */}
                <div className="form-floating form-floating-outline mb-5">
                  <input
                    type="text"
                    className="form-control"
                    id="email"
                    name="email"
                    placeholder="Enter your email or username"
                    autoFocus
                    style={{ borderColor: '#666cff' }}
                    value={formData.email}
                    onChange={handleChange}
                  />
                  <label htmlFor="email">Email or Username</label>
                </div>

                {/* Password Field */}
                <div className="mb-5">
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
                        />
                        <label htmlFor="password">Password</label>
                      </div>
                      <span className="input-group-text cursor-pointer" onClick={handleTogglePassword}>
                        <i className={showPassword ? 'ri-eye-line' : 'ri-eye-off-line'}></i>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Error Message */}
                {error && <p className="text-danger mb-3 text-center">{error}</p>}

                {/* Remember Me and Forgot Password */}
                <div className="mb-5 d-flex justify-content-between mt-5">
                  <div className="form-check mt-2">
                    <input className="form-check-input" type="checkbox" id="remember-me" />
                    <label className="form-check-label" htmlFor="remember-me"> Remember Me </label>
                  </div>
                  <a href="/ForgotPassword" className="float-end mb-1 mt-2">
                    <span>Forgot Password?</span>
                  </a>
                </div>

                {/* Login Button */}
                <div className="mb-5">                 
                  <button type="submit" className="btn btn-primary d-grid w-100">Log in</button>
                </div>
              </form>

              {/* <p className="text-center">
                <span>New on our platform?</span>
                <Link href="/SignUp"><span> Create an account</span></Link>
              </p> */}

              {/* <div className="divider my-5">
                <div className="divider-text">or</div>
              </div> */}

          
            </div>
          </div>
        </div>
      </div>

      {/* Inline styles to remove focus shadow */}
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
