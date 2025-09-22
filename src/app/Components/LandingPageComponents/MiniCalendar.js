"use client";
import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./MiniCalendar.css";
import axios from "axios";

const MiniCalendar = ({
  selected,
  onDateChange,
  onSlotSelect,
  duration,
  bookedTimeSlots = [],
  selectedSlot,
  planId,
}) => {
  const [timeSlots, setTimeSlots] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);

  // 🔹 Parse "10:00 AM" → Date (with baseDate = selected date)
  const parse12ToDate = (timeStr, baseDate) => {
    if (!timeStr) return null;
    const [time, modifier] = timeStr.split(" ");
    let [hours, minutes] = time.split(":").map(Number);
    if (modifier === "PM" && hours !== 12) hours += 12;
    if (modifier === "AM" && hours === 12) hours = 0;
    const d = new Date(baseDate);
    d.setHours(hours, minutes, 0, 0);
    return d;
  };

  // 🔹 Format helpers
  const format12 = (date) => {
    let h = date.getHours();
    const m = String(date.getMinutes()).padStart(2, "0");
    const period = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return `${h}:${m} ${period}`;
  };

  const isOverlapping = (s1, e1, s2, e2) => s1 < e2 && s2 < e1;

  // 🔹 Generate slots for a shift
  const generateTimeSlots = (shiftStart, shiftEnd, durationMin, bufferMin, baseDate) => {
    if (!shiftStart || !shiftEnd || !durationMin || durationMin <= 0) return [];
    const slots = [];
    let cur = new Date(shiftStart);

    while (true) {
      const slotEnd = new Date(cur.getTime() + durationMin * 60000);
      if (slotEnd > shiftEnd) break;

      slots.push({
        label: `${format12(cur)} - ${format12(slotEnd)}`,
        start: new Date(cur),
        end: new Date(slotEnd),
      });

      // move cur by duration + buffer
      cur = new Date(slotEnd.getTime() + (bufferMin || 0) * 60000);
    }
    return slots;
  };

  // 🔹 Fetch shift + booked slots
useEffect(() => {
  const fetchShiftAndGenerateSlots = async () => {
    if (!selected || !duration || !planId) return;

    const token = localStorage.getItem("token");

    try {
      const baseDate = new Date(selected);

      // ✅ Get slug from URL path (e.g. /landing/pradnya → "pradnya")
      const pathParts = window.location.pathname.split("/");
      const slug = pathParts[pathParts.length - 1];

      // 1. Get plan-shift-buffer for this admin via slug
      const bufferRes = await axios.get(
        `https://appo.coinagesoft.com/api/public-landing/all-rules/${slug}`,
      );

      const rule = bufferRes.data.rules.find((r) => r.planId === planId);
      if (!rule) {
        setTimeSlots([]);
        return;
      }

      // 2. Get shifts for this admin via slug
      const shiftRes = await axios.get(
        `https://appo.coinagesoft.com/api/public-landing/all-shifts/${slug}`,
      );
      const shift = shiftRes.data.data.find((s) => s.id === rule.shiftId);
      if (!shift) {
        setTimeSlots([]);
        return;
      }

      const shiftStart = new Date(`${selected}T${shift.startTime}`);
      const shiftEnd = new Date(`${selected}T${shift.endTime}`);

      // 3. Generate all slots
      const slots = generateTimeSlots(
        shiftStart,
        shiftEnd,
        Number(duration),
        rule.bufferInMinutes,
        baseDate
      );

      // 4. Fetch booked slots for that date via slug
     const bookedRes = await axios.get(
  `http://localhost:5000/api/public-landing/booked-slots/${selected}?slug=${slug}`,
);


      const bookedData = bookedRes.data?.data || [];

      // Convert booked slots → Date
      const bookedRanges = bookedData.map((b) => ({
        start: parse12ToDate(b.startTime, baseDate),
        end: parse12ToDate(b.endTime, baseDate),
      }));

      // 5. Filter booked
      const finalSlots = slots.map((slot) => {
        const isBooked = bookedRanges.some((b) =>
          isOverlapping(slot.start, slot.end, b.start, b.end)
        );
        return { ...slot, isBooked };
      });

      setTimeSlots(finalSlots);
    } catch (err) {
      console.error("❌ Error fetching shift/slots:", err);
      setTimeSlots([]);
    }
  };

  fetchShiftAndGenerateSlots();
}, [selected, duration, planId]);

  return (
    <div className="mx-auto mt-5 mt-sm-0" style={{ maxWidth: "35rem" }}>
      <div className="bg-white p-4 mt-5 mt-lg-0" style={{ maxHeight: "40rem", minHeight: "30rem" }}>
        <div className="calendar-container custom-calendar">
          <DatePicker
            inline
            selected={selected ? new Date(selected) : new Date()}
            onChange={(dateObj) => {
              if (!duration || !planId) {
                alert("Please select a plan first.");
                return;
              }
              onDateChange && onDateChange(dateObj.toISOString().split("T")[0]);
            }}
            minDate={new Date()}
          />

          {timeSlots.length > 0 && (
            <>
              <h6 className="fw-semibold mb-3 text-secondary">Available Slots</h6>
              <div className="slot-grid px-2 px-sm-0">
                {timeSlots.map(({ label, isBooked }, index) => {
                  const isSelected = selectedSlot === label;
                  return (
                    <button
                      key={index}
                      type="button"
                      className={`btn btn-sm rounded-pill px-3 py-2 fw-semibold ${
                        isBooked
                          ? "btn-secondary"
                          : isSelected
                          ? "btn-primary"
                          : "btn-outline-primary"
                      }`}
                      disabled={isBooked}
                      onClick={() => onSlotSelect(label)}
                      title={isBooked ? "Slot already booked" : "Available"}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MiniCalendar;
