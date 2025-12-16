'use client';
import React, { useEffect, useState } from "react";
import MiniCalendar from "./MiniCalendar.js";

export default function CalendarOnly({ prefillData }) {

  const [formData, setFormData] = useState({
    appointmentDate: "",
    appointmentTime: "",
    duration: "",
  });

  const [bookedTimeSlots, setBookedTimeSlots] = useState([]);

  useEffect(() => {
    console.log("first", prefillData)
    if (prefillData) {
      setFormData(prev => ({
        ...prev,
        duration: prefillData.planDuration,
      }));
    }
  }, [prefillData]);

  const handleDateSelect = (date) => {
    console.log("Calendar Received Plan:", prefillData);

    setFormData(prev => ({
      ...prev,
      appointmentDate: date
    }));
    setBookedTimeSlots([]);
  };

  const handleSlotSelect = (slot) => {
    setFormData(prev => ({
      ...prev,
      appointmentTime: slot
    }));
  };

  return (
    <>
  <MiniCalendar
        selected={formData.appointmentDate}
        onDateChange={handleDateSelect}
        selectedSlot={formData.appointmentTime}
        onSlotSelect={handleSlotSelect}
        planName={prefillData?.planName}
        planPrice={prefillData?.planPrice}
        duration={prefillData?.planDuration}   // FIXED
        planId={prefillData?.planId}          // FIXED
        bookedSlots={bookedTimeSlots}
      />

     

    
    </>
  );
}
