'use client';
import QrCodeModal from './QrCodeModal';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import './BusinessProfile.css';

const BusinessProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [navigating, setNavigating] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const cardUrl =
    typeof window !== 'undefined' ? window.location.href : '';

  const router = useRouter();

  const copyCardLink = async () => {
    try {
      await navigator.clipboard.writeText(cardUrl);
      alert('Business card link copied!');
    } catch {
      alert('Unable to copy link');
    }
  };

  const shareWhatsApp = () => {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(cardUrl)}`,
      '_blank'
    );
  };

  const saveContact = () => {
    if (!profile) return;

    const vCard = `
BEGIN:VCARD
VERSION:3.0
FN:${profile.fullName}
N:${profile.fullName};;;;
ORG:${profile.businessName || ''}
TITLE:${profile.role || ''}
TEL;TYPE=CELL:9158287488
EMAIL:${profile.email || ''}
URL:${window.location.href}
END:VCARD
  `.trim();

    const blob = new Blob([vCard], { type: 'text/vcard;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `${profile.fullName}.vcf`;
    link.click();

    URL.revokeObjectURL(url);
  };

  const shareEmail = () => {
    window.location.href =
      `mailto:?subject=My Digital Business Card&body=${encodeURIComponent(cardUrl)}`;
  };

  const shareLinkedIn = () => {
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(cardUrl)}`,
      '_blank'
    );
  };

  const shareSMS = () => {
    window.location.href = `sms:?body=${encodeURIComponent(cardUrl)}`;
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const hostname = window.location.hostname;
        const pathname = window.location.pathname;
        const slug =
          hostname.includes('appointify') || hostname.includes('localhost')
            ? pathname.split('/')[1]
            : hostname;

        if (!slug) throw new Error('Slug not found');

        const [landingRes, adminRes] = await Promise.all([
          fetch(`https://appo.coinagesoft.com/api/public-landing/?slug=${slug}`)
          // fetch(`http://localhost:5000/api/public-landing/getAdminBySlug?slug=${slug}`)
        ]);

        const landingJson = await landingRes.json();
        // const adminJson = await adminRes.json();

        const mergedProfile = {
          ...landingJson.data,
          phoneNumber: landingJson?.data?.phoneNumber ?? null
        };

        setProfile(mergedProfile);
      } catch (err) {
        console.error('Profile fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const goToPlans = () => {
    const hostname = window.location.hostname;
    const pathname = window.location.pathname;

    const slug =
      hostname.includes('appointify') || hostname.includes('localhost')
        ? pathname.split('/')[1]
        : hostname;

    router.push(`/${slug}/Plans`);
  };

const getFirstParagraphText = (html) => {
  if (!html) return '';

  const div = document.createElement('div');
  div.innerHTML = html;

  const firstP = div.querySelector('p');
  return firstP ? firstP.textContent.trim() : '';
};





  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" />
      </div>
    );
  }

  if (!profile?.fullName) return null;

  return (

    <section className="profile-section">
      {/* COVER IMAGE */}{navigating && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'white',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
          }}
        >
          <ThreeDotsLoader />
        </div>
      )}
<div className="bg-blobs">
  <span className="blob blob-1"></span>
  <span className="blob blob-2"></span>
  <span className="blob blob-3"></span>
