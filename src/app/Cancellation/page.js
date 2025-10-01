import React from 'react'
import CancellationPolicy from '../Components/LandingPageComponents/CancellationPolicy'
import Header from 'app/Components/LandingPageComponents/Header'
import Footer from 'app/Components/LandingPageComponents/Footer'
import "../Components/LandingPageComponents/policies.css"
const page = () => {
  return (
    <div className="page-container">
 <div className="mb-10">
       <Header />
   </div>
   <main className='mt-6'>

<CancellationPolicy/>
   </main>
<Footer/>
    </div>
)
}

export default page