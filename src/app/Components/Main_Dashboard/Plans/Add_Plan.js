'use client';
import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API_URL = process.env.REACT_APP_API_URL;

const Add_Plan = () => {
  const [formData, setFormData] = useState({
    planName: '',
    planPrice: '',
    planDuration: '',
    planDescription: '',
    planFeatures: '',
  });

  const [shiftList, setShiftList] = useState([]);
  const [selectedShift, setSelectedShift] = useState(null);
  const [bufferMin, setBufferMin] = useState('');



  const editorRef = useRef(null);

   const loadShifts = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`https://appo.coinagesoft.com/api/admin/shift`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(res.data);
      setShiftList(res.data.data);
    } catch (err) {
      console.error('Failed to load shifts', err);
    }
  };


 useEffect(() => {
    loadShifts(); // now this works fine
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const formatText = (command, value = null) => {
    document.execCommand(command, false, value);
  };

  const validateForm = () => {
    const htmlContent = editorRef.current?.innerHTML || '';
    if (!formData.planName || !formData.planPrice || !formData.planDuration || !formData.planDescription || !htmlContent.trim()) {
      toast.error('Please fill all fields before submitting the plan.');
      return false;
    }

    if (isNaN(formData.planPrice) || formData.planPrice <= 0) {
      toast.error('Please enter a valid plan price.');
      return false;
    }

    if (isNaN(formData.planDuration) || formData.planDuration.trim() === '') {
      toast.error('Please enter a valid duration.');
      return false;
    }
    

    return true;
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validateForm()) return;

  const token = localStorage.getItem('token');
const listItems = Array.from(editorRef.current.querySelectorAll("li"))
  .map(el => el.innerText.trim())
  .filter(text => text.length > 0);



  const planData = {
    planName: formData.planName,
    planPrice: parseFloat(formData.planPrice),
    planDuration: formData.planDuration,
    planDescription: formData.planDescription,
    planFeatures: listItems,
    shiftId: selectedShift?.id || null
  };

  console.log("📤 Sending Plan Data:", planData);

  try {
    const response = await fetch(`https://appo.coinagesoft.com/api/admin/plans`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(planData),
    });

    console.log("Plan API Response Status:", response.status);

    const result = await response.json();
    console.log("Plan API Response Data:", result);

    if (!response.ok) throw new Error(result.message || 'Failed to add plan.');

   const createdPlanId = result.plan?.planId;

if (!createdPlanId) {
  console.error("Plan ID not found in response", result);
  toast.error("Failed to extract plan ID after creation.");
  return;
}
console.log("Sending Buffer Data:", {
  planId: createdPlanId,
  shiftId: selectedShift.id,
  bufferInMinutes: parseInt(bufferMin),
});


if (selectedShift && bufferMin && parseInt(bufferMin) > 0) {
  const bufferPayload = {
    planId: createdPlanId,
    shiftId: selectedShift?.id || undefined,
    bufferInMinutes: parseInt(bufferMin)
  };
  console.log("Sending Buffer Data:", bufferPayload);

  await axios.post(`https://appo.coinagesoft.com/api/plan-shift-buffer-rule/add`, bufferPayload, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
} else if (selectedShift && (!bufferMin || parseInt(bufferMin) <= 0)) {
  console.warn(" Shift selected but buffer minutes missing or invalid.");
  toast.warn(" Please enter valid buffer minutes if shift is selected.");
} else if (!selectedShift && bufferMin) {
  console.warn(" Buffer minutes entered but no shift selected.");
  toast.warn(" Please select a shift when entering buffer time.");
} else {
  console.info(" No buffer rule created — optional step skipped.");
}



    toast.success(result.message || 'Plan and buffer saved successfully!');
    setFormData({ planName: '', planPrice: '', planDuration: '', planDescription: '', planFeatures: '' });
    setSelectedShift(null);
    setBufferMin('');
    await loadShifts(); // if you want to force reload

    if (editorRef.current) editorRef.current.innerHTML = '';


  } catch (error) {
    console.error("❌ Error during submission:", error);
    toast.error(error.message || 'An error occurred.');
  }
};

  return (
    <div className="container-xxl py-4">
      <ToastContainer />
      <form onSubmit={handleSubmit}>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-5">
          <h4 className="fw-bold text-black m-0">Add a New Plan</h4>
          <button type="submit" className="btn btn-primary shadow-sm px-4 py-2 rounded-pill">
            Publish Plan
          </button>
        </div>

        <div className="row justify-content-center mt-5">
          <div className="col-lg-9 mt-5">
            <div className="rounded-4 border-0 p-4" style={{ backgroundColor: '#f9f9ff' }}>
              <h5 className="card-title text-secondary mb-4">Plan Information</h5>

              <div className="form-floating mb-4">
                <input type="text" className="form-control rounded-3" id="planName" name="planName" value={formData.planName} onChange={handleChange} placeholder="Plan Name" />
                <label htmlFor="planName">Plan Name</label>
              </div>

              <div className="row g-4">
                <div className="col-md-6">
                  <div className="form-floating">
                    <input type="number" className="form-control rounded-3" id="planPrice" name="planPrice" value={formData.planPrice} onChange={handleChange} placeholder="Price" />
                    <label htmlFor="planPrice">Plan Price (₹)</label>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-floating">
                    <input type="text" className="form-control rounded-3" id="planDuration" name="planDuration" value={formData.planDuration} onChange={handleChange} placeholder="Duration" />
                    <label htmlFor="planDuration">Plan Duration (e.g 30 minutes)</label>
                  </div>
                </div>
              </div>

              <div className="form-floating mt-4">
                <input type="text" className="form-control rounded-3" id="planDescription" name="planDescription" value={formData.planDescription} onChange={handleChange} placeholder="Description" />
                <label htmlFor="planDescription">Plan Description</label>
              </div>

              <div className="mt-5">
                <label className="mb-2 fw-semibold text-dark">Plan Features</label>
                <div className="d-flex gap-2 flex-wrap mb-3 p-2 bg-light shadow-sm rounded-3">
                  <button type="button" className="btn btn-outline-primary btn-sm" onClick={() => formatText('bold')}><i className="fas fa-bold"></i></button>
                  <button type="button" className="btn btn-outline-primary btn-sm" onClick={() => formatText('italic')}><i className="fas fa-italic"></i></button>
                  <button type="button" className="btn btn-outline-primary btn-sm" onClick={() => formatText('underline')}><i className="fas fa-underline"></i></button>
                  <button type="button" className="btn btn-outline-primary btn-sm" onClick={() => formatText('insertOrderedList')}><i className="fas fa-list-ol"></i></button>
                  <button type="button" className="btn btn-outline-primary btn-sm" onClick={() => formatText('insertUnorderedList')}><i className="fas fa-list-ul"></i></button>
                </div>
                <div ref={editorRef} contentEditable className="form-control p-4 rounded-3" style={{ minHeight: '200px', outline: 'none', backgroundColor: '#fff' }}></div>
              </div>

              <div className="form-floating mt-4">
                <select className="form-select" id="selectShift" value={selectedShift?.id || ''} onChange={(e) => {
                  const selected = shiftList.find(s => s.id === e.target.value);
                  setSelectedShift(selected || null);
                }}>
                  <option value="">-- Select Shift --</option>
                  {shiftList.map((shift) => (
                    <option key={shift.id} value={shift.id}>
                      {shift.name} ({shift.startTime?.slice(0, 5)} - {shift.endTime?.slice(0, 5)})
                    </option>
                  ))}
                </select>
                <label htmlFor="selectShift">Select Shift for Buffer</label>
              </div>

              <div className="form-floating mt-4">
                <input
                  type="number"
                  className="form-control rounded-3"
                  id="bufferMinutes"
                  name="bufferMinutes"
                  value={bufferMin}
                  onChange={(e) => setBufferMin(e.target.value)}
                  placeholder="Buffer Minutes"
                />
                <label htmlFor="bufferMinutes">Buffer Minutes</label>
              </div>


            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Add_Plan;


