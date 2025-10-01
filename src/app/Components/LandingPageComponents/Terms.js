"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import DOMPurify from "dompurify";

const API_URL = "https://appo.coinagesoft.com/api/admin/policy"; // ✅ your API
const tenantId = 8; // or dynamic if needed

const Terms = () => {
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchPolicy = async () => {
    try {
      const res = await axios.get(`${API_URL}/${tenantId}/terms`); // ✅ type = "terms"
      setPolicy(res.data.data);
    } catch (err) {
      console.error("Error fetching Terms policy:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicy();
  }, []);

  if (loading) return <p>Loading Terms & Conditions...</p>;

  if (!policy) return <p>No Terms & Conditions found.</p>;

  return (
    <section id="terms" className="container my-5">
      {/* ✅ Bold Title */}
      <h2 className="mb-3"><strong>{policy.title}</strong></h2>

      {/* ✅ Render content exactly as stored (with breaks/spaces) */}
      <div
        style={{ whiteSpace: "pre-wrap", fontFamily: "inherit" }}
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(policy.content) }}
      />
    </section>
  );
};

export default Terms;
