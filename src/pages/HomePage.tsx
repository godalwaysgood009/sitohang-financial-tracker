type SummaryRow = {
  total_income: number;
  total_fixed_expense: number;
  total_variable_expense: number;
  total_saving: number;
  net_remaining: number;
};

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

export default function HomePage({ row }: { row?: SummaryRow }) {
  if (!row) {
    return <div className="rounded-xl border p-4">Belum ada data summary.</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      <div className="rounded-2xl border p-4">
        <div className="text-sm text-gray-500">Pendapatan</div>
        <div className="text-xl font-semibold">{formatRupiah(row.total_income)}</div>
      </div>

      <div className="rounded-2xl border p-4">
        <div className="text-sm text-gray-500">Pengeluaran Tetap</div>
        <div className="text-xl font-semibold">{formatRupiah(row.total_fixed_expense)}</div>
      </div>

      <div className="rounded-2xl border p-4">
        <div className="text-sm text-gray-500">Pengeluaran Variabel</div>
        <div className="text-xl font-semibold">{formatRupiah(row.total_variable_expense)}</div>
      </div>

      <div className="rounded-2xl border p-4">
        <div className="text-sm text-gray-500">Tabungan</div>
        <div className="text-xl font-semibold">{formatRupiah(row.total_saving)}</div>
      </div>

      <div className="rounded-2xl border p-4">
        <div className="text-sm text-gray-500">Sisa Bersih</div>
        <div className="text-xl font-semibold">{formatRupiah(row.net_remaining)}</div>
      </div>
    </div>
  );
}