import React from 'react'
import ShippingPolicy from '../Components/LandingPageComponents/ShippingPolicy'
import Footer from 'app/Components/LandingPageComponents/Footer'
import '../Components/LandingPageComponents/policies.css'
import Header from 'app/Components/LandingPageComponents/Header'
import "../Components/LandingPageComponents/policies.css"

const page = () => {
  return (
    <div className="page-container">
     <div className="mb-10">
       <Header />
   </div>
   <main>

<ShippingPolicy/>
   </main>
    <Footer/>
    </div>

)
}

export default page