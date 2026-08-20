import { useState, type FormEvent } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import "./Transfer.css";

interface Account {
    id: number;
    accountNumber: string;
    balance: number;
}

const mockAccounts: Account[] = [
    {
        id: 1,
        accountNumber: "**** 4821",
        balance: 2450.50,
    },
    {
        id: 2,
        accountNumber: "**** 7319",
        balance: 850.00,
    },
];

function Transfer() {
    const [sourceAccount, setSourceAccount] =
        useState("");

    const [destinationAccount, setDestinationAccount] =
        useState("");

    const [amount, setAmount] = useState("");

    const [description, setDescription] =
        useState("");

    const [message, setMessage] =
        useState("");

    const handleSubmit = (
        event: FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        setMessage(
            "Transfer preview created successfully."
        );
    };

    return (
        <div className="transfer-page">
            <Sidebar />

            <main className="transfer-main">
                <Header />

                <div className="transfer-page-header">
                    <h2>Transfer Money</h2>

                    <p>
                        Send money from one Bankly account
                        to another.
                    </p>
                </div>

                <section className="transfer-container">
                    <form
                        className="transfer-form"
                        onSubmit={handleSubmit}
                    >
                        <div className="form-section">
                            <h3>
                                Transfer Details
                            </h3>

                            <p>
                                Choose the source account
                                and enter the destination
                                account.
                            </p>
                        </div>

                        <div className="form-group">
                            <label htmlFor="source-account">
                                From Account
                            </label>

                            <select
                                id="source-account"
                                value={sourceAccount}
                                onChange={(event) =>
                                    setSourceAccount(
                                        event.target.value
                                    )
                                }
                                required
                            >
                                <option value="">
                                    Select an account
                                </option>

                                {mockAccounts.map(
                                    (account) => (
                                        <option
                                            key={
                                                account.id
                                            }
                                            value={
                                                account.id
                                            }
                                        >
                                            {
                                                account.accountNumber
                                            }{" "}
                                            — €
                                            {account.balance.toFixed(
                                                2
                                            )}
                                        </option>
                                    )
                                )}
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="destination-account">
                                Destination Account
                            </label>

                            <input
                                id="destination-account"
                                type="number"
                                value={
                                    destinationAccount
                                }
                                onChange={(event) =>
                                    setDestinationAccount(
                                        event.target.value
                                    )
                                }
                                placeholder="Enter account ID"
                                required
                            />

                            <span className="form-hint">
                                Enter the Bankly account ID
                                of the recipient.
                            </span>
                        </div>

                        <div className="form-group">
                            <label htmlFor="amount">
                                Amount
                            </label>

                            <div className="amount-input">
                                <span>€</span>

                                <input
                                    id="amount"
                                    type="number"
                                    min="0.01"
                                    step="0.01"
                                    value={amount}
                                    onChange={(event) =>
                                        setAmount(
                                            event.target.value
                                        )
                                    }
                                    placeholder="0.00"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="description">
                                Description
                            </label>

                            <input
                                id="description"
                                type="text"
                                value={description}
                                onChange={(event) =>
                                    setDescription(
                                        event.target.value
                                    )
                                }
                                placeholder="Optional description"
                            />
                        </div>

                        {message && (
                            <div className="transfer-message">
                                {message}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="transfer-button"
                        >
                            Continue Transfer
                        </button>
                    </form>

                    <aside className="transfer-summary">
                        <h3>
                            Transfer Summary
                        </h3>

                        <div className="summary-row">
                            <span>
                                From
                            </span>

                            <strong>
                                {sourceAccount
                                    ? mockAccounts.find(
                                          (account) =>
                                              account.id.toString() ===
                                              sourceAccount
                                      )?.accountNumber
                                    : "—"}
                            </strong>
                        </div>

                        <div className="summary-row">
                            <span>
                                Destination
                            </span>

                            <strong>
                                {destinationAccount ||
                                    "—"}
                            </strong>
                        </div>

                        <div className="summary-row">
                            <span>
                                Amount
                            </span>

                            <strong>
                                {amount
                                    ? `€${Number(
                                          amount
                                      ).toFixed(2)}`
                                    : "€0.00"}
                            </strong>
                        </div>

                        <div className="summary-divider" />

                        <p>
                            Please review the transfer
                            details before confirming.
                        </p>
                    </aside>
                </section>
            </main>
        </div>
    );
}

export default Transfer;