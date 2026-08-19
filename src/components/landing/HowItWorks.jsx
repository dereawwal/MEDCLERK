import { useNavigate } from 'react-router-dom';
import { Search, FileText } from 'lucide-react';
import './HowItWorks.css';

const HowItWorks = () => {
  const navigate = useNavigate();
  const steps = [
    {
      icon: <Search size={24} />,
      title: "Search a condition",
      description: "Quickly find any disease or symptom using our AI-powered search.",
      action: () => {
        const input = document.getElementById('main-search');
        if (input) {
          input.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setTimeout(() => input.focus(), 300);
        }
      }
    },
    {
      icon: <FileText size={24} />,
      title: "Get full clerking guide",
      description: "Master the structure of History, Exams, and high-yield Clinical Skills.",
      action: () => navigate('/master-guide')
    }
  ];

  return (
    <section className="how-it-works">
      <div className="how-it-works-container">
        <h2 className="how-title">How It Works</h2>
        <div className="steps-container">
          {steps.map((step, index) => (
            <div 
              key={index} 
              className={`step-card ${step.action ? 'interactive-step' : ''}`}
              onClick={step.action || undefined}
            >
              <div className="step-icon">
                {step.icon}
              </div>
              <h3 className="step-title">{step.title}</h3>
              <p className="step-description">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
