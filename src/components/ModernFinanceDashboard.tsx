type MonthlySummaryRow = {
  month_jkt?: string;
  total_income: number;
  total_fixed_expense: number;
  total_variable_expense: number;
  total_saving: number;
  net_remaining: number;
};

type CategorySummaryRow = {
  month_jkt?: string;
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
  selectedYear?: number | null;
  selectedMonth?: number | null;
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

function getVarianceStatus(variance: number) {
  if (Number(variance) > 0) return "over";
  if (Number(variance) < 0) return "under";
  return "on track";
}

function getVarianceBadgeClass(variance: number) {
  if (Number(variance) > 0) return "bg-amber-100 text-amber-800";
  if (Number(variance) < 0) return "bg-emerald-100 text-emerald-800";
  return "bg-slate-100 text-slate-700";
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
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-500">
      {text}
    </div>
  );
}

function MiniBars({ values }: { values: Array<{ label: string; value: number }> }) {
  const normalizedValues = values.map((v) => ({
    ...v,
    value: Number(v.value || 0),
  }));

  const max = Math.max(1, ...normalizedValues.map((v) => v.value));

  return (
    <div className="grid h-64 grid-cols-4 gap-4">
      {normalizedValues.map((item) => (
        <div key={item.label} className="flex h-full flex-col items-center justify-end gap-2">
          <div className="text-xs font-medium text-slate-600 text-center">{fmt(item.value)}</div>
          <div className="flex h-44 w-full items-end justify-center rounded-2xl bg-slate-50">
            <div
              className="w-10 rounded-t-2xl bg-slate-900 transition-all"
              style={{ height: `${Math.max(6, (item.value / max) * 100)}%` }}
              title={`${item.label}: ${fmt(item.value)}`}
            />
          </div>
          <div className="text-xs text-slate-500 text-center">{item.label}</div>
        </div>
      ))}
    </div>
  );
}

function sumByFilter(
  rows: CategorySummaryRow[],
  filter: (row: CategorySummaryRow) => boolean
) {
  return rows.filter(filter).reduce((acc, row) => acc + Number(row.total_amount || 0), 0);
}

type FixedPlanTarget = {
  label: string;
  entry_type: "income" | "expense";
  aliases: string[];
};

const FIXED_EXPENSE_TARGETS: FixedPlanTarget[] = [
  { label: "IPL", entry_type: "expense", aliases: ["ipl"] },
  { label: "Pulsa Mama", entry_type: "expense", aliases: ["pulsa mama", "internet mama"] },
  { label: "Listrik Rumah", entry_type: "expense", aliases: ["listrik rumah", "listrik"] },
  { label: "Air PDAM", entry_type: "expense", aliases: ["air pdam", "pdam"] },
];

const FIXED_INCOME_TARGETS: FixedPlanTarget[] = [
  { label: "Bulanan bang harun", entry_type: "income", aliases: ["iuran harun", "harun"] },
  { label: "Bulanan bang Daniel", entry_type: "income", aliases: ["iuran daniel", "daniel"] },
  { label: "Bulanan bang Justin", entry_type: "income", aliases: ["iuran justin", "justin"] },
];

function normalizeText(value: string) {
  return value.toLowerCase().trim().replace(/\s+/g, " ");
}

function findPlanActualRow(rows: PlanActualRow[], target: FixedPlanTarget): PlanActualRow | null {
  const matched = rows.find((row) => {
    if (row.entry_type !== target.entry_type) return false;
    if (row.cashflow_group !== "fixed") return false;
    const raw = normalizeText(row.category_name || "");
    return target.aliases.some((alias) => raw.includes(normalizeText(alias)));
  });

  return matched ?? null;
}

function buildDisplayRow(
  rows: PlanActualRow[],
  target: FixedPlanTarget
): PlanActualRow & { display_name: string } {
  const found = findPlanActualRow(rows, target);

  return {
    category_name: found?.category_name ?? target.label,
    display_name: target.label,
    planned_amount: Number(found?.planned_amount ?? 0),
    actual_amount: Number(found?.actual_amount ?? 0),
    variance: Number(found?.variance ?? 0),
    entry_type: target.entry_type,
    cashflow_group: "fixed",
  };
}

function getPeriodLabel(selectedYear?: number | null, selectedMonth?: number | null) {
  const monthNames = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  if (selectedYear && selectedMonth) {
    return `${monthNames[selectedMonth - 1]} ${selectedYear}`;
  }

  if (selectedYear) {
    return `Tahun ${selectedYear}`;
  }

  if (selectedMonth) {
    return `Bulan ${monthNames[selectedMonth - 1]}`;
  }

  return "Semua Periode";
}

