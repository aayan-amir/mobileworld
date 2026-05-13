export default function UsedPhoneWarning({ condition, approval }) {
  const grey = ['jv', 'non-pta', 'cpid', 'mdm'].includes(approval);
  return (
    <div className="space-y-3">
      {condition === 'used' && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-900">
          We recommend inspecting used phones in person at our shop before purchasing online.
        </div>
      )}
      {grey && (
        <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 text-sm font-semibold text-orange-900">
          This phone is not PTA approved and may be blocked by Pakistani telecom authorities. Purchase at your own risk.
        </div>
      )}
    </div>
  );
}
