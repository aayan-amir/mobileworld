const styles = {
  pta: ['PTA Approved', 'bg-green-100 text-green-800'],
  fu: ['Factory Unlocked', 'bg-blue-100 text-blue-800'],
  boxpack: ['Box Pack', 'bg-navy text-gold'],
  jv: ['Non-PTA (JV)', 'bg-amber-100 text-amber-800'],
  'non-pta': ['Non-PTA', 'bg-amber-100 text-amber-800'],
  cpid: ['CPID', 'bg-orange-100 text-orange-800'],
  mdm: ['MDM Locked', 'bg-red-100 text-red-800']
};

export default function ApprovalBadge({ approval }) {
  const entry = styles[approval];
  if (!entry) return null;
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${entry[1]}`}>{entry[0]}</span>;
}
