"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import DOMPurify from "dompurify";

const API_URL = "https://appo.coinagesoft.com/api/admin/policy"; // ✅ your API base
const tenantId = 8; // hardcoded for now (can later make dynamic from domain)

const ContactUs = () => {
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchPolicy = async () => {
    try {
      // ✅ type = "contact"
      const res = await axios.get(`${API_URL}/${tenantId}/contact`);
      setPolicy(res.data.data);
    } catch (err) {
      console.error("Error fetching Contact Us policy:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicy();
  }, []);

  if (loading) return <p>Loading Contact Us...</p>;

  if (!policy) return <p>No Contact Us information found.</p>;

  return (
    <section id="contact-us" className="container my-5">
      {/* ✅ Dynamic Title */}
      <h2 className="mb-3 fw-bold">{policy.title}</h2>

      {/* ✅ Render saved HTML safely */}
      <div
        style={{ whiteSpace: "pre-wrap", fontFamily: "inherit" }}
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(policy.content) }}
      />
    </section>
  );
};

export default ContactUs;
