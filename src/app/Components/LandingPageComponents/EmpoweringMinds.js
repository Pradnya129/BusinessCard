'use client';
import React, { useEffect, useState } from 'react';

const EmpoweringMinds = () => {
  const [consultantInfo, setConsultantInfo] = useState(null); // initially null = loading

  useEffect(() => {
    const fetchData = async () => {
      try {
        let slug = window.location.hostname;
        if (!slug) throw new Error("Slug not found in hostname");
 console.log("slug",slug)
        const response = await fetch(`https://appo.coinagesoft.com/api/public-landing/?slug=${slug}`);
        if (!response.ok) throw new Error("Failed to fetch consultant data");

        const result = await response.json();
        const data = result.data;

        const rawDescription = data?.section3_Description || "";
        const formattedDescription = rawDescription
          .split("',")
          .map(s => s.replace(/^'/, "").trim())
          .filter(line => line.length > 0);

        setConsultantInfo({
          section3_Tagline: data?.section3_Tagline || "",
          section3_Description: formattedDescription,
          section3_Image: data?.section3_Image || ""
        });
      } catch (error) {
        console.error("Error fetching consultant data:", error);
        setConsultantInfo({ section3_Tagline: "", section3_Description: [], section3_Image: "" }); // prevent crash
      }
    };

    fetchData();
  }, []);

  // Show nothing while loading
  if (!consultantInfo) return null;

  // Optional: don't render if no content
  const { section3_Tagline, section3_Description, section3_Image } = consultantInfo;
  const isEmpty = !section3_Tagline && section3_Description.length === 0 && !section3_Image;
  if (isEmpty) return null;

  return (
    <div className="container bg-grey py-5 px-3 px-md-4 px-lg-5">
      <div className="row justify-content-lg-between">
        <div className="col-lg-8 mt-3 pt-3">
          <h2>{section3_Tagline}</h2>

          {section3_Description.map((text, index) => (
            <p key={index}>{text}</p>
          ))}
        </div>

        <div className="col-lg-4 mb-5 mb-lg-0">
          <img
            src={`https://appo.coinagesoft.com/${section3_Image}`}
            alt={section3_Tagline}
            className="img-fluid"
            style={{ maxWidth: "100%", maxHeight: "300px", objectFit: "cover" }}
          />
        </div>
      </div>
    </div>
  );
};

export default EmpoweringMinds;
