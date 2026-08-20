import { useState, type FormEvent } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import "./Settings.css";

function Settings() {
    const [username, setUsername] = useState(
        localStorage.getItem("username") || "Arthur"
    );

    const [email, setEmail] = useState(
        "user@bankly.com"
    );

    const [message, setMessage] = useState("");

    const handleSubmit = (
        event: FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        localStorage.setItem("username", username);

        setMessage(
            "Your profile has been updated successfully."
        );
    };

    return (
        <div className="settings-page">
            <Sidebar />

            <main className="settings-main">
                <Header />

                <div className="settings-page-header">
                    <h2>Settings</h2>

                    <p>
                        Manage your account and
                        preferences.
                    </p>
                </div>

                <section className="settings-container">
                    <div className="settings-section">
                        <div className="settings-section-header">
                            <h3>
                                Profile Information
                            </h3>

                            <p>
                                Update your personal
                                information.
                            </p>
                        </div>

                        <form
                            className="settings-form"
                            onSubmit={handleSubmit}
                        >
                            <div className="settings-form-group">
                                <label htmlFor="username">
                                    Username
                                </label>

                                <input
                                    id="username"
                                    type="text"
                                    value={username}
                                    onChange={(event) =>
                                        setUsername(
                                            event.target
                                                .value
                                        )
                                    }
                                />
                            </div>

                            <div className="settings-form-group">
                                <label htmlFor="email">
                                    Email
                                </label>

                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(event) =>
                                        setEmail(
                                            event.target
                                                .value
                                        )
                                    }
                                />
                            </div>

                            <div className="settings-form-group">
                                <label htmlFor="customer-id">
                                    Customer ID
                                </label>

                                <input
                                    id="customer-id"
                                    type="text"
                                    value={
                                        localStorage.getItem(
                                            "customerId"
                                        ) || "—"
                                    }
                                    disabled
                                />
                            </div>

                            {message && (
                                <div className="settings-message">
                                    {message}
                                </div>
                            )}

                            <button
                                type="submit"
                                className="settings-save-button"
                            >
                                Save Changes
                            </button>
                        </form>
                    </div>

                    <div className="settings-section">
                        <div className="settings-section-header">
                            <h3>
                                Security
                            </h3>

                            <p>
                                Manage your account
                                security.
                            </p>
                        </div>

                        <div className="settings-option">
                            <div>
                                <strong>
                                    Password
                                </strong>

                                <span>
                                    Change your account
                                    password.
                                </span>
                            </div>

                            <button>
                                Change Password
                            </button>
                        </div>

                        <div className="settings-option">
                            <div>
                                <strong>
                                    Two-Factor
                                    Authentication
                                </strong>

                                <span>
                                    Add an additional
                                    layer of security.
                                </span>
                            </div>

                            <button>
                                Configure
                            </button>
                        </div>
                    </div>

                    <div className="settings-section danger-section">
                        <div className="settings-section-header">
                            <h3>
                                Danger Zone
                            </h3>

                            <p>
                                These actions can affect
                                your Bankly account.
                            </p>
                        </div>

                        <div className="settings-option">
                            <div>
                                <strong>
                                    Delete Account
                                </strong>

                                <span>
                                    Permanently delete
                                    your Bankly account.
                                </span>
                            </div>

                            <button className="delete-button">
                                Delete Account
                            </button>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}

export default Settings;