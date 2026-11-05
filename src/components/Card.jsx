export default function Card({ highlight = false, className = "", children }) {
  return (
    <div className={`${highlight ? "card-highlight" : "card-glass"} ${className}`}>
      {children}
    </div>
  );
}
