import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import ConditionCard from './ConditionCard';
import { systemsList } from '../../data/mockConditions';
import { getWardPresentations, deleteCondition } from '../../services/storageService';
import './QuickAccess.css';

const QuickAccess = ({ searchTerm }) => {
  const [activeSystem, setActiveSystem] = useState('All');
  const [presentations, setPresentations] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    setPresentations(getWardPresentations());
  }, []);

  const handleDeleteCondition = (id, name) => {
    // 1. Remove from persistent storage
    deleteCondition(id, name);
    // 2. Update UI state immediately
    setPresentations(prev => prev.filter(p => p.id !== id));
  };

  const filteredConditions = presentations.filter(c => {
    const matchesSystem = activeSystem === 'All' || c.system === activeSystem;
    const matchesSearch = (c.name || '').toLowerCase().includes((searchTerm || '').toLowerCase());
    return matchesSystem && matchesSearch;
  });

  useEffect(() => {
    // If there are no matches and user has typed something, auto-redirect after they stop typing
    if (searchTerm && filteredConditions.length === 0) {
      const timer = setTimeout(() => {
        navigate(`/condition/${encodeURIComponent(searchTerm)}`);
      }, 1200); // 1.2s debounce
      
      return () => clearTimeout(timer);
    }
  }, [searchTerm, filteredConditions.length, navigate]);

  return (
    <section className="quick-access">
      <div className="section-header">
        <h2 className="section-title">Quick Access</h2>
        <p className="section-subtitle">Most common ward presentations</p>
      </div>

      <div className="system-filters-wrapper">
        <div className="system-filters">
          {systemsList.map(system => (
            <button 
              key={system}
              className={`system-tab ${activeSystem === system ? 'active' : ''}`}
              onClick={() => setActiveSystem(system)}
            >
              {system}
            </button>
          ))}
        </div>
      </div>

      <div className="conditions-grid">
        {filteredConditions.length > 0 ? (
          filteredConditions.map(condition => (
            <ConditionCard 
              key={condition.id} 
              condition={condition} 
              onDelete={handleDeleteCondition}
            />
          ))
        ) : (
          <div className="empty-search-state">
            <div className="empty-icon-wrapper">
              <Sparkles size={24} className="sparkles-icon spin-animation" />
            </div>
            <h3>Searching medical database...</h3>
            <p>Automatically generating clinical guide for <strong style={{ color: 'var(--color-text-primary)' }}>"{searchTerm}"</strong></p>
          </div>
        )}
      </div>
    </section>
  );
};

export default QuickAccess;
