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
              `https://appo.coinagesoft.com/api/plan-shift-buffer-rule/${plan.planId}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );

            bufferMap[plan.planId] = bufferRes.data.bufferInMinutes ?? 0;

            if (bufferRes.data.shiftId) {
              return {
                ...plan,
                shiftId: bufferRes.data.shiftId,
                bufferRuleId: bufferRes.data.id,
              };
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

  // 🔹 Fetch all users
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

  // 🔹 Decode admin user from token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setAdminUser({ id: payload.id, name: payload.name });
      } catch (e) {
        console.error("Error decoding token:", e);
      }
    }
  }, []);

  // 🔹 Ensure admin always exists in allUsers
  useEffect(() => {
    if (adminUser && allUsers.length > 0) {
      const adminExists = allUsers.some((user) => user.id === adminUser.id);
      if (!adminExists) {
        setAllUsers((prev) => [
          ...prev,
          {
            id: adminUser.id,
            name: adminUser.name,
            email: "admin@example.com",
          },
        ]);
      }
    }
  }, [adminUser, allUsers]);

  // 🔹 Open Assign Modal
  const handleAssign = (plan) => {
    setAssigningPlan(plan);

    let initialSelected = plan.UserPlans
      ? plan.UserPlans.map((up) => up.User.id)
      : [];

    if (adminUser && !initialSelected.includes(adminUser.id)) {
      initialSelected.push(adminUser.id);
    }

    setSelectedUsers(initialSelected);

    const modal = new window.bootstrap.Modal(
      document.getElementById("assignModal")
    );
    modal.show();
  };

  // 🔹 Assign users to plan
  const handleAssignSubmit = async () => {
    if (!assigningPlan) return;
    const token = localStorage.getItem("token");

    try {
      let userIdsToAssign = [...selectedUsers];
      if (adminUser && !userIdsToAssign.includes(adminUser.id)) {
        userIdsToAssign.push(adminUser.id);
      }

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
            userIds: userIdsToAssign,
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

  // 🔹 Fetch buffer rule
  const fetchBufferForPlan = async (planId, shiftId) => {
    if (!shiftId) {
      setBufferInMinutes(0);
      return;
    }
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(
        "https://appo.coinagesoft.com/api/plan-shift-buffer-rule/all",
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { planId, shiftId },
        }
      );
      setBufferInMinutes(response?.data?.rules[0].bufferInMinutes ?? 0);
    } catch (error) {
      if (error.response?.status === 404) setBufferInMinutes(0);
      else console.error("Error fetching buffer rule:", error);
    }
  };

  // ... 🔹 (rest of your file is unchanged: edit, delete, unassign, save, render UI etc.)
};

export default Plan_List;
