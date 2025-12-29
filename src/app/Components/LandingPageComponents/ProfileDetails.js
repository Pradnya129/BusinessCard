'use client';
import React, { useEffect, useRef, useState } from 'react';
import './ProfileUI.css';
import Plans from '../LandingPageComponents/Plans.js';
import QrCodeModal from './QrCodeModal';

export default function ProfileDetails({ onClose }) {
  const sheetRef = useRef(null);
  const startY = useRef(0);
  const startTranslate = useRef(0);

  const [translateY, setTranslateY] = useState(90);
  const [closing, setClosing] = useState(false);
  const [plansReady, setPlansReady] = useState(false);
const [showQr, setShowQr] = useState(false);

  const cardUrl =
    typeof window !== 'undefined' ? window.location.href : '';

  const handleClose = () => {
    setClosing(true);
    setTimeout(onClose, 400);
  };

  /* ---------- ACTIONS ---------- */

  const copyCardLink = async () => {
    try {
      await navigator.clipboard.writeText(cardUrl);
      alert('Link copied!');
    } catch {
      alert('Unable to copy');
    }
  };

  const saveContact = () => {
    const vCard = `
BEGIN:VCARD
VERSION:3.0
FN:Brian James
TITLE:Product Designer
EMAIL:brian@email.com
URL:${cardUrl}
END:VCARD
`.trim();

    const blob = new Blob([vCard], { type: 'text/vcard;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'Brian-James.vcf';
    link.click();

    URL.revokeObjectURL(url);
  };

  const shareWhatsApp = () => {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(cardUrl)}`,
      '_blank'
    );
  };

  const shareEmail = () => {
    window.location.href = `mailto:?body=${encodeURIComponent(cardUrl)}`;
  };

  /* ---------- BOTTOM SHEET (UNCHANGED) ---------- */

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
    if (translateY < 25) setTranslateY(0);
    else setTranslateY(90);
  };

  useEffect(() => {
    setTimeout(() => setTranslateY(85), 600);
  }, []);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => (document.body.style.overflow = '');
  }, []);

  return (
    <div className={`details-page clean ${closing ? 'slide-out' : 'slide-in'}`}>
      <button className="back-arrow clean" onClick={handleClose}>
        ←
      </button>

      {/* PROFILE */}
      <div className="details-content">
        <img
          className="avatar clean"
          src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=388"
          alt="Brian James"
        />

        <h2 className="name">Brian James</h2>
        <p className="role">Product Designer</p>

        <p className="desc clean">
          Sr. UI/UX Design Manager @sakspro <br />
          formerly Interactive Director at @enlab.
        </p>

{/* ===== ACTION BUTTONS ===== */}
<div className="action-section">

  {/* PRIMARY ACTION */}
  <button className="action-btn primary" onClick={saveContact}>
    <div className="icon-box">↓</div>
    <span>Save contact</span>
  </button>

  {/* SECONDARY ACTIONS */}
  <div className="action-grid two-col">
    <button className="action-btn" onClick={() => setShowQr(true)}>
      <div className="icon-box">▢</div>
      <span>QR Code</span>
    </button>

    <button className="action-btn" onClick={copyCardLink}>
      <div className="icon-box">🔗</div>
      <span>Copy link</span>
    </button>

    <button className="action-btn" onClick={shareWhatsApp}>
      <div className="icon-box">💬</div>
      <span>WhatsApp</span>
    </button>

    <button className="action-btn" onClick={shareEmail}>
      <div className="icon-box">✉️</div>
      <span>Email</span>
    </button>
  </div>
</div>




      </div>

      {/* BOTTOM SHEET */}
      <div
        ref={sheetRef}
        className="bottom-sheet"
        style={{ transform: `translateY(${translateY}%)` }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {translateY > 50 && (
          <div className="sheet-teaser" onClick={() => setTranslateY(35)}>
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
              Loading plans…
            </div>
          )}
          <Plans ref={sheetRef} onReady={() => setPlansReady(true)} />
        </div>
      </div>
    </div>
  );
}
