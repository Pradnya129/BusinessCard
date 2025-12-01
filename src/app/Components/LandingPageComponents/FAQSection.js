'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Accordion, Spinner, Row, Col } from 'react-bootstrap';
import { FaQuestionCircle } from 'react-icons/fa';
import './FAQ.css'

const FAQSection = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeKey, setActiveKey] = useState("0"); // ✅ Controlled active key

  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        setLoading(true);
      const hostname = window.location.hostname; // "www.appointify.me" or "www.aura-enterprises.in"
const pathname = window.location.pathname; // "/aura-enterprises" or "/"

// Determine slug
let slug = "";

// If main domain
if (hostname.includes("appointify.me")) {
  slug = pathname.split("/")[1]; // get slug from URL path
} else {
  // Custom domain → send hostname as slug
  slug = hostname;
}
        if (!slug) throw new Error("Slug not found in URL or hostname");

        const response = await axios.get(`https://appo.coinagesoft.com/api/public-landing/all-faqs?slug=${slug}`);
        setFaqs(response.data.data || []);
      } catch (err) {
        console.error('Error fetching FAQs:', err);
        setError('Failed to load FAQs. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchFAQs();
  }, []);



if( faqs.length === 0){
  return null
}

  // Split FAQs into two columns

  const midIndex = Math.ceil(faqs.length / 2);
  const column1 = faqs.slice(0, midIndex);
  const column2 = faqs.slice(midIndex);

  // ✅ Toggle function to open/close only one at a time
  const handleToggle = (key) => {
    setActiveKey(activeKey === key ? null : key);
  };

  return (
    <section className="py-5 my-5">
      <div className="container px-3 px-md-5" style={{ maxWidth: '1600px' }}>
        <div className="text-center mb-7">
          <h2>Frequently Asked Questions</h2>
          <p className="text-muted">Answers to the most common questions</p>
        </div>

        {loading ? (
          <div className="text-center my-5">
            <Spinner animation="border" variant="primary" />
          </div>
        ) : error ? (
          <div className="text-center text-danger my-5">{error}</div>
        ) : (
          <>
            {faqs.length > 0 ? (
              <Row>
                <Col md={6} xs={12} className="mb-4">
                  <Accordion activeKey={activeKey}>
                    {column1.map((faq, index) => (
                      <Accordion.Item
                        eventKey={index.toString()}
                        key={faq.id}
                        className="mb-3 rounded shadow-sm border-0"
                        style={{ backgroundColor: '#fff' }}
                      >
                        <Accordion.Header onClick={() => handleToggle(index.toString())}>
                          <FaQuestionCircle className="me-2 text-primary" />
                          <strong className="text-dark">{faq.question}</strong>
                        </Accordion.Header>
                        <Accordion.Body className="text-muted">{faq.answer}</Accordion.Body>
                      </Accordion.Item>
                    ))}
                  </Accordion>
                </Col>
                <Col md={6} xs={12} className="mb-4">
                  <Accordion activeKey={activeKey}>
                    {column2.map((faq, index) => (
                      <Accordion.Item
                        eventKey={(midIndex + index).toString()}
                        key={faq.id}
                        className="mb-3 rounded shadow-sm border-0"
                        style={{ backgroundColor: '#fff' }}
                      >
                        <Accordion.Header onClick={() => handleToggle((midIndex + index).toString())}>
                          <FaQuestionCircle className="me-2 text-primary" />
                          <strong className="text-dark">{faq.question}</strong>
                        </Accordion.Header>
                        <Accordion.Body className="text-muted">{faq.answer}</Accordion.Body>
                      </Accordion.Item>
                    ))}
                  </Accordion>
                </Col>
              </Row>
            ) : (
              <div className="text-center text-muted fs-5">
                No FAQs available at the moment. Please check back later.
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default FAQSection;
