'use client';
import React, { useEffect, useRef, useState } from 'react';
import './ProfileUI.css';
import Plans from '../LandingPageComponents/Plans.js'

export default function ProfileDetails({ onClose }) {
  const sheetRef = useRef(null);
  const startY = useRef(0);
  const startTranslate = useRef(0);

  const [translateY, setTranslateY] = useState(90); // collapsed %
  const [closing, setClosing] = useState(false);
  const [plansReady, setPlansReady] = useState(false);

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => {
      onClose();
    }, 400);
  };

  const onTouchStart = (e) => {
    startY.current = e.touches[0].clientY;
    startTranslate.current = translateY;
  };

  const onTouchMove = (e) => {
    const delta = e.touches[0].clientY - startY.current;
    const next = startTranslate.current + (delta / window.innerHeight) * 100;
    setTranslateY(Math.min(Math.max(next, 0), 95));
  };

  const onTouchEnd = () => {
    if (translateY < 25) setTranslateY(0);      // full
    else if (translateY < 55) setTranslateY(35); // half
    else setTranslateY(90);                     // collapsed
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setTranslateY(85); // initial collapsed state
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <div className={`details-page clean ${closing ? 'slide-out' : 'slide-in'}`}>
      {/* Back Arrow */}
      <button className="back-arrow clean" onClick={handleClose}>←</button>

      {/* Top Right Icon */}
      {/* <div className="top-icon">♂</div> */}

      <div className="details-content">
        <img
          className="avatar clean"
          src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=388&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Brian James"
        />
        <h2 className="name">Brian James</h2>
        <p className="role">Product Designer</p>
        <p className="desc clean">
          Sr. UI/UX Design Manager @sakspro <br />
          formerly Interactive Director at @enlab.
        </p>
        <div className="stats clean">
          <div>
            <strong>2390</strong>
            <span>Followers</span>
          </div>
          <div>
            <strong>450</strong>
            <span>Following</span>
          </div>
        </div>
        <button className="follow-btn clean">Follow</button>
      </div>

      {/* Bottom Sheet */}
      <div
        ref={sheetRef}
        className="bottom-sheet"
        style={{ transform: `translateY(${translateY}%)` }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* TEASER CTA: show only when sheet is collapsed */}
        {translateY > 50 && (
          <div
            className="sheet-teaser"
            onClick={() => setTranslateY(35)} // expand on tap
          >
            <span>View Plans & Book</span>
            <span className="arrow">↑</span>
          </div>
        )}

        <div className="sheet-handle-wrapper">
          <div className="sheet-handle" />
        </div>
        <div className="sheet-scroll bg-grey">
          {!plansReady && (
            <div style={{ padding: 24, textAlign: 'center' }}>
              <span>Loading plans…</span>
            </div>
          )}
          <Plans ref={sheetRef} onReady={() => setPlansReady(true)} />
        </div>
      </div>
    </div>
  );
}
