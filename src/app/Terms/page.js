"use client";

import React from "react";
import Terms from "../Components/LandingPageComponents/Terms";
import Footer from "app/Components/LandingPageComponents/Footer";
import Header from "app/Components/LandingPageComponents/Header";
import "../Components/LandingPageComponents/policies.css"
const Page = () => {
  return (
    <div className="page-container"> {/* ✅ Use min-h-screen */}
   <div className="mb-10">
       <Header />
   </div>

      {/* Main content grows to push footer down */}
      <main className=""> {/* ✅ Add padding so header doesn't overlap */}
        <Terms />
      </main>

      <Footer /> {/* ✅ Footer stays at bottom */}
    </div>
  );
};

export default Page;
