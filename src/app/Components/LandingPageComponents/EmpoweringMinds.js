'use client';
import React, { useEffect, useState } from 'react';

const EmpoweringMinds = () => {
  const [consultantInfo, setConsultantInfo] = useState(null); // initially null = loading


  useEffect(() => {
    const fetchData = async () => {
      try {
        let slug = window.location.hostname;
        if (!slug) throw new Error("Slug not found in hostname");
        console.log("slug", slug);
        const response = await fetch(`https://appo.coinagesoft.com/api/public-landing/?slug=${slug}`);
        if (!response.ok) throw new Error("Failed to fetch consultant data");

        const result = await response.json();
        const data = result.data;

        setConsultantInfo({
          section3_Tagline: data?.section3_Tagline || "",
          section3_Description: data?.section3_Description || "", // ✅ now keep HTML string as-is
          section3_Image: data?.section3_Image || ""
        });
      } catch (error) {
        console.error("Error fetching consultant data:", error);
        setConsultantInfo({ section3_Tagline: "", section3_Description: "", section3_Image: "" }); // prevent crash
      }
    };

    fetchData();
  }, []);

  // Show nothing while loading
  if (!consultantInfo) return null;

  // Optional: don't render if no content
  const { section3_Tagline, section3_Description, section3_Image } = consultantInfo;
  const isEmpty = !section3_Tagline && !section3_Description && !section3_Image;
  if (isEmpty) return null;

  return (
    <div className="container bg-grey py-5 px-3 px-md-4 px-lg-5">
      <div className="row justify-content-lg-between align-items-center">
        <div className="col-lg-8 mt-3 pt-3">
          <h3 className='text-dark fw-bold mb-1'>{section3_Tagline}</h3>

          {/* ✅ Render formatted HTML directly */}
          <div dangerouslySetInnerHTML={{ __html: section3_Description }} />
        </div>

        <div className="col-lg-4 mb-5 mb-lg-0 mt-3 mt-lg-0 text-center">
          {section3_Image && (
            <img
              src={`https://appo.coinagesoft.com/${section3_Image}`}
              alt={section3_Tagline}
              className="img-fluid rounded"
              style={{ maxWidth: "100%", maxHeight: "400px", objectFit: "cover" }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default EmpoweringMinds;
