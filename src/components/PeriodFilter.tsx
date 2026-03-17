type Props = {
  years: number[];
  selectedYear: number | null;
  selectedMonth: number | null;
  onYearChange: (year: number | null) => void;
  onMonthChange: (month: number | null) => void;
};

const MONTH_OPTIONS = [
  { value: 1, label: "Januari" },
  { value: 2, label: "Februari" },
  { value: 3, label: "Maret" },
  { value: 4, label: "April" },
  { value: 5, label: "Mei" },
  { value: 6, label: "Juni" },
  { value: 7, label: "Juli" },
  { value: 8, label: "Agustus" },
  { value: 9, label: "September" },
  { value: 10, label: "Oktober" },
  { value: 11, label: "November" },
  { value: 12, label: "Desember" },
];

export default function PeriodFilter({
  years,
  selectedYear,
  selectedMonth,
  onYearChange,
  onMonthChange,
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border bg-white p-4">
      <div className="text-sm font-medium text-slate-600">Filter Periode</div>

      <select
        className="rounded-lg border px-3 py-2 text-sm"
        value={selectedYear ?? ""}
        onChange={(e) => {
          const value = e.target.value;
          onYearChange(value ? Number(value) : null);
        }}
      >
        <option value="">Semua Tahun</option>
        {years.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>

      <select
        className="rounded-lg border px-3 py-2 text-sm"
        value={selectedMonth ?? ""}
        onChange={(e) => {
          const value = e.target.value;
          onMonthChange(value ? Number(value) : null);
        }}
      >
        <option value="">Semua Bulan</option>
        {MONTH_OPTIONS.map((month) => (
          <option key={month.value} value={month.value}>
            {month.label}
          </option>
        ))}
      </select>

      {(selectedYear || selectedMonth) && (
        <button
          className="rounded-lg border px-3 py-2 text-sm hover:bg-slate-50"
          onClick={() => {
            onYearChange(null);
            onMonthChange(null);
          }}
        >
          Reset Filter
        </button>
      )}
    </div>
  );
}