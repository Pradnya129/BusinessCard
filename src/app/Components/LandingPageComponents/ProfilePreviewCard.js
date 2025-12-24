'use client';
import React, { useState, useCallback, useEffect } from 'react';
import ProfileDetails from './ProfileDetails';
import './ProfileUI.css';

export default function ProfilePreviewCard() {
  const [open, setOpen] = useState(false);

  const openPreview = useCallback(() => {
    setOpen(true);
  }, []);

  const closePreview = useCallback(() => {
    setOpen(false);
  }, []);

  useEffect(() => {
  document.body.style.overflow = open ? 'hidden' : '';
}, [open]);


  return (
    <>
      {/* FIRST SCREEN */}
    
          <div className="preview-card full">
            <img
              src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e"
              alt="profile"
            />

            <div className="preview-info">
              <h3>Brian James</h3>
              <p>Product Designer</p>
            </div>

            <button
              className="arrow-btn"
              type="button"
              onClick={openPreview}
            >
              →
            </button>
          </div>
     

      {/* SECOND SCREEN (OVERLAY) */}
      {open && <ProfileDetails onClose={closePreview} />}
    </>
  );
}
