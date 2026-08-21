import {
    useEffect,
    useState,
    type FormEvent,
} from "react";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import "./Transfer.css";

interface Account {
    id: number;
    accountNumber: string;
    balance: number;
    isActive: boolean;
    customerId: number;
}

interface TransferResponse {
    message: string;
    amount: number;
    sourceAccountId: number;
    destinationAccountId: number;
}

function Transfer() {
    const [accounts, setAccounts] =
        useState<Account[]>([]);

    const [sourceAccount, setSourceAccount] =
        useState("");

    const [destinationAccount, setDestinationAccount] =
        useState("");

    const [amount, setAmount] =
        useState("");

    const [isLoadingAccounts, setIsLoadingAccounts] =
        useState(true);

    const [isSubmitting, setIsSubmitting] =
        useState(false);

    const [successMessage, setSuccessMessage] =
        useState("");

    const [errorMessage, setErrorMessage] =
        useState("");

    useEffect(() => {
        const fetchAccounts = async () => {
            setIsLoadingAccounts(true);
            setErrorMessage("");

            try {
                const token =
                    localStorage.getItem("token");

                if (!token) {
                    setErrorMessage(
                        "Authentication token not found."
                    );
                    return;
                }

                const response = await fetch(
                    "http://localhost:5000/api/accounts",
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (response.status === 401) {
                    setErrorMessage(
                        "Your session has expired. Please sign in again."
                    );
                    return;
                }

                if (!response.ok) {
                    throw new Error(
                        "Unable to load accounts."
                    );
                }

                const data: Account[] =
                    await response.json();

                setAccounts(data);
            } catch (error) {
                console.error(
                    "Transfer accounts error:",
                    error
                );

                setErrorMessage(
                    "Unable to load your accounts."
                );
            } finally {
                setIsLoadingAccounts(false);
            }
        };

        fetchAccounts();
    }, []);

    const selectedSourceAccount =
        accounts.find(
            (account) =>
                account.id.toString() ===
                sourceAccount
        );

    const activeAccounts =
        accounts.filter(
            (account) => account.isActive
        );

    const handleSubmit = async (
        event: FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        setSuccessMessage("");
        setErrorMessage("");

        if (!sourceAccount) {
            setErrorMessage(
                "Please select a source account."
            );
            return;
        }

        if (!destinationAccount) {
            setErrorMessage(
                "Please enter a destination account ID."
            );
            return;
        }

        const sourceAccountId =
            Number(sourceAccount);

        const destinationAccountId =
            Number(destinationAccount);

        const transferAmount =
            Number(amount);

        if (
            !Number.isInteger(sourceAccountId) ||
            sourceAccountId <= 0
        ) {
            setErrorMessage(
                "Invalid source account."
            );
            return;
        }

        if (
            !Number.isInteger(destinationAccountId) ||
            destinationAccountId <= 0
        ) {
            setErrorMessage(
                "Destination account ID must be valid."
            );
            return;
        }

        if (
            !Number.isFinite(transferAmount) ||
            transferAmount <= 0
        ) {
            setErrorMessage(
                "Transfer amount must be greater than zero."
            );
            return;
        }

        if (
            sourceAccountId ===
            destinationAccountId
        ) {
            setErrorMessage(
                "Source and destination accounts must be different."
            );
            return;
        }

        if (
            selectedSourceAccount &&
            transferAmount >
                selectedSourceAccount.balance
        ) {
            setErrorMessage(
                "Insufficient balance."
            );
            return;
        }

        setIsSubmitting(true);

        try {
            const token =
                localStorage.getItem("token");

            if (!token) {
                setErrorMessage(
                    "Authentication token not found."
                );
                return;
            }

            const response = await fetch(
                `http://localhost:5000/api/accounts/${sourceAccountId}/transfer`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        destinationAccountId,
                        amount: transferAmount,
                    }),
                }
            );

            if (response.status === 401) {
                setErrorMessage(
                    "Your session has expired. Please sign in again."
                );
                return;
            }

            if (!response.ok) {
                const errorText =
                    await response.text();

                setErrorMessage(
                    errorText ||
                        "Unable to complete transfer."
                );
                return;
            }

            const data: TransferResponse =
                await response.json();

            setSuccessMessage(
                data.message ||
                    "Transfer completed successfully."
            );

            setAccounts((currentAccounts) =>
                currentAccounts.map((account) =>
                    account.id ===
                    sourceAccountId
                        ? {
                              ...account,
                              balance:
                                  account.balance -
                                  transferAmount,
                          }
                        : account
                )
            );

            setDestinationAccount("");
            setAmount("");
        } catch (error) {
            console.error(
                "Transfer error:",
                error
            );

            setErrorMessage(
                "Unable to complete the transfer."
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const maskAccountNumber = (
        accountNumber: string
    ) => {
        if (!accountNumber) {
            return "****";
        }

        return `**** ${accountNumber.slice(-4)}`;
    };

    const transferAmount =
        Number(amount);

    const remainingBalance =
        selectedSourceAccount &&
        Number.isFinite(transferAmount) &&
        transferAmount > 0
            ? Math.max(
                  selectedSourceAccount.balance -
                      transferAmount,
                  0
              )
            : selectedSourceAccount?.balance ?? 0;

    return (
        <div className="transfer-page">
            <Sidebar />

            <main className="transfer-main">
                <Header />

                <div className="transfer-page-header">
                    <span className="transfer-eyebrow">
                        PAYMENTS
                    </span>

                    <h2>
                        Transfer Money
                    </h2>

                    <p>
                        Send money securely between
                        Bankly accounts.
                    </p>
                </div>

                <section className="transfer-overview">
                    <div>
                        <span>
                            Active Accounts
                        </span>

                        <strong>
                            {isLoadingAccounts
                                ? "..."
                                : activeAccounts.length}
                        </strong>

                        <small>
                            Available for transfers
                        </small>
                    </div>

                    <div>
                        <span>
                            Source Balance
                        </span>

                        <strong className="overview-green">
                            {selectedSourceAccount
                                ? `€${selectedSourceAccount.balance.toFixed(
                                      2
                                  )}`
                                : "€0.00"}
                        </strong>

                        <small>
                            Current available balance
                        </small>
                    </div>

                    <div>
                        <span>
                            Transfer Amount
                        </span>

                        <strong className="overview-purple">
                            {amount &&
                            Number.isFinite(
                                Number(amount)
                            )
                                ? `€${Number(
                                      amount
                                  ).toFixed(2)}`
                                : "€0.00"}
                        </strong>

                        <small>
                            Amount to be sent
                        </small>
                    </div>

                    <div>
                        <span>
                            Remaining Balance
                        </span>

                        <strong>
                            €
                            {remainingBalance.toFixed(
                                2
                            )}
                        </strong>

                        <small>
                            Estimated after transfer
                        </small>
                    </div>
                </section>

                {errorMessage && (
                    <div className="transfer-alert error">
                        {errorMessage}
                    </div>
                )}

                {successMessage && (
                    <div className="transfer-alert success">
                        {successMessage}
                    </div>
                )}

                <section className="transfer-container">
                    <form
                        className="transfer-form"
                        onSubmit={handleSubmit}
                    >
                        <div className="form-section">
                            <div className="form-section-icon">
                                ↗
                            </div>

                            <div>
                                <span className="transfer-eyebrow">
                                    TRANSFER
                                </span>

                                <h3>
                                    Transfer Details
                                </h3>

                                <p>
                                    Select the source
                                    account, recipient and
                                    amount.
                                </p>
                            </div>
                        </div>

                        <div className="transfer-field">
                            <label htmlFor="source-account">
                                From Account
                            </label>

                            <div className="transfer-select-wrapper">
                                <span className="field-icon">
                                    €
                                </span>

                                <select
                                    id="source-account"
                                    value={
                                        sourceAccount
                                    }
                                    onChange={(event) =>
                                        setSourceAccount(
                                            event.target
                                                .value
                                        )
                                    }
                                    required
                                    disabled={
                                        isLoadingAccounts
                                    }
                                >
                                    <option value="">
                                        {isLoadingAccounts
                                            ? "Loading accounts..."
                                            : "Select source account"}
                                    </option>

                                    {activeAccounts.map(
                                        (account) => (
                                            <option
                                                key={
                                                    account.id
                                                }
                                                value={
                                                    account.id
                                                }
                                            >
                                                {maskAccountNumber(
                                                    account.accountNumber
                                                )}{" "}
                                                — €
                                                {account.balance.toFixed(
                                                    2
                                                )}
                                            </option>
                                        )
                                    )}
                                </select>
                            </div>
                        </div>

                        {selectedSourceAccount && (
                            <div className="selected-account-card">
                                <div>
                                    <span className="selected-account-icon">
                                        €
                                    </span>

                                    <div>
                                        <strong>
                                            Bankly Account
                                        </strong>

                                        <span>
                                            {maskAccountNumber(
                                                selectedSourceAccount.accountNumber
                                            )}
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <span>
                                        Available
                                    </span>

                                    <strong>
                                        €
                                        {selectedSourceAccount.balance.toFixed(
                                            2
                                        )}
                                    </strong>
                                </div>
                            </div>
                        )}

                        <div className="transfer-field">
                            <label htmlFor="destination-account">
                                Destination Account
                            </label>

                            <div className="transfer-input-wrapper">
                                <span className="field-icon">
                                    #
                                </span>

                                <input
                                    id="destination-account"
                                    type="number"
                                    min="1"
                                    step="1"
                                    value={
                                        destinationAccount
                                    }
                                    onChange={(event) =>
                                        setDestinationAccount(
                                            event.target
                                                .value
                                        )
                                    }
                                    placeholder="Enter recipient account ID"
                                    required
                                />
                            </div>

                            <span className="form-hint">
                                Enter the Bankly account ID
                                of the recipient.
                            </span>
                        </div>

                        <div className="transfer-field">
                            <label htmlFor="amount">
                                Amount
                            </label>

                            <div className="transfer-amount-input">
                                <span>
                                    €
                                </span>

                                <input
                                    id="amount"
                                    type="number"
                                    min="0.01"
                                    step="0.01"
                                    value={amount}
                                    onChange={(event) =>
                                        setAmount(
                                            event.target
                                                .value
                                        )
                                    }
                                    placeholder="0.00"
                                    required
                                />
                            </div>
                        </div>

                        <div className="transfer-security-note">
                            <span>
                                ✓
                            </span>

                            <div>
                                <strong>
                                    Secure transfer
                                </strong>

                                <p>
                                    Transfers are processed
                                    immediately between
                                    Bankly accounts.
                                </p>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="transfer-button"
                            disabled={
                                isSubmitting ||
                                isLoadingAccounts
                            }
                        >
                            {isSubmitting
                                ? "Processing transfer..."
                                : "Confirm Transfer"}

                            {!isSubmitting && (
                                <span>
                                    →
                                </span>
                            )}
                        </button>
                    </form>

                    <aside className="transfer-summary">
                        <div className="summary-header">
                            <span className="transfer-eyebrow">
                                SUMMARY
                            </span>

                            <h3>
                                Transfer Overview
                            </h3>

                            <p>
                                Review the transaction
                                before confirming.
                            </p>
                        </div>

                        <div className="summary-route">
                            <div className="route-point">
                                <span className="route-icon source">
                                    €
                                </span>

                                <div>
                                    <span>
                                        From
                                    </span>

                                    <strong>
                                        {selectedSourceAccount
                                            ? maskAccountNumber(
                                                  selectedSourceAccount.accountNumber
                                              )
                                            : "Select account"}
                                    </strong>
                                </div>
                            </div>

                            <div className="route-line">
                                <span>
                                    ↓
                                </span>
                            </div>

                            <div className="route-point">
                                <span className="route-icon destination">
                                    ↗
                                </span>

                                <div>
                                    <span>
                                        To
                                    </span>

                                    <strong>
                                        {destinationAccount
                                            ? `Account #${destinationAccount}`
                                            : "Enter recipient"}
                                    </strong>
                                </div>
                            </div>
                        </div>

                        <div className="summary-divider" />

                        <div className="summary-row">
                            <span>
                                Transfer Amount
                            </span>

                            <strong className="summary-amount">
                                {amount &&
                                Number.isFinite(
                                    Number(amount)
                                )
                                    ? `€${Number(
                                          amount
                                      ).toFixed(2)}`
                                    : "€0.00"}
                            </strong>
                        </div>

                        <div className="summary-row">
                            <span>
                                Available Balance
                            </span>

                            <strong>
                                {selectedSourceAccount
                                    ? `€${selectedSourceAccount.balance.toFixed(
                                          2
                                      )}`
                                    : "€0.00"}
                            </strong>
                        </div>

                        <div className="summary-row">
                            <span>
                                Balance After Transfer
                            </span>

                            <strong>
                                €
                                {remainingBalance.toFixed(
                                    2
                                )}
                            </strong>
                        </div>

                        <div className="summary-divider" />

                        <div className="transfer-total">
                            <span>
                                Total
                            </span>

                            <strong>
                                {amount &&
                                Number.isFinite(
                                    Number(amount)
                                )
                                    ? `€${Number(
                                          amount
                                      ).toFixed(2)}`
                                    : "€0.00"}
                            </strong>
                        </div>

                        <div className="summary-footer">
                            <span>
                                ●
                            </span>

                            No transfer fees
                        </div>
                    </aside>
                </section>
            </main>
        </div>
    );
}

export default Transfer;