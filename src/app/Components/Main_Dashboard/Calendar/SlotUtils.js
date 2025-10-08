import { useState, useEffect } from "react";
import axios from "axios";

// Helpers
export const format12 = (date) => {
  if (!date) return '';
  let h = date.getHours();
  const m = String(date.getMinutes()).padStart(2, '0');
  const period = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${m} ${period}`;
};

export const format24 = (date) => {
  if (!date) return '';
  return date.toTimeString().slice(0,5);
};

export const parse12ToDate = (timeStr, baseDate) => {
  if (!timeStr) return null;
  const [time, modifier] = timeStr.split(" ");
  let [hours, minutes] = time.split(":").map(Number);
  if (modifier === "PM" && hours !== 12) hours += 12;
  if (modifier === "AM" && hours === 12) hours = 0;
  const d = new Date(baseDate);
  d.setHours(hours, minutes, 0, 0);
  return d;
};

export const parse24ToDate = (time24, baseDate) => {
  if (!time24) return null;
  const [hStr, mStr] = time24.split(':');
  const d = new Date(baseDate);
  d.setHours(parseInt(hStr,10), parseInt(mStr,10), 0,0);
  return d;
};

export const isOverlapping = (s1,e1,s2,e2) => s1 < e2 && s2 < e1;

export const generateTimeSlots = (startDate, endDate, durationMin, bufferMin=0) => {
  if (!startDate || !endDate || !durationMin || durationMin <= 0) return [];
  const slots = [];
  let cur = new Date(startDate);

  while(true){
    const slotEnd = new Date(cur.getTime() + durationMin * 60000);
    if (slotEnd > endDate) break;

    slots.push({
      label: `${format12(cur)} - ${format12(slotEnd)}`,
      value: `${format12(cur)} - ${format12(slotEnd)}`,
      start: format24(cur),
      end: format24(slotEnd),
    });

    cur = new Date(slotEnd.getTime() + bufferMin*60000);
  }

  return slots;
};

// Fetch all booked slots for a plan on a date
export const fetchBookedSlots = async (selectedDate, planId, slug="booking.vedratnavastu.com") => {
  if (!planId) return [];

  try {
    const usersRes = await axios.get(
      `https://appo.coinagesoft.com/api/public-landing/allUsersByPlan`,
      { params: { planId, slug } }
    );
    const users = usersRes.data?.data || [];
    if (!users.length) return [];

    const bookedResults = await Promise.all(
      users.map(async user => {
        const dateStr = new Date(selectedDate).toISOString().split("T")[0];
        const res = await axios.get(
          `https://appo.coinagesoft.com/api/public-landing/booked-slots/${dateStr}`,
          { params: { userId: user.id, planId, slug } }
        );
        return res.data?.data || [];
      })
    );

    return bookedResults.flat();
  } catch (err) {
    console.error("Failed to fetch booked slots", err);
    return [];
  }
};

// Mark which slots are booked
export const markSlotsBooked = (slots, bookedSlots, selectedDate) => {
  return slots.map(slot => {
    const slotStart = parse24ToDate(slot.start, new Date(selectedDate));
    const slotEnd = parse24ToDate(slot.end, new Date(selectedDate));

    const isBooked = bookedSlots.some(b => {
      const bStart = parse12ToDate(b.startTime, new Date(selectedDate));
      const bEnd = parse12ToDate(b.endTime, new Date(selectedDate));
      const status = (b.status || '').toLowerCase();
      return isOverlapping(slotStart, slotEnd, bStart, bEnd) &&
             ['scheduled','rescheduled','pending'].includes(status);
    });

    return {...slot, isBooked};
  });
};

// Main hook
export const useTimeSlots = ({shiftStart, shiftEnd, duration, buffer, selectedDate, planId}) => {
  const [slots, setSlots] = useState([]);

  useEffect(() => {
    if (!shiftStart || !shiftEnd || !duration || !selectedDate || !planId) {
      setSlots([]);
      return;
    }

    const loadSlots = async () => {
      const allSlots = generateTimeSlots(shiftStart, shiftEnd, Number(duration), Number(buffer || 0));
      const booked = await fetchBookedSlots(selectedDate, planId);
      const finalSlots = markSlotsBooked(allSlots, booked, selectedDate);
      setSlots(finalSlots);
    };

    loadSlots();
  }, [shiftStart, shiftEnd, duration, buffer, selectedDate, planId]);

  return slots;
};
