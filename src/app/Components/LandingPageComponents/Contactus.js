"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import DOMPurify from "dompurify";
import { useSearchParams } from "next/navigation";

const API_URL = "https://appo.coinagesoft.com/api/public-landing/policy";

const ContactUs = () => {
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug"); // ✅ safer for app-router

  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPolicy = async () => {
      if (!slug) return;

      try {
        const res = await axios.get(`${API_URL}/contact?slug=${slug}`);
        setPolicy(res.data.data);
      } catch (err) {
        console.error("Error fetching Contact Us policy:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPolicy();
  }, [slug]);

  return (
    <section id="contact-us" className="container my-5">
      {loading ? (
        <p className="text-center text-muted">Loading Contact Us...</p>
      ) : !policy ? (
        <p className="text-center text-danger">No Contact Us information found.</p>
      ) : (
        <>
          <h2 className="mb-3 fw-bold">{policy.title}</h2>
          <div
            style={{ whiteSpace: "pre-wrap", fontFamily: "inherit" }}
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(policy.content) }}
          />
        </>
      )}
    </section>
  );
};

export default ContactUs;
