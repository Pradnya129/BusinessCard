'use client';
import React, { useEffect, useState } from 'react';
import Swiper from 'swiper';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/thumbs';
import 'swiper/css/effect-fade';
import { Pagination, Thumbs, EffectFade, Autoplay } from 'swiper/modules';
const API_URL = process.env.REACT_APP_API_URL;
const dummyData = {
  images: ['img32', 'img33', 'img34'],
};

const DEFAULT_BANNERS = [
  '/assets/img/1920x1080/img32.jpg',
  '/assets/img/1920x1080/img33.jpg',
  '/assets/img/1920x1080/img34.jpg',
];
const BASE_URL = 'https://appo.coinagesoft.com';
const Hero = ({ scrollToSectionHeader }) => {
  const [consultantData, setConsultantData] = useState({});
  const [taglines, setTaglines] = useState([]);
  const [bannerImages, setBannerImages] = useState([]);
  Swiper.use([Pagination, Thumbs, EffectFade, Autoplay]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // ✅ Get slug from hostname (production)
        let slug = window.location.hostname;



        if (!slug) throw new Error("Slug not found in hostname or URL path");

        // ✅ Fetch data using slug query param
        const response = await fetch(`https://appo.coinagesoft.com/api/public-landing/?slug=${slug}`);
        if (!response.ok) throw new Error("Failed to fetch consultant data");

        const result = await response.json();
        const data = result.data;

        setConsultantData(data);
        setTaglines([data.tagline1, data.tagline2, data.tagline3]);
        setBannerImages([
          data?.banner1_Image ? `${BASE_URL}${data.banner1_Image}` : DEFAULT_BANNERS[0],
          data?.banner2_Image ? `${BASE_URL}${data.banner2_Image}` : DEFAULT_BANNERS[1],
          data?.banner3_Image ? `${BASE_URL}${data.banner3_Image}` : DEFAULT_BANNERS[2],
        ]);
      } catch (error) {
        console.error("Error fetching consultant data:", error);
        setBannerImages(DEFAULT_BANNERS);
      }
    };

    fetchData();
  }, []);


  useEffect(() => {
    const loadImage = (path) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.addEventListener('load', () => resolve());
        img.src = path.replace(/url\("(.*?)"\)/g, '$1');
      });
    };

    const $preloader = document.querySelector('.js-swiper-preloader');
    const promises = [...document.querySelectorAll('.js-swiper-slide-preload')].map((slide) =>
      loadImage(window.getComputedStyle(slide).backgroundImage)
    );

    Promise.all(promises).then(() => {
      if ($preloader) $preloader.remove();

      const sliderThumbs = new Swiper('.js-swiper-blog-journal-hero-thumbs', {
        direction: 'vertical',
        watchSlidesVisibility: true,
        watchSlidesProgress: true,
        slidesPerView: 3,
        history: false,
        on: {
          afterInit: function (swiper) {
            swiper.el.style.opacity = 1;
            swiper.el.querySelectorAll('.js-swiper-pagination-progress-body-helper').forEach(($progress) => {
              $progress.style.transitionDuration = `${swiper.params.autoplay.delay}ms`;
            });
          },
        },
      });

      new Swiper('.js-swiper-blog-journal-hero', {
        effect: 'fade',
        autoplay: { delay: 3000 },
        loop: true,
        pagination: {
          el: '.js-swiper-blog-journal-hero-pagination',
          clickable: true,
        },
        thumbs: {
          swiper: sliderThumbs,
        },
      });
    });
  }, [bannerImages, taglines]);

  if (consultantData.length === 0) {
    return null
  }
  return (
    <main id="content" role="main">
      <div className="position-relative">
        <div className="js-swiper-blog-journal-hero swiper">
          <div className="swiper-wrapper">
            {bannerImages.map((image, index) => (
              <div
                key={index}
                className="js-swiper-slide-preload swiper-slide d-flex gradient-x-overlay-sm-dark bg-img-start"

                style={{ backgroundImage: `url(${image})`, height: '100vh', backgroundPosition: 'center center' }}
              // , minHeight: '40rem'
              >
                <div className="container d-flex align-items-center" style={{ minHeight: '40rem' }}>
                  <div className="w-lg-50 me-3">
                    <div className="d-flex align-items-center mb-3">
                      <div className="flex-shrink-0">
                        <div className="avatar avatar-circle rounded-pill">
                          <img
                            className="avatar-img rounded-pill"
                            src={
                              `https://appo.coinagesoft.com/${consultantData.profileImage}`
                            }
                          />
                        </div>
                      </div>
                      <div className="flex-grow-1 ms-3">
                        <a className="text-white" href="#">
                          {consultantData.fullName}
                          {consultantData.experience ? ` - ${consultantData.experience}` : ""}
                        </a>

                      </div>
                    </div>
                    <div className="mb-5">
                      <h2 className="text-white" style={{ lineHeight: '1.2' }}>
                        {taglines[index]}
                      </h2>
                    </div>
                    <button className="btn btn-primary btn-transition scrollBtn" type="button" onClick={() => { scrollToSectionHeader() }}>
                      Book Appointment <i className="bi-chevron-right small ms-1"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="js-swiper-blog-journal-hero-pagination swiper-pagination swiper-pagination-light swiper-pagination-vertical swiper-pagination-middle-y-end me-3 d-lg-none"></div>
          <div className="js-swiper-preloader d-flex align-items-center justify-content-center top-0 position-absolute w-100 h-100 bg-white zi-1">
            <div className="spinner spinner-border text-primary"></div>
          </div>
        </div>

        <div className="d-none d-lg-block container translate-middle-y position-absolute top-50 start-0 end-0 zi-2">
          <div className="translate-middle-y position-absolute top-50 end-0">
            <div className="js-swiper-blog-journal-hero-thumbs swiper" style={{ opacity: 0, maxWidth: '13rem' }}>
              <div className="swiper-wrapper">
                {taglines.map((text, index) => (
                  <div key={index} className="swiper-slide swiper-pagination-progress swiper-pagination-progress-light py-3">
                    <p className="text-white">{text}</p>
                    <div className="swiper-pagination-progress-body">
                      <div className="js-swiper-pagination-progress-body-helper swiper-pagination-progress-body-helper"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Hero;
