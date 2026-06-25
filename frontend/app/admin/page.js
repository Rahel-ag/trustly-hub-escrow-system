"use client"; // This tells Next.js this component uses interactive features like clicking tabs
import { useState } from 'react';
import './admin.css';

export default function AdminDashboard() {
  // React State to keep track of which tab is active
  const [activeTab, setActiveTab] = useState('overview');
  
  // React State for our mock database
  const [disputes, setDisputes] = useState([
      { id: "ESC-4021", project: "Website Redesign", client: "AlphaCorp", freelancer: "DevJhon", amount: "$1,500.00", reason: "Freelancer missed final deadline milestone." },
      { id: "ESC-5099", project: "Mobile App UI", client: "BetaTech", freelancer: "UI_Expert", amount: "$800.00", reason: "Client requested changes outside original scope." }
  ]);

  // Function to handle dispute resolution
  const handleArbitrate = (escrowId, decision) => {
      alert(`Administrative Action Recorded:\nEscrow status updated for ${escrowId}.\nDecision: ${decision} executed successfully.`);
      // Removes the resolved dispute from the screen
      setDisputes(disputes.filter(item => item.id !== escrowId));
  };

  return (
    <div className="admin-wrapper">
        {/* Sidebar Navigation */}
        <div className="sidebar">
            <div className="logo">Trustly Hub <span>Admin</span></div>
            <nav>
                <button className={`nav-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>Overview</button>
                <button className={`nav-btn ${activeTab === 'disputes' ? 'active' : ''}`} onClick={() => setActiveTab('disputes')}>Disputes Queue</button>
                <button className={`nav-btn ${activeTab === 'transactions' ? 'active' : ''}`} onClick={() => setActiveTab('transactions')}>All Escrows</button>
            </nav>
        </div>

        {/* Main Content Area */}
        <div className="main-content">
            <header>
                <div className="metric-card">
                    <h3>Total Value Locked (TVL)</h3>
                    <p className="metric-value">$142,500.00</p>
                </div>
                <div className="metric-card">
                    <h3>Platform Fees Earned (2%)</h3>
                    <p className="metric-value">$2,850.00</p>
                </div>
                <div className="metric-card">
                    <h3>Active Disputes</h3>
                    {/* The number of disputes updates automatically! */}
                    <p className="metric-value" style={{ color: '#ff6b6b' }}>{disputes.length} Pending</p>
                </div>
            </header>

            <main>
                {/* SECTION 1: OVERVIEW */}
                {activeTab === 'overview' && (
                    <section className="content-section">
                        <h2>System Overview</h2>
                        <p>Welcome back. Below are the urgent items requiring administrator authorization.</p>
                        <div className="alert-box">
                            <strong>Attention:</strong> There are unresolved disputes over 48 hours old. Please review the Disputes Queue.
                        </div>
                    </section>
                )}

                {/* SECTION 2: DISPUTES QUEUE */}
                {activeTab === 'disputes' && (
                    <section className="content-section">
                        <h2>Dispute Arbitration Center</h2>
                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Escrow ID</th>
                                        <th>Project Name</th>
                                        <th>Client</th>
                                        <th>Freelancer</th>
                                        <th>Amount</th>
                                        <th>Reason</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {/* Loop through our data array and create table rows dynamically */}
                                    {disputes.map((dispute) => (
                                        <tr key={dispute.id}>
                                            <td>{dispute.id}</td>
                                            <td><strong>{dispute.project}</strong></td>
                                            <td>{dispute.client}</td>
                                            <td>{dispute.freelancer}</td>
                                            <td>{dispute.amount}</td>
                                            <td><small>{dispute.reason}</small></td>
                                            <td>
                                                <button className="action-btn btn-release" onClick={() => handleArbitrate(dispute.id, 'Release')}>Release</button>
                                                <button className="action-btn btn-refund" onClick={() => handleArbitrate(dispute.id, 'Refund')}>Refund</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}

                {/* SECTION 3: ALL ESCROWS */}
                {activeTab === 'transactions' && (
                    <section className="content-section">
                        <h2>Global Escrow Registry</h2>
                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Escrow ID</th>
                                        <th>Client</th>
                                        <th>Freelancer</th>
                                        <th>Amount</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>#ESC-9081</td>
                                        <td>Alice Smith</td>
                                        <td>John Doe</td>
                                        <td>$1,200.00</td>
                                        <td><span className="status-badge status-completed">Released</span></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}
            </main>
        </div>
    </div>
  );
}