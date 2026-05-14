const labels = {
  boxpack: ['Box Pack', 'bg-violet-50 text-violet-700 ring-violet-200'],
  kit: ['Kit', 'bg-orange-50 text-orange-700 ring-orange-200']
};

export default function PackageBadge({ type }) {
  const [label, style] = labels[type] || labels.kit;
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${style}`}>{label}</span>;
}
