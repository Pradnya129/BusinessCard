"use client";
import React, { useState, useEffect, useRef } from "react";
import "@fortawesome/fontawesome-free/css/all.min.css";
import Plan_Widget from "./Plan_Widget";
import axios from "axios";

const API_BASE = process.env.REACT_APP_API_URL || "https://appo.coinagesoft.com/api";

const Plan_List = () => {
  const [plans, setPlans] = useState([]);
  const [shiftList, setShiftList] = useState([]);
  const [bufferRules, setBufferRules] = useState({});
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [assigningPlan, setAssigningPlan] = useState(null);

  const [editingIndex, setEditingIndex] = useState(null);
  const [editedPlan, setEditedPlan] = useState({
    name: "",
    price: "",
    duration: "",
    description: "",
    shiftId: "",
  });
  const [bufferInMinutes, setBufferInMinutes] = useState(0);
  const [errors, setErrors] = useState({});
  const editorRef = useRef(null);

  // 🔹 Fetch plans
  const fetchPlans = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE}/admin/plans/get_All_Plans_by_admin`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const fetchedPlans = res.data.data?.plans || [];

      // Build shift list and buffer rules
      const shifts = [];
      const bufferMap = {};

      fetchedPlans.forEach((plan) => {
        // Collect shift info
        const shiftRule = plan.shiftBufferRule;
        if (shiftRule?.shift) {
          shifts.push(shiftRule.shift);
          bufferMap[plan.planId] = shiftRule.bufferInMinutes;
        }
      });

      // Remove duplicates from shiftList
      const uniqueShifts = Array.from(new Map(shifts.map((s) => [s.id, s])).values());

      setPlans(fetchedPlans);
      setShiftList(uniqueShifts);
      setBufferRules(bufferMap);
    } catch (err) {
      console.error("❌ Error fetching plans:", err);
    }
  };

  // 🔹 Fetch all users
  const fetchUsers = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get(`${API_BASE}/admin/all_user`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAllUsers(res.data.data || []);
    } catch (err) {
      console.error("Error fetching users:", err);
      setAllUsers([]);
    }
  };

  useEffect(() => {
    fetchPlans();
    fetchUsers();
  }, []);

  // 🔹 Assign plan modal
  const handleAssign = (plan) => {
    setAssigningPlan(plan);
    setSelectedUsers(plan.UserPlans ? plan.UserPlans.map((up) => up.user.id) : []);
    const modal = new window.bootstrap.Modal(document.getElementById("assignModal"));
    modal.show();
  };
const handleAssignSubmit = async () => {
  if (!assigningPlan) return;
  const token = localStorage.getItem("token");

  try {
    if (selectedUsers.length > 0) {
      // Assign selected users
      await axios.post(
        `${API_BASE}/admin/plans/assign-plan-to-user`,
        {
          planId: assigningPlan.planId,
          planShiftBufferRuleId: assigningPlan.shiftBufferRule?.id,
          userIds: selectedUsers,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } else {
      // No users selected => unassign all
      if (assigningPlan.UserPlans && assigningPlan.UserPlans.length > 0) {
        await Promise.all(
          assigningPlan.UserPlans.map((up) =>
            axios.delete(`${API_BASE}/admin/plans/unassign/${up.id}`, {
              headers: { Authorization: `Bearer ${token}` },
            })
          )
        );
      }
    }

    alert("Plan assignments updated successfully!");
    fetchPlans();

    const modal = window.bootstrap.Modal.getInstance(document.getElementById("assignModal"));
    modal.hide();
  } catch (err) {
    console.error("Error assigning/unassigning plan:", err);
    alert("Failed to update plan assignments.");
  }
};




  // 🔹 Delete plan
  const handleDelete = async (index) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this plan?");
    if (!confirmDelete) return;
    const plan = plans[index];
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`${API_BASE}/admin/plans/${plan.planId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPlans(plans.filter((_, i) => i !== index));
    } catch (err) {
      console.error("Error deleting plan:", err);
    }
  };



// 🔹 Edit plan modal
const handleEdit = async (index) => {
  await fetchAdminShifts(); // fetch shifts first
  const plan = plans[index];
  setEditingIndex(index);
  setEditedPlan({
    name: plan.planName,
    price: plan.planPrice,
    duration: plan.planDuration,
    description: plan.planDescription,
    shiftId: plan.shiftBufferRule?.shiftId || "",
  });
  setBufferInMinutes(plan.shiftBufferRule?.bufferInMinutes || 0);

  // Parse features from DB
  let features = [];
  try {
    features = Array.isArray(plan.planFeatures)
      ? plan.planFeatures
      : JSON.parse(plan.planFeatures || "[]");
  } catch {
    features = [];
  }

  if (editorRef.current) {
    // Wrap each feature in <li> for proper bullets
    editorRef.current.innerHTML = `<ul>${features.map(f => `<li>${f}</li>`).join('')}</ul>`;
  }

  const modal = new window.bootstrap.Modal(document.getElementById("editModal"));
  modal.show();
};

