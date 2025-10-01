import React from 'react'
import ContactUs from '../Components/LandingPageComponents/Contactus'
import "../Components/LandingPageComponents/policies.css"
import Header from 'app/Components/LandingPageComponents/Header'
import Footer from 'app/Components/LandingPageComponents/Footer'

const page = () => {
  return (
  <div className="page-container">
 <div className="mb-10">
       <Header />
   </div>
   <main>

      <ContactUs/>
   </main>
      <Footer/>
    </div>
  )
}

export default page