</div>

      <div className="cover-wrapper ">
        <div className="cover-slider">
          {[profile.banner1_Image, profile.banner2_Image, profile.banner3_Image]
            .filter(Boolean)
            .map((img, index) => (
              <div
                key={index}
                className="cover-slide"
                style={{ backgroundImage: `url(https://appo.coinagesoft.com${img})` }}
              />
            ))}
        </div>
      </div>

      {/* PROFILE CARD */}
      <div className="container profile-container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-10 col-lg-7">
            <div className="card border-0 shadow rounded-4 profile-card">
              <div className="card-body p-4 p-md-5 text-center">
                <div>

                  {/* Profile Image */}
                  <div className="profile-img-wrapper">
                    <img
                      src={`https://appo.coinagesoft.com${profile.section2_Image}`}
                      alt={profile.fullName}
                      className="profile-image"
                    />
                  </div>
                </div>


                <h5 className="fw-bold mt-3 mb-0">{profile.fullName}</h5>
                <p className="text-primary fw-medium my-0">{profile.role}</p>

                {/* Name & Role */}

                {/* Description */}
{profile.description && (
  <div className="mt-3">
    <p
      className={`text-muted ${expanded ? '' : 'line-clamp-2'}`}
    >
      {getFirstParagraphText(profile.description)}
      
    </p>
{!expanded && (
      <span
        className=" p-0 text-primary fw-medium"
        onClick={() => setExpanded(true)}
      >
        Read more
      </span>
    )}
    
  </div>
)}



                {/* Contact Info */}
                <div className="row g-3 mt-4">
                  <div className="col-12 col-md-6">
                    <a href={`tel:91 9875708668`} className="text-decoration-none">
                      <div className="p-3 border rounded-3 h-100 text-center">
                        <small className="text-muted">Phone</small>
                        <p className="fw-semibold mb-0">{'+91 9158287488'}</p>
                      </div>
                    </a>
                  </div>
                  <div className="col-12 col-md-6">
                    <a href={`mailto:${profile.email}`} className="text-decoration-none">
                      <div className="p-3 border rounded-3 h-100 text-center">
                        <small className="text-muted">Email</small>
                        <p className="fw-semibold mb-0">{profile.email || 'contact@appointify.com'}</p>
                      </div>
                    </a>
                  </div>
                </div>

                {/* CTA */}
                <div className="mt-4">
                  <button className="btn btn-primary btn-lg w-100 rounded-3" onClick={goToPlans}>
                    Book
                  </button>
                  <p className="text-muted small mt-2">
                    No app required · Save contact instantly
                  </p>
                </div>
                {/* Secondary actions - Theme-consistent */}
                <div className="d-flex flex-column flex-sm-row gap-2 mt-3">
                  {/* Save Contact */}
                  <button
                    className="btn btn-outline-primary bg-black text-white flex-fill rounded-3 p-3 fw-semibold shadow-sm"
                    onClick={saveContact}

                  >
                     <span className="icon">⬇️</span>
                    Save my contact
                  </button>


                  {/* Share Dropdown */}
                  <div className="dropdown flex-fill">
                    <button
                      className="btn btn-outline-primary w-100 rounded-3 p-3 fw-semibold shadow-sm dropdown-toggle"
                      data-bs-toggle="dropdown"
                    >
                      Share
                    </button>

                    <ul className="dropdown-menu w-100 shadow-sm">
                      <li className="dropdown-item" onClick={copyCardLink}>
                        Copy my card link
                      </li>

                      <li
                        className="dropdown-item"
                        onClick={() => setShowQr(true)}
                      >
                        Show QR code
                      </li>

                      <li className="dropdown-item" onClick={shareWhatsApp}>
                        WhatsApp
                      </li>

                      <li className="dropdown-item" onClick={shareEmail}>
                        Email
                      </li>

                      {profile.linkedinId && (
                        <li className="dropdown-item" onClick={shareLinkedIn}>
                          LinkedIn
                        </li>
                      )}

                      <li className="dropdown-item text-muted">
                        Add to Apple / Google Wallet (soon)
                      </li>
                    </ul>
                  </div>
                </div>




                {/* Trust footer */}
                <div className="mt-4 p-3 bg-light rounded-3 text-center">
                  <small className="text-muted">
                    Easy booking · Secure · Trusted by clients
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <QrCodeModal
        open={showQr}
        onClose={() => setShowQr(false)}
        url={cardUrl}
      />

    </section>

  );
};

export default BusinessProfile;
