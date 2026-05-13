const labels = {
  new: 'New',
  refurbished: 'Refurbished',
  used: 'Used'
};

export default function ConditionBadge({ condition }) {
  return <span className="inline-flex rounded-full bg-white px-2.5 py-1 text-xs font-bold capitalize text-slate-700 ring-1 ring-slate-200">{labels[condition] || condition}</span>;
}
