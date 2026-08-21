import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import "./Settings.css";

function Settings() {
    const navigate = useNavigate();

    const username =
        localStorage.getItem("username") || "—";

    const userId =
        localStorage.getItem("userId") || "—";

    const customerId =
        localStorage.getItem("customerId") || "—";

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        localStorage.removeItem("customerId");
        localStorage.removeItem("username");

        navigate("/login");
    };

    return (
        <div className="settings-page">
            <Sidebar />

            <main className="settings-main">
                <Header />

                <div className="settings-page-header">
                    <span className="settings-eyebrow">
                        ACCOUNT
                    </span>

                    <h2>
                        Settings
                    </h2>

                    <p>
                        View your Bankly account information
                        and manage your current session.
                    </p>
                </div>

                <section className="settings-overview">
                    <div className="settings-profile-summary">
                        <div className="settings-avatar">
                            {username !== "—"
                                ? username
                                      .charAt(0)
                                      .toUpperCase()
                                : "U"}
                        </div>

                        <div>
                            <span>
                                Signed in as
                            </span>

                            <strong>
                                {username}
                            </strong>

                            <small>
                                Bankly user
                            </small>
                        </div>
                    </div>

                    <div className="settings-overview-stat">
                        <span>
                            User ID
                        </span>

                        <strong>
                            #{userId}
                        </strong>

                        <small>
                            Authentication identity
                        </small>
                    </div>

                    <div className="settings-overview-stat">
                        <span>
                            Customer ID
                        </span>

                        <strong>
                            #{customerId}
                        </strong>

                        <small>
                            Banking profile
                        </small>
                    </div>

                    <div className="settings-overview-stat">
                        <span>
                            Session
                        </span>

                        <strong className="settings-status-active">
                            Active
                        </strong>

                        <small>
                            JWT authenticated
                        </small>
                    </div>
                </section>

                <section className="settings-container">
                    <div className="settings-section">
                        <div className="settings-section-header">
                            <div className="settings-section-icon profile">
                                U
                            </div>

                            <div>
                                <span className="settings-eyebrow">
                                    PROFILE
                                </span>

                                <h3>
                                    Profile Information
                                </h3>

                                <p>
                                    Information associated with
                                    your Bankly user account.
                                </p>
                            </div>
                        </div>

                        <div className="settings-profile-grid">
                            <div className="settings-info-card">
                                <span>
                                    Username
                                </span>

                                <strong>
                                    {username}
                                </strong>

                                <small>
                                    Your Bankly sign-in name
                                </small>
                            </div>

                            <div className="settings-info-card">
                                <span>
                                    User ID
                                </span>

                                <strong>
                                    #{userId}
                                </strong>

                                <small>
                                    Internal user identifier
                                </small>
                            </div>

                            <div className="settings-info-card">
                                <span>
                                    Customer ID
                                </span>

                                <strong>
                                    #{customerId}
                                </strong>

                                <small>
                                    Linked banking customer
                                </small>
                            </div>
                        </div>

                        <div className="settings-profile-note">
                            <span>
                                i
                            </span>

                            <p>
                                Profile information is currently
                                read-only.
                            </p>
                        </div>
                    </div>

                    <div className="settings-section">
                        <div className="settings-section-header">
                            <div className="settings-section-icon security">
                                ✓
                            </div>

                            <div>
                                <span className="settings-eyebrow">
                                    SECURITY
                                </span>

                                <h3>
                                    Session & Authentication
                                </h3>

                                <p>
                                    Review your current authenticated
                                    Bankly session.
                                </p>
                            </div>
                        </div>

                        <div className="security-status-card">
                            <div className="security-status-left">
                                <span className="security-icon">
                                    ✓
                                </span>

                                <div>
                                    <strong>
                                        Authenticated Session
                                    </strong>

                                    <span>
                                        Your session is protected using
                                        JWT authentication.
                                    </span>
                                </div>
                            </div>

                            <span className="security-badge">
                                Active
                            </span>
                        </div>

                        <div className="settings-session-card">
                            <div>
                                <span className="settings-eyebrow">
                                    CURRENT SESSION
                                </span>

                                <strong>
                                    This Browser
                                </strong>

                                <p>
                                    Signing out will remove the
                                    locally stored authentication
                                    session from this browser.
                                </p>
                            </div>

                            <button
                                type="button"
                                className="settings-signout-button"
                                onClick={handleLogout}
                            >
                                <span>
                                    ↗
                                </span>

                                Sign Out
                            </button>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}

export default Settings;