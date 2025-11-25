'use client';
import React, { useRef, useState, useEffect } from 'react';
import '../../../dist/assets/css/theme.min.css';
import './LandingPage.css';
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

  const [isLoaded, setIsLoaded] = useState(false);

  const scrollToSection = (planData) => {
    setSelectedPlan(planData);
    targetRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToSectionHeader = () => {
    targetRefHeader.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Scroll to top when loaded
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  // Trigger fade-out after short delay
  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 700);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <Head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.2.7/semantic.min.css"
        />
        <link
          rel="stylesheet"
          href="../../../dist/assets/vendor/bootstrap/dist/css/bootstrap.min.css"
        />
      </Head>

      <div className="bg-white">
        {/* Smooth fade overlay */}
        <div className={`page-fade-overlay ${isLoaded ? 'fade-out' : ''}`}></div>

        {/* Always render Hero first */}
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

          <div className="section-alt" ref={targetRefHeader}>
            <Plans scrollToSection={scrollToSection} />
          </div>

          <div
            className="section-light"
            ref={targetRef}
            style={{ marginBottom: '14rem' }}
          >
            <Contact_Calender prefillData={selectedPlan} />
          </div>

          <div className="section-alt">
            <FAQSection />
          </div>

          <LeafletMap />
        </div>
 
        <Footer />

        {/* Scripts at end */}
        <script src="/dist/assets/js/theme.min.js" defer></script>
        <script src="/dist/assets/vendor/bootstrap/dist/js/bootstrap.bundle.min.js" defer></script>
      </div>
    </>
  );
};

export default LandingPage;
