// app/layout.js
import Script from 'next/script';

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className="light-style layout-navbar-fixed layout-menu-fixed layout-compact"
      dir="ltr"
      data-theme="theme-default"
      data-assets-path="/materialize/assets/"
      data-template="vertical-menu-template"
      data-style="light"
    >
      <head>
        <link rel="icon" type="image/x-icon" href="/materialize/assets/img/favicon/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link rel="stylesheet" href="/materialize/assets/vendor/fonts/remixicon/remixicon.css" />
        <link rel="stylesheet" href="/materialize/assets/vendor/fonts/flag-icons.css" />
        <link rel="stylesheet" href="/materialize/assets/vendor/libs/node-waves/node-waves.css" />
        <link rel="stylesheet" href="/materialize/assets/vendor/css/rtl/core.css" />
        <link rel="stylesheet" href="/materialize/assets/vendor/css/rtl/theme-default.css" />
        <link rel="stylesheet" href="/materialize/assets/css/demo.css" />
        {/* <link rel="stylesheet" href="/materialize/assets/vendor/libs/perfect-scrollbar/perfect-scrollbar.css" /> */}
        <link rel="stylesheet" href="/materialize/assets/vendor/libs/typeahead-js/typeahead.css" />
        <link rel="stylesheet" href="/materialize/assets/vendor/libs/apex-charts/apex-charts.css" />
        <link rel="stylesheet" href="/materialize/assets/vendor/libs/datatables-bs5/datatables.bootstrap5.css" />
        <link rel="stylesheet" href="/materialize/assets/vendor/libs/datatables-responsive-bs5/responsive.bootstrap5.css" />
        <link rel="stylesheet" href="/materialize/assets/vendor/libs/datatables-checkboxes-jquery/datatables.checkboxes.css" />
        <link rel="stylesheet" href="/materialize/assets/vendor/css/pages/app-logistics-dashboard.css" />
        <link rel="stylesheet" href="/materialize/assets/vendor/css/pages/app-calendar.css" />

      </head>

      <body>
        {/* Global JS Config */}
        <Script id="materialize-config" strategy="beforeInteractive">
          {`
            window.isRtl = false;
            window.isDarkStyle = false;
            window.templateName = "vertical-menu-template";
            window.assetsPath = "/materialize/assets/";
            window.config = {
              theme: "light",
              assetsPath: "/materialize/assets/",
              colors: {
                textMuted: "#6c757d"
                }
                };
                `}
        </Script>

        {children}
        {/* Essential JS */}
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="beforeInteractive" />
      

        <Script src="/materialize/assets/vendor/libs/jquery/jquery.js" strategy="beforeInteractive" />
        <Script src="/materialize/assets/vendor/libs/popper/popper.js" strategy="beforeInteractive" />
        <Script src="/materialize/assets/vendor/js/bootstrap.js" strategy="beforeInteractive" />
        <Script src="/materialize/assets/vendor/libs/typeahead-js/typeahead.js" strategy="beforeInteractive" />
<Script src="https://cdn.jsdelivr.net/bootstrap/5.3.0/bootstrap.min.js"/>


        {/* After DOM Load */}
        <Script src="/materialize/assets/vendor/libs/node-waves/node-waves.js" strategy="afterInteractive" />
        {/* <Script src="/materialize/assets/vendor/libs/perfect-scrollbar/perfect-scrollbar.js" strategy="afterInteractive" /> */}
        <Script src="/materialize/assets/vendor/libs/hammer/hammer.js" strategy="afterInteractive" />
        <Script src="/materialize/assets/vendor/js/helpers.js" strategy="afterInteractive" />
        <Script src="/materialize/assets/vendor/js/menu.js" strategy="afterInteractive" />

        <Script src="/materialize/assets/js/main.js" strategy="afterInteractive" />
        <Script src="/materialize/assets/vendor/libs/datatables-bs5/datatables-bootstrap5.js" strategy="afterInteractive" />
        <Script src="/materialize/assets/js/app-logistics-dashboard.js" strategy="afterInteractive" />

        {/* Page Content */}

        {/* NoScript Fallback */}
      </body>
    </html>
  );
}