// 🔹 Save edited plan
const handleSave = async () => {
  if (!editedPlan.name || !editedPlan.price || !editedPlan.duration || !editedPlan.description) {
    alert("Please fill all required fields.");
    return;
  }
  const plan = plans[editingIndex];
  const token = localStorage.getItem("token");

  // Get <li> items from editor
  const featuresArray = Array.from(editorRef.current.querySelectorAll("li")).map(el => el.innerText.trim());

  try {
    // Update plan
    await axios.put(
      `${API_BASE}/admin/plans/${plan.planId}`,
      {
        planName: editedPlan.name,
        planPrice: editedPlan.price,
        planDuration: editedPlan.duration,
        planDescription: editedPlan.description,
        planFeatures: featuresArray, // ✅ store as array in DB
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    // Update buffer rule if shift selected
    if (editedPlan.shiftId) {
      const payload = {
        planId: plan.planId,
        shiftId: editedPlan.shiftId,
        bufferInMinutes: Number(bufferInMinutes),
      };
      if (plan.shiftBufferRule?.id) {
        await axios.patch(
          `${API_BASE}/plan-shift-buffer-rule/${plan.shiftBufferRule.id}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(`${API_BASE}/plan-shift-buffer-rule/add`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    }

    alert("Plan updated successfully!");
    fetchPlans();
    const modal = window.bootstrap.Modal.getInstance(document.getElementById("editModal"));
    modal.hide();
  } catch (err) {
    console.error("Error saving plan:", err);
    alert("Failed to save plan.");
  }
};

  // Fetch admin shifts
  const fetchAdminShifts = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE}/admin/shift`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShiftList(res.data.data || []);
    } catch (err) {
      console.error("Error fetching shifts:", err);
      setShiftList([]);
    }
  };

  useEffect(() => {
    fetchPlans();
    fetchUsers();
    fetchAdminShifts(); // <-- Add this
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedPlan((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="container py-4">
      <Plan_Widget />
      <div className="row">
        {plans.length === 0 ? (
          <div>No plans available.</div>
        ) : (
          plans.map((plan, index) => (
            <div className="col-lg-4 col-md-6 col-12 mt-4" key={plan.planId}>
              <div className="card h-100 shadow-lg border-0 rounded-4">
                <div className="card-header bg-primary text-white text-center rounded-top-4">
                  <h5 className="mb-1 badge bg-light text-dark py-2 px-3">
                    <i className="fas fa-clock me-2"></i>
                    {plan.planDuration} min
                  </h5>
                  <span
                    className="px-1 py-1 d-block text-wrap"
                    style={{ wordBreak: "break-word", whiteSpace: "normal" }}
                  >
                    {plan.planName}
                  </span>
                </div>

                <div className="card-body text-center">
                  <p className="text-muted small mt-4">{plan.planDescription}</p>
                  <h4 className="fw-bold text-success mb-3">₹{plan.planPrice}</h4>

                  <h6 className="fw-semibold mb-2">Features:</h6>
                  <ul className="list-unstyled small text-start mx-auto" style={{ maxWidth: "250px" }}>
                    {(Array.isArray(plan.planFeatures)
                      ? plan.planFeatures
                      : JSON.parse(plan.planFeatures || "[]")
                    ).map((f, i) => (
                      <li key={i}>
                        <i className="fas fa-check-circle text-success me-2"></i>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
                {/* Assigned Users */}
                {plan.UserPlans && plan.UserPlans.length > 0 && (
                  <div className="card-body text-center pt-2">
                    <h6 className="fw-semibold mb-1">Assigned Users:</h6>
                    <ul className="list-unstyled small text-start mx-auto" style={{ maxWidth: "250px" }}>
                      {plan.UserPlans.map((up) => (
                        <li key={up.user.id}>
                          <i className="fas fa-user text-primary me-2"></i>
                          {up.user.name} ({up.user.email})
                        </li>
                      ))}
                    </ul>
                  </div>
                )}


                {/* Shift & Buffer */}
                <div className="card-body text-center pt-0">
                  <p className="mb-1">
                    <i className="fas fa-calendar-day me-2 text-primary"></i>
                    {shiftList.find((s) => String(s.id) === String(plan.shiftBufferRule?.shiftId))?.name || "None"}
                  </p>
                  <p className="mb-0">
                    <i className="fas fa-hourglass-half me-2 text-warning"></i>
                    Buffer: {bufferRules[plan.planId] ?? "—"} min
                  </p>
                </div>

                {/* Footer Actions */}
                <div className="card-footer rounded-bottom-4 d-flex justify-content-between flex-wrap mt-3 gap-2">
                  <button className="btn btn-warning text-white flex-grow-1 shadow-sm" onClick={() => handleEdit(index)}>
                    <i className="fas fa-edit me-1"></i>
                  </button>
                  <button className="btn btn-info text-white flex-grow-1 shadow-sm" onClick={() => handleAssign(plan)}>
                    <i className="fas fa-user-plus me-1"></i>
                  </button>
                  <button className="btn btn-danger text-white flex-grow-1 shadow-sm" onClick={() => handleDelete(index)}>
                    <i className="fas fa-trash-alt me-1"></i>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      {/* Assign Modal */}
      <div
        className="modal fade"
        id="assignModal"
        tabIndex="-1"
        aria-labelledby="assignModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="assignModalLabel">Assign Plan</h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <h6>Select Users:</h6>
              {allUsers.map((user) => (
                <div className="form-check" key={user.id}>
                  <input
                    className="form-check-input"
                    type="checkbox"
                    value={user.id}
                    checked={selectedUsers.includes(user.id)}
                  onChange={(e) => {
  const checked = e.target.checked;
  setSelectedUsers(prev =>
    checked
      ? [...prev, user.id]       // add if checked
      : prev.filter(id => id !== user.id) // remove if unchecked
  );
}}



                  />
                  <label className="form-check-label">{user.name}</label>
                </div>
              ))}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
              <button className="btn btn-primary" onClick={handleAssignSubmit}>Assign</button>
            </div>
          </div>
        </div>
      </div>
      {/* Edit Modal */}
      <div
        className="modal fade"
        id="editModal"
        tabIndex="-1"
        aria-labelledby="editModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="editModalLabel">Edit Plan</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label">Name</label>
                <input type="text" className="form-control" name="name" value={editedPlan.name} onChange={handleChange} />
              </div>
              <div className="mb-3">
                <label className="form-label">Price</label>
                <input type="number" className="form-control" name="price" value={editedPlan.price} onChange={handleChange} />
              </div>
              <div className="mb-3">
                <label className="form-label">Duration</label>
                <input type="number" className="form-control" name="duration" value={editedPlan.duration} onChange={handleChange} />
              </div>
              <div className="mb-3">
                <label className="form-label">Description</label>
                <textarea className="form-control" name="description" value={editedPlan.description} onChange={handleChange}></textarea>
              </div>
              <div className="mb-3">
                <label className="form-label">Shift</label>
               <select
  className="form-select"
  name="shiftId"
  value={editedPlan.shiftId}
  onChange={handleChange}
>
  <option value="">Select Shift</option>
  {shiftList.map((shift) => (
    <option key={shift.id} value={shift.id}>
      {shift.name} ({shift.startTime} - {shift.endTime})
    </option>
  ))}
</select>



              </div>
              <div className="mb-3">
                <label className="form-label">Buffer Minutes</label>
                <input
                  type="number"
                  className="form-control"
                  value={bufferInMinutes}
                  onChange={(e) => setBufferInMinutes(e.target.value)}
                />
              </div>
            <div className="mb-3">
  <label className="form-label">Features</label>

  {/* Formatting Toolbar */}
  <div className="d-flex gap-2 flex-wrap mb-2">
    <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => document.execCommand('bold')}>
      <i className="fas fa-bold"></i>
    </button>
    <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => document.execCommand('italic')}>
      <i className="fas fa-italic"></i>
    </button>
    <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => document.execCommand('underline')}>
      <i className="fas fa-underline"></i>
    </button>
    <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => document.execCommand('insertOrderedList')}>
      <i className="fas fa-list-ol"></i>
    </button>
    <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => document.execCommand('insertUnorderedList')}>
      <i className="fas fa-list-ul"></i>
    </button>
  </div>

  {/* Editable Features List */}
  <div
    ref={editorRef}
    contentEditable
    className="form-control p-2 rounded-2"
    style={{ minHeight: '100px', border: '1px solid #ccc', overflowY: 'auto', backgroundColor: '#fff' }}
    data-placeholder="Enter features here..."
  ></div>
</div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
              <button className="btn btn-primary" onClick={handleSave}>Save Changes</button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Plan_List;
