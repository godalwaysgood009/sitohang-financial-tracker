import { subscribeTransactions } from "./lib/realtime";
import { useEffect, useState } from "react";
import NavBar from "./components/NavBar";
import ModernFinanceDashboard from "./components/ModernFinanceDashboard";
import TransactionsPage from "./pages/TransactionsPage";
import PlansPage from "./pages/PlansPage";
import PlanActualPage from "./pages/PlanActualPage";
import {
  getMonthlyCashflowSummary,
  getMonthlyCategorySummary,
  getMonthlyPlans,
  getPlanVsActual,
  getTransactions,
} from "./lib/queries";

type PageKey = "home" | "transactions" | "plans" | "plan-actual";

export default function App() {
  const [page, setPage] = useState<PageKey>("home");

  const [summary, setSummary] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [planActual, setPlanActual] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);

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

      setSummary(summaryData);
      setCategories(categoryData);
      setTransactions(txData);
      setPlans(plansData);
      setPlanActual(planActualData);
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

  return (
    <main className="p-6 max-w-7xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Dashboard Keuangan</h1>

      <NavBar current={page} onNavigate={setPage} />

      {loading ? (
        <div className="rounded-xl border p-4">Loading...</div>
      ) : (
        <>
          {page === "home" && (
            <ModernFinanceDashboard
              summary={summary?.[0] ?? null}
              categories={categories}
              planActual={planActual}
              transactions={transactions}
            />
          )}

          {page === "transactions" && (
            <TransactionsPage rows={transactions} />
          )}

          {page === "plans" && (
            <PlansPage rows={plans} />
          )}

          {page === "plan-actual" && (
            <PlanActualPage rows={planActual} />
          )}
        </>
      )}
    </main>
  );
}