import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckSquare, Square, ExternalLink } from 'lucide-react';
import './ChecklistSection.css';

const ChecklistSection = ({ title, items, conditionName }) => {
  const navigate = useNavigate();
  // Use conditionName to namespace local storage
  const namespace = `medclerk_${conditionName.replace(/\s+/g, '_')}_${title}`;
  const [checkedItems, setCheckedItems] = useState(() => {
    try {
      const saved = localStorage.getItem(namespace);
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem(namespace, JSON.stringify(checkedItems));
  }, [checkedItems, namespace]);

  const toggleItem = (index) => {
    setCheckedItems(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  if (!items || items.length === 0) return null;

  return (
    <div className="checklist-section">
      <h3 className="section-title">{title}</h3>
      <ul className="checklist">
        {items.map((item, index) => {
          const isChecked = checkedItems[index] || false;
          return (
            <li 
              key={index} 
              className={`checklist-item ${isChecked ? 'checked' : ''}`}
              onClick={() => toggleItem(index)}
            >
              <div className="checkbox-icon">
                {isChecked ? (
                  <CheckSquare size={20} className="icon-checked" />
                ) : (
                  <Square size={20} className="icon-unchecked" />
                )}
              </div>
              <span className="item-text">{item}</span>
              {title === "Differentials" && (
                <button 
                  className="view-differential-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/condition/${encodeURIComponent(item)}`);
                  }}
                  title="Generate a clinical guide for this differential diagnosis"
                >
                  <ExternalLink size={14} />
                  <span>Verify</span>
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default ChecklistSection;
