'use client';
import React, { useState, useCallback, useEffect } from 'react';
import ProfileDetails from './ProfileDetails';
import './ProfileUI.css';

export default function ProfilePreviewCard() {
  const [open, setOpen] = useState(false);

  const openPreview = useCallback(() => setOpen(true), []);
  const closePreview = useCallback(() => setOpen(false), []);

  // Lock scroll when overlay is open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
  }, [open]);

  return (
    <>
      {/* FULLSCREEN IMAGE */}
      <div className="preview-card full">
        <img
          src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=388&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="profile"
        />

        <div className="preview-info">
          <h3 className='text-white mb-0'>Brian James</h3>
          <p>Product Designer</p>
        </div>

        <button className="arrow-btn" type="button" onClick={openPreview}>
          →
        </button>
      </div>

      {/* OVERLAY DETAILS */}
      {open && <ProfileDetails onClose={closePreview} />}
    </>
  );
}
