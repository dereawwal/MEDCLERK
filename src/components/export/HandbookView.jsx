import React from 'react';
import { Clock, Lightbulb, CheckCircle, AlertTriangle, ShieldAlert, GraduationCap } from 'lucide-react';
import './HandbookView.css';

const HandbookView = React.forwardRef(({ presentations = [], cachedGuides = [] }, ref) => {
  // Synchronize: Only render diseases with actual clinical data saved
  const validGuidesToRender = (presentations || []).map(p => {
    if (!p || !p.name) return null;
    const guide = (cachedGuides || []).find(g => 
      (g?.conditionName || '').toLowerCase() === (p.name || '').toLowerCase() ||
      (g?.conditionName?.length > 5 && (p.name || '').toLowerCase().includes(g.conditionName.toLowerCase()))
    );
    return guide ? { presentation: p, guide } : null;
  }).filter(Boolean);

  // Uniqueness: No repeating diseases
  const uniqueGuides = [];
  const seenIds = new Set();
  validGuidesToRender.forEach(item => {
    if (!item?.guide?.conditionName) return;
    const uniqueKey = item.guide.conditionName.toLowerCase();
    if (!seenIds.has(uniqueKey)) {
      uniqueGuides.push(item);
      seenIds.add(uniqueKey);
    }
  });

  return (
    <div ref={ref} className="handbook-print-root">
      
      {/* PAGE 1: COVER PAGE */}
      <div className="handbook-page cover-page">
        <div className="print-header">
          <span>MedClerk Handbook <span className="sep">|</span> <span className="muted">Clinical Reference</span></span>
        </div>
        
        <div className="cover-box">
          <h1 className="cover-title">MedClerk</h1>
          <div className="cover-divider"></div>
          <h2 className="cover-subtitle">Clinical Clerking Guide</h2>
          <p className="cover-tagline">Integrated bedside resources for medical rotations.</p>
        </div>

        <div className="cover-bottom-info">
          <div className="info-item">
            <ShieldAlert size={18} />
            <span>Case-based Red Flags</span>
          </div>
          <div className="info-item">
            <GraduationCap size={18} />
            <span>OSCE Examiner Tips</span>
          </div>
        </div>

        <div className="print-footer">
          <span>medclerk.io | Page 1</span>
        </div>
      </div>

      {/* PAGE 3: HANDBOOK INDEX */}
      <div className="handbook-page toc-page">
        <div className="print-header">
          <span>MedClerk Handbook <span className="sep">|</span> <span className="muted">Clinical Reference</span></span>
        </div>
        
        <div className="toc-section">
          <h1 className="toc-main-title">Handbook Index</h1>
          <p className="toc-subtitle">Unique conditions saved in your current clinical session.</p>
          
          <div className="toc-grid">
            <div className="toc-grid-header">
              <span>REF #</span>
              <span>CONDITION</span>
              <span className="toc-meta-col">SYSTEM</span>
              <span className="toc-page-col">PAGE</span>
            </div>
            {uniqueGuides.map((item, i) => (
              <div key={item?.presentation?.id || i} className="toc-grid-row">
                <span className="toc-num">{String(i + 1).padStart(2, '0')}</span>
                <span className="toc-name">{item?.guide?.conditionName || 'Unknown Condition'}</span>
                <span className="toc-system">{item?.guide?.specialty || item?.presentation?.system || 'Medicine'}</span>
                <span className="toc-page-col">{i + 4}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="print-footer">
          <span>medclerk.io | Page 3</span>
        </div>
      </div>

      {/* DISEASE PAGES (Starting at Page 4) */}
      {uniqueGuides.map((item, index) => {
        const { guide } = item;
        if (!guide) return null;
        return (
          <div key={item?.presentation?.id || index} className="handbook-page disease-page">
            <div className="print-header">
              <span>MedClerk Handbook <span className="sep">|</span> <span className="muted">Clinical Guide</span></span>
            </div>

            <div className="print-title-bar">
              <h1 className="guide-name">{guide.conditionName || 'Condition'}</h1>
              <span className="guide-specialty">{guide.specialty || item?.presentation?.system || 'General'}</span>
            </div>

            <div className="guide-body">
              <div className="print-section-block">
                <h2 className="num-heading">1. History Framework</h2>
                <h3 className="label-teal">PRESENTING COMPLAINT & HPC</h3>
                <ul className="p-list">
                  {(guide.history || []).map((h, i) => <li key={i}>{h}</li>)}
                </ul>
              </div>

              <div className="print-section-block">
                <h2 className="num-heading">2. Physical Examination</h2>
                <ul className="p-list">{(guide.exam || []).map((e, i) => <li key={i}>{e}</li>)}</ul>
              </div>

              <div className="print-section-block">
                <h2 className="num-heading">3. Clinical Investigations</h2>
                <table className="print-table">
                  <tbody>
                    <tr><td className="t-label">Bedside</td><td>{(guide.investigations?.bedside || []).join(', ') || 'Vitals, ECG'}</td></tr>
                    <tr><td className="t-label">Bloods</td><td>{(guide.investigations?.blood || guide.investigations?.bloods || []).join(', ') || 'FBC, U&E'}</td></tr>
                    <tr><td className="t-label">Imaging</td><td>{(guide.investigations?.imaging || []).join(', ') || 'CXR'}</td></tr>
                  </tbody>
                </table>
              </div>

              <div className="print-red-box page-break-avoid">
                <h3 className="red-box-title">!!! CRITICAL RED FLAGS</h3>
                <ul className="p-list">{(guide.redFlags || []).map((rf, i) => <li key={i}>{rf}</li>)}</ul>
              </div>

              <div className="print-section-block page-break-avoid">
                <h2 className="num-heading">4. Differentials & Logic</h2>
                <ul className="p-list">
                  {(guide.differentials || []).slice(0, 5).map((d, i) => (
                    <li key={i}><strong>{d?.name || d}</strong>{d?.rationale && `: ${d.rationale}`}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="print-footer-simple">
              <span>medclerk.io | Guide {index + 1} | Page {index + 4}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
});

export default HandbookView;
