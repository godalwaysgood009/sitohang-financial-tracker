import { supabase } from "./supabase";

export async function getMonthlyCashflowSummary() {
  const { data, error } = await supabase
    .from("v_monthly_cashflow_summary")
    .select("*")
    .order("month_jkt", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getMonthlyCategorySummary() {
  const { data, error } = await supabase
    .from("v_monthly_category_summary")
    .select("*")
    .order("month_jkt", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getTransactions() {
  const { data, error } = await supabase
    .from("finance_transactions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) throw error;
  return data ?? [];
}

export async function getMonthlyPlans() {
  const { data, error } = await supabase
    .from("monthly_plans")
    .select("*")
    .order("effective_month", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getPlanVsActual() {
  const { data, error } = await supabase
    .from("v_monthly_plan_vs_actual")
    .select("*")
    .order("effective_month", { ascending: false });

  if (error) throw error;
  return data ?? [];
}