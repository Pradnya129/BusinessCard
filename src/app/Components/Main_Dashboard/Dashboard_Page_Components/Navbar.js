"use client";
import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import "./Dashboard.css";

const Navbar = ({ onToggleSidebar }) => {
  const router = useRouter();
  const [user, setUser] = useState({});
  const [slug, setSlug] = useState("");
  const [editingSlug, setEditingSlug] = useState(false);
  const [tempSlug, setTempSlug] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const dropdownRef = useRef(null);

  const handleLogOut = () => {
    localStorage.removeItem("token");
    router.push("/Login");
  };

  const handleEditSlug = () => {
    setTempSlug(slug);
    setEditingSlug(true);
  };

  const handleSaveSlug = async () => {
    try {
      const token = localStorage.getItem("token");
      const decoded = jwtDecode(token);
      const adminId = decoded.id;

      const payload = { adminId, slug: tempSlug };
      console.log("Sending payload:", payload);

      const response = await axios.put(
        "https://appo.coinagesoft.com/api/admin/edit-slug",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("✅ Slug updated:", response.data);

      setSlug(tempSlug);
      setEditingSlug(false);
      alert("Slug updated successfully ✅");
    } catch (error) {
      console.error("❌ Error updating slug:", error.response?.data || error);
      alert("Failed to update slug ❌");
    }
  };

  const handleCancelEdit = () => {
    setEditingSlug(false);
    setTempSlug("");
  };

  const handleToggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/");
      return;
    }

    const decoded = jwtDecode(token);
    const adminId = decoded.id;

    axios
      .get(`https://appo.coinagesoft.com/api/landing/${adminId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const data = res.data.data;
        if (data) {
          setUser(data);
        }
      })
      .catch((err) => console.error("Error fetching profile:", err));

    axios
      .get(`https://appo.coinagesoft.com/api/admin/slugbyAdminId/${adminId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        if (res.data && res.data.slug) {
          setSlug(res.data.slug);
        }
      })
      .catch((err) => console.error("Error fetching slug:", err));
  }, [router]);

  const handleDropdownItemClick = () => {
    setIsDropdownOpen(false);
  };

  return (
    <div>
      <nav
        className="layout-navbar container-xxl navbar navbar-expand-xl navbar-detached align-items-center bg-navbar-theme"
        id="layout-navbar"
      >
        <div
          className="layout-menu-toggle layout-menu navbar-nav flex align-items-xl-center me-xl-0 d-xl-none"
          id="layout-menu"
        >
          <a
            className="nav-item nav-link px-0 me-xl-6 ms-0"
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onToggleSidebar();
            }}
          >
            <i className="ri-menu-fill ri-22px"></i>
          </a>
        </div>

        <div className="navbar-center flex-grow-1 d-flex justify-content-center align-items-center">
          {editingSlug ? (
            <div className="d-flex align-items-center flex-nowrap">
              <p className="me-2 fw-bold">Your live URL https://appointify.me/</p>
              <input
                type="text"
                className="form-control form-control-sm me-2"
                value={tempSlug}
                onChange={(e) => setTempSlug(e.target.value)}
                style={{ width: "180px" }}
              />
              <button className="btn btn-sm btn-success me-2" onClick={handleSaveSlug}>
                Save
              </button>
              <button className="btn btn-sm btn-secondary" onClick={handleCancelEdit}>
                Cancel
              </button>
            </div>
          ) : (
            <div className="d-flex align-items-center flex-nowrap">
              <span className="me-2 fw-bold" style={{ whiteSpace: "nowrap" }}>
                Your live URL is here 👉 https://appointify.me/{slug}
              </span>
              <button className="btn btn-sm btn-outline-primary" onClick={handleEditSlug}>
                Edit
              </button>
            </div>
          )}
        </div>

        <div
          className="navbar-nav-right d-flex justify-items-end align-items-center"
          id="navbar-collapse"
        >
          <ul className="navbar-nav flex-row align-items-center ms-auto" ref={dropdownRef}>
            <li className="nav-item navbar-dropdown dropdown-user dropdown">
              <a
                className="nav-link dropdown-toggle hide-arrow"
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleToggleDropdown();
                }}
              >
                <div className="avatar avatar-online">
                  <img
                    src={
                      user.profileImage
                        ? user.profileImage.startsWith("blob:")
                          ? user.profileImage
                          : `https://appo.coinagesoft.com${user.profileImage}`
                        : "/assets/img/160x160/img8.jpg"
                    }
                    alt="User"
                    className="rounded-circle"
                  />
                </div>
              </a>
              <ul className={`dropdown-menu dropdown-menu-end ${isDropdownOpen ? "show" : ""}`}>
                <li>
                  <a className="dropdown-item" href="#">
                    <div className="d-flex">
                      <div className="flex-shrink-0 me-2">
                        <div className="avatar avatar-online">
                          <img
                            src={
                              user.profileImage
                                ? user.profileImage.startsWith("blob:")
                                  ? user.profileImage
                                  : `https://appo.coinagesoft.com${user.profileImage}`
                                : "/assets/img/160x160/img8.jpg"
                            }
                            alt="User"
                            className="rounded-circle"
                          />
                        </div>
                      </div>
                      <div className="flex-grow-1">
                        <span className="fw-medium d-block small">
                          {user.fullName || "User"}
                        </span>
                        <small className="text-muted">{user.role || "Role"}</small>
                      </div>
                    </div>
                  </a>
                </li>

                <li><div className="dropdown-divider"></div></li>

                <li>
                  <Link className="dropdown-item" href="/Dashboard/Profile" onClick={handleDropdownItemClick}>
                    <i className="ri-user-3-line ri-22px me-3"></i>
                    <span className="align-middle">My Profile</span>
                  </Link>
                </li>

                <li>
                  <Link className="dropdown-item" href="/Dashboard/Security" onClick={handleDropdownItemClick}>
                    <i className="ri-settings-4-line ri-22px me-3"></i>
                    <span className="align-middle">Security</span>
                  </Link>
                </li>

                <li>
                  <Link className="dropdown-item" href="/Dashboard/Billing" onClick={handleDropdownItemClick}>
                    <span className="d-flex align-items-center align-middle">
                      <i className="flex-shrink-0 ri-file-text-line ri-22px me-3"></i>
                      <span className="flex-grow-1 align-middle">Billing</span>
                      <span className="flex-shrink-0 badge badge-center rounded-pill bg-danger">4</span>
                    </span>
                  </Link>
                </li>

                <li><div className="dropdown-divider"></div></li>

                <li>
                  <a className="dropdown-item" href="#" onClick={handleDropdownItemClick}>
                    <i className="ri-question-line ri-22px me-3"></i>
                    <span className="align-middle">FAQ</span>
                  </a>
                </li>

                <li>
                  <div className="d-grid px-4 pt-2 pb-1">
                    <button className="btn btn-sm btn-danger d-flex" onClick={handleLogOut}>
                      <small className="align-middle">Logout</small>
                      <i className="ri-logout-box-r-line ms-2 ri-16px"></i>
                    </button>
                  </div>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
