"use client";
import React, { useState, useEffect, useRef } from "react";
import "@fortawesome/fontawesome-free/css/all.min.css";
import Plan_Widget from "./Plan_Widget";
import axios from "axios";
import { api } from "../../../../api";
import { jwtDecode } from "jwt-decode";

const Plan_List = () => {
  const [plans, setPlans] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [bufferInMinutes, setBufferInMinutes] = useState(0);
  const [bufferRules, setBufferRules] = useState({});
  const [shiftList, setShiftList] = useState([]);
  const [assigningPlan, setAssigningPlan] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);

  const [editedPlan, setEditedPlan] = useState({
    name: "",
    price: "",
    duration: "",
    description: "",
    shiftId: "",
  });
  const [errors, setErrors] = useState({});
  const editorRef = useRef(null);

  // 🔹 Fetch plans + shifts
const API_BASE = process.env.REACT_APP_API_URL || 'https://appo.coinagesoft.com/api';

const fetchPlans = async () => {
  const token = localStorage.getItem("token");
  if (!token) return;

  try {
    const decoded = jwtDecode(token);
    const adminId = decoded?.id || decoded?.adminId;

    // 1️⃣ Fetch plans + shifts + all buffer rules in parallel
    const [plansRes, shiftsRes, bufferRes] = await Promise.all([
      axios.get(`${API_BASE}/admin/plans/all_plans_with_users`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      axios.get(`${API_BASE}/admin/shift`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      axios.get(`${API_BASE}/plan-shift-buffer-rule/all`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);

    const shiftData = shiftsRes.data.data;
    setShiftList(shiftData);

    const allPlans = plansRes.data?.data || [];
    const filteredPlans = allPlans.filter((plan) => plan.adminId === adminId);

    // 2️⃣ Map buffer rules for quick access
    const bufferMap = {};
    (bufferRes.data?.rules || []).forEach((rule) => {
      bufferMap[rule.planId] = bufferMap[rule.planId] || [];
      bufferMap[rule.planId].push(rule); // can have multiple shift buffers per plan
    });

    // 3️⃣ Attach buffer info to plans
    const updatedPlans = filteredPlans.map((plan) => {
      const planRules = bufferMap[plan.planId] || [];
      return {
        ...plan,
        bufferRules: planRules, // store all rules for this plan
        shiftId: planRules[0]?.shiftId ?? null, // default to first shift
        bufferRuleId: planRules[0]?.id ?? null,
      };
    });

    setPlans(updatedPlans);
    setBufferRules(
      Object.fromEntries(
        Object.entries(bufferMap).map(([planId, rules]) => [
          planId,
          rules[0]?.bufferInMinutes ?? 0,
        ])
      )
    );
  } catch (err) {
    console.error("Error fetching plans:", err);
    setPlans([]);
    setShiftList([]);
    setBufferRules({});
  }
};






  useEffect(() => {
    fetchPlans();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch(
          "https://appo.coinagesoft.com/api/admin/all_user",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (res.ok) {
          const result = await res.json();
          // 👇 store only the array
          setAllUsers(result.data || []);
        } else {
          setAllUsers([]);
        }
      } catch (err) {
        console.error("Error fetching users:", err);
        setAllUsers([]);
      }
    };
    fetchUsers();
  }, []);

  const handleAssign = (plan) => {
    setAssigningPlan(plan);
    setSelectedUsers(
      plan.UserPlans ? plan.UserPlans.map((up) => up.User.id) : []
    );
    const modal = new window.bootstrap.Modal(
      document.getElementById("assignModal")
    );
    modal.show();
  };

  const handleAssignSubmit = async () => {
    if (!assigningPlan) return;
    const token = localStorage.getItem("token");
    try {
      await fetch(
        "https://appo.coinagesoft.com/api/admin/plans/assign-plan-to-user",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            planId: assigningPlan.planId,
            planShiftBufferRuleId: assigningPlan.bufferRuleId,
            userIds: selectedUsers,
          }),
        }
      );
      alert("Plan assigned successfully!");
      await fetchPlans();
      const modal = window.bootstrap.Modal.getInstance(
        document.getElementById("assignModal")
      );
      modal.hide();
    } catch (err) {
      console.error("Error assigning plan:", err);
    }
  };

  // const fetchBufferForPlan = async (planId, shiftId) => {
  //   if (!shiftId) {
  //     setBufferInMinutes(0);
  //     return;
  //   }
  //   const token = localStorage.getItem("token");
  //   try {
  //     const response = await axios.get(
  //       "https://appo.coinagesoft.com/api/plan-shift-buffer-rule/all",
  //       {
  //         headers: { Authorization: `Bearer ${token}` },
  //         params: { planId, shiftId },
  //       }
  //     );
  //     console.log("setBufferInMinutes", response.data.rules[0]);
  //     setBufferInMinutes(response?.data?.rules[0].bufferInMinutes ?? 0);
  //   } catch (error) {
  //     if (error.response?.status === 404) setBufferInMinutes(0);
  //     else console.error("Error fetching buffer rule:", error);
  //   }
  // };
