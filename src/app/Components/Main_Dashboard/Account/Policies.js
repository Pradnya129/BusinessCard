"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import {jwtDecode} from "jwt-decode"; // import jwt-decode

const API_URL = "http://localhost:5000/api/admin/policy"; // admin API base

const Policies = () => {
  const [tenantId, setTenantId] = useState(8);
  const [policyType, setPolicyType] = useState("terms");
  const [policy, setPolicy] = useState(null);
  const [newPolicy, setNewPolicy] = useState({
    type: "terms",
    title: "",
    content: ""
  });
  const [userRole, setUserRole] = useState("");

const fetchPolicy = async () => {
  const token = localStorage.getItem("token");
  if (!token) return alert("No token found");

  try {
    const decoded = jwtDecode(token);
    setUserRole(decoded.role);
  } catch (err) {
    console.error("Invalid token:", err);
  }

  try {
    const res = await axios.get(`${API_URL}/${tenantId}/${policyType}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setPolicy(res.data.data || null);
    if (res.data.data) {
      setNewPolicy({
        type: res.data.data.type,
        title: res.data.data.title,
        content: res.data.data.content
      });
    } else {
      setNewPolicy({ type: policyType, title: "", content: "" });
    }
  } catch (err) {
    // Handle 404 separately
    if (err.response && err.response.status === 404) {
      console.log("No policy found, can create new one.");
      setPolicy(null);
      setNewPolicy({ type: policyType, title: "", content: "" });
    } else {
      console.error(err);
    }
  }
};


  useEffect(() => {
    fetchPolicy();
  }, [tenantId, policyType]);

  const savePolicy = async () => {
    const token = localStorage.getItem("token");
    if (!token) return alert("No token found");

    try {
      if (policy) {
        // Update existing
        await axios.put(`${API_URL}/${policy.id}`, {
          title: newPolicy.title,
          content: newPolicy.content
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        // Create new
        await axios.post(API_URL, { tenantId, ...newPolicy }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      fetchPolicy();
      alert("Policy saved successfully");
    } catch (err) {
      console.error(err);
      alert("Error saving policy");
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Admin Policies (Tenant ID: {tenantId})</h2>
      <p>User Role: {userRole}</p>

      <div className="mb-3">
        <label className="form-label">Select Policy Type</label>
        <select
          className="form-select"
          value={policyType}
          onChange={(e) => setPolicyType(e.target.value)}
        >
          <option value="terms">Terms</option>
          <option value="privacy">Privacy</option>
          <option value="shipping">Shipping</option>
          <option value="cancellation">Cancellation</option>
          <option value="contact">Contact</option>
        </select>
      </div>

      <div className="card mb-4">
        <div className="card-header">
          {policy ? "Edit Policy" : "Create Policy"}
        </div>
        <div className="card-body">
          <div className="mb-3">
            <label className="form-label">Title</label>
            <input
              type="text"
              className="form-control"
              value={newPolicy.title}
              onChange={(e) => setNewPolicy({ ...newPolicy, title: e.target.value })}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Content</label>
            <textarea
              className="form-control"
              rows={6}
              value={newPolicy.content}
              onChange={(e) => setNewPolicy({ ...newPolicy, content: e.target.value })}
              style={{ whiteSpace: "pre-wrap" }}
            />
          </div>
          <button className="btn btn-primary" onClick={savePolicy}>
            {policy ? "Update Policy" : "Create Policy"}
          </button>
        </div>
      </div>

      {policy && (
        <div className="card">
          <div className="card-header">Existing Policy Preview</div>
          <div className="card-body">
            <h5>{policy.title}</h5>
            <p style={{ whiteSpace: "pre-wrap" }}>{policy.content}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Policies;
