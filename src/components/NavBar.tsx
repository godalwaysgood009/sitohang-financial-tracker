type Props = {
  current: "home" | "transactions" | "plans" | "plan-actual";
  onNavigate: (page: Props["current"]) => void;
};

export default function NavBar({ current, onNavigate }: Props) {
  const menus: Array<{ key: Props["current"]; label: string }> = [
    { key: "home", label: "Home" },
    { key: "transactions", label: "Transactions" },
    { key: "plans", label: "Plans" },
    { key: "plan-actual", label: "Plan vs Actual" },
  ];

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {menus.map((menu) => (
        <button
          key={menu.key}
          onClick={() => onNavigate(menu.key)}
          className={`px-4 py-2 rounded-lg border ${
            current === menu.key ? "bg-black text-white" : "bg-white text-black"
          }`}
        >
          {menu.label}
        </button>
      ))}
    </div>
  );
}