import { NavLink, useNavigate } from "react-router-dom";
import "./Sidebar.css";

function Sidebar() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        localStorage.removeItem("customerId");
        localStorage.removeItem("username");

        navigate("/login");
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                Bankly
            </div>

            <nav className="sidebar-nav">
                <NavLink
                    to="/dashboard"
                    className={({ isActive }) =>
                        isActive
                            ? "nav-link active"
                            : "nav-link"
                    }
                >
                    Dashboard
                </NavLink>

                <NavLink
                    to="/accounts"
                    className={({ isActive }) =>
                        isActive
                            ? "nav-link active"
                            : "nav-link"
                    }
                >
                    Accounts
                </NavLink>

                <NavLink
                    to="/transactions"
                    className={({ isActive }) =>
                        isActive
                            ? "nav-link active"
                            : "nav-link"
                    }
                >
                    Transactions
                </NavLink>

                <NavLink
                    to="/transfer"
                    className={({ isActive }) =>
                        isActive
                            ? "nav-link active"
                            : "nav-link"
                    }
                >
                    Transfer
                </NavLink>

                <NavLink
                    to="/settings"
                    className={({ isActive }) =>
                        isActive
                            ? "nav-link active"
                            : "nav-link"
                    }
                >
                    Settings
                </NavLink>
            </nav>

            <button
                type="button"
                className="logout-button"
                onClick={handleLogout}
            >
                Logout
            </button>
        </aside>
    );
}

export default Sidebar;