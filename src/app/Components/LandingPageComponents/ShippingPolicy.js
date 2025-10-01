"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import DOMPurify from "dompurify";

const API_URL = "http://localhost:5000/api/admin/policy"; // ✅ your API
const tenantId = 8; // hardcoded for now, or make dynamic if needed

const ShippingPolicy = () => {
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchPolicy = async () => {
    try {
      const res = await axios.get(`${API_URL}/${tenantId}/shipping`); // ✅ type = "shipping"
      setPolicy(res.data.data);
    } catch (err) {
      console.error("Error fetching Shipping Policy:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicy();
  }, []);

  if (loading) return <p>Loading Shipping Policy...</p>;

  if (!policy) return <p>No Shipping Policy found.</p>;

  return (
    <section id="shipping" className="mb-5 px-3 py-4">
      <div className="container">
        {/* ✅ Bold Title */}
        <h2 className="mb-3 fw-bold">{policy.title}</h2>

        {/* ✅ Render content as-is with formatting */}
        <div
          style={{ whiteSpace: "pre-wrap", fontFamily: "inherit" }}
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(policy.content) }}
        />
      </div>
    </section>
  );
};

export default ShippingPolicy;
