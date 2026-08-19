import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import ConditionPage from './pages/ConditionPage';
import MasterGuidePage from './pages/MasterGuidePage';
import AboutPage from './pages/AboutPage';
import Header from './components/common/Header';
import './App.css';

function App() {
  return (
    <div className="app-container">
      <Header />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/condition/:query" element={<ConditionPage />} />
          <Route path="/master-guide" element={<MasterGuidePage />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
      </main>
    </div>
  );
}


export default App;
