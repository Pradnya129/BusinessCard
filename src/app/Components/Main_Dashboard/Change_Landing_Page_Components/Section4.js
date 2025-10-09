import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from "jwt-decode";
import { toast, ToastContainer } from 'react-toastify';

const API_URL = "https://appo.coinagesoft.com";

const ConsultantSection4 = () => {
  const [stats, setStats] = useState([]);

  // 🔽 Fetch stats on component mount
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
                  toast.error("No token found. Please log in.");
          
          return;
        }

        const response = await axios.get(`${API_URL}/api/admin/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
console.log(response)
        const apiStats = response.data.data.map(stat => ({
          ...stat,
          editedValue: stat.value.replace("%", ""),
          editedDescription: stat.description || "",
        }));

        if (apiStats.length === 0) {
          // No stats found → show a blank stat card for creation
          setStats([{
            id: null,
            value: "",
            description: "",
            icon: "up",
            editedValue: "",
            editedDescription: ""
          }]);
        } else {
          setStats(apiStats);
        }

      } catch (error) {
        console.error("Error fetching stats:", error);
         toast.error("Error fetching stats.");
      }
    };

    fetchStats();
  }, []);

  // 🔽 Handlers
  const handleStatChange = (index, newValue) => {
    const updatedStats = [...stats];
    updatedStats[index].editedValue = newValue;
    setStats(updatedStats);
  };

  const handleDescChange = (index, newDesc) => {
    const updatedStats = [...stats];
    updatedStats[index].editedDescription = newDesc;
    setStats(updatedStats);
  };

  const handleDirectionChange = (index, newDirection) => {
    const updatedStats = [...stats];
    updatedStats[index].icon = newDirection;
    setStats(updatedStats);
  };

  const handleSave = async (index, value) => {
    const updatedStats = [...stats];
    const stat = updatedStats[index];

    // Validation
    if (!stat.editedValue || isNaN(stat.editedValue) || stat.editedValue <= 0) {
     toast.error('Value must be a positive number.');
      return;
    }
    if (!stat.editedDescription.trim()) {
       toast.error('Description cannot be empty.');
      return;
    }

   const dataToSend = {
  value: parseFloat(stat.editedValue), // ✅ number, no '%'
  description: stat.editedDescription,
  icon: stat.icon,
};


    try {
      const token = localStorage.getItem("token");
      if (!token) {
         toast.error("No token found. Please log in.");
        return;
      }

      if (stat.id) {
        // UPDATE existing stat
        await axios.put(`${API_URL}/api/admin/stats/${stat.id}`, dataToSend, {
          headers: { Authorization: `Bearer ${token}` }
        });

        stat.value = dataToSend.value;
        stat.description = dataToSend.description;
        setStats(updatedStats);
        toast.success("Section 4 updated successfully!");

      } else {
        // CREATE new stat
        const res = await axios.post(`${API_URL}/api/admin/stats`, dataToSend, {
          headers: { Authorization: `Bearer ${token}` }
        });

        stat.id = res.data.id;
        stat.value = res.data.value;
        stat.description = res.data.description;
        setStats(updatedStats);
         toast.success('New stat created successfully!');
      }
    } catch (error) {
      console.error('Error saving stat:', error);
       toast.error('Error saving stat' );
    }
  };

  // 🔽 Delete stat
  const handleDelete = async (index) => {
    const stat = stats[index];

    if (!stat.id) {
      // If not saved yet, just remove locally
      setStats(stats.filter((_, i) => i !== index));
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/api/admin/stats/${stat.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setStats(stats.filter((_, i) => i !== index));
       toast.success('Stat deleted successfully!');
    } catch (error) {
      console.error('Error deleting stat:', error);
     toast.error("Error deleting stat");
    }
  };

  return (
    <div>
      <h5 className="text-start mb-3 text-muted mt-5">Section 4 - Manage Stats</h5>

        <ToastContainer />
     

      <div className="card p-4 shadow-sm mt-4">
        <div className="row">
          {stats.map((stat, index) => (
            <div key={stat.id || index} className="col-md-4 mb-5">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center">
                  <div className="mb-3">
                    <h2 className="fw-bold d-flex align-items-center justify-content-center" style={{ gap: '8px' }}>
                      <i
                        className={`bi ${stat.icon === 'up'
                          ? 'bi-arrow-up-short text-success'
                          : 'bi-arrow-down-short text-danger'
                          }`}
                        style={{ fontSize: '1.5rem' }}
                      ></i>
                      <span className={stat.icon === 'up' ? 'text-success' : 'text-danger'}>
                        {stat.value}
                      </span>
                    </h2>
                    <p className="text-muted">{stat.description}</p>
                  </div>

                  <div className="form-group mb-3 text-start">
                    <label className="form-label">Update Value</label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="e.g. 50"
                      value={stat.editedValue || ""}
                      onChange={(e) => handleStatChange(index, e.target.value)}
                    />
                    <button
                      className="btn btn-outline-success mt-2 w-100"
                      onClick={() => handleSave(index, "Value")}
                    >
                      Save Value
                    </button>
                  </div>

                  <div className="form-group mb-3 text-start">
                    <label className="form-label">Trend Direction</label>
                    <select
                      className="form-select"
                      value={stat.icon}
                      onChange={(e) => handleDirectionChange(index, e.target.value)}
                    >
                      <option value="up">Up</option>
                      <option value="down">Down</option>
                    </select>
                  </div>

                  <div className="form-group text-start">
                    <label className="form-label">Update Description</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="Write new description"
                      value={stat.editedDescription || ""}
                      onChange={(e) => handleDescChange(index, e.target.value)}
                    ></textarea>
                    <button
                      className="btn btn-primary mt-2 w-100"
                      onClick={() => handleSave(index, "Description")}
                    >
                      Save Description
                    </button>
                  </div>

                  {/* 🔽 Delete button */}
                  <button
                    className="btn btn-danger mt-3 w-100"
                    onClick={() => handleDelete(index)}
                  >
                    Delete 
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ➕ Button to add new stat */}
        <button
          className="btn btn-outline-primary mt-3"
          onClick={() =>
            setStats([
              ...stats,
              { id: null, value: "", description: "", icon: "up", editedValue: "", editedDescription: "" }
            ])
          }
        >
          + Add New Stat
        </button>
      </div>
    </div>
  );
};

export default ConsultantSection4;
