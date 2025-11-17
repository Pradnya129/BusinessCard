"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import DOMPurify from "dompurify";

const API_URL = "https://appo.coinagesoft.com/api/admin/policy"; // ✅ change to your API base
const tenantId = 8; // hardcoded for now, make dynamic later


const CancellationPolicy = () => {
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchPolicy = async () => {
    try {
      const res = await axios.get(`${API_URL}/${tenantId}/cancellation`); // ✅ type = "cancellation"
      setPolicy(res.data.data);
    } catch (err) {
      console.error("Error fetching Cancellation Policy:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicy();
  }, []);

  if (loading) return <p>Loading Cancellation Policy...</p>;

  if (!policy) return <p>No Cancellation Policy found.</p>;

  return (
    <section id="cancellation" className="container py-5">
      {/* ✅ Bold Title */}
      <h2 className="mb-3 fw-bold">{policy.title}</h2>

      {/* ✅ Show content as stored in DB (formatted) */}
      <div
        style={{ whiteSpace: "pre-wrap", fontFamily: "inherit" }}
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(policy.content) }}
      />
    </section>
  );
};

export default CancellationPolicy;
