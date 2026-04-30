import React from 'react';
import { useSelector } from 'react-redux';
import { Calendar, User, AlignLeft } from 'lucide-react';

const Dashboard = ({ minimal = false }) => {
  const interactions = useSelector((state) => state.interactions.list);
  const hcps = useSelector((state) => state.hcps.list);

  const getHCPName = (hcpId) => {
    const hcp = hcps.find(h => h.id === hcpId);
    return hcp ? hcp.name : 'Unknown HCP';
  };

  const displayList = minimal ? interactions.slice(0, 3) : interactions;

  return (
    <div className="glass-panel" style={{ padding: '2rem' }}>
      <h2 style={{ marginBottom: '1.5rem' }}>{minimal ? 'Recent Interactions' : 'All Interactions'}</h2>
      
      {interactions.length === 0 ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          No interactions logged yet.
        </div>
      ) : (
        <div className="card-list">
          {displayList.map(interaction => (
            <div key={interaction.id} className="interaction-card">
              <div className="card-header">
                <div className="card-title">
                  <User size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }} />
                  {getHCPName(interaction.hcp_id)}
                </div>
                <div className="card-date">
                  <Calendar size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }} />
                  {new Date(interaction.timestamp).toLocaleString()}
                </div>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <span className="badge" style={{ marginBottom: '0.5rem' }}>{interaction.method}</span>
                <p style={{ color: 'var(--text-main)', fontSize: '0.95rem', lineHeight: '1.5' }}>
                  <AlignLeft size={14} style={{ display: 'inline', marginRight: '6px', color: 'var(--text-muted)' }} />
                  {interaction.summary}
                </p>
              </div>
              {interaction.next_steps && (
                <div style={{ padding: '0.75rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', fontSize: '0.85rem' }}>
                  <strong style={{ color: '#10B981' }}>Next Steps:</strong> {interaction.next_steps}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
