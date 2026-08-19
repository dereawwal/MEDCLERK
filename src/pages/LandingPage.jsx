import { useState } from 'react';
import HeroSection from '../components/landing/HeroSection';
import QuickAccess from '../components/landing/QuickAccess';
import HowItWorks from '../components/landing/HowItWorks';
import BackToTop from '../components/layout/BackToTop';

const LandingPage = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="landing-page">
      <HeroSection 
        searchTerm={searchTerm} 
        setSearchTerm={setSearchTerm} 
      />
      
      <QuickAccess searchTerm={searchTerm} />
      
      <HowItWorks />
      
      <BackToTop />
    </div>
  );
};

export default LandingPage;
