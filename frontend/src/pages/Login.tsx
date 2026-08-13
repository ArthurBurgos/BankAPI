import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import "./Login.css";
import { useTheme } from "../contexts/ThemeContext";

function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const { theme, toggleTheme } = useTheme();

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!username.trim() || !password.trim()) {
            return;
        }

        setIsLoading(true);

        // A integração com a API de login será adicionada aqui.

        setTimeout(() => {
            setIsLoading(false);
        }, 800);
    };

    return (
        <main className={`login-page ${theme}`}>
            {/* Theme Toggle */}
            <div className="theme-toggle">
                <span className="theme-label">
                    Light
                </span>

                <button
                    type="button"
                    className={`theme-switch ${
                        theme === "dark" ? "dark" : "light"
                    }`}
                    onClick={toggleTheme}
                    aria-label="Toggle theme"
                >
                    <span className="theme-switch-thumb"></span>
                </button>

                <span className="theme-label">
                    Dark
                </span>
            </div>

            {/* Login */}
            <section className="login-card">

                {/* Brand */}
                <div className="login-brand">

                    <div className="login-logo">
                        Bankly
                    </div>

                    <h1>
                        Welcome back
                    </h1>

                    <p>
                        Sign in to your Bankly account
                    </p>
                </div>

                {/* Form */}
                <form
                    className="login-form"
                    onSubmit={handleSubmit}
                >

                    {/* Username */}
                    <div className="form-group">

                        <label htmlFor="username">
                            Username
                        </label>

                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(event) =>
                                setUsername(event.target.value)
                            }
                            placeholder="Enter your username"
                            autoComplete="username"
                        />

                    </div>

                    {/* Password */}
                    <div className="form-group">

                        <label htmlFor="password">
                            Password
                        </label>

                        <div className="password-wrapper">

                            <input
                                id="password"
                                type={
                                    showPassword
                                        ? "text"
                                        : "password"
                                }
                                value={password}
                                onChange={(event) =>
                                    setPassword(event.target.value)
                                }
                                placeholder="Enter your password"
                                autoComplete="current-password"
                            />

                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() =>
                                    setShowPassword(
                                        !showPassword
                                    )
                                }
                            >
                                {showPassword
                                    ? "Hide"
                                    : "Show"}
                            </button>

                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        className="login-button"
                        disabled={
                            isLoading ||
                            !username.trim() ||
                            !password.trim()
                        }
                    >
                        {isLoading
                            ? "Signing in..."
                            : "Sign in →"}
                    </button>

                </form>

                {/* Footer */}
                <div className="login-footer">

                    <span>
                        Don't have an account?
                    </span>

                    <Link to="/register">
                        Create an account
                    </Link>

                </div>

            </section>
        </main>
    );
}

export default Login;