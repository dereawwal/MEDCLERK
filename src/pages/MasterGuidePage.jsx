import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import { ArrowLeft, Lightbulb, Activity, FileDown, BookOpen, CheckCircle2 } from 'lucide-react';
import HandbookView from '../components/export/HandbookView';
import { getWardPresentations, getAllCachedGuides } from '../services/storageService';
import './MasterGuidePage.css';

const MasterGuidePage = () => {
  const navigate = useNavigate();
  const handbookRef = useRef();

  // Read-only — disease names from the dashboard
  const presentations = getWardPresentations();
  const cachedGuides = getAllCachedGuides();

  const handlePrint = useReactToPrint({
    contentRef: handbookRef,
    documentTitle: 'MedClerk_Full_Clerking_Guide',
  });

  return (
    <div className="master-guide-page">

      {/* Back Button */}
      <div className="mgp-header">
        <button className="mgp-back-btn" onClick={() => navigate('/')}>
          <ArrowLeft size={18} />
          <span>Back to Dashboard</span>
        </button>
      </div>

      {/* Page Title */}
      <div className="mgp-title-block">
        <BookOpen size={28} className="mgp-title-icon" />
        <h1 className="mgp-main-title">Get Full Clerking Guide</h1>
        <p className="mgp-main-subtitle">
          MedClerk is designed for use at the bedside, in tutorials, and during OSCE preparation.
          Each condition is structured identically so you always know where to look.
        </p>
      </div>

      {/* ── SECTION 1: HOW TO USE THIS GUIDE ── */}
      <section className="mgp-section">
        <h2 className="mgp-section-title">How to Use This Guide</h2>

        {/* Guide Structure */}
        <div className="mgp-card">
          <h3 className="mgp-card-heading teal">Guide Structure — Every Condition Follows This Format:</h3>
          <ul className="mgp-structure-list">
            <li>
              <span className="mgp-item-title">History Taking</span>
              <ul className="mgp-sub-list">
                <li>Presenting Complaint (PC) · History of Presenting Complaint (HPC)</li>
                <li>Past Medical History (PMH) · Drug History (DH) · Family History (FH) · Social History (SH)</li>
              </ul>
            </li>
            <li>
              <span className="mgp-item-title">Examination</span>
              <ul className="mgp-sub-list">
                <li>General Inspection · Specific Findings relevant to the condition</li>
              </ul>
            </li>
            <li>
              <span className="mgp-item-title">Investigations</span>
              <ul className="mgp-sub-list">
                <li>Bedside · Bloods · Imaging · Special Tests</li>
              </ul>
            </li>
            <li>
              <span className="mgp-item-title">Differentials</span>
              <ul className="mgp-sub-list">
                <li>Top 5 conditions to keep in mind for this presentation</li>
              </ul>
            </li>
            <li>
              <span className="mgp-item-title red">Red Flags</span>
              <ul className="mgp-sub-list">
                <li>Things you absolutely must not miss — highlighted in red throughout</li>
              </ul>
            </li>
            <li>
              <span className="mgp-item-title teal">OSCE Tips &amp; Examiner Questions</span>
              <ul className="mgp-sub-list">
                <li>Key points examiners look for and common questions to prepare for</li>
              </ul>
            </li>
          </ul>
        </div>

        {/* On the Ward Callout */}
        <div className="mgp-callout ward-callout">
          <div className="mgp-callout-header">
            <Activity size={18} className="callout-icon blue" />
            <h4 className="callout-title blue">On the Ward — Quick Reference</h4>
          </div>
          <ul className="mgp-callout-list">
            <li>Read the Presenting Complaint and HPC section before seeing the patient</li>
            <li>Use the checklist to ensure you haven't missed any important questions</li>
            <li>Review Red Flags first if the patient looks unwell</li>
            <li>Check Investigations before requesting tests — justify each one</li>
          </ul>
        </div>

        {/* For OSCE Preparation Callout */}
        <div className="mgp-callout osce-callout">
          <div className="mgp-callout-header">
            <Lightbulb size={18} className="callout-icon green" />
            <h4 className="callout-title green">For OSCE Preparation</h4>
          </div>
          <ul className="mgp-callout-list">
            <li>Study the OSCE Tips section — these reflect what examiners prioritise</li>
            <li>Practise answering the Examiner Questions out loud</li>
            <li>Learn to classify severity (e.g., mild/moderate/severe asthma) — this shows clinical reasoning</li>
            <li>Know your immediate management steps for each emergency condition</li>
          </ul>
        </div>
      </section>

      {/* ── SECTION 2: GET A FULL GUIDE IN PDF ── */}
      <section className="mgp-section">
        <h2 className="mgp-section-title">Get a Full Guide in PDF</h2>

        {presentations.length === 0 ? (
          <div className="mgp-empty-state">
            <BookOpen size={36} className="empty-icon" />
            <h3 className="empty-title">No conditions saved yet</h3>
            <p className="empty-text">
              Search and explore conditions on the dashboard first. Their names will appear here
              and be compiled into your personalised PDF handbook.
            </p>
            <button className="mgp-go-dashboard-btn" onClick={() => navigate('/')}>
              Go to Dashboard
            </button>
          </div>
        ) : (
          <div className="mgp-pdf-section">
            <p className="mgp-pdf-intro">
              The PDF below compiles a full structured guide for every condition you have explored.
              Each entry follows the standard clerking format shown above.
            </p>

            {/* Disease name list */}
            <div className="mgp-disease-list-card">
              <h3 className="mgp-disease-list-title">Conditions included in your guide:</h3>
              <ul className="mgp-disease-list">
                {presentations.map((p, i) => (
                  <li key={p.id || i} className="mgp-disease-item">
                    <CheckCircle2 size={16} className="disease-check-icon" />
                    <span>{p.name}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Download Button */}
            <button className="mgp-download-btn" onClick={handlePrint}>
              <FileDown size={20} />
              <span>Download Full PDF Handbook</span>
            </button>
          </div>
        )}
      </section>

      {/* Hidden PDF View for print — separate layout from the main page */}
      <HandbookView
        ref={handbookRef}
        presentations={presentations}
        cachedGuides={cachedGuides}
      />
    </div>
  );
};

export default MasterGuidePage;
