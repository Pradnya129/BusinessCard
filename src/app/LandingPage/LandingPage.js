'use client';

import React, { useEffect, useRef, useState } from 'react';
import ClipLoader from 'react-spinners/ClipLoader'; // 🌀 Spinner import

// CSS imports
import '../../../dist/assets/css/theme.min.css';
import '../../../dist/assets/css/theme.min.css';
import './LandingPage.css';

// Components
import Head from 'next/head';
import Header from '../Components/LandingPageComponents/Header';
import Hero from '../Components/LandingPageComponents/Hero';
import Consultant_Info from '../Components/LandingPageComponents/Consultant_Info';
import EmpoweringMinds from '../Components/LandingPageComponents/EmpoweringMinds';
import Plans from '../Components/LandingPageComponents/Plans';
import Stats from '../Components/LandingPageComponents/Stats';
import Contact_Calender from '../Components/LandingPageComponents/Contact_Calender';
import Footer from '../Components/LandingPageComponents/Footer';
import LeafletMap from '../Components/LandingPageComponents/LeafletMap';
import FAQSection from '../Components/LandingPageComponents/FAQSection';

const LandingPage = ({ admin }) => {
  const targetRef = useRef(null);
  const targetRefHeader = useRef(null);

  const [selectedPlan, setSelectedPlan] = useState({
    planName: '',
    planPrice: '',
    planDuration: '',
  });

  const [loading, setLoading] = useState(true); // 🔄 State to control loading spinner

  const scrollToSection = (planData) => {
    targetRef.current?.scrollIntoView({ behavior: 'smooth' });
    setSelectedPlan(planData);
  };

  const scrollToSectionHeader = () => {
    targetRefHeader.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // ✅ Spinner disappears once component mounts fully (simulate full content load)
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1200); // Adjust delay if needed (for smoother experience)
    return () => clearTimeout(timer);
  }, []);

  // 🔒 Show spinner until fully loaded
  if (loading) {
    return (
      <div
        style={{
          height: '100vh',
          width: '100vw',
          background: '#fff',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
          position: 'fixed',
          top: 0,
          left: 0,
        }}
      >
        <ClipLoader size={60} color="#2563EB" />
      </div>
    );
  }

  return (
    <>
      <Head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.2.7/semantic.min.css" />
        <link rel="stylesheet" href="../../../dist/assets/vendor/bootstrap/dist/css/bootstrap.min.css" />
        <link rel="stylesheet" href="https://fonts.googleapis.com" />
        <link rel="stylesheet" href="https://fonts.gstatic.com" />
      </Head>

      <div className="bg-white">
        <Hero scrollToSectionHeader={scrollToSectionHeader} />

        <div className="landing-page-container">
          <Header admin={admin} />
          <div className="section-light">
            <Consultant_Info />
          </div>
          <div className="section-alt">
            <EmpoweringMinds />
          </div>
          <div className="section-light">
            <Stats />
          </div>
          <div className="section-alt">
            <Plans scrollToSection={scrollToSection} ref={targetRefHeader} />
          </div>
          <div className="section-light">
            <Contact_Calender ref={targetRef} prefillData={selectedPlan} />
          </div>
          <div className="section-alt">
            <FAQSection />
          </div>
          <LeafletMap />
        </div>

        <Footer />

        {/* Scripts */}
        <script src="/dist/assets/js/theme.min.js" defer></script>
        <script src="/dist/assets/vendor/bootstrap/dist/js/bootstrap.bundle.min.js" defer></script>
        <script src="./node_modules/swiper/swiper-bundle.min.js" defer></script>
        <script src="https://cdn.jsdelivr.net/npm/chart.js" defer></script>
      </div>
    </>
  );
};

export default LandingPage;
