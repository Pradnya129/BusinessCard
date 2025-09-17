"use client";
import React, { useState, useEffect, useRef } from "react";
import "@fortawesome/fontawesome-free/css/all.min.css";
import Plan_Widget from "./Plan_Widget";
import axios from "axios";
import { api } from "../../../../api";

const Plan_List = () => {
  const [plans, setPlans] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [bufferInMinutes, setBufferInMinutes] = useState(0);
  const [bufferRules, setBufferRules] = useState({});
  const [shiftList, setShiftList] = useState([]);
  const [assigningPlan, setAssigningPlan] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [adminUser, setAdminUser] = useState(null);

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
  const fetchPlans = async () => {
    const token = localStorage.getItem("token");
    try {
      const [plansRes, shiftsRes] = await Promise.all([
        api.getPlansWithUsers(),
        api.getShifts(),
      ]);

      const plansData = plansRes.data;
      const shiftData = shiftsRes;

      setShiftList(shiftData);

      // Fetch buffer rules & assign shiftId to plans
      const bufferMap = {};
      const updatedPlans = await Promise.all(
        plansData.map(async (plan) => {
          try {
            const bufferRes = await axios.get(
              `http://localhost:5000/api/plan-shift-buffer-rule/${plan.planId}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );

            bufferMap[plan.planId] = bufferRes.data.bufferInMinutes ?? 0;

            // Assign shiftId and bufferRuleId from buffer rule if exists
            if (bufferRes.data.shiftId) {
              return { ...plan, shiftId: bufferRes.data.shiftId, bufferRuleId: bufferRes.data.id };
            }
            return { ...plan, bufferRuleId: null };
          } catch {
            bufferMap[plan.planId] = 0;
            return plan;
          }
        })
      );

      setPlans(updatedPlans);
      setBufferRules(bufferMap);
    } catch (error) {
      console.error("Error fetching:", error);
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
        const res = await fetch("http://localhost:5000/api/admin/all_user", {
          headers: { Authorization: `Bearer ${token}` },
        });
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

  useEffect(() => {
    if (adminUser && allUsers.length > 0) {
      const adminExists = allUsers.some(user => user.id === adminUser.id);
      if (!adminExists) {
        setAllUsers(prev => [...prev, { id: adminUser.id, name: adminUser.name, email: 'admin@example.com' }]); // Assuming email or adjust as needed
      }
    }
  }, [adminUser, allUsers]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setAdminUser({ id: payload.id, name: payload.name });
      } catch (e) {
        console.error("Error decoding token:", e);
      }
    }
  }, []);

  const handleAssign = (plan) => {
  setAssigningPlan(plan);

  // Collect existing assigned user IDs
  let initialSelected = plan.UserPlans ? plan.UserPlans.map(up => up.User.id) : [];

  // ✅ Ensure admin ID is included
  if (adminUser && !initialSelected.includes(adminUser.id)) {
    initialSelected.push(adminUser.id);
  }

  setSelectedUsers(initialSelected);

  const modal = new window.bootstrap.Modal(document.getElementById("assignModal"));
  modal.show();
};


 const handleAssignSubmit = async () => {
  if (!assigningPlan) return;
  const token = localStorage.getItem("token");

  try {
    // ✅ Always include admin id
    let userIdsToAssign = [...selectedUsers];
    if (adminUser && !userIdsToAssign.includes(adminUser.id)) {
      userIdsToAssign.push(adminUser.id);
    }

    await fetch("http://localhost:5000/api/admin/plans/assign-plan-to-user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        planId: assigningPlan.planId,
        planShiftBufferRuleId: assigningPlan.bufferRuleId,
        userIds: userIdsToAssign, // ✅ admin included here
      }),
    });

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

  const fetchBufferForPlan = async (planId, shiftId) => {
    if (!shiftId) {
      setBufferInMinutes(0);
      return;
    }
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(
        "http://localhost:5000/api/plan-shift-buffer-rule/all",
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { planId, shiftId },
        }
      );
      console.log("setBufferInMinutes", response.data.rules[0]);
      setBufferInMinutes(response?.data?.rules[0].bufferInMinutes ?? 0);
    } catch (error) {
      if (error.response?.status === 404) setBufferInMinutes(0);
      else console.error("Error fetching buffer rule:", error);
    }
  };

  // 🔹 Edit modal
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

    await fetchBufferForPlan(selectedPlan.planId, selectedPlan.shiftId);

    const editModal = new window.bootstrap.Modal(
      document.getElementById("editModal")
    );
    editModal.show();
  };

  // 🔹 Delete plan
  const handleDelete = async (index) => {
    const token = localStorage.getItem("token");
    const planToDelete = plans[index];
    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/plans/${planToDelete.planId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.ok) setPlans(plans.filter((_, i) => i !== index));
    } catch (error) {
      console.error("Error deleting plan:", error);
    }
  };

  // 🔹 Unassign user from plan
  const handleUnassign = async (userId) => {
    if (!confirm("Are you sure you want to unassign this user from the plan?")) return;
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/plans/unassign/${userId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.ok) {
        alert("User unassigned successfully!");
        await fetchPlans();
      } else {
        alert("Failed to unassign user.");
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

    const featuresArray = Array.from(editorRef.current.querySelectorAll("li"))
      .map((el) => el.innerText.trim())
      .filter((t) => t.length > 0);

    const updatedPlan = {
      planId: plan.planId,
      planName: editedPlan.name,
      planPrice: parseFloat(editedPlan.price) || 0,
      planDuration: editedPlan.duration,
      planDescription: editedPlan.description,
      planFeatures: featuresArray,
      shiftId: editedPlan.shiftId,
    };

    try {
      // 🔹 Update Plan
      await fetch(`http://localhost:5000/api/admin/plans/${plan.planId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedPlan),
      });

      // 🔹 Update buffer
      const ruleRes = await axios.get(
        `http://localhost:5000/api/plan-shift-buffer-rule/${plan.planId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (ruleRes.status === 200 && ruleRes.data) {
        // PATCH existing buffer rule
        await fetch(
          `http://localhost:5000/api/plan-shift-buffer-rule/${ruleRes.data.id}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              shiftId: editedPlan.shiftId,
              bufferInMinutes: Number(bufferInMinutes),
            }),
          }
        );
      } else {
        // POST new buffer rule
        await fetch(`http://localhost:5000/C:\Users\ASUS\Desktop\github clone\appointify\NewAppointify_MultiUser_Frontend\src\app\Components\Main_Dashboard\Plans\Plan_List.jsplan-shift-buffer-rule/add`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            planId: plan.planId,
            shiftId: editedPlan.shiftId,
            bufferInMinutes: Number(bufferInMinutes),
          }),
        });
      }

      // 🔹 Update UI immediately
      const updatedPlans = [...plans];
      updatedPlans[editingIndex] = {
        ...updatedPlan,
      };
      setPlans(updatedPlans);

      // 🔹 Update bufferRules state
      setBufferRules((prev) => ({
        ...prev,
        [plan.planId]: Number(bufferInMinutes),
      }));

      setEditingIndex(null);
      const modal = window.bootstrap.Modal.getInstance(
        document.getElementById("editModal")
      );
      modal.hide();
    } catch (err) {
      console.error("Save failed:", err);
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
            <div
              className="col-md mb-3 mb-md-0 col-lg-4 col-md-6 col-12 mt-4"
              key={plan.planId}
            >
              <div className="card h-100 shadow-sm border-0 rounded-4 px-0">
                <div className="card-header text-center text-black">
                  <div className="mb-2">
                    <span className="fs-2 text-dark fw-semibold">
                      {plan.planDuration}
                      <span className="fs-5"> min</span>
                    </span>
                  </div>
                  <h3 className="card-title fs-5 mt-1 lh-1">{plan.planName}</h3>
                  <p className="card-text justify-start mt-2">
                    {plan.planDescription}
                  </p>
                </div>
                <div className="card-body d-flex flex-column align-items-center py-0">
                  <h5 className="text-dark fw-bold mt-3">
                    Price: ₹{plan.planPrice}
                  </h5>
                  <div className="text-black">
                    <ul>
                      {(Array.isArray(plan.planFeatures)
                        ? plan.planFeatures
                        : JSON.parse(plan.planFeatures || "[]")
                      ).map((f, i) => (
                        <li key={i}>{f}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="card-body d-flex flex-column align-items-center py-0">
                  <p>
                    {plan.shiftId
                      ? shiftList.find(
                          (s) => String(s.id) === String(plan.shiftId)
                        )?.name ?? "None"
                      : "None"}
                  </p>
                  <p>Buffer: {bufferRules[plan.planId] ?? "—"} min</p>
                </div>
                <div className="card-body d-flex flex-column align-items-center py-0">
                  <p>Assigned Users:</p>
                  <ul>
                    {plan.UserPlans && plan.UserPlans.length > 0 ? (
                      plan.UserPlans.map((up) => (
                        <li key={up.id} className="d-flex justify-content-between align-items-center">
                          {up.User.name} ({up.User.email})
                          <button
                            className="btn btn-sm btn-danger ms-2"
                            onClick={() => handleUnassign(up.User.id)}
                          >
                            Unassign
                          </button>
                        </li>
                      ))
                    ) : (
                      <li>No users assigned</li>
                    )}
                  </ul>
                </div>
                <div className="card-footer text-center">
                  <button
                    className="btn btn-warning text-white me-2"
                    onClick={() => handleEdit(index)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-info text-white me-2"
                    onClick={() => handleAssign(plan)}
                  >
                    Assign User
                  </button>
                  <button
                    className="btn btn-danger text-white"
                    onClick={() => handleDelete(index)}
                  >
                    Delete
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
                  className={`form-control p-3 ${
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