const fetchBufferForPlan = async (planId, shiftId) => {
  try {
    const slug = window.location.hostname;
    console.log("🟢 Fetching buffer for plan:", planId, "shift:", shiftId, "slug:", slug);

    const res = await axios.get(
      `https://appo.coinagesoft.com/api/public-landing/all-rules?slug=${slug}`
    );

    console.log("🟢 Rules from API:", res.data.rules);

    // match both planId and shiftId if possible
    const rule = res.data.rules.find(
      (r) => r.planId === planId && (!shiftId || r.shiftId === shiftId)
    );

    if (!rule) {
      console.warn("⚠️ No matching rule found for plan:", planId);
      return null;
    }

    console.log("✅ Matched rule for plan:", rule);
    return rule.bufferInMinutes;
  } catch (err) {
    console.error("❌ Error fetching buffer:", err);
    return null;
  }
};



  // 🔹 Edit modal
//   const handleEdit = async (index) => {
//     const selectedPlan = plans[index];
//     setEditingIndex(index);

//     setEditedPlan({
//       name: selectedPlan.planName ?? "",
//       price: selectedPlan.planPrice ?? "",
//       duration: selectedPlan.planDuration ?? "",
//       description: selectedPlan.planDescription ?? "",
//       shiftId: selectedPlan.shiftId ?? "",
//     });
// console.log("Opening modal with buffer:", bufferInMinutes);

//     let features = [];
//     try {
//       features = Array.isArray(selectedPlan.planFeatures)
//         ? selectedPlan.planFeatures
//         : JSON.parse(selectedPlan.planFeatures || "[]");
//     } catch {
//       features = [];
//     }
// console.log("Opening modal with buffer:", bufferInMinutes);

//     if (editorRef.current) {
//       editorRef.current.innerHTML = features
//         .map((f) => `<li>${f}</li>`)
//         .join("");
//     }
// console.log("Opening modal with buffer:", bufferInMinutes);

//     await fetchBufferForPlan(selectedPlan.planId, selectedPlan.shiftId);
// console.log("Opening modal with buffer:", bufferInMinutes);

//     const editModal = new window.bootstrap.Modal(
//       document.getElementById("editModal")
//     );
//     editModal.show();
//     console.log("Opening modal with buffer:", bufferInMinutes);

//   };

const handleEdit = async (index) => {
  const selectedPlan = plans[index];
  setEditingIndex(index);

  setEditedPlan({
    name: selectedPlan.planName ?? "",
    price: selectedPlan.planPrice ?? "",
    duration: selectedPlan.planDuration ?? "",
    description: selectedPlan.planDescription ?? "",
    shiftId: selectedPlan.shiftId ?? "",
  });

  let features = [];
  try {
    features = Array.isArray(selectedPlan.planFeatures)
      ? selectedPlan.planFeatures
      : JSON.parse(selectedPlan.planFeatures || "[]");
  } catch {
    features = [];
  }

  if (editorRef.current) {
    editorRef.current.innerHTML = features
      .map((f) => `<li>${f}</li>`)
      .join("");
  }

  // ✅ Fetch buffer synchronously and set it before opening modal
  const buffer = await fetchBufferForPlan(selectedPlan.planId, selectedPlan.shiftId);
  setBufferInMinutes(buffer);
  console.log("Opening modal with buffer:", buffer);

  // ✅ Now open modal (after buffer is set)
  const editModal = new window.bootstrap.Modal(
    document.getElementById("editModal")
  );
  editModal.show();
};


  // 🔹 Delete plan
