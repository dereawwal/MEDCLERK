import { BookOpen, FileDown, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './GuideCTA.css';

const GuideCTA = () => {
  const navigate = useNavigate();

  return (
    <section className="guide-cta-section">
      <div className="guide-cta-card">
        <div className="cta-header">
          <div className="cta-icon-outer">
            <BookOpen size={28} className="cta-icon" />
          </div>
          <div className="cta-text">
            <h2 className="cta-title">Get a Clerking Guide</h2>
            <p className="cta-subtitle">Access the master framework and download your compiled professional handbook.</p>
          </div>
        </div>
        
        <button className="cta-primary-btn" onClick={() => navigate('/master-guide')}>
          <span>View Master Guide</span>
          <ArrowRight size={18} />
        </button>
      </div>
    </section>
  );
};

export default GuideCTA;
