import { useState, type SubmitEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Register.css";

interface CustomerResponse {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
}

function Register() {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const navigate = useNavigate();

    const handleSubmit = async (
        event: SubmitEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        setErrorMessage("");
        setSuccessMessage("");

        if (
            !firstName.trim() ||
            !lastName.trim() ||
            !email.trim() ||
            !phoneNumber.trim() ||
            !username.trim() ||
            !password ||
            !confirmPassword
        ) {
            setErrorMessage(
                "Please fill in all fields."
            );
            return;
        }

        if (password.length < 6) {
            setErrorMessage(
                "Password must contain at least 6 characters."
            );
            return;
        }

        if (password !== confirmPassword) {
            setErrorMessage(
                "Passwords do not match."
            );
            return;
        }

        setIsLoading(true);

        try {
            const customerResponse = await fetch(
                "http://localhost:5000/api/Customers",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        firstName: firstName.trim(),
                        lastName: lastName.trim(),
                        email: email.trim(),
                        phoneNumber: phoneNumber.trim(),
                    }),
                }
            );

            if (!customerResponse.ok) {
                const errorText =
                    await customerResponse.text();

                setErrorMessage(
                    errorText ||
                        "Unable to create customer."
                );

                return;
            }

            const customer: CustomerResponse =
                await customerResponse.json();

            const registerResponse = await fetch(
                "http://localhost:5000/api/Auth/register",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        username: username.trim(),
                        email: email.trim(),
                        password,
                        customerId: customer.id,
                    }),
                }
            );

            if (!registerResponse.ok) {
                const errorText =
                    await registerResponse.text();

                setErrorMessage(
                    errorText ||
                        "Unable to create account."
                );

                return;
            }

            setSuccessMessage(
                "Account created successfully. Redirecting to login..."
            );

            setTimeout(() => {
                navigate("/login");
            }, 1500);
        } catch (error) {
            console.error(
                "Registration error:",
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
        <main className="register-page">
            <section className="register-card">
                <div className="register-brand">
                    <div className="register-logo">
                        Bankly
                    </div>

                    <h1>
                        Create your account
                    </h1>

                    <p>
                        Join Bankly and manage your finances
                    </p>
                </div>

                <form
                    className="register-form"
                    onSubmit={handleSubmit}
                >
                    <div className="form-group">
                        <label htmlFor="firstName">
                            First name
                        </label>

                        <input
                            id="firstName"
                            type="text"
                            value={firstName}
                            onChange={(event) =>
                                setFirstName(
                                    event.target.value
                                )
                            }
                            placeholder="Enter your first name"
                            autoComplete="given-name"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="lastName">
                            Last name
                        </label>

                        <input
                            id="lastName"
                            type="text"
                            value={lastName}
                            onChange={(event) =>
                                setLastName(
                                    event.target.value
                                )
                            }
                            placeholder="Enter your last name"
                            autoComplete="family-name"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">
                            Email
                        </label>

                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(event) =>
                                setEmail(
                                    event.target.value
                                )
                            }
                            placeholder="Enter your email"
                            autoComplete="email"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="phoneNumber">
                            Phone number
                        </label>

                        <input
                            id="phoneNumber"
                            type="tel"
                            value={phoneNumber}
                            onChange={(event) =>
                                setPhoneNumber(
                                    event.target.value
                                )
                            }
                            placeholder="Enter your phone number"
                            autoComplete="tel"
                        />
                    </div>

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
                            placeholder="Choose a username"
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
                                placeholder="Create a password"
                                autoComplete="new-password"
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

                    <div className="form-group">
                        <label htmlFor="confirmPassword">
                            Confirm password
                        </label>

                        <div className="password-wrapper">
                            <input
                                id="confirmPassword"
                                type={
                                    showConfirmPassword
                                        ? "text"
                                        : "password"
                                }
                                value={confirmPassword}
                                onChange={(event) =>
                                    setConfirmPassword(
                                        event.target.value
                                    )
                                }
                                placeholder="Confirm your password"
                                autoComplete="new-password"
                            />

                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() =>
                                    setShowConfirmPassword(
                                        !showConfirmPassword
                                    )
                                }
                            >
                                {showConfirmPassword
                                    ? "Hide"
                                    : "Show"}
                            </button>
                        </div>
                    </div>

                    {errorMessage && (
                        <div className="register-error">
                            {errorMessage}
                        </div>
                    )}

                    {successMessage && (
                        <div className="register-success">
                            {successMessage}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="register-button"
                        disabled={isLoading}
                    >
                        {isLoading
                            ? "Creating account..."
                            : "Create account →"}
                    </button>
                </form>

                <div className="register-footer">
                    <span>
                        Already have an account?
                    </span>

                    <Link to="/login">
                        Sign in
                    </Link>
                </div>
            </section>
        </main>
    );
}

export default Register;