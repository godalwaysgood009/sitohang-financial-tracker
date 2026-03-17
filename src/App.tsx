import { useEffect, useMemo, useState } from "react";
import NavBar from "./components/NavBar";
import ModernFinanceDashboard from "./components/ModernFinanceDashboard";
import TransactionsPage from "./pages/TransactionsPage";
import PlansPage from "./pages/PlansPage";
import PlanActualPage from "./pages/PlanActualPage";
import PeriodFilter from "./components/PeriodFilter";
import {
  getMonthlyCashflowSummary,
  getMonthlyCategorySummary,
  getMonthlyPlans,
  getPlanVsActual,
  getTransactions,
} from "./lib/queries";
import { subscribeTransactions } from "./lib/realtime";

type PageKey = "home" | "transactions" | "plans" | "plan-actual";

function parseYearMonth(value?: string | null) {
  if (!value) return { year: null, month: null };

  const date = new Date(value);
  if (isNaN(date.getTime())) return { year: null, month: null };

  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
  };
}

function matchesYearMonth(
  value: string | null | undefined,
  selectedYear: number | null,
  selectedMonth: number | null
) {
  if (!value) return false;

  const { year, month } = parseYearMonth(value);

  if (!year || !month) return false;
  if (selectedYear && year !== selectedYear) return false;
  if (selectedMonth && month !== selectedMonth) return false;

  return true;
}

export default function App() {
  const [page, setPage] = useState<PageKey>("home");

  const [summary, setSummary] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [planActual, setPlanActual] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);

  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);

  async function loadAll() {
    setLoading(true);
    try {
      const [
        summaryData,
        categoryData,
        txData,
        plansData,
        planActualData,
      ] = await Promise.all([
        getMonthlyCashflowSummary(),
        getMonthlyCategorySummary(),
        getTransactions(),
        getMonthlyPlans(),
        getPlanVsActual(),
      ]);

      setSummary(summaryData ?? []);
      setCategories(categoryData ?? []);
      setTransactions(txData ?? []);
      setPlans(plansData ?? []);
      setPlanActual(planActualData ?? []);
    } catch (error) {
      console.error("Dashboard load error:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();

    const unsubscribe = subscribeTransactions(() => {
      loadAll();
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const availableYears = useMemo(() => {
    const years = new Set<number>();

    summary.forEach((row) => {
      const { year } = parseYearMonth(row.month_jkt);
      if (year) years.add(year);
    });

    categories.forEach((row) => {
      const { year } = parseYearMonth(row.month_jkt);
      if (year) years.add(year);
    });

    plans.forEach((row) => {
      const { year } = parseYearMonth(row.effective_month);
      if (year) years.add(year);
    });

    planActual.forEach((row) => {
      const { year } = parseYearMonth(row.effective_month);
      if (year) years.add(year);
    });

    transactions.forEach((row) => {
      const { year } = parseYearMonth(row.transaction_date);
      if (year) years.add(year);
    });

    return Array.from(years).sort((a, b) => b - a);
  }, [summary, categories, plans, planActual, transactions]);

  const filteredSummary = useMemo(() => {
    return summary.filter((row) =>
      matchesYearMonth(row.month_jkt, selectedYear, selectedMonth)
    );
  }, [summary, selectedYear, selectedMonth]);

  const filteredCategories = useMemo(() => {
    return categories.filter((row) =>
      matchesYearMonth(row.month_jkt, selectedYear, selectedMonth)
    );
  }, [categories, selectedYear, selectedMonth]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((row) =>
      matchesYearMonth(row.transaction_date, selectedYear, selectedMonth)
    );
  }, [transactions, selectedYear, selectedMonth]);

  const filteredPlans = useMemo(() => {
    return plans.filter((row) =>
      matchesYearMonth(row.effective_month, selectedYear, selectedMonth)
    );
  }, [plans, selectedYear, selectedMonth]);

  const filteredPlanActual = useMemo(() => {
    return planActual.filter((row) =>
      matchesYearMonth(row.effective_month, selectedYear, selectedMonth)
    );
  }, [planActual, selectedYear, selectedMonth]);

  const latestSummary =
    filteredSummary.length > 0
      ? [...filteredSummary].sort(
          (a, b) => new Date(b.month_jkt).getTime() - new Date(a.month_jkt).getTime()
        )[0]
      : null;

  return (
    <main className="p-6 max-w-7xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Sitohang Financial Tracker</h1>

      <NavBar current={page} onNavigate={setPage} />

      <PeriodFilter
        years={availableYears}
        selectedYear={selectedYear}
        selectedMonth={selectedMonth}
        onYearChange={setSelectedYear}
        onMonthChange={setSelectedMonth}
      />

      {loading ? (
        <div className="rounded-xl border p-4">Loading...</div>
      ) : (
        <>
          {page === "home" && (
            <ModernFinanceDashboard
              summary={latestSummary}
              categories={filteredCategories}
              planActual={filteredPlanActual}
              transactions={filteredTransactions}
              selectedYear={selectedYear}
              selectedMonth={selectedMonth}
            />
          )}

          {page === "transactions" && <TransactionsPage rows={filteredTransactions} />}
          {page === "plans" && <PlansPage rows={filteredPlans} />}
          {page === "plan-actual" && <PlanActualPage rows={filteredPlanActual} />}
        </>
      )}
    </main>
  );
}