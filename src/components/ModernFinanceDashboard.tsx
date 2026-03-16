type MonthlySummaryRow = {
  total_income: number;
  total_fixed_expense: number;
  total_variable_expense: number;
  total_saving: number;
  net_remaining: number;
};

type CategorySummaryRow = {
  category_name: string;
  total_amount: number;
  entry_type: "income" | "expense" | "saving";
  cashflow_group: "fixed" | "variable" | "planned" | "other";
};

type PlanActualRow = {
  category_name: string;
  planned_amount: number;
  actual_amount: number;
  variance: number;
  entry_type: "income" | "expense" | "saving";
  cashflow_group: "fixed" | "variable" | "planned" | "other";
};

type TransactionRow = {
  id: string;
  transaction_date: string;
  description: string;
  category_name: string;
  amount: number;
  entry_type: "income" | "expense" | "saving";
  review_status: "approved" | "needs_review" | "rejected";
};

type DashboardProps = {
  summary?: MonthlySummaryRow | null;
  categories?: CategorySummaryRow[];
  planActual?: PlanActualRow[];
  transactions?: TransactionRow[];
};

const fmt = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(n || 0));

function percent(part: number, whole: number) {
  if (!whole || whole <= 0) return 0;
  return (part / whole) * 100;
}

function StatCard({
  title,
  value,
  hint,
}: {
  title: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="text-sm text-slate-500">{title}</div>
      <div className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">{value}</div>
      <div className="mt-2 text-xs leading-5 text-slate-500">{hint}</div>
    </div>
  );
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-2 w-full rounded-full bg-slate-100">
      <div
        className="h-2 rounded-full bg-slate-900 transition-all"
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}