export default function ModernFinanceDashboard({
  summary,
  categories = [],
  planActual = [],
  transactions = [],
  selectedYear = null,
  selectedMonth = null,
}: DashboardProps) {
  const latestTransactions = transactions.slice(0, 5);

  const fixedIncome = sumByFilter(
    categories,
    (row) => row.entry_type === "income" && row.cashflow_group === "fixed"
  );

  const variableIncome = sumByFilter(
    categories,
    (row) => row.entry_type === "income" && row.cashflow_group === "variable"
  );

  const fixedCost = sumByFilter(
    categories,
    (row) => row.entry_type === "expense" && row.cashflow_group === "fixed"
  );

  const variableCost = sumByFilter(
    categories,
    (row) => row.entry_type === "expense" && row.cashflow_group === "variable"
  );

  const totalIncome = fixedIncome + variableIncome;
  const totalSaving = Number(summary?.total_saving || 0);
  const netRemaining = Number(summary?.net_remaining || 0);

  const savingRate = percent(totalSaving, totalIncome);
  const fixedCostRatio = percent(fixedCost, totalIncome);
  const variableCostRatio = percent(variableCost, totalIncome);

  const variableCategories = categories
    .filter((row) => row.entry_type === "expense" && row.cashflow_group === "variable")
    .sort((a, b) => Number(b.total_amount) - Number(a.total_amount))
    .slice(0, 5);

  const displayFixedIncomeItems = FIXED_INCOME_TARGETS.map((target) =>
    buildDisplayRow(planActual, target)
  );

  const displayFixedExpenseItems = FIXED_EXPENSE_TARGETS.map((target) =>
    buildDisplayRow(planActual, target)
  );

  const largestVariableCost = variableCategories[0];

  const overBudgetItems = planActual.filter(
    (row) => Number(row.variance) > 0 && row.entry_type === "expense"
  );

  const needsReviewCount = transactions.filter(
    (row) => row.review_status === "needs_review"
  ).length;

  const trendBars = [
    { label: "Fixed Income", value: fixedIncome },
    { label: "Variable Income", value: variableIncome },
    { label: "Fixed Cost", value: fixedCost },
    { label: "Variable Cost", value: variableCost },
  ];

  const periodLabel = getPeriodLabel(selectedYear, selectedMonth);

  return (
    <div className="min-h-screen bg-slate-50 p-6 text-slate-900">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-sm font-medium text-slate-500">Dashboard Keuangan Sitohang Helpmen</div>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">Ringkasan {periodLabel}</h1>
            <p className="mt-2 text-sm text-slate-500">
              Fokus pada pemisahan fixed income, variable income, fixed cost, dan variable cost.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div className="text-xs text-slate-500">Saving Rate</div>
              <div className="mt-1 text-lg font-semibold">{savingRate.toFixed(1)}%</div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div className="text-xs text-slate-500">Fixed Cost Ratio</div>
              <div className="mt-1 text-lg font-semibold">{fixedCostRatio.toFixed(1)}%</div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div className="text-xs text-slate-500">Variable Cost Ratio</div>
              <div className="mt-1 text-lg font-semibold">{variableCostRatio.toFixed(1)}%</div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div className="text-xs text-slate-500">Need Review</div>
              <div className="mt-1 text-lg font-semibold">{needsReviewCount} transaksi</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-6">
          <StatCard title="Fixed Income" value={fmt(fixedIncome)} hint="Iuran Rutin Bulanan." />
          <StatCard title="Variable Income" value={fmt(variableIncome)} hint="Transfer Tambahan." />
          <StatCard title="Fixed Cost" value={fmt(fixedCost)} hint="Biaya rutin seperti IPL, pulsa, listrik, air, dan lainnya." />
          <StatCard title="Variable Cost" value={fmt(variableCost)} hint="Pengeluaran harian seperti makan, transport, dan belanja." />
          <StatCard title="Saving" value={fmt(totalSaving)} hint="Total tabungan yang tercatat pada periode ini." />
          <StatCard title="Net Remaining" value={fmt(netRemaining)} hint="Sisa bersih setelah expense dan saving." />
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
            <div>
              <h2 className="text-lg font-semibold">Komposisi Arus Kas</h2>
              <p className="mt-1 text-sm text-slate-500">
                Perbandingan fixed income, variable income, fixed cost, dan variable cost.
              </p>
            </div>
            <div className="mt-6">
              <MiniBars values={trendBars} />
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Insight Otomatis</h2>
            <p className="mt-1 text-sm text-slate-500">
              Ringkasan cepat dari struktur pemasukan dan pengeluaran pada periode ini.
            </p>
            <div className="mt-4 space-y-3">
              <InsightCard
                title="Komposisi pendapatan"
                description={`Fixed income ${fmt(fixedIncome)} dan variable income ${fmt(variableIncome)}.`}
                tone={fixedIncome >= variableIncome ? "good" : "neutral"}
              />
              <InsightCard
                title="Komposisi pengeluaran"
                description={`Fixed cost ${fmt(fixedCost)} dan variable cost ${fmt(variableCost)}.`}
                tone={variableCost > fixedCost ? "warn" : "neutral"}
              />
              <InsightCard
                title="Kontrol terhadap budget"
                description={
                  overBudgetItems.length > 0
                    ? `${overBudgetItems.length} kategori expense sudah melewati planned amount.`
                    : "Belum ada kategori expense utama yang melewati planned amount."
                }
                tone={overBudgetItems.length > 0 ? "warn" : "good"}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Top Variable Cost</h2>
            <p className="mt-1 text-sm text-slate-500">
              Kategori variable cost yang paling banyak menyerap cashflow.
            </p>
            <div className="mt-5 space-y-4">
              {variableCategories.length === 0 ? (
                <EmptyState text="Belum ada data variable cost untuk ditampilkan." />
              ) : (
                variableCategories.map((row) => (
                  <div key={row.category_name} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <div className="font-medium text-slate-700">{row.category_name}</div>
                      <div className="text-slate-500">{fmt(Number(row.total_amount))}</div>
                    </div>
                    <ProgressBar value={percent(Number(row.total_amount), variableCost)} />
                    <div className="text-xs text-slate-400">
                      {percent(Number(row.total_amount), variableCost).toFixed(1)}% dari total variable cost
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Fixed Plan vs Actual</h2>
            <p className="mt-1 text-sm text-slate-500">
              Perbandingan planned dan actual sesuai daftar pendapatan dan pengeluaran tetap.
            </p>

            <div className="mt-6 space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-slate-800">Pendapatan</h3>
                <div className="mt-3 space-y-3">
                  {displayFixedIncomeItems.map((item) => (
                    <div key={`fixed-income-${item.display_name}`} className="rounded-2xl border border-slate-200 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="w-full">
                          <div className="font-medium">{item.display_name}</div>
                          <div className="mt-1 text-sm text-slate-500">
                            Planned {fmt(Number(item.planned_amount))} • Actual {fmt(Number(item.actual_amount))}
                          </div>
                          <div className="mt-2">
                            <ProgressBar
                              value={
                                Number(item.planned_amount) > 0
                                  ? Math.min(100, percent(Number(item.actual_amount), Number(item.planned_amount)))
                                  : 0
                              }
                            />
                          </div>
                          <div className="mt-1 text-xs text-slate-400">
                            {Number(item.planned_amount) > 0
                              ? `${percent(Number(item.actual_amount), Number(item.planned_amount)).toFixed(1)}% dari planned`
                              : "Planned amount belum tersedia"}
                          </div>
                        </div>

                        <div className={`rounded-full px-3 py-1 text-xs font-medium ${getVarianceBadgeClass(Number(item.variance))}`}>
                          {getVarianceStatus(Number(item.variance))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-800">Pengeluaran</h3>
                <div className="mt-3 space-y-3">
                  {displayFixedExpenseItems.map((item) => (
                    <div key={`fixed-expense-${item.display_name}`} className="rounded-2xl border border-slate-200 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="w-full">
                          <div className="font-medium">{item.display_name}</div>
                          <div className="mt-1 text-sm text-slate-500">
                            Planned {fmt(Number(item.planned_amount))} • Actual {fmt(Number(item.actual_amount))}
                          </div>
                          <div className="mt-2">
                            <ProgressBar
                              value={
                                Number(item.planned_amount) > 0
                                  ? Math.min(100, percent(Number(item.actual_amount), Number(item.planned_amount)))
                                  : 0
                              }
                            />
                          </div>
                          <div className="mt-1 text-xs text-slate-400">
                            {Number(item.planned_amount) > 0
                              ? `${percent(Number(item.actual_amount), Number(item.planned_amount)).toFixed(1)}% dari planned`
                              : "Planned amount belum tersedia"}
                          </div>
                        </div>

                        <div className={`rounded-full px-3 py-1 text-xs font-medium ${getVarianceBadgeClass(Number(item.variance))}`}>
                          {getVarianceStatus(Number(item.variance))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm xl:col-span-3">
            <h2 className="text-lg font-semibold">Plan vs Actual</h2>
            <p className="mt-1 text-sm text-slate-500">
              Bandingkan target dan realisasi pada kategori utama.
            </p>
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
                          <span className={`rounded-full px-3 py-1 text-xs font-medium ${getVarianceBadgeClass(Number(row.variance))}`}>
                            {getVarianceStatus(Number(row.variance))}
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
            <p className="mt-1 text-sm text-slate-500">
              Data terbaru dari Telegram dan status review AI.
            </p>
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
                        <div className="mt-1 text-xs uppercase tracking-wide text-slate-400">
                          {row.entry_type}
                        </div>
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

        {largestVariableCost && (
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Highlight Periode Ini</h2>
            <p className="mt-1 text-sm text-slate-500">
              Fokus utama berdasarkan pola cashflow yang terbaca.
            </p>
            <div className="mt-4">
              <InsightCard
                title="Variable cost terbesar"
                description={`${largestVariableCost.category_name} menjadi variable cost terbesar dengan nilai ${fmt(
                  Number(largestVariableCost.total_amount)
                )}.`}
                tone="neutral"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}