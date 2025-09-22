"use client";
import React, { useEffect } from 'react'
import Plan_List from '../../Components/Main_Dashboard/Plans/Plan_List_updated'
import Sidebar from '../../Components/Main_Dashboard/Dashboard_Page_Components/Sidebar'
import Navbar from '../../Components/Main_Dashboard/Dashboard_Page_Components/Navbar'
import { useRouter } from 'next/navigation'

const Page = () => {
    const router = useRouter();
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/');
    }
  }, []);

  return (

        <Plan_List/>

  )
}

export default Page
