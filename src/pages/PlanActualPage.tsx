function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

export default function PlanActualPage({ rows }: { rows: any[] }) {
  return (
    <div className="overflow-x-auto rounded-2xl border">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="p-3 text-left">Bulan</th>
            <th className="p-3 text-left">Tipe</th>
            <th className="p-3 text-left">Group</th>
            <th className="p-3 text-left">Kategori</th>
            <th className="p-3 text-left">Planned</th>
            <th className="p-3 text-left">Actual</th>
            <th className="p-3 text-left">Variance</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={`${row.profile_id}-${row.effective_month}-${row.category_name}-${idx}`} className="border-t">
              <td className="p-3">{row.effective_month}</td>
              <td className="p-3">{row.entry_type}</td>
              <td className="p-3">{row.cashflow_group}</td>
              <td className="p-3">{row.category_name}</td>
              <td className="p-3">{formatRupiah(row.planned_amount)}</td>
              <td className="p-3">{formatRupiah(row.actual_amount)}</td>
              <td className="p-3">{formatRupiah(row.variance)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}