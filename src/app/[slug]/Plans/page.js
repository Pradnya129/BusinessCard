'use client';

import React, { useEffect, useState } from 'react';
import Plans from '../../Components/LandingPageComponents/Plans.js';
import ThreeDotsLoader from '../../Components/LandingPageComponents/ThreeDotsLoader.js';

const Page = () => {
  const [loading, setLoading] = useState(true);

  return (
    <>
      {loading && (
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

      <Plans onReady={() => setLoading(false)} />
    </>
  );
};

export default Page;
