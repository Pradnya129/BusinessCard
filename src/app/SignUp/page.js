"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
const API_URL = process.env.REACT_APP_API_URL;
const Page = () => {
    const router = useRouter();
      const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
    expertise: "",
    password: "",
  });

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("Sending form data:", formData); // ✅ Debug

    try {
      const response = await fetch(`http://103.224.247.28:5000/api/admin/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
    
      let result;
      const contentType = response.headers.get("content-type");
    
      if (contentType && contentType.includes("application/json")) {
        result = await response.json();
      } else {
        const text = await response.text();
        throw new Error(text); // 👈 fallback to readable error
      }
    
      console.log("Server response:", result);
    
      if (response.ok) {
        alert("✅ Registered successfully!");
        router.push('/Login');
      } else {
        alert("❌ Registration failed: " + (result.message || "Unknown error"));
      }
    } catch (err) {
      console.error("API Error:", err.message);
      alert(err.message);
    }
  };

  return (
    <div
      className="d-flex align-items-center justify-content-center min-vh-100"
      style={{ backgroundColor: "#ffffff", padding: "1rem" }}
    >
      <div
        className="card p-4 p-md-5 rounded-4 shadow-lg border-0"
        style={{
          maxWidth: "520px",
          width: "100%",
          backgroundColor: "#fff",
          color: "#262B43",
        }}
      >
        <div className="text-center mb-4">
          <h3 className="fw-bold" style={{ color: "rgb(38, 43, 67)" }}>
            🚀 Let’s Begin
          </h3>
          <p className="text-muted mb-0">
            Sign in to access your personalized experience
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-floating form-floating-outline mb-4">
            <input
              type="text"
              className="form-control"
              id="firstName"
              name="firstName"
              placeholder="First Name"
              value={formData.firstName}
              onChange={handleChange}
            />
            <label htmlFor="firstName">First Name</label>
          </div>

          <div className="form-floating form-floating-outline mb-4">
            <input
              type="text"
              className="form-control"
              id="lastName"
              name="lastName"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={handleChange}
            />
            <label htmlFor="lastName">Last Name</label>
          </div>

          <div className="form-floating form-floating-outline mb-4">
            <input
              type="text"
              className="form-control"
              id="phone"
              name="phoneNumber"
              placeholder="Phone Number"
              value={formData.phoneNumber}
              onChange={handleChange}
            />
            <label htmlFor="phone">Phone Number</label>
          </div>

          <div className="form-floating form-floating-outline mb-4">
            <input
              type="email"
              className="form-control"
              id="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
            />
            <label htmlFor="email">Email</label>
          </div>

          <div className="form-floating form-floating-outline mb-4">
            <input
              type="text"
              className="form-control"
              id="expertise"
              name="expertise"
              placeholder="Expertise"
              value={formData.expertise}
              onChange={handleChange}
            />
            <label htmlFor="expertise">Expertise</label>
          </div>

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
                    style={{ borderColor: "#666cff" }}
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

          {/* Sign In Button */}
          <div className="mb-3 d-grid">
            <button type="submit" className="btn btn-primary d-grid w-100">
              Sign Up
            </button>
          </div>
        </form>

        <p className="text-center mt-4">
          <a
            href="/Login"
            className="text-decoration-none ms-1 fw-bold"
            style={{ color: "rgb(38, 43, 67)" }}
          >
            Log in
          </a>
        </p>

        <div className="divider text-center my-4 position-relative">
          <hr />
          <span className="position-absolute top-50 start-50 translate-middle bg-white px-2 text-muted small">
            or continue with
          </span>
        </div>

        <div className="d-flex justify-content-center gap-3">
          {/* Social login buttons */}
        </div>
      </div>
    </div>
  );
};

export default Page;
