function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

export default function TransactionsPage({ rows }: { rows: any[] }) {
  return (
    <div className="overflow-x-auto rounded-2xl border">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="p-3 text-left">Tanggal</th>
            <th className="p-3 text-left">Tipe</th>
            <th className="p-3 text-left">Group</th>
            <th className="p-3 text-left">Kategori</th>
            <th className="p-3 text-left">Deskripsi</th>
            <th className="p-3 text-left">Nominal</th>
            <th className="p-3 text-left">Input</th>
            <th className="p-3 text-left">Review</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-t">
              <td className="p-3">{new Date(row.transaction_date).toLocaleString("id-ID")}</td>
              <td className="p-3">{row.entry_type}</td>
              <td className="p-3">{row.cashflow_group}</td>
              <td className="p-3">{row.category_name}</td>
              <td className="p-3">{row.description}</td>
              <td className="p-3">{formatRupiah(row.amount)}</td>
              <td className="p-3">{row.input_mode}</td>
              <td className="p-3">{row.review_status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}