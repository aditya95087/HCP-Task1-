import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateFormField, resetForm } from '../store/formSlice';
import { logInteraction } from '../store/interactionSlice';
import { Mic, Search, Save, RotateCcw } from 'lucide-react';

const LogForm = () => {
  const dispatch = useDispatch();
  const hcps = useSelector((state) => state.hcps.list);
  const formData = useSelector((state) => state.form);

  const handleChange = (field, value) => {
    dispatch(updateFormField({ field, value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.hcp_id || !formData.summary) {
      alert('Please fill in HCP Name and Topics Discussed before saving.');
      return;
    }

    dispatch(
      logInteraction({
        hcp_id: parseInt(formData.hcp_id, 10),
        method: formData.method,
        summary: formData.summary,
        next_steps: formData.next_steps || '',
      })
    );

    dispatch(resetForm());
    alert('Interaction logged successfully!');
  };

  const handleReset = () => {
    dispatch(resetForm());
  };

  return (
    <div className="panel panel-scrollable">
      <h1 className="page-title">Log HCP Interaction</h1>

      <div className="form-section-title">Interaction Details</div>
      <form onSubmit={handleSubmit}>
        <div className="input-row">
          <div className="input-group">
            <label className="input-label">HCP Name</label>
            <select
              className="input-field"
              value={formData.hcp_id || formData.hcp_name}
              onChange={(e) => {
                const val = e.target.value;
                const matchedHcp = hcps.find(h => h.id.toString() === val);
                if (matchedHcp) {
                  dispatch(updateFormField({ field: 'hcp_id', value: matchedHcp.id.toString() }));
                  dispatch(updateFormField({ field: 'hcp_name', value: matchedHcp.name }));
                } else {
                  dispatch(updateFormField({ field: 'hcp_id', value: '' }));
                  dispatch(updateFormField({ field: 'hcp_name', value: val }));
                }
              }}
              required
            >
              <option value="">Search or select HCP...</option>
              {hcps.map((hcp) => (
                <option key={hcp.id} value={hcp.id}>
                  {hcp.name}
                </option>
              ))}
              {formData.hcp_name && !hcps.find(h => h.id.toString() === formData.hcp_id) && (
                <option value={formData.hcp_name}>{formData.hcp_name} (Extracted)</option>
              )}
            </select>
          </div>
          <div className="input-group">
            <label className="input-label">Interaction Type</label>
            <select
              className="input-field"
              value={formData.method}
              onChange={(e) => handleChange('method', e.target.value)}
            >
              <option value="Meeting">Meeting</option>
              <option value="Call">Call</option>
              <option value="Email">Email</option>
            </select>
          </div>
        </div>

        <div className="input-row">
          <div className="input-group">
            <label className="input-label">Date</label>
            <input
              type="date"
              className="input-field"
              value={formData.date}
              onChange={(e) => handleChange('date', e.target.value)}
            />
          </div>
          <div className="input-group">
            <label className="input-label">Time</label>
            <input
              type="time"
              className="input-field"
              value={formData.time}
              onChange={(e) => handleChange('time', e.target.value)}
            />
          </div>
        </div>

        <div className="input-group" style={{ marginBottom: '1.5rem' }}>
          <label className="input-label">Attendees</label>
          <input
            type="text"
            className="input-field"
            placeholder="Enter names or search..."
            value={formData.attendees}
            onChange={(e) => handleChange('attendees', e.target.value)}
          />
        </div>

        <div className="input-group" style={{ marginBottom: '1rem' }}>
          <label className="input-label">Topics Discussed</label>
          <textarea
            className="input-field"
            placeholder="Enter key discussion points..."
            value={formData.summary}
            onChange={(e) => handleChange('summary', e.target.value)}
            required
            style={{ minHeight: '120px' }}
          />
        </div>

        <div className="input-group" style={{ marginBottom: '1rem' }}>
          <label className="input-label">Next Steps</label>
          <textarea
            className="input-field"
            placeholder="Follow-up actions..."
            value={formData.next_steps}
            onChange={(e) => handleChange('next_steps', e.target.value)}
            style={{ minHeight: '60px' }}
          />
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <button type="button" className="link-button">
            <Mic size={14} /> Summarize from Voice Note (Requires Consent)
          </button>
        </div>

        <div className="form-section-title">
          Materials Shared / Samples Distributed
        </div>
        <div className="form-section-title" style={{ marginTop: '0.2rem' }}>
          Materials Shared
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '1rem',
            borderBottom: '1px solid #eee',
            paddingBottom: '1rem',
            marginBottom: '1.5rem',
          }}
        >
          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            No materials added.
          </span>
          <button
            type="button"
            className="link-button"
            style={{ color: '#555', fontWeight: '500' }}
          >
            <Search size={14} /> Search/Add
          </button>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            type="submit"
            style={{
              flex: 1,
              padding: '0.75rem',
              background: 'var(--primary)',
              color: '#fff',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              fontFamily: "'Inter', sans-serif",
              fontWeight: 600,
              fontSize: '0.95rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              transition: 'background 0.2s',
            }}
          >
            <Save size={16} /> Save Interaction
          </button>
          <button
            type="button"
            onClick={handleReset}
            style={{
              padding: '0.75rem 1.25rem',
              background: '#f1f1f1',
              color: '#555',
              border: '1px solid #ddd',
              borderRadius: 'var(--radius-md)',
              fontFamily: "'Inter', sans-serif",
              fontWeight: 500,
              fontSize: '0.95rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <RotateCcw size={16} /> Reset
          </button>
        </div>
      </form>
    </div>
  );
};

export default LogForm;
