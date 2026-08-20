import { useState, type SubmitEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";

interface LoginResponse {
    token: string;
    userId: number;
    customerId: number;
    username: string;
}

function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const navigate = useNavigate();

    const handleSubmit = async (
        event: SubmitEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        setErrorMessage("");

        if (!username.trim() || !password.trim()) {
            setErrorMessage(
                "Please enter your username and password."
            );
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch(
                "http://localhost:5000/api/Auth/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        username: username.trim(),
                        password: password,
                    }),
                }
            );

            if (!response.ok) {
                if (response.status === 401) {
                    setErrorMessage(
                        "Invalid username or password."
                    );
                } else {
                    const errorText =
                        await response.text();

                    setErrorMessage(
                        errorText ||
                            "Unable to sign in."
                    );
                }

                return;
            }

            const data: LoginResponse =
                await response.json();

            localStorage.setItem(
                "token",
                data.token
            );

            localStorage.setItem(
                "userId",
                data.userId.toString()
            );

            localStorage.setItem(
                "customerId",
                data.customerId.toString()
            );

            localStorage.setItem(
                "username",
                data.username
            );

            navigate("/dashboard");
        } catch (error) {
            console.error(
                "Login error:",
                error
            );

            setErrorMessage(
                "Unable to connect to the server."
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="login-page">
            <section className="login-card">
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

                <form
                    className="login-form"
                    onSubmit={handleSubmit}
                >
                    <div className="form-group">
                        <label htmlFor="username">
                            Username
                        </label>

                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(event) =>
                                setUsername(
                                    event.target.value
                                )
                            }
                            placeholder="Enter your username"
                            autoComplete="username"
                        />
                    </div>

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
                                    setPassword(
                                        event.target.value
                                    )
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

                    {errorMessage && (
                        <div className="login-error">
                            {errorMessage}
                        </div>
                    )}

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