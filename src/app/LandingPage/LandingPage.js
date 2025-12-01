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

// Import skeleton
import SkeletonLoader from '../../app/LandingPage/SkeltonLoader.js';

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

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  // Set loading time
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
        {/* Fade overlay */}
        <div className={`page-fade-overlay ${isLoaded ? 'fade-out' : ''}`}></div>

        {/* Hero always shown */}
        <Hero scrollToSectionHeader={scrollToSectionHeader} />

        <div className="landing-page-container">
          {/* Header */}
          {isLoaded ? <Header admin={admin} /> : <SkeletonLoader height={70} />}

          {/* Consultant Info */}
          <div className="section-light">
            {isLoaded ? <Consultant_Info /> : <SkeletonLoader height={300} />}
          </div>

          {/* Empowering Minds */}
          <div className="section-alt">
            {isLoaded ? <EmpoweringMinds /> : <SkeletonLoader height={280} />}
          </div>

          {/* Stats */}
          <div className="section-light">
            {isLoaded ? <Stats /> : <SkeletonLoader height={220} />}
          </div>

          {/* Plans */}
          <div className="section-alt" ref={targetRefHeader}>
            {isLoaded ? (
              <Plans scrollToSection={scrollToSection} />
            ) : (
              <SkeletonLoader height={300} />
            )}
          </div>

          {/* Contact Calendar */}
          <div
            className="section-light"
            ref={targetRef}
            style={{ marginBottom: '14rem' }}
          >
            {isLoaded ? (
              <Contact_Calender prefillData={selectedPlan} />
            ) : (
              <SkeletonLoader height={350} />
            )}
          </div>

          {/* FAQ */}
          <div className="section-alt">
            {isLoaded ? <FAQSection /> : <SkeletonLoader height={250} />}
          </div>

          {/* Map (optional skeleton) */}
          {isLoaded ? <LeafletMap /> : <SkeletonLoader height={350} />}
        </div>

        <Footer />

        {/* Scripts */}
        <script src="/dist/assets/js/theme.min.js" defer></script>
        <script
          src="/dist/assets/vendor/bootstrap/dist/js/bootstrap.bundle.min.js"
          defer
        ></script>
      </div>
    </>
  );
};

export default LandingPage;