const handleDelete = async (index) => {
  const confirmDelete = window.confirm("Are you sure you want to delete this plan?");
  if (!confirmDelete) return; // 🚫 cancel deletion

  const token = localStorage.getItem("token");
  const planToDelete = plans[index];
  try {
    const response = await fetch(
      `https://appo.coinagesoft.com/api/admin/plans/${planToDelete.planId}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    if (response.ok) {
      setPlans(plans.filter((_, i) => i !== index));
    }
  } catch (error) {
    console.error("Error deleting plan:", error);
  }
};


  // 🔹 Unassign user from plan
  const handleUnassign = async (userId) => {
    if (!confirm("Are you sure you want to unassign this user from the plan?"))
      return;
    const token = localStorage.getItem("token");

    console.log("Unassigning user:", userId);
    console.log("Token:", token);

    try {
      const response = await fetch(
        `https://appo.coinagesoft.com/api/admin/plans/unassign/${userId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        alert(data.message || "User unassigned successfully!");
        await fetchPlans();
      } else {
        const errorText = await response.text();
        console.error("Unassign failed:", errorText);
        alert("Failed to unassign user.\n" + errorText);
      }
    } catch (error) {
      console.error("Error unassigning user:", error);
      alert("Error unassigning user.");
    }
  };

  const formatText = (command, value = null) => {
    document.execCommand(command, false, value);
  };

  // 🔹 Validation
  const validateForm = () => {
    let isValid = true;
    const newErrors = {};
    if (!editedPlan.name) {
      newErrors.name = "Name is required";
      isValid = false;
    }
    if (
      !editedPlan.price ||
      isNaN(editedPlan.price) ||
      parseFloat(editedPlan.price) <= 0
    ) {
      newErrors.price = "Enter valid price";
      isValid = false;
    }
    if (!editedPlan.duration) {
      newErrors.duration = "Duration is required";
      isValid = false;
    }
    if (!editedPlan.description) {
      newErrors.description = "Description is required";
      isValid = false;
    }
    if (
      !editorRef.current ||
      !editorRef.current.querySelectorAll("li").length
    ) {
      newErrors.features = "Features required";
      isValid = false;
    }
    if (bufferInMinutes === null || isNaN(bufferInMinutes)) {
      newErrors.bufferMin = "Buffer minutes required";
      isValid = false;
    }
    setErrors(newErrors);
    return isValid;
  };

  // 🔹 Save changes
