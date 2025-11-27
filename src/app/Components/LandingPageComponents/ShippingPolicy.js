"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import DOMPurify from "dompurify";
import { useSearchParams } from "next/navigation";

const API_URL = "https://appo.coinagesoft.com/api/public-landing/policy"; // slug-based API

const ShippingPolicy = () => {
  const searchParams = useSearchParams(); // ✅ add this
  const slug = searchParams.get("slug");   // ✅ get slug from URL

  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPolicy = async () => {
      if (!slug) return; // wait until slug is available

      try {
        const res = await axios.get(`${API_URL}/shipping?slug=${slug}`); // fetch by slug
        setPolicy(res.data.data);
      } catch (err) {
        console.error("Error fetching Shipping Policy:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPolicy();
  }, [slug]);

  return (
    <section id="shipping" className="mb-5 px-3 py-4">
      <div className="container">
        {loading ? (
          <p className="text-center text-muted">Loading Shipping Policy...</p>
        ) : !policy ? (
          <p className="text-center text-danger">No Shipping Policy found.</p>
        ) : (
          <>
            <h2 className="mb-3 fw-bold">{policy.title}</h2>
            <div
              style={{ whiteSpace: "pre-wrap", fontFamily: "inherit" }}
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(policy.content) }}
            />
          </>
        )}
      </div>
    </section>
  );
};

export default ShippingPolicy;
