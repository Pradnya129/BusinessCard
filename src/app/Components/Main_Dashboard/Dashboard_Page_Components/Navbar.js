"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const Navbar = ({ onToggleSidebar }) => {
  const router = useRouter();
  const [user, setUser] = useState({});
  const [slug, setSlug] = useState("");
  const [editingSlug, setEditingSlug] = useState(false);
  const [tempSlug, setTempSlug] = useState("");

  const handleLogOut = () => {
    localStorage.removeItem("token");
    router.push("/");
  };

  const handleEditSlug = () => {
    setTempSlug(slug);
    setEditingSlug(true);
  };

  const handleSaveSlug = async () => {
    if (!user.id) return;
    try {
      await axios.patch(
        `https://appo.coinagesoft.com/api/landing/${user.id}`,
        { slug: tempSlug },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setSlug(tempSlug);
      setEditingSlug(false);
    } catch (err) {
      console.error("Error saving slug:", err);
    }
  };

  const handleCancelEdit = () => {
    setEditingSlug(false);
    setTempSlug("");
  };

  useEffect(() => {
    import("../../../../../public/materialize/assets/js/ui-menu.js");
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/"); // or your login page
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
          if (data.slug) setSlug(data.slug);
        }
      })
      .catch((err) => console.error("Error fetching profile:", err));
  }, [router]);

  return (
    <div>
      <nav
        className="layout-navbar  container-xxl navbar navbar-expand-xl navbar-detached  align-items-center bg-navbar-theme"
        id="layout-navbar"
      >
        <div
          className="layout-menu-toggle layout-menu navbar-nav flex align-items-xl-center  me-xl-0 d-xl-none"
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
              <span className="me-2 fw-bold">Your live URL  https://appointify.me/</span>
              <input
                type="text"
                className="form-control form-control-sm me-2"
                value={tempSlug}
                onChange={(e) => setTempSlug(e.target.value)}
                style={{ width: "180px" }}
              />
              <button
                className="btn btn-sm btn-success me-2"
                onClick={handleSaveSlug}
              >
                Save
              </button>
              <button
                className="btn btn-sm btn-secondary"
                onClick={handleCancelEdit}
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="d-flex align-items-center flex-nowrap">
              <span className="me-2 fw-bold" style={{ whiteSpace: "nowrap" }}>
                Your live URL is here 👉 https://appointify.me/{slug}
              </span>
              <button
                className="btn btn-sm btn-outline-primary"
                onClick={handleEditSlug}
              >
                Edit
              </button>
            </div>
          )}
        </div>

        <div
          className="navbar-nav-right d-flex justify-items-end align-items-center"
          id="navbar-collapse"
        >
          <ul className="navbar-nav flex-row align-items-center ms-auto">
            <li className="nav-item navbar-dropdown dropdown-user dropdown">
              <a
                className="nav-link dropdown-toggle hide-arrow"
                href="#"
                data-bs-toggle="dropdown"
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
                {/* <span className="ms-2 d-none d-lg-inline-block">{user.fullName || 'User'}</span> */}
              </a>
              <ul className="dropdown-menu dropdown-menu-end">
                <li>
                  <a className="dropdown-item" href="./Security.html">
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
                        <small className="text-muted">
                          {user.role || "Role"}
                        </small>
                      </div>
                    </div>
                  </a>
                </li>
                <li>
                  <div className="dropdown-divider"></div>
                </li>
                <li>
                  <Link className="dropdown-item" href="/Dashboard/Profile">
                    <i className="ri-user-3-line ri-22px me-3"></i>
                    <span className="align-middle">My Profile</span>
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item" href="/Dashboard/Security">
                    <i className="ri-settings-4-line ri-22px me-3"></i>
                    <span className="align-middle">Security</span>
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item" href="/Dashboard/Billing">
                    <span className="d-flex align-items-center align-middle">
                      <i className="flex-shrink-0 ri-file-text-line ri-22px me-3"></i>
                      <span className="flex-grow-1 align-middle">Billing</span>
                      <span className="flex-shrink-0 badge badge-center rounded-pill bg-danger">
                        4
                      </span>
                    </span>
                  </Link>
                </li>
                <li>
                  <div className="dropdown-divider"></div>
                </li>

                <li>
                  <a className="dropdown-item" href="pages-faq.html">
                    <i className="ri-question-line ri-22px me-3"></i>
                    <span className="align-middle">FAQ</span>
                  </a>
                </li>
                <li>
                  <div className="d-grid px-4 pt-2 pb-1">
                    <a className="btn btn-sm btn-danger d-flex" target="_blank">
                      <small className="align-middle" onClick={handleLogOut}>
                        Logout
                      </small>
                      <i className="ri-logout-box-r-line ms-2 ri-16px"></i>
                    </a>
                  </div>
                </li>
              </ul>
            </li>
          </ul>
        </div>

        <div className="navbar-search-wrapper search-input-wrapper d-none">
          <input
            type="text"
            className="form-control search-input container-xxl border-0"
            placeholder="Search..."
            aria-label="Search..."
          />
          <i className="ri-close-fill search-toggler cursor-pointer"></i>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
