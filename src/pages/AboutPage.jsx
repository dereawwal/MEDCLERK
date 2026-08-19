import { Stethoscope, FileSpreadsheet, Compass, ShieldAlert, CheckCircle } from 'lucide-react';
import './AboutPage.css';

const AboutPage = () => {
  return (
    <article className="about-page">
      <header className="about-hero">
        <div className="about-hero-content">
          <div className="about-hero-icon-wrapper">
            <Stethoscope className="about-hero-icon" size={32} />
          </div>
          <h1 className="about-title">About MedClerk</h1>
          <p className="about-subtitle">Your clinical companion on the ward</p>
        </div>
      </header>

      <section className="about-content">
        <div className="about-intro-section">
          <p className="about-intro-text">
            MedClerk is a platform created to help medical students stay organised and keep track of their clinical clerkships. Clinical rotations can get busy very quickly. Students move between departments, meet different requirements, see many patients, and still have to keep up with ward responsibilities. MedClerk brings all of that into one place and makes it easier to manage.
          </p>
        </div>

        <div className="about-grid">
          
          <div className="about-card">
            <div className="about-card-header">
              <div className="about-card-icon-container teal">
                <FileSpreadsheet size={20} />
              </div>
              <h2 className="about-card-title">Ditch the Notebooks</h2>
            </div>
            <p className="about-card-text">
              Students can use MedClerk to record patient encounters, procedures, and clinical cases as they happen. Rather than depending on notebooks, spreadsheets, or paper logbooks, they can keep an organised record of their clinical experience on their phone or laptop. They can also follow their progress during each rotation and see what they have completed and what still needs attention.
            </p>
          </div>

          <div className="about-card">
            <div className="about-card-header">
              <div className="about-card-icon-container blue">
                <Compass size={20} />
              </div>
              <h2 className="about-card-title">Clearer Training Overview</h2>
            </div>
            <p className="about-card-text">
              MedClerk also gives students a clearer view of their clinical training as a whole. Having an accurate record of cases and experiences can make it easier to prepare for assessments, reflect on progress, and identify areas where more exposure may be needed.
            </p>
          </div>

          <div className="about-card">
            <div className="about-card-header">
              <div className="about-card-icon-container red">
                <ShieldAlert size={20} />
              </div>
              <h2 className="about-card-title">Built for Ward Realities</h2>
            </div>
            <p className="about-card-text">
              The platform is built around the reality of life on the wards, where time is limited and students need something simple and practical. MedClerk is not meant to add another task to an already busy schedule. It is meant to make an important part of clinical training easier to organise.
            </p>
          </div>

        </div>

        <div className="about-footer-card">
          <div className="about-footer-icon-wrapper">
            <CheckCircle className="about-footer-icon" size={24} />
          </div>
          <h3 className="about-footer-title">Reliable Record of your Journey</h3>
          <p className="about-footer-text">
            At its core, MedClerk helps medical students keep a reliable record of their clinical journey and stay on top of their clerkship requirements as they move through each stage of training.
          </p>
        </div>
      </section>
    </article>
  );
};

export default AboutPage;
