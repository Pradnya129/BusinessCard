"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import DOMPurify from "dompurify";
import { useSearchParams } from "next/navigation"; // ✅ app router hook

const API_URL = "https://appo.coinagesoft.com/api/public-landing/policy";

const PrivacyPolicy = () => {
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug"); // ✅ get slug from URL query
console.log("slug params",slug)
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPolicy = async () => {
      if (!slug) return; // wait until slug is available

      try {
        const res = await axios.get(`${API_URL}/privacy?slug=${slug}`);
        setPolicy(res.data.data);
      } catch (err) {
        console.error("Policy fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPolicy();
  }, [slug]);

  return (
    <section className="container my-5">
      {loading ? (
        <p className="text-center text-muted fs-5">Loading Privacy Policy...</p>
      ) : !policy ? (
        <p className="text-center text-danger fs-5">No Privacy Policy found.</p>
      ) : (
        <>
          <h2 className="mb-3 fw-bold">{policy.title}</h2>
          <div
            style={{ whiteSpace: "pre-wrap" }}
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(policy.content) }}
          />
        </>
      )}
    </section>
  );
};

export default PrivacyPolicy;
