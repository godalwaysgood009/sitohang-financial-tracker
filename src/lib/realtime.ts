import { supabase } from "./supabase";

export function subscribeTransactions(onChange: () => void) {
  const channel = supabase
    .channel("transactions-live")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "finance_transactions",
      },
      () => {
        onChange();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}