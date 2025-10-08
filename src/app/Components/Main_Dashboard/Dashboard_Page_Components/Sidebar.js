"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import React, { useState, useEffect } from "react";
import "./Dashboard.css";
import PerfectScrollbar from "perfect-scrollbar";
if (typeof window !== "undefined") {
  window.PerfectScrollbar = PerfectScrollbar;
}

const Sidebar = ({ mobileSidebarVisible, setMobileSidebarVisible, sidebarCollapsed, setSidebarCollapsed }) => {
  const [openMenu, setOpenMenu] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [tenantLogo, setTenantLogo] = useState(null);

  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserRole(decoded.role); // ✅ Extract role
      } catch (err) {
        console.error("Invalid token:", err);
      }
    }
  }, []);
useEffect(() => {
  const token = localStorage.getItem("token");
  if (!token) return;

  try {
    const decoded = jwtDecode(token);
    const tenantId = decoded.tenantId; // get tenantId directly from token
    if (!tenantId) throw new Error("Tenant ID not found in token");

    fetch(`https://appo.coinagesoft.com/api/admin/logo/${tenantId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        if (data.logoUrl) {
          setTenantLogo(data.logoUrl); // set tenant logo
        } else {
          setTenantLogo(null); // fallback logo
        }
      })
      .catch(err => {
        console.error('Failed to fetch tenant logo', err);
        setTenantLogo(null); // fallback on error
      });
  } catch (err) {
    console.error('Invalid token:', err);
    setTenantLogo(null); // fallback if token is invalid
  }
}, []);


useEffect(() => {
  const el = document.querySelector("#menu-scroll");
  if (!el) return;
  const ps = new PerfectScrollbar(el, { suppressScrollX: true });
  return () => ps.destroy();
}, [userRole, openMenu, sidebarCollapsed, mobileSidebarVisible]);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (
        mobileSidebarVisible &&
        !e.target.closest("#layout-menu") &&
        !e.target.closest(".layout-menu-toggle")
      ) {
        setMobileSidebarVisible(false);
      }
    };

    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, [mobileSidebarVisible, setMobileSidebarVisible]);

  const toggleMenu = (menu) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  return (
    <div className="h-screen flex flex-col">
     <aside
  id="layout-menu"
  className={`layout-menu menu-vertical menu bg-menu-theme bg-light
    ${sidebarCollapsed ? "menu-collapsed" : ""} 
    ${mobileSidebarVisible ? "mobile-sidebar-show" : "mobile-sidebar-hide"}`}
  style={{
   
    
      // hide extra scroll
    backgroundColor: "#ffffff",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  }}
>
      <div className="app-brand demo">
  <Link href="/Dashboard" className="app-brand-link">
    {tenantLogo ? (
      // ✅ Show tenant uploaded logo
      <img
        src={`https://appo.coinagesoft.com${tenantLogo}`}
        alt="Tenant Logo"
        className="w-32 h-auto"
      />
    ) : (
      // ✅ Show default SVG if no tenant logo
      <span className="app-brand-logo demo me-5 ">
        <span style={{ color: "var(--bs-primary)" }} className="me-4">
          <svg
            width="268"
            height="150"
            viewBox="0 0 38 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M30.0944 2.22569C29.0511 0.444187 26.7508 -0.172113 24.9566 0.849138C23.1623 1.87039 22.5536 4.14247 23.5969 5.92397L30.5368 17.7743C31.5801 19.5558 33.8804 20.1721 35.6746 19.1509C37.4689 18.1296 38.0776 15.8575 37.0343 14.076L30.0944 2.22569Z"
              fill="currentColor"
            />
            <path
              d="M30.171 2.22569C29.1277 0.444187 26.8274 -0.172113 25.0332 0.849138C23.2389 1.87039 22.6302 4.14247 23.6735 5.92397L30.6134 17.7743C31.6567 19.5558 33.957 20.1721 35.7512 19.1509C37.5455 18.1296 38.1542 15.8575 37.1109 14.076L30.171 2.22569Z"
              fill="url(#paint0_linear_2989_100980)"
              fillOpacity="0.4"
            />
            <path
              d="M22.9676 2.22569C24.0109 0.444187 26.3112 -0.172113 28.1054 0.849138C29.8996 1.87039 30.5084 4.14247 29.4651 5.92397L22.5251 17.7743C21.4818 19.5558 19.1816 20.1721 17.3873 19.1509C15.5931 18.1296 14.9843 15.8575 16.0276 14.076L22.9676 2.22569Z"
              fill="currentColor"
            />
            <path
              d="M14.9558 2.22569C13.9125 0.444187 11.6122 -0.172113 9.818 0.849138C8.02377 1.87039 7.41502 4.14247 8.45833 5.92397L15.3983 17.7743C16.4416 19.5558 18.7418 20.1721 20.5361 19.1509C22.3303 18.1296 22.9391 15.8575 21.8958 14.076L14.9558 2.22569Z"
              fill="currentColor"
            />
            <path
              d="M14.9558 2.22569C13.9125 0.444187 11.6122 -0.172113 9.818 0.849138C8.02377 1.87039 7.41502 4.14247 8.45833 5.92397L15.3983 17.7743C16.4416 19.5558 18.7418 20.1721 20.5361 19.1509C22.3303 18.1296 22.9391 15.8575 21.8958 14.076L14.9558 2.22569Z"
              fill="url(#paint1_linear_2989_100980)"
              fillOpacity="0.4"
            />
            <path
              d="M7.82901 2.22569C8.87231 0.444187 11.1726 -0.172113 12.9668 0.849138C14.7611 1.87039 15.3698 4.14247 14.3265 5.92397L7.38656 17.7743C6.34325 19.5558 4.04298 20.1721 2.24875 19.1509C0.454514 18.1296 -0.154233 15.8575 0.88907 14.076L7.82901 2.22569Z"
              fill="currentColor"
            />
            <defs>
              <linearGradient
                id="paint0_linear_2989_100980"
                x1="5.36642"
                y1="0.849138"
                x2="10.532"
                y2="24.104"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0" stopOpacity="1" />
                <stop offset="1" stopOpacity="0" />
              </linearGradient>
              <linearGradient
                id="paint1_linear_2989_100980"
                x1="5.19475"
                y1="0.849139"
                x2="10.3357"
                y2="24.1155"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0" stopOpacity="1" />
                <stop offset="1" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </span>
      </span>
    )}
  </Link>

  {/* Desktop toggle */}
  <a
    href="#"
    onClick={() => setSidebarCollapsed((prev) => !prev)}
    className="layout-menu-toggle menu-link text-large ms-auto"
  >
    <svg
      className={`sidebar-arrow ${sidebarCollapsed ? "collapsed" : ""}`}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8.47365 11.7183C8.11707 12.0749 8.11707 12.6531 8.47365 13.0097L12.071 16.607C12.4615 16.9975 12.4615 17.6305 12.071 18.021C11.6805 18.4115 11.0475 18.4115 10.657 18.021L5.83009 13.1941C5.37164 12.7356 5.37164 11.9924 5.83009 11.5339L10.657 6.707C11.0475 6.31653 11.6805 6.31653 12.071 6.707C12.4615 7.09747 12.4615 7.73053 12.071 8.121L8.47365 11.7183Z"
        fillOpacity="0.9"
      />
      <path
        d="M14.3584 11.8336C14.0654 12.1266 14.0654 12.6014 14.3584 12.8944L18.071 16.607C18.4615 16.9975 18.4615 17.6305 18.071 18.021C17.6805 18.4115 17.0475 18.4115 16.657 18.021L11.6819 13.0459C11.3053 12.6693 11.3053 12.0587 11.6819 11.6821L16.657 6.707C17.0475 6.31653 17.6805 6.31653 18.071 6.707C18.4615 7.09747 18.4615 7.73053 18.071 8.121L14.3584 11.8336Z"
        fillOpacity="0.4"
      />
    </svg>
  </a>
</div>


        <div className="menu-inner-shadow"></div>
 <div
    id="menu-scroll"
    style={{
      flex: 1,               // takes remaining vertical space
      overflowY: "auto",     // enable vertical scroll
      overflowX: "hidden",   // prevent horizontal scroll
      paddingRight: "4px",   // optional to avoid scrollbar cutoff
      minHeight: 0           // important for flex children
    }}
  >

        {/* ✅ Show menus based on role */}
        {userRole === "admin" && (
          <ul className="menu-inner py-1">
            {/* --- Admin Menus --- */}
            <li className={`menu-item ${
                  pathname === "/Dashboard" ? "active" : ""
                }`}>
              <Link
                href="/Dashboard"
                className="menu-link"
              >
                <i className="menu-icon tf-icons ri-dashboard-line me-2"></i>
                <div>Dashboard</div>
              </Link>
            </li>
            {/* <li className="menu-item">
              <a
                className={`menu-link menu-toggle cursor-pointer ${pathname === '/Dashboard/Users' || pathname === '/Dashboard/Users/CreateUser' ? 'active' : ''}`}
                onClick={() => toggleMenu('users')}
              >
                <i className="menu-icon tf-icons ri-group-line me-2"></i>
                <div>Users</div>
              </a>
              <ul className={`menu-sub ${openMenu === 'users' ? 'd-block' : 'd-none'}`}>
                <li className="menu-item">
                  <Link href="/Dashboard/Users" className={`menu-link ${pathname === '/Dashboard/Users' ? 'active' : ''}`}>
                    <div>Manage Users</div>
                  </Link>
                </li>
                <li className="menu-item">
                  <Link href="/Dashboard/Users/CreateUser" className={`menu-link ${pathname === '/Dashboard/Users/CreateUser' ? 'active' : ''}`}>
                    <div>Create User</div>
                  </Link>
                </li>
              </ul>
            </li> */}

            <li className={`menu-item ${
                  pathname === "/Dashboard/Change_Landing_Page" ? "active" : ""
                }`}>
              <Link
                href="/Dashboard/Change_Landing_Page"
                className="menu-link"
              >
                <i className="menu-icon tf-icons ri-layout-line me-2"></i>
                <div>Manage Landing Page</div>
              </Link>
            </li>
            <li className={`menu-item ${
                  pathname === "/Dashboard/Users" ? "active" : ""
                }`}>
              <Link
                href="/Dashboard/Users"
                className="menu-link"
              >
                <i className="menu-icon tf-icons ri-team-line me-2"></i>
                <div>Manage Clients</div>
              </Link>
            </li>
            <li className={`menu-item ${
                  pathname === "/Dashboard/Users/CreateUser" ? "active" : ""
                }`}>
              <Link
                href="/Dashboard/Users/CreateUser"
                className="menu-link"
              >
                <i className="menu-icon tf-icons ri-user-add-line me-2"></i>
                <div>Create Sub-Admin</div>
              </Link>
            </li>

            <li className={`menu-item ${
                  pathname === "/Dashboard/Calendar" ? "active" : ""
                }`}>
              <Link
                href="/Dashboard/Calendar"
                className="menu-link"
              >
                <i className="menu-icon tf-icons ri-calendar-line me-2"></i>
                <div>Calendar</div>
              </Link>
            </li>

            <li className={`menu-item ${
                  pathname === "/Dashboard/Appointments" ? "active" : ""
                }`}>
              <Link
                href="/Dashboard/Appointments"
                className="menu-link"
              >
                <i className="menu-icon tf-icons ri-calendar-check-line me-2"></i>
                <div>Appointments</div>
              </Link>
            </li>
            <li className={`menu-item ${
                  pathname === "/Dashboard/Renewal" ? "active" : ""
                }`}>
              <Link
                href="/Dashboard/Renewal"
                className="menu-link"
              >
                <i className="menu-icon tf-icons ri-calendar-check-line me-2"></i>
                <div>Renewals</div>
              </Link>
            </li>

            <li className={`menu-item ${
                  pathname === "/Dashboard/SubscriptionAssigned" ? "active" : ""
                }`}>
              <Link
                href="/Dashboard/SubscriptionAssigned"
                className="menu-link"
              >
                <i className="menu-icon tf-icons ri-file-text-line me-2"></i>
                <div>My Subscription</div>
              </Link>
            </li>

            {/* Plans submenu */}
            <li className={`menu-item ${
                  (pathname === "/Dashboard/Add_Plan" ||
                  pathname === "/Dashboard/Plan_List")
                    ? "active"
                    : ""
                } ${openMenu === "plans" ? "open" : ""}`}>
              <a
                className="menu-link menu-toggle cursor-pointer"
                onClick={() => toggleMenu("plans")}
              >
                <i className="menu-icon tf-icons ri-price-tag-3-line me-2"></i>
                <div>Plans</div>
              </a>
              <ul
                className={`menu-sub ${
                  openMenu === "plans" ? "d-block" : "d-none"
                }`}
              >
                <li className={`menu-item ${
                      pathname === "/Dashboard/Add_Plan" ? "active" : ""
                    }`}>
                  <Link
                    href="/Dashboard/Add_Plan"
                    className="menu-link"
                  >
                    <div>Add Plan</div>
                  </Link>
                </li>
                <li className={`menu-item ${
                      pathname === "/Dashboard/Plan_List" ? "active" : ""
                    }`}>
                  <Link
                    href="/Dashboard/Plan_List"
                    className="menu-link"
                  >
                    <div>Plan List</div>
                  </Link>
                </li>
              </ul>
            </li>

            {/* Account Settings */}
            <li className={`menu-item ${
                  (pathname === "/Dashboard/Profile" ||
                  pathname === "/Dashboard/Security" ||
                  pathname === "/Dashboard/Billing"||
                  pathname === "/Dashboard/Policies")
                    ? "active"
                    : ""
                } ${openMenu === "account" ? "open" : ""}`}>
              <a
                className="menu-link menu-toggle cursor-pointer"
                onClick={() => toggleMenu("account")}
              >
                <i className="menu-icon tf-icons ri-settings-3-line me-2"></i>
                <div>Account Settings</div>
              </a>
              <ul
                className={`menu-sub ${
                  openMenu === "account" ? "d-block" : "d-none"
                }`}
              >
                <li className={`menu-item ${
                      pathname === "/Dashboard/Profile" ? "active" : ""
                    }`}>
                  <Link
                    href="/Dashboard/Profile"
                    className="menu-link"
                  >
                    <div>My Profile</div>
                  </Link>
                </li>
                <li className={`menu-item ${
                      pathname === "/Dashboard/Security" ? "active" : ""
                    }`}>
                  <Link
                    href="/Dashboard/Security"
                    className="menu-link"
                  >
                    <div>Security</div>
                  </Link>
                </li>
                <li className={`menu-item ${
                      pathname === "/Dashboard/Billing" ? "active" : ""
                    }`}>
                  <Link
                    href="/Dashboard/Billing"
                    className="menu-link"
                  >
                    <div>Billing & Plans</div>
                  </Link>
                </li>

                 <li className={`menu-item ${
                      pathname === "/Dashboard/Policies" ? "active" : ""
                    }`}>
                  <Link
                    href="/Dashboard/Policies"
                    className="menu-link"
                  >
                    <div>Manage Policies</div>
                  </Link>
                </li>
              </ul>
            </li>
          </ul>
        )}

        {userRole === "superadmin" && (
          <ul className="menu-inner py-1">
            {/* --- Superadmin Menus --- */}
            {/* <li className="menu-item">
              <a
                className={`menu-link menu-toggle cursor-pointer ${pathname === '/Dashboard/AdminUsers' || pathname === '/Dashboard/AdminUsers/CreateUser' ? 'active' : ''}`}
                onClick={() => toggleMenu('users')}
              >
                <i className="menu-icon tf-icons ri-group-line me-2"></i>
                <div>Users</div>
              </a>
              <ul className={`menu-sub ${openMenu === 'users' ? 'd-block' : 'd-none'}`}>
                <li className="menu-item">
                  <Link href="/Dashboard/AdminUsers" className={`menu-link ${pathname === '/Dashboard/AdminUsers' ? 'active' : ''}`}>
                    <div>Manage Users</div>
                  </Link>
                </li>
               
              </ul>
              </li> */}
              <li className={`menu-item ${
                    pathname === "/Dashboard/AdminUsers" ? "active" : ""
                  }`}>
                <Link
                  href="/Dashboard/AdminUsers"
                  className="menu-link"
                >
                   <i className="menu-icon tf-icons ri-admin-line me-2"></i>
                  <div>Manage Admins</div>
                </Link>
              </li>
            <li className={`menu-item ${
                  pathname === "/Dashboard/Coupans" ? "active" : ""
                }`}>
              <Link
                href="/Dashboard/Coupans"
                className="menu-link"
              >
                <i className="menu-icon tf-icons ri-coupon-line me-2"></i>
                <div>Coupons</div>
              </Link>
            </li>
            <li className={`menu-item ${
                  pathname === "/Dashboard/Plans" ? "active" : ""
                }`}>
              <Link
                href="/Dashboard/Plans"
                className="menu-link"
              >
                <i className="menu-icon tf-icons ri-price-tag-3-line me-2"></i>
                <div>Subscription Plans</div>
              </Link>
            </li>
            <li className={`menu-item ${
                  pathname === "/Dashboard/SubscriptionRenewals" ? "active" : ""
                }`}>
              <Link
                href="/Dashboard/SubscriptionRenewals"
                className="menu-link"
              >
                <i className="menu-icon tf-icons ri-wallet-line me-2"></i>
                <div>Subscription Renewals</div>
              </Link>
            </li>
          </ul>
        )}
        </div>
      </aside>
    </div>
  );
};

export default Sidebar;
