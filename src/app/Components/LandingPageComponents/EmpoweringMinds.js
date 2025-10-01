'use client';
import React, { useEffect, useState } from 'react';
const API_URL = process.env.REACT_APP_API_URL;
const EmpoweringMinds = () => {
  const [consultantInfo, setConsultantInfo] = useState({
    section3_Tagline: '',
    section3_Description: [],
    section3_Image: ''
  });

useEffect(() => {
  const fetchData = async () => {
    try {
      // ✅ Extract slug from hostname first, fallback to URL path
      let slug = window.location.hostname; // e.g., booking.vedratnavastu.com
    

      if (!slug) throw new Error("Slug not found in URL or hostname");

      // ✅ Fetch landing page data for this tenant
      const response = await fetch(`https://appo.coinagesoft.com/api/public-landing/?slug=${slug}`);
      if (!response.ok) throw new Error("Failed to fetch consultant data");

      const result = await response.json();
      const data = result.data;

      // ✅ Split description into array of paragraphs
      const rawDescription = data?.section3_Description || "";
      const formattedDescription = rawDescription
        .split("',") // or "\n" if your backend uses newlines
        .map(s => s.replace(/^'/, "").trim())
        .filter(line => line.length > 0);

      // ✅ Update state
      setConsultantInfo({
        section3_Tagline: data?.section3_Tagline || "",
        section3_Description: formattedDescription,
        section3_Image: data?.section3_Image || ""
      });
    } catch (error) {
      console.error("Error fetching consultant data:", error);
    }
  };

  fetchData();
}, []);



  return (
    <div className="container bg-grey py-5  px-3 px-md-4 px-lg-5">
      <div className="row justify-content-lg-between">
        <div className="col-lg-8 mt-3 pt-3">
          <h2>{consultantInfo.section3_Tagline}</h2>

          {Array.isArray(consultantInfo.section3_Description) &&
            consultantInfo.section3_Description.map((text, index) => (
              <p key={index}>{text}</p>
            ))}
        </div>
        <div className="col-lg-4 mb-5 mb-lg-0">
          <img
            src={
              consultantInfo.section3_Image
                ? `https://appo.coinagesoft.com/${consultantInfo.section3_Image}`
                : "/assets/img/psychological-help-jpg.jpg"
            }
            // alt="Empowering Minds"
            alt={consultantInfo.section3_Tagline || "Empowering Minds"}
            // style={{ width: "400px" }}
            className="img-fluid"
            style={{ maxWidth: "100%", maxHeight: "300px", objectFit: "cover" }}
          />
        </div>

        
      </div>
    </div>
  );
};

export default EmpoweringMinds;
