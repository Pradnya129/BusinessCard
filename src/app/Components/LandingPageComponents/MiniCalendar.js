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
const [loading, setLoading] = useState(false);

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



  useEffect(() => {
    const fetchShiftAndGenerateSlots = async () => {
      console.log("selected",selected,"planid ",planId)  
      if (!selected || !duration || !planId) {
        console.log("time slot empty")
        setTimeSlots([]); // ❌ No plan selected → clear slots
        return;
      }

      try {
              setLoading(true); // ✅ start loading

    

        const baseDate = new Date(selected);
        const slug = window.location.hostname;
  console.log("slug by mini",slug)
        // 1️⃣ Get plan-shift-buffer
        const bufferRes = await axios.get(
          `https://appo.coinagesoft.com/api/public-landing/all-rules?slug=${slug}`
        );
        const rule = bufferRes.data.rules.find(r => r.planId === planId);
        if (!rule) {
          setTimeSlots([]);
          return;
        }
console.log("mini rule",rule)
        // 2️⃣ Get shifts
        const shiftRes = await axios.get(
          `https://appo.coinagesoft.com/api/public-landing/all-shifts?slug=${slug}`
        );
        const shift = shiftRes.data.data.find(s => s.id === rule.shiftId);
        if (!shift) {
          setTimeSlots([]);
          return;
        }
        console.log("shift mini",shift)
        
        const shiftStart = new Date(`${selected}T${shift.startTime}`);
        const shiftEnd = new Date(`${selected}T${shift.endTime}`);

        console.log("mini shiftstart",shiftStart)
        console.log("mini shiftend",shiftEnd)

        console.log("Shift start raw:", shift.startTime);
console.log("Shift start constructed:", shiftStart.toString());

        // 3️⃣ Generate all slots
        const slots = generateTimeSlots(
          shiftStart,
          shiftEnd,
          Number(duration),
          rule.bufferInMinutes,
          baseDate
        );
console.log("mini slots",slots)
        // 4️⃣ Get only users assigned to this plan
        const usersRes = await axios.get(
          `https://appo.coinagesoft.com/api/public-landing/allUsersByPlan`,
          { params: { slug, planId } }
        );
        const users = usersRes.data?.data || [];
        console.log("Users assigned to this plan:", users);

        if (!users.length) {
          setTimeSlots(slots); // no users, all slots are free
          return;
        }

        // 5️⃣ Fetch booked slots (filtered by both user + planId + slug)
        const bookedResults = await Promise.all(
          users.map(async (user) => {
            try {
              const dateStr = new Date(selected).toISOString().split("T")[0];
              const res = await axios.get(
                `https://appo.coinagesoft.com/api/public-landing/booked-slots/${dateStr}`,
                { params: { userId: user.id, planId, slug } }
                // 👈 added slug here
              );
              return res.data?.data || [];
            } catch (err) {
              console.error(`Error fetching booked slots for user ${user.id}`, err);
              return [];
            }
          })
        );

        const allBooked = bookedResults.flat();

        // convert to Date ranges
        const bookedRanges = allBooked.map(b => ({
          start: parse12ToDate(b.startTime, baseDate),
          end: parse12ToDate(b.endTime, baseDate),
        }));

        // mark slots as booked only for this plan
        const finalSlots = slots.map(slot => {
          const isBooked = bookedRanges.some(
            b => b.start.getTime() === slot.start.getTime() && b.end.getTime() === slot.end.getTime()
          );
          return { ...slot, isBooked };
        });



        setTimeSlots(finalSlots);
        console.log("mini finalsots".finalSlots)

      } catch (err) {
        console.error("❌ Error fetching shift/slots:", err);
        setTimeSlots([]);
      }finally {
      setLoading(false); // ✅ end loading
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
          {!planId && (
            <div className="text-center mt-3 text-warning">
              Please select a plan first from form to see available slots.
            </div>
          )}

{planId && (
  <>
    {loading ? (
      <div className="text-center text-info mt-3">
        Loading available slots...
      </div>
    ) : timeSlots.length > 0 ? (
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
    ) : (
      <div className="text-center text-warning mt-3">
        No slots available for selected date
      </div>
    )}
  </>
)}
      </div>
      </div>
    </div>
  );
};

export default MiniCalendar;
