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
        const urlParams = new URLSearchParams(window.location.search);
        const adminId = urlParams.get('adminId') || '67adc6aa-6fac-4c37-9f00-632bf483b916';
        const response = await fetch(`http://103.224.247.28:5000/api/landing/${adminId}`);
        if (!response.ok) throw new Error("Failed to fetch consultant data");

        const result = await response.json();
        const data = result.data;

        // Split the long description string into array of paragraphs
        const rawDescription = data.section3_Description || '';
        const formattedDescription = rawDescription
          .split("',") // You can change this if needed to '\n' or a custom delimiter
          .map(s => s.replace(/^'/, '').trim())
          .filter(line => line.length > 0);

        // Update state with formatted data
        setConsultantInfo({
          section3_Tagline: data.section3_Tagline || '',
          section3_Description: formattedDescription,
          section3_Image: data.section3_Image || ''
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
                ? `http://103.224.247.28:5000${consultantInfo.section3_Image}`
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
