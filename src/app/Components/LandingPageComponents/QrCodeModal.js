'use client';

import { QRCodeCanvas } from 'qrcode.react';

const QrCodeModal = ({ open, onClose, url }) => {
  if (!open) return null;

  return (
    <div className="qr-overlay">
      <div className="qr-box">
        <h6 className="fw-semibold mb-2">Scan to save my contact</h6>

        <QRCodeCanvas
          value={url}
          size={220}
          bgColor="#ffffff"
          fgColor="#000000"
        />

        <p className="text-muted small mt-3">
          Open your camera and scan
        </p>

        <button
          className="btn btn-outline-secondary mt-3 w-100"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default QrCodeModal;
