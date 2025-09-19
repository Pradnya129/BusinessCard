'use client'
import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import axios from 'axios';
import { jwtDecode } from "jwt-decode";

const API_URL = process.env.REACT_APP_API_URL;
const ConsultantSection6 = () => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [faqs, setFaqs] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [editQuestion, setEditQuestion] = useState('');
  const [editAnswer, setEditAnswer] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  // Helper function to get token
  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Load FAQs from API on mount
  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const headers = getAuthHeaders();
        if (!headers.Authorization) {
          setStatusMessage({ type: 'error', text: 'No token found. Please log in.' });
          return;
        }

        const res = await axios.get(`https://appo.coinagesoft.com/api/admin/faq`, { headers });
        setFaqs(res.data.data);
        setStatusMessage({ type: '', text: '' });
      } catch (err) {
        console.error("Error fetching FAQs:", err);
        setStatusMessage({ type: 'error', text: 'Error fetching FAQs' });
      }
    };

    fetchFaqs();
  }, []);

  const handleAddFAQ = async () => {
    if (!question.trim() || !answer.trim()) return;

    try {
      const headers = getAuthHeaders();
      if (!headers.Authorization) return;

      const res = await axios.post(`https://appo.coinagesoft.com/api/admin/faq`, {
        question,
        answer
      }, { headers });

      setFaqs([...faqs, res.data]);
      setQuestion('');
      setAnswer('');
      setStatusMessage({ type: 'success', text: 'FAQ added successfully!' });
    } catch (err) {
      console.error('Error adding FAQ:', err);
      setStatusMessage({ type: 'error', text: 'Error adding FAQ' });
    }
  };

  const handleEditClick = (index) => {
    setEditIndex(index);
    setEditQuestion(faqs[index].question);
    setEditAnswer(faqs[index].answer);
    setShowModal(true);
  };

  const handleModalSave = async () => {
    const updatedFaq = {
      id: faqs[editIndex].id,
      question: editQuestion,
      answer: editAnswer
    };

    try {
      const headers = getAuthHeaders();
      if (!headers.Authorization) return;

      const res = await axios.put(`https://appo.coinagesoft.com/api/admin/faq/${updatedFaq.id}`, updatedFaq, { headers });
      const updatedFaqs = [...faqs];
      updatedFaqs[editIndex] = res.data;
      setFaqs(updatedFaqs);
      setShowModal(false);
      setStatusMessage({ type: 'success', text: 'FAQ updated successfully!' });
    } catch (err) {
      console.error('Error updating FAQ:', err);
      setStatusMessage({ type: 'error', text: 'Error updating FAQ' });
    }
  };

  const handleDelete = async (index) => {
    const id = faqs[index].id;
    try {
      const headers = getAuthHeaders();
      if (!headers.Authorization) return;

      await axios.delete(`https://appo.coinagesoft.com/api/admin/faq/${id}`, { headers });
      setFaqs(faqs.filter((_, i) => i !== index));
      setStatusMessage({ type: 'success', text: `FAQ index - ${index} deleted successfully!` });
    } catch (err) {
      console.error('Error deleting FAQ:', err);
      setStatusMessage({ type: 'error', text: 'Error deleting FAQ' });
    }
  };

  return (
    <div>
      <h5 className="text-start mb-3 text-muted mt-8">Section 6 - Manage FAQs</h5>
      {statusMessage.text && (
        <div className={`alert ${statusMessage.type === 'success' ? 'alert-success' : 'alert-danger'}`}>
          {statusMessage.text}
        </div>
      )}
      <div className="card p-4 mt-8">
        <div className="container mt-5">
          {/* FAQ Form */}
          <div className="mb-3">
            <label className="form-label">Question:</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter your question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Answer:</label>
            <textarea
              rows="3"
              className="form-control"
              placeholder="Enter your answer"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
            />
          </div>

          <button
            className="btn btn-primary"
            onClick={handleAddFAQ}
            disabled={!question.trim() || !answer.trim()}
          >
            Add FAQ
          </button>

          {/* FAQ List */}
          {faqs.length > 0 && (
            <div className="mt-5">
              <h3>Frequently Asked Questions</h3>
              {faqs.map((faq, index) => (
                <div key={faq.id} className="card py-5 px-5 mb-3">
                  <h5>{faq.question}</h5>
                  <p>{faq.answer}</p>
                  <div className="row px-5 text-center">
                    <button
                      className="btn btn-sm btn-warning col-2 me-3"
                      onClick={() => handleEditClick(index)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-danger col-2"
                      onClick={() => handleDelete(index)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit FAQ Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit FAQ</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Question</Form.Label>
            <Form.Control
              type="text"
              value={editQuestion}
              onChange={(e) => setEditQuestion(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Answer</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={editAnswer}
              onChange={(e) => setEditAnswer(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleModalSave}
            disabled={!editQuestion.trim() || !editAnswer.trim()}
          >
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ConsultantSection6;