const handleSave = async () => {
  if (!validateForm()) return;

  const token = localStorage.getItem("token");
  const plan = plans[editingIndex];

  // Prepare features array
  const featuresArray = Array.from(editorRef.current.querySelectorAll("li"))
    .map((el) => el.innerText.trim())
    .filter((t) => t.length > 0);

  // 🔹 Plan data (plans table)
  const updatedPlan = {
    planId: plan.planId,
    planName: editedPlan.name,
    planPrice: parseFloat(editedPlan.price) || 0,
    planDuration: editedPlan.duration,
    planDescription: editedPlan.description,
    planFeatures: featuresArray,
    assignedUsers: plan.UserPlans ? plan.UserPlans.map((up) => up.User.id) : [],
  };

  try {
    // 1️⃣ Update plan in plans table
    await fetch(`${API_BASE}/admin/plans/${plan.planId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updatedPlan),
    });

    // 2️⃣ Update shift & buffer in plan-shift-buffer-rule table
    // Find existing buffer rule for this plan + shift
    const existingRule = plan.bufferRules?.find(
      (r) => r.shiftId === editedPlan.shiftId
    );

    const bufferPayload = {
      shiftId: editedPlan.shiftId,
      bufferInMinutes: Number(bufferInMinutes),
      planId: plan.planId,
    };

    if (existingRule) {
      // PATCH existing buffer rule
      await axios.patch(
        `${API_BASE}/plan-shift-buffer-rule/${existingRule.id}`,
        bufferPayload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } else if (editedPlan.shiftId) {
      // POST new buffer rule if shift selected
      await axios.post(
        `${API_BASE}/plan-shift-buffer-rule/add`,
        bufferPayload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
    }

    // 3️⃣ Update UI immediately
    const updatedPlans = [...plans];
    updatedPlans[editingIndex] = {
      ...updatedPlan,
      shiftId: editedPlan.shiftId,
      UserPlans: plan.UserPlans,
      bufferRules: plan.bufferRules || [],
    };
    setPlans(updatedPlans);

    // Update bufferRules map for UI
    setBufferRules((prev) => ({
      ...prev,
      [plan.planId]: Number(bufferInMinutes),
    }));

    // Close modal
    setEditingIndex(null);
    const modal = window.bootstrap.Modal.getInstance(
      document.getElementById("editModal")
    );
    modal.hide();

    alert("Plan updated successfully!");
  } catch (err) {
    console.error("Save failed:", err);
    alert("Failed to save plan. Check console for details.");
  }
};



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
    {/* Header with duration */}
    <div className="card-header bg-primary text-white text-center rounded-top-4">
      <h5 className="mb-1 badge bg-light text-dark py-2 px-3">
        <i className="fas fa-clock me-2"></i>
        {plan.planDuration} min
      </h5>
  <span
  className=" px-1 py-1 d-block text-wrap"
  style={{ wordBreak: "break-word", whiteSpace: "normal" }}
>
  {plan.planName}
</span>


    </div>

    {/* Card Body */}
    <div className="card-body text-center">
      <p className="text-muted small mt-4">{plan.planDescription}</p>

      <h4 className="fw-bold text-success mb-3">
        ₹{plan.planPrice}
      </h4>

      <h6 className="fw-semibold mb-2">Features:</h6>
      <ul className="list-unstyled small text-start mx-auto" style={{maxWidth:"250px"}}>
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

    {/* Shift & Buffer */}
    <div className="card-body text-center pt-0">
      <p className="mb-1">
        <i className="fas fa-calendar-day me-2 text-primary"></i>
        {plan.shiftId
          ? shiftList.find((s) => String(s.id) === String(plan.shiftId))?.name ?? "None"
          : "None"}
      </p>
      <p className="mb-0">
        <i className="fas fa-hourglass-half me-2 text-warning"></i>
        Buffer: {bufferRules[plan.planId] ?? "—"} min
      </p>
    </div>

 {/* Assigned Users */}
{/* Assigned Users */}
<div className="card-body pt-0">
  <p className="fw-semibold mb-2">Assigned Users:</p>
  <ul className="list-group">
    {plan.UserPlans && plan.UserPlans.length > 0 ? (
      plan.UserPlans.map((up) => (
        <li key={up.id} className="list-group-item">
          <div className="row align-items-center text-center">
            {/* Name */}
            <div
              className="col-4 d-flex justify-content-center align-items-center"
              style={{ minHeight: "50px" }}
            >
              <span className="fw-semibold small">{up.User.name}</span>
            </div>

            {/* Email */}
            <div
              className="col-6 d-flex justify-content-center align-items-center"
              style={{ minHeight: "50px" }}
            >
              {/* <span className="text-muted small">{up.User.email}</span> */}
            </div>

            {/* Button */}
            <div
              className="col-2 d-flex justify-content-center align-items-center"
              style={{ minHeight: "50px" }}
            >
              <button
                className="btn btn-sm btn-outline-danger"
                onClick={() => handleUnassign(up.id)}
              >
                <i className="fas fa-user-minus"></i>
              </button>
            </div>
          </div>
        </li>
      ))
    ) : (
      <li className="list-group-item text-muted small">No users assigned</li>
    )}
  </ul>
</div>




{/* Footer Actions */}
<div className="card-footer  rounded-bottom-4 d-flex justify-content-between flex-wrap mt-3 gap-2">
  <button
    className="btn btn-warning text-white flex-grow-1 shadow-sm"
    onClick={() => handleEdit(index)}
  >
    <i className="fas fa-edit me-1"></i>
  </button>
  <button
    className="btn btn-info text-white flex-grow-1 shadow-sm"
    onClick={() => handleAssign(plan)}
  >
    <i className="fas fa-user-plus me-1"></i>
  </button>
  <button
    className="btn btn-danger text-white flex-grow-1 shadow-sm"
    onClick={() => handleDelete(index)}
  >
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
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content rounded-4">
            <div className="modal-header">
              <h5 className="modal-title">
                Assign Plan {assigningPlan ? `: ${assigningPlan.planName}` : ""}
              </h5>
              <button className="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body">
              <p className="small text-muted">
                Duration: {assigningPlan?.planDuration} min | Price: ₹
                {assigningPlan?.planPrice}
              </p>

              <label className="fw-semibold">Select Users</label>
              <select
                multiple
                className="form-select"
                value={selectedUsers}
                onChange={(e) =>
                  setSelectedUsers(
                    Array.from(e.target.selectedOptions, (opt) => opt.value)
                  )
                }
              >
                {Array.isArray(allUsers) && allUsers.length > 0 ? (
                  allUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.email})
                    </option>
                  ))
                ) : (
                  <option disabled>No users found</option>
                )}
              </select>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" data-bs-dismiss="modal">
                Close
              </button>
              <button className="btn btn-primary" onClick={handleAssignSubmit}>
                Assign
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        className="modal fade"
        id="editModal"
        tabIndex="-1"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content rounded-4">
            <div className="modal-header">
              <h5 className="modal-title">
                Edit Plan {editedPlan?.name ? `: ${editedPlan.name}` : ""}
              </h5>
              <button
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>

            <div className="modal-body">
              {/* Form */}
              <div className="form-floating mb-4">
                <input
                  type="text"
                  className={`form-control ${
                    errors.name ? "border-danger" : ""
                  }`}
                  name="name"
                  value={editedPlan.name}
                  onChange={handleChange}
                  placeholder="Plan Name"
                />
                <label>Plan Name</label>
                {errors.name && (
                  <div className="text-danger">{errors.name}</div>
                )}
              </div>

              <div className="row g-4">
                <div className="col-md-6">
                  <div className="form-floating">
                    <input
                      type="number"
                      className={`form-control ${
                        errors.price ? "border-danger" : ""
                      }`}
                      name="price"
                      value={editedPlan.price}
                      onChange={handleChange}
                      placeholder="Price"
                    />
                    <label>Plan Price (₹)</label>
                    {errors.price && (
                      <div className="text-danger">{errors.price}</div>
                    )}
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-floating">
                    <input
                      type="text"
                      className={`form-control ${
                        errors.duration ? "border-danger" : ""
                      }`}
                      name="duration"
                      value={editedPlan.duration}
                      onChange={handleChange}
                      placeholder="Duration"
                    />
                    <label>Plan Duration</label>
                    {errors.duration && (
                      <div className="text-danger">{errors.duration}</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="form-floating mt-4">
                <input
                  type="text"
                  className={`form-control ${
                    errors.description ? "border-danger" : ""
                  }`}
                  name="description"
                  value={editedPlan.description}
                  onChange={handleChange}
                  placeholder="Description"
                />
                <label>Plan Description</label>
                {errors.description && (
                  <div className="text-danger">{errors.description}</div>
                )}
              </div>

              {/* Features */}
              <div className="mt-4">
                <label className="mb-2 fw-semibold text-dark">
                  Plan Features
                </label>
                <div className="d-flex gap-2 flex-wrap mb-3 p-2 bg-light shadow-sm rounded-3">
                  <button
                    type="button"
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => formatText("bold")}
                  >
                    <i className="fas fa-bold"></i>
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => formatText("italic")}
                  >
                    <i className="fas fa-italic"></i>
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => formatText("underline")}
                  >
                    <i className="fas fa-underline"></i>
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => formatText("insertOrderedList")}
                  >
                    <i className="fas fa-list-ol"></i>
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => formatText("insertUnorderedList")}
                  >
                    <i className="fas fa-list-ul"></i>
                  </button>
                </div>
                <div
                  ref={editorRef}
                  contentEditable
                  className={`form-control p-5 ${
                    errors.features ? "border-danger" : ""
                  }`}
                  style={{
                    minHeight: "150px",
                    outline: "none",
                    backgroundColor: "#fff",
                  }}
                />
                {errors.features && (
                  <div className="text-danger">{errors.features}</div>
                )}
              </div>

              <div className="form-floating mt-4">
                <select
                  className="form-select"
                  name="shiftId"
                  value={editedPlan.shiftId}
                  onChange={handleChange}
                >
                  <option value="">-- Select Shift --</option>
                  {shiftList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.startTime?.slice(0, 5)} -{" "}
                      {s.endTime?.slice(0, 5)})
                    </option>
                  ))}
                </select>
                <label>Select Shift</label>
              </div>

              <div className="form-floating mt-4">
                <input
                  type="number"
                  className="form-control"
                  name="bufferInMinutes"
                  value={bufferInMinutes ?? 0}
                  onChange={(e) => setBufferInMinutes(e.target.value)}
                />
                <label>Buffer Minutes</label>
                {errors.bufferMin && (
                  <div className="text-danger">{errors.bufferMin}</div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" data-bs-dismiss="modal">
                Close
              </button>
              <button className="btn btn-primary" onClick={handleSave}>
                Save changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Plan_List;
