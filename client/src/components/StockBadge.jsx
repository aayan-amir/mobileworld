export default function StockBadge({ stock }) {
  if (stock <= 0) return <span className="font-semibold text-danger">Out of Stock</span>;
  if (stock <= 3) return <span className="font-semibold text-warning">Only {stock} left</span>;
  return <span className="font-semibold text-emerald-600">{stock} in stock</span>;
}
