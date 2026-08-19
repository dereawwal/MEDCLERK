import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import './HeroSection.css';

const HeroSection = ({ searchTerm, setSearchTerm }) => {
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/condition/${encodeURIComponent(searchTerm)}`);
    }
  };

  return (
    <section className="hero">
      <div className="hero-content">
        <h1 
          className="hero-title" 
          onClick={() => window.location.href = '/'}
          title="Refresh App"
        >
          MedClerk
        </h1>
        <p className="hero-subtitle">Your clinical companion on the ward</p>

        
        <form className="search-container" onSubmit={handleSearch}>
          <div className="search-input-wrapper">
            <Search className="search-icon" size={20} />
            <input 
              id="main-search"
              type="text" 
              className="search-input" 
              placeholder="Search any condition or symptom..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </form>
      </div>
    </section>
  );
};

export default HeroSection;
