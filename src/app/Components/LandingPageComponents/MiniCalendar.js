'use client';
import React, { useState, useEffect, useMemo } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";
import "./MiniCalendar.css"; // <- Ensure this file exists at: ./MiniCalendar.css
import { useRouter } from "next/navigation";
import { FaArrowLeft } from "react-icons/fa";

const MiniCalendar = ({
  selected,        // string: "YYYY-MM-DD" or Date-compatible
  onDateChange,    // fn(dateString)
  onSlotSelect,    // fn(slotLabel)
  duration,        // number (minutes)
  bookedTimeSlots = [],
  selectedSlot,
  planId,
  planName,     // ADD THIS
  planPrice,
}) => {
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [hover, setHover] = useState(false);

  // helper: parse "10:00 AM" -> Date on baseDate
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
useEffect(() => {
  if (!selected) {
    const todayIso = new Date().toISOString().split("T")[0];
    onDateChange && onDateChange(todayIso);
  }
}, [selected, onDateChange]);


  const generateTimeSlots = (shiftStart, shiftEnd, durationMin, bufferMin) => {
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
  // memoize slug derivation
  const slug = useMemo(() => {
    try {
      const hostname = typeof window !== "undefined" ? window.location.hostname : "";
      const pathname = typeof window !== "undefined" ? window.location.pathname : "";
      let s = "";
      if (hostname.includes("www.appointify.me") || hostname.includes("localhost")) {
        s = pathname.split("/")[1] || "";
      } else {
        s = hostname || "";
      }
      return s;
    } catch (e) {
      return "";
    }
  }, []);

  useEffect(() => {
    const fetchShiftAndGenerateSlots = async () => {
      // required pieces
      if (!selected || !duration || !planId) {
        setTimeSlots([]);
        return;
      }

      setLoading(true);
      try {
        const baseDate = new Date(selected);
        // 1) get rules
        const bufferRes = await axios.get(
          `https://appo.coinagesoft.com/api/public-landing/all-rules?slug=${slug}`
        );
        const rules = bufferRes?.data?.rules || [];
        const rule = rules.find(r => String(r.planId) === String(planId));
        if (!rule) {
          setTimeSlots([]);
          return;
        }

        // 2) get shifts
        const shiftRes = await axios.get(
          `https://appo.coinagesoft.com/api/public-landing/all-shifts?slug=${slug}`
        );
        const shifts = shiftRes?.data?.data || [];
        const shift = shifts.find(s => String(s.id) === String(rule.shiftId));
        if (!shift) {
          setTimeSlots([]);
          return;
        }

        // construct shift start & end on the selected date
        // shift.startTime expected format "09:00:00" or "09:00"
        const shiftStart = new Date(`${selected}T${shift.startTime}`);
        const shiftEnd = new Date(`${selected}T${shift.endTime}`);

        // 3) generate base slots
        const slots = generateTimeSlots(
          shiftStart,
          shiftEnd,
          Number(duration),
          Number(rule.bufferInMinutes || 0)
        );

        // 4) get users assigned to plan
        const usersRes = await axios.get(
          `https://appo.coinagesoft.com/api/public-landing/allUsersByPlan`,
          { params: { slug, planId } }
        );
        const users = usersRes?.data?.data || [];

        // if no users, all slots free
        if (!users.length) {
          setTimeSlots(slots.map(s => ({ ...s, isBooked: false })));
          return;
        }

        // 5) fetch booked slots for each user for that date
        const dateStr = new Date(selected).toISOString().split("T")[0];
        const bookedResults = await Promise.all(
          users.map(async (user) => {
            try {
              const res = await axios.get(
                `https://appo.coinagesoft.com/api/public-landing/booked-slots/${dateStr}`,
                { params: { userId: user.id, planId, slug } }
              );
              return res?.data?.data || [];
            } catch (err) {
              console.error("Error fetching booked slots for user", user.id, err);
              return [];
            }
          })
        );
        const allBooked = bookedResults.flat();

        // map booked ranges to Dates
        const bookedRanges = allBooked.map(b => ({
          start: parse12ToDate(b.startTime, baseDate),
          end: parse12ToDate(b.endTime, baseDate),
        }));
        const now = new Date();

        const filteredSlots = slots.map(slot => {
          let isPast = false;

          // If slot is today AND slot start time is before now
          if (
            slot.start.toDateString() === now.toDateString() &&
            slot.start.getTime() <= now.getTime()
          ) {
            isPast = true;
          }

          return {
            ...slot,
            isPast,
          };
        });

        // mark slots if overlapping any booked range
        const finalSlots = filteredSlots.map(slot => {
          const isBooked = bookedRanges.some(b => {
            if (!b.start || !b.end) return false;
            return (
              b.start.getTime() === slot.start.getTime() &&
              b.end.getTime() === slot.end.getTime()
            );
          });

          return {
            ...slot,
            isBooked: isBooked || slot.isPast,
          };
        });

        setTimeSlots(finalSlots);


        setTimeSlots(finalSlots);
      } catch (err) {
        console.error("❌ Error fetching/generating slots:", err);
        setTimeSlots([]);
      } finally {
        setLoading(false);
      }
    };

    fetchShiftAndGenerateSlots();
  }, [selected, duration, planId, slug]);

  // UI: Calendly-like three-column layout
  return (

    <div className="card mx-auto calendar-card mt-lg-5" >
      <div className="d-flex align-items-center mb-3" style={{ padding: 10 }}>
        <button
          type="button"
          onClick={() => router.back()}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 40, // similar circular size
            height: 40, // height same as width
            fontSize: 20,
            fontWeight: 800,
            borderRadius: "50%",
            border: "1px solid #d0d0d0",
            backgroundColor: hover ? "#e6f0ff" : "#f8f9fa",
            color: hover ? "#0c6cd3" : "#0f65c7",
            cursor: "pointer",
            transition: "all 0.2s ease-in-out",
          }}
        >
          <FaArrowLeft />

        </button>
      </div>
      <div className="mb-5 d-flex justify-content-center calendly-layout">

        {/* LEFT: Meeting Info */}
        <div className="pb-3 calendly-info ">
          <div style={{ padding: 10 }} >
            <h4 style={{ margin: 0, fontWeight: 700 }}>{planName}</h4>
            <div style={{ marginTop: 10, color: "#444" }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <div style={{ fontSize: 14, color: "#666" }}>⏱</div>
                <div style={{ fontWeight: 600 }}>{duration ? `${duration} minutes` : "—"}</div>
              </div>
              <div style={{ marginTop: 12, color: "#666", fontSize: 14 }}>
                You’ll receive all appointment details after confirmation.              </div>
            </div>
          </div>
        </div>

        {/* CENTER: Calendar */}
        <div
          className="p-lg-3 border-start calendly-calendar"
          
        >
          <div style={{ padding: 6 }}>
            <DatePicker
              inline
              selected={selected ? new Date(selected) : new Date()}
              onChange={(dateObj) => {
                if (!duration || !planId) {
                  alert("Please select a plan first.");
                  return;
                }
                // convert to YYYY-MM-DD
                const iso = dateObj.toISOString().split("T")[0];
                onDateChange && onDateChange(iso);
              }}
              minDate={new Date()}
              calendarClassName="custom-calendar"
              dayClassName={(date) => {
                // optionally mark dates with dots (use bookedTimeSlots param if you calculate)
                // For now return '' or 'date-has-dot' if any bookedTimeSlots include that date
                const dateIso = date.toISOString().split("T")[0];
                if (bookedTimeSlots && bookedTimeSlots.includes(dateIso)) return "date-has-dot";
                return "";
              }}
            />
          </div>
        </div>

        {/* RIGHT: Slots */}
        <div
          className="calendly-slots"
      
        >

          <div style={{ padding: 7 }}>
            {/* Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                position: "sticky",
                top: 0,
                background: "#fff",
                zIndex: 2,
                paddingBottom: 6,
              }}
            >
              <h6 style={{ margin: 0, fontWeight: 400 }} >Select a Time</h6>
              <div style={{ color: "#666", fontSize: 13 }}>
                {selected || "Choose date"}
              </div>
            </div>

            {/* Slot container */}
            <div style={{ marginTop: 10 }}>
              {!planId ? (
                <div className="text-center text-warning">
                  Please select a plan first from form to see available slots.
                </div>
              ) : loading ? (
                <div className="text-info">Loading available slots...</div>
              ) : timeSlots.length === 0 ? (
                <div className="text-warning">No slots available for selected date</div>
              ) : (
                <div
                  className="slot-dropdown"
                  style={{
                    maxHeight: 300,       // 🔥 controls dropdown height
                    overflowY: "auto",
                    overflowX: "hidden",  // 🔥 scroll instead of page grow
                    paddingRight: 2,
                  }}
                >
                  <div className="slot-grid calendly-slot-grid pb-3 mb-5">
                    {timeSlots.map(({ label, isBooked }, index) => {
                      const isSelected = selectedSlot === label;

                      return (
                        <div key={index} className="slot-row">
                          <button
                            type="button"
                            className={`slot-btn 
                      ${isBooked ? "booked" : isSelected ? "selected" : "available"}`}
                            disabled={isBooked}
                            onClick={() => onSlotSelect(label)}
                          >
                            {label}
                          </button>

                          {isSelected && (
                            <button
                              className="next-btn"
                              onClick={() =>
                                router.push(
                                  `/${slug}/ContactForm?planId=${planId}&planName=${planName}&planDuration=${duration}&selectedDate=${selected}&planPrice=${planPrice}&selectedSlot=${label}`
                                )
                              }
                            >
                              Next
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default MiniCalendar;
