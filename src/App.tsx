import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import DrawPage from './pages/DrawPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/draw/:drawId" element={<DrawPage />} />
    </Routes>
  );
}
