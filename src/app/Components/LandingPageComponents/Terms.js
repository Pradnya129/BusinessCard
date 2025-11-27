"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import DOMPurify from "dompurify";
import { useSearchParams } from "next/navigation";

const API_URL = "https://appo.coinagesoft.com/api/public-landing/policy"; // ✅ slug-based API

const Terms = () => {
  const searchParams = useSearchParams(); // ✅ add this
  const slug = searchParams.get("slug"); // ✅ safer for app-router

  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPolicy = async () => {
      if (!slug) return; // wait until slug is available

      try {
        const res = await axios.get(`${API_URL}/terms?slug=${slug}`);
        setPolicy(res.data.data);
      } catch (err) {
        console.error("Error fetching Terms policy:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPolicy();
  }, [slug]);

  return (
    <section id="terms" className="container my-5">
      {loading ? (
        <p className="text-center text-muted">Loading Terms & Conditions...</p>
      ) : !policy ? (
        <p className="text-center text-danger">No Terms & Conditions found.</p>
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

export default Terms;
