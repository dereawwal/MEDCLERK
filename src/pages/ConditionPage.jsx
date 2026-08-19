import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Microscope } from 'lucide-react';
import { generateClerkingGuide } from '../services/aiService';
import { getCachedGuide, saveConditionGuide } from '../services/storageService';
import ChecklistSection from '../components/guide/ChecklistSection';
import { RedFlagsCard, OSCETipsCard } from '../components/guide/SpecialCards';
import './ConditionPage.css';

const ConditionPage = () => {
  const { query } = useParams();
  const navigate = useNavigate();
  const [guide, setGuide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGuide = async () => {
      setLoading(true);
      setError(null);

      const cached = getCachedGuide(query);
      if (cached) {
        setGuide(cached);
        setLoading(false);
        return;
      }

      const result = await generateClerkingGuide(query);
      if (result && result.conditionName) {
        setGuide(result);
        saveConditionGuide(result);
      } else {
        setError('Could not generate a clinical guide for this condition. Please try again.');
      }
      setLoading(false);
    };

    if (query) {
      fetchGuide();
    }
  }, [query]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <Loader2 className="loading-spinner" size={40} />
          <h2 className="loading-title">Synthesizing Clinical Guide</h2>
        </div>
      </div>
    );
  }

  if (error || !guide) {
    return (
      <div className="error-container">
        <h2>Something went wrong</h2>
        <p>{error || 'No guide data available.'}</p>
        <button className="back-btn" onClick={() => navigate('/')}>
          <ArrowLeft size={18} /> Back to Dashboard
        </button>
      </div>
    );
  }

  // Build investigations list for checklist display
  const investigationsList = [
    ...(guide.investigations?.bedside || []).map(i => `[Bedside] ${i}`),
    ...(guide.investigations?.bloods || guide.investigations?.blood || []).map(i => `[Bloods] ${i}`),
    ...(guide.investigations?.imaging || []).map(i => `[Imaging] ${i}`),
    ...(guide.investigations?.specialTests || []).map(i => `[Special] ${i}`),
  ];

  // Handle investigations being a flat array (legacy)
  const invList = investigationsList.length > 0
    ? investigationsList
    : Array.isArray(guide.investigations) ? guide.investigations : ['See clinical guidelines'];

  // OSCE tips
  const osceTips = guide.osceInfo?.keyTips || guide.osceTips || [];
  const examinerQ = guide.osceInfo?.examinerQuestions || [];

  // Differentials as strings for the checklist
  const differentaislList = (guide.differentials || []).map(d =>
    typeof d === 'string' ? d : `${d.name}${d.rationale ? ` — ${d.rationale}` : ''}`
  );

  return (
    <div className="condition-page">
      {/* Header */}
      <div className="condition-header">
        <button className="back-btn" onClick={() => navigate('/')}>
          <ArrowLeft size={18} />
          <span>Dashboard</span>
        </button>
        <div className="condition-meta">
          <h1 className="condition-title">{guide.conditionName}</h1>
          <span className="condition-badge">{guide.specialty || guide.system || 'General Medicine'}</span>
        </div>
      </div>

      {/* Content */}
      <div className="condition-content">
        <ChecklistSection
          title="History Taking"
          items={guide.history || []}
          conditionName={guide.conditionName}
        />

        <ChecklistSection
          title="Physical Examination"
          items={guide.exam || []}
          conditionName={guide.conditionName}
        />

        <div className="investigations-header">
          <Microscope size={20} className="inv-icon" />
          <h3>Investigations</h3>
        </div>
        <ChecklistSection
          title="Investigations"
          items={invList}
          conditionName={guide.conditionName}
        />

        <ChecklistSection
          title="Differentials"
          items={differentaislList}
          conditionName={guide.conditionName}
        />

        <RedFlagsCard flags={guide.redFlags || []} />

        <OSCETipsCard tips={[...osceTips, ...examinerQ]} />
      </div>
    </div>
  );
};

export default ConditionPage;
