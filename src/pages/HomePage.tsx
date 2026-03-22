import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DrawingCard from '../components/DrawingCard';
import './HomePage.css';

interface Drawing {
  id: string;
  title: string;
  createdAt: string;
  svgContent: string;
}

export default function HomePage() {
  const navigate = useNavigate();
  const [drawings, setDrawings] = useState<Drawing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/drawings')
      .then(res => res.json())
      .then(data => {
        setDrawings(data.drawings || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load drawings:', err);
        setLoading(false);
      });
  }, []);

  const handleCreate = async () => {
    const res = await fetch('/api/drawings', { method: 'POST' });
    const drawing = await res.json();
    navigate(`/draw/${drawing.id}`);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await fetch(`/api/drawings/${id}`, { method: 'DELETE' });
    setDrawings(prev => prev.filter(d => d.id !== id));
  };

  return (
    <div className="home-page">
      <div className="home-header">
        <h1>SVG Artist</h1>
        <button className="create-button" onClick={handleCreate}>
          + Create New Drawing
        </button>
      </div>

      {loading ? (
        <p className="home-loading">Loading...</p>
      ) : drawings.length === 0 ? (
        <p className="home-empty">No drawings yet. Create your first one!</p>
      ) : (
        <div className="drawings-grid">
          {drawings
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .map(drawing => (
              <DrawingCard
                key={drawing.id}
                drawing={drawing}
                onClick={() => navigate(`/draw/${drawing.id}`)}
                onDelete={(e) => handleDelete(e, drawing.id)}
              />
            ))}
        </div>
      )}
    </div>
  );
}
