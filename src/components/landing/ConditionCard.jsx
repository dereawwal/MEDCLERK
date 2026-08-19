import { Heart, Activity, Brain, Stethoscope, AlertTriangle, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './ConditionCard.css';

const getSystemIcon = (system) => {
  switch(system) {
    case 'Cardiology': return <Heart size={18} />;
    case 'Respiratory': return <Activity size={18} />;
    case 'Neurology': return <Brain size={18} />;
    default: return <Stethoscope size={18} />;
  }
};

const ConditionCard = ({ condition, onDelete }) => {
  const navigate = useNavigate();
  
  const handleDelete = (e) => {
    e.stopPropagation(); // Prevent navigation
    if (onDelete) {
      onDelete(condition.id, condition.name);
    }
  };

  return (
    <div 
      className={`condition-card ${condition.isRedFlag ? 'has-red-flag' : ''}`}
      onClick={() => navigate(`/condition/${encodeURIComponent(condition.name)}`)}
    >
      <div className="card-icon-wrapper">
        {getSystemIcon(condition.system)}
      </div>
      <div className="card-content">
        <h3 className="card-title">{condition.name}</h3>
        <span className="card-system">{condition.system}</span>
      </div>
      
      <div className="card-actions">
        {condition.isRedFlag && (
          <div className="red-flag-indicator" title="Contains Red Flags">
            <AlertTriangle size={14} />
          </div>
        )}
        <button 
          className="delete-card-btn" 
          onClick={handleDelete}
          title="Remove from Dashboard"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};

export default ConditionCard;
