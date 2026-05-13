const labels = {
  new: 'New',
  refurbished: 'Refurbished',
  used: 'Used'
};

export default function ConditionBadge({ condition }) {
  return <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold capitalize text-slate-700">{labels[condition] || condition}</span>;
}
