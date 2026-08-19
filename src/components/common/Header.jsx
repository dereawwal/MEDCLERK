import { Stethoscope } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const navigate = useNavigate();

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo-group" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <div className="logo-icon-wrapper">
            <Stethoscope className="logo-icon" size={24} />
          </div>
          <span className="logo-text">MedClerk</span>
        </div>
        
        <nav className="nav-links">
          <button className="nav-link" onClick={() => navigate('/about')}>About</button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
