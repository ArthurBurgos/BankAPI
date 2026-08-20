import "./Header.css";

function Header() {
    const username =
        localStorage.getItem("username") || "User";

    const initial =
        username.charAt(0).toUpperCase();

    return (
        <header className="dashboard-header">
            <div className="dashboard-header-title">
                <span className="header-eyebrow">
                    OVERVIEW
                </span>

                <h1>
                    Dashboard
                </h1>

                <p>
                    Welcome back, {username}.
                </p>
            </div>

            <div className="user-profile">
                <div className="user-avatar">
                    {initial}
                </div>

                <div className="user-profile-info">
                    <strong>
                        {username}
                    </strong>

                    <span>
                        Personal account
                    </span>
                </div>
            </div>
        </header>
    );
}

export default Header;