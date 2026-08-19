import { AlertTriangle, Lightbulb } from 'lucide-react';
import './SpecialCards.css';

export const RedFlagsCard = ({ flags }) => {
  if (!flags || flags.length === 0) return null;

  return (
    <div className="special-card red-flags-card">
      <div className="card-header">
        <AlertTriangle size={20} className="header-icon red-icon" />
        <h3 className="header-title red-title">Red Flags (Do Not Miss)</h3>
      </div>
      <ul className="special-list">
        {flags.map((flag, index) => (
          <li key={index} className="special-item">{flag}</li>
        ))}
      </ul>
    </div>
  );
};

export const OSCETipsCard = ({ tips }) => {
  if (!tips || tips.length === 0) return null;

  return (
    <div className="special-card osce-tips-card">
      <div className="card-header">
        <Lightbulb size={20} className="header-icon teal-icon" />
        <h3 className="header-title teal-title">OSCE Tips</h3>
      </div>
      <ul className="special-list list-numbered">
        {tips.map((tip, index) => (
          <li key={index} className="special-item">{tip}</li>
        ))}
      </ul>
    </div>
  );
};
