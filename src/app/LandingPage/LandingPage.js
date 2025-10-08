'use client';
import React, { useEffect, useRef, useState } from 'react'
import '../../../dist/assets/css/theme.min.css'
import '../../../dist/assets/css/theme.min.css'
import Header from '../Components/LandingPageComponents/Header'
import Hero from '../Components/LandingPageComponents/Hero'
import Head from 'next/head';
import Consultant_Info from '../Components/LandingPageComponents/Consultant_Info';
import EmpoweringMinds from '../Components/LandingPageComponents/EmpoweringMinds';
import Plans from '../Components/LandingPageComponents/Plans';
import Stats from '../Components/LandingPageComponents/Stats';
import Contact_Calender from '../Components/LandingPageComponents/Contact_Calender';
import Footer from '../Components/LandingPageComponents/Footer';
import LeafletMap from '../Components/LandingPageComponents/LeafletMap';
import FAQSection from '../Components/LandingPageComponents/FAQSection';
import './LandingPage.css'

const LandingPage = ({ admin }) => {
  const targetRef = useRef(null);
  const targetRefHeader = useRef(null);
  const [selectedPlan, setSelectedPlan] = useState({
    planName: '',
    planPrice: '',
    planDuration: '',
  });
  const scrollToSection = (planData) => {
    targetRef.current?.scrollIntoView({ behavior: 'smooth' });
    setSelectedPlan(planData)
  };
  const scrollToSectionHeader = () => {
    targetRefHeader.current?.scrollIntoView({ behavior: 'smooth' });
  };


  return (
    <>
      <Head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.2.7/semantic.min.css" />
        <link rel="stylesheet" href="../../../dist/assets/vendor/bootstrap/dist/css/bootstrap.min.css" />
        <link rel="stylesheet" href="https://fonts.googleapis.com" />
        <link rel="stylesheet" href="https://fonts.gstatic.com" />
      </Head >
      <div className='bg-white '>
        <Hero scrollToSectionHeader={scrollToSectionHeader} />
      <div className='landing-page-container'>

        {/* Content */}
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

      </div>
        <LeafletMap />
        <Footer />

        {/* Scripts */}

        <script src="/dist/assets/js/theme.min.js" defer></script>
        <script src="/dist/assets/vendor/bootstrap/dist/js/bootstrap.bundle.min.js" defer></script>
        <script src="./node_modules/swiper/swiper-bundle.min.js" defer></script>

        <script src="https://cdn.jsdelivr.net/npm/chart.js" defer></script>


        <script src="https://cdn.jsdelivr.net/npm/chart.js" defer></script>
      </div>
    </>
  )
}

export default LandingPage