function InsightCard({
  title,
  description,
  tone,
}: {
  title: string;
  description: string;
  tone: "good" | "warn" | "neutral";
}) {
  const toneClass =
    tone === "good"
      ? "border-emerald-200 bg-emerald-50 text-emerald-900"
      : tone === "warn"
      ? "border-amber-200 bg-amber-50 text-amber-900"
      : "border-slate-200 bg-slate-50 text-slate-900";

  return (
    <div className={`rounded-2xl border p-4 ${toneClass}`}>
      <div className="font-semibold">{title}</div>
      <div className="mt-1 text-sm leading-6">{description}</div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-500">{text}</div>;
}

function MiniBars({ values }: { values: Array<{ label: string; value: number }> }) {
  const max = Math.max(1, ...values.map((v) => v.value));

  return (
    <div className="flex h-56 items-end gap-4">
      {values.map((item) => (
        <div key={item.label} className="flex flex-1 flex-col items-center gap-2">
          <div className="flex h-full w-full items-end justify-center">
            <div
              className="w-8 rounded-t-2xl bg-slate-900"
              style={{ height: `${(item.value / max) * 100}%` }}
              title={`${item.label}: ${fmt(item.value)}`}
            />
          </div>
          <div className="text-xs text-slate-500">{item.label}</div>
        </div>
      ))}
    </div>
  );
}

export default function ModernFinanceDashboard({
  summary,
  categories = [],
  planActual = [],
  transactions = [],
}: DashboardProps) {
  const variableCategories = categories
    .filter((row) => row.entry_type === "expense" && row.cashflow_group === "variable")
    .sort((a, b) => Number(b.total_amount) - Number(a.total_amount))
    .slice(0, 5);

  const fixedItems = planActual
    .filter((row) => row.cashflow_group === "fixed" || row.entry_type === "saving")
    .slice(0, 4);

  const latestTransactions = transactions.slice(0, 5);

  const savingRate = percent(Number(summary?.total_saving || 0), Number(summary?.total_income || 0));
  const variableRatio = percent(Number(summary?.total_variable_expense || 0), Number(summary?.total_income || 0));

  const largestVariable = variableCategories[0];
  const overBudgetItems = planActual.filter((row) => Number(row.variance) > 0 && row.entry_type !== "income");
  const needsReviewCount = transactions.filter((row) => row.review_status === "needs_review").length;

  const trendBars = [
    { label: "Income", value: Number(summary?.total_income || 0) },
    { label: "Fixed", value: Number(summary?.total_fixed_expense || 0) },
    { label: "Variable", value: Number(summary?.total_variable_expense || 0) },
    { label: "Saving", value: Number(summary?.total_saving || 0) },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-6 text-slate-900">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-sm font-medium text-slate-500">Dashboard Keuangan Modern</div>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">Ringkasan Bulan Ini</h1>
            <p className="mt-2 text-sm text-slate-500">
              Menggabungkan data rutin dari monthly_plans dan transaksi aktual dari Telegram.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div className="text-xs text-slate-500">Saving Rate</div>
              <div className="mt-1 text-lg font-semibold">{savingRate.toFixed(1)}%</div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div className="text-xs text-slate-500">Variable Ratio</div>
              <div className="mt-1 text-lg font-semibold">{variableRatio.toFixed(1)}%</div>
            </div>
            <div className="col-span-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 md:col-span-1">
              <div className="text-xs text-slate-500">Need Review</div>
              <div className="mt-1 text-lg font-semibold">{needsReviewCount} transaksi</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
          <StatCard
            title="Pendapatan"
            value={fmt(Number(summary?.total_income || 0))}
            hint="Pendapatan bulan ini dari item tetap dan tambahan."
          />
          <StatCard
            title="Pengeluaran Tetap"
            value={fmt(Number(summary?.total_fixed_expense || 0))}
            hint="Kos, internet, cicilan, dan biaya rutin lainnya."
          />
          <StatCard
            title="Pengeluaran Variabel"
            value={fmt(Number(summary?.total_variable_expense || 0))}
            hint="Makan, transport, belanja, hiburan, dan harian."
          />
          <StatCard
            title="Tabungan"
            value={fmt(Number(summary?.total_saving || 0))}
            hint="Setoran tabungan tetap maupun tambahan bulan ini."
          />
          <StatCard
            title="Sisa Bersih"
            value={fmt(Number(summary?.net_remaining || 0))}
            hint="Pendapatan dikurangi expense dan saving."
          />
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
            <div>
              <h2 className="text-lg font-semibold">Komposisi Arus Kas Bulan Ini</h2>
              <p className="mt-1 text-sm text-slate-500">Perbandingan income, pengeluaran tetap, variabel, dan saving.</p>
            </div>
            <div className="mt-6">
              <MiniBars values={trendBars} />
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Insight Otomatis</h2>
            <p className="mt-1 text-sm text-slate-500">Ringkasan cepat yang langsung berguna untuk pengambilan keputusan.</p>
            <div className="mt-4 space-y-3">
              <InsightCard
                title="Rasio tabungan bulan ini"
                description={`Saat ini saving rate Anda ada di ${savingRate.toFixed(1)}% dari total pendapatan.`}
                tone={savingRate >= 10 ? "good" : "warn"}
              />
              <InsightCard
                title="Pengeluaran variabel terbesar"
                description={
                  largestVariable
                    ? `${largestVariable.category_name} menjadi kategori variabel terbesar dengan nilai ${fmt(Number(largestVariable.total_amount))}.`
                    : "Belum ada data pengeluaran variabel bulan ini."
                }
                tone={largestVariable ? "neutral" : "warn"}
              />
              <InsightCard
                title="Kontrol terhadap budget"
                description={
                  overBudgetItems.length > 0
                    ? `${overBudgetItems.length} kategori sudah melewati planned amount. Perlu perhatian lebih di akhir bulan.`
                    : "Belum ada kategori utama yang melewati planned amount."
                }
                tone={overBudgetItems.length > 0 ? "warn" : "good"}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Top Pengeluaran Variabel</h2>
            <p className="mt-1 text-sm text-slate-500">Kategori yang paling banyak menyerap cashflow harian.</p>
            <div className="mt-5 space-y-4">
              {variableCategories.length === 0 ? (
                <EmptyState text="Belum ada data pengeluaran variabel untuk ditampilkan." />
              ) : (
                variableCategories.map((row) => (
                  <div key={row.category_name} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <div className="font-medium text-slate-700">{row.category_name}</div>
                      <div className="text-slate-500">{fmt(Number(row.total_amount))}</div>
                    </div>
                    <ProgressBar value={percent(Number(row.total_amount), Number(summary?.total_variable_expense || 0))} />
                    <div className="text-xs text-slate-400">
                      {percent(Number(row.total_amount), Number(summary?.total_variable_expense || 0)).toFixed(1)}% dari variable expense
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Tagihan & Setoran Prioritas</h2>
            <p className="mt-1 text-sm text-slate-500">Item tetap yang perlu dipantau secara rutin.</p>
            <div className="mt-5 space-y-3">
              {fixedItems.length === 0 ? (
                <EmptyState text="Belum ada data plan vs actual untuk item rutin." />
              ) : (
                fixedItems.map((item) => (
                  <div key={`${item.category_name}-${item.entry_type}`} className="rounded-2xl border border-slate-200 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="font-medium">{item.category_name}</div>
                        <div className="mt-1 text-sm text-slate-500">
                          Planned {fmt(Number(item.planned_amount))} • Actual {fmt(Number(item.actual_amount))}
                        </div>
                      </div>
                      <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                        {Number(item.variance) > 0 ? "over" : Number(item.variance) < 0 ? "under" : "on track"}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm xl:col-span-3">
            <h2 className="text-lg font-semibold">Plan vs Actual</h2>
            <p className="mt-1 text-sm text-slate-500">Bandingkan target dan realisasi pada kategori utama.</p>
            <div className="mt-5 overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="pb-3 text-left font-medium">Kategori</th>
                    <th className="pb-3 text-left font-medium">Planned</th>
                    <th className="pb-3 text-left font-medium">Actual</th>
                    <th className="pb-3 text-left font-medium">Variance</th>
                    <th className="pb-3 text-left font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {planActual.length === 0 ? (
                    <tr>
                      <td className="py-6 text-slate-500" colSpan={5}>
                        Belum ada data plan vs actual.
                      </td>
                    </tr>
                  ) : (
                    planActual.slice(0, 8).map((row, idx) => (
                      <tr key={`${row.category_name}-${idx}`} className="border-b border-slate-100 last:border-0">
                        <td className="py-4 font-medium">{row.category_name}</td>
                        <td className="py-4 text-slate-600">{fmt(Number(row.planned_amount))}</td>
                        <td className="py-4 text-slate-600">{fmt(Number(row.actual_amount))}</td>
                        <td className="py-4 text-slate-600">{fmt(Number(row.variance))}</td>
                        <td className="py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                              Number(row.variance) > 0
                                ? "bg-amber-100 text-amber-800"
                                : Number(row.variance) < 0
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {Number(row.variance) > 0 ? "over" : Number(row.variance) < 0 ? "under" : "on track"}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
            <h2 className="text-lg font-semibold">Transaksi Terbaru</h2>
            <p className="mt-1 text-sm text-slate-500">Data terbaru dari Telegram dan status review AI.</p>
            <div className="mt-5 space-y-3">
              {latestTransactions.length === 0 ? (
                <EmptyState text="Belum ada transaksi terbaru untuk ditampilkan." />
              ) : (
                latestTransactions.map((row) => (
                  <div key={row.id} className="rounded-2xl border border-slate-200 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="font-medium">{row.description}</div>
                        <div className="mt-1 text-sm text-slate-500">
                          {row.category_name} • {new Date(row.transaction_date).toLocaleString("id-ID")}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{fmt(Number(row.amount))}</div>
                        <div className="mt-1 text-xs uppercase tracking-wide text-slate-400">{row.entry_type}</div>
                      </div>
                    </div>
                    <div className="mt-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          row.review_status === "needs_review"
                            ? "bg-amber-100 text-amber-800"
                            : row.review_status === "approved"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {row.review_status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
