type Props = {
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout?: () => void;
};

const navItems = [
  { id: "home",          label: "Home",      icon: "⬡" },
  { id: "jobmatch",      label: "Job Match",  icon: "✦" },
  { id: "application",  label: "Apply",      icon: "◈" },
  { id: "resume",        label: "Resume AI",  icon: "◎" },
  { id: "chat",          label: "AI Chat",    icon: "◉" },
];

export default function NavBar({ currentPage, onNavigate, onLogout }: Props) {
  const userRole = localStorage.getItem("user_role");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_role");
    onLogout?.();
  };

  return (
    <nav>
      <span className="nav-brand">⚡ TalentSpark</span>

      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => onNavigate(item.id)}
          disabled={currentPage === item.id}
          title={item.label}
        >
          {item.label}
        </button>
      ))}

      {(userRole === "Admin") && (
        <button
          onClick={() => onNavigate("admindashboard")}
          disabled={currentPage === "admindashboard"}
        >
          Admin
        </button>
      )}

      {(userRole === "user" || userRole === "User") && (
        <button
          onClick={() => onNavigate("userdashboard")}
          disabled={currentPage === "userdashboard"}
        >
          Dashboard
        </button>
      )}

      <button className="nav-logout" onClick={handleLogout}>
        Sign Out
      </button>
    </nav>
  );
}