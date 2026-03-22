import './DrawingCard.css';

interface Drawing {
  id: string;
  title: string;
  createdAt: string;
  svgContent: string;
}

interface DrawingCardProps {
  drawing: Drawing;
  onClick: () => void;
  onDelete: (e: React.MouseEvent) => void;
}

export default function DrawingCard({ drawing, onClick, onDelete }: DrawingCardProps) {
  return (
    <div className="drawing-card" data-id={drawing.id} onClick={onClick}>
      <div
        className="card-thumbnail"
        dangerouslySetInnerHTML={{ __html: drawing.svgContent }}
      />
      <div className="card-info">
        <span className="card-title">{drawing.title}</span>
        <button
          className="delete-button"
          onClick={onDelete}
          title="Delete drawing"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
