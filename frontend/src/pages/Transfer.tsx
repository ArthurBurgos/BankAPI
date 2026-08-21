import {
    useEffect,
    useRef,
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

    const [isAccountDropdownOpen, setIsAccountDropdownOpen] =
        useState(false);

    const accountDropdownRef =
        useRef<HTMLDivElement | null>(null);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("en-IE", {
            style: "currency",
            currency: "EUR",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(value);
    };

    const formatAmountInput = (
        rawValue: string
    ) => {
        if (!rawValue) {
            return "";
        }

        const cleanedValue =
            rawValue.replace(/[^\d.]/g, "");

        const parts =
            cleanedValue.split(".");

        const integerPart =
            parts[0] || "0";

        const decimalPart =
            parts
                .slice(1)
                .join("")
                .slice(0, 2);

        const formattedInteger =
            Number(integerPart).toLocaleString(
                "en-IE"
            );

        if (cleanedValue.includes(".")) {
            return `${formattedInteger}.${decimalPart}`;
        }

        return formattedInteger;
    };

    const parseAmountInput = (
        value: string
    ) => {
        return Number(
            value.replace(/,/g, "")
        );
    };

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
                            Authorization:
                                `Bearer ${token}`,
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

    useEffect(() => {
        const handleOutsideClick = (
            event: MouseEvent
        ) => {
            if (
                accountDropdownRef.current &&
                !accountDropdownRef.current.contains(
                    event.target as Node
                )
            ) {
                setIsAccountDropdownOpen(false);
            }
        };

        document.addEventListener(
            "mousedown",
            handleOutsideClick
        );

        return () => {
            document.removeEventListener(
                "mousedown",
                handleOutsideClick
            );
        };
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

    const transferAmount =
        parseAmountInput(amount);

    const validTransferAmount =
        Number.isFinite(transferAmount) &&
        transferAmount > 0
            ? transferAmount
            : 0;

    const remainingBalance =
        selectedSourceAccount
            ? Math.max(
                  selectedSourceAccount.balance -
                      validTransferAmount,
                  0
              )
            : 0;

    const maskAccountNumber = (
        accountNumber: string
    ) => {
        if (!accountNumber) {
            return "****";
        }

        return `**** ${accountNumber.slice(-4)}`;
    };

    const selectAccount = (
        account: Account
    ) => {
        setSourceAccount(
            account.id.toString()
        );

        setIsAccountDropdownOpen(false);

        setSuccessMessage("");
        setErrorMessage("");
    };

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
                currentAccounts.map((account) => {
                    if (
                        account.id ===
                        sourceAccountId
                    ) {
                        return {
                            ...account,
                            balance:
                                account.balance -
                                transferAmount,
                        };
                    }

                    if (
                        account.id ===
                        destinationAccountId
                    ) {
                        return {
                            ...account,
                            balance:
                                account.balance +
                                transferAmount,
                        };
                    }

                    return account;
                })
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
                                ? formatCurrency(
                                      selectedSourceAccount.balance
                                  )
                                : formatCurrency(0)}
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
                            {formatCurrency(
                                validTransferAmount
                            )}
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
                            {formatCurrency(
                                remainingBalance
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
                                    Select the source account,
                                    recipient and amount.
                                </p>
                            </div>
                        </div>

                        <div className="transfer-field">
                            <label>
                                From Account
                            </label>

                            <div
                                className="account-dropdown"
                                ref={
                                    accountDropdownRef
                                }
                            >
                                <button
                                    type="button"
                                    className={`account-dropdown-trigger ${
                                        isAccountDropdownOpen
                                            ? "open"
                                            : ""
                                    }`}
                                    onClick={() =>
                                        setIsAccountDropdownOpen(
                                            (
                                                currentValue
                                            ) =>
                                                !currentValue
                                        )
                                    }
                                    disabled={
                                        isLoadingAccounts
                                    }
                                    aria-expanded={
                                        isAccountDropdownOpen
                                    }
                                >
                                    <span className="dropdown-trigger-icon">
                                        €
                                    </span>

                                    <span className="dropdown-trigger-content">
                                        {isLoadingAccounts ? (
                                            <strong>
                                                Loading accounts...
                                            </strong>
                                        ) : selectedSourceAccount ? (
                                            <>
                                                <strong>
                                                    {maskAccountNumber(
                                                        selectedSourceAccount.accountNumber
                                                    )}
                                                </strong>

                                                <small>
                                                    {formatCurrency(
                                                        selectedSourceAccount.balance
                                                    )}{" "}
                                                    available
                                                </small>
                                            </>
                                        ) : (
                                            <>
                                                <strong>
                                                    Select source account
                                                </strong>

                                                <small>
                                                    Choose an active Bankly account
                                                </small>
                                            </>
                                        )}
                                    </span>

                                    <span
                                        className={`dropdown-chevron ${
                                            isAccountDropdownOpen
                                                ? "open"
                                                : ""
                                        }`}
                                    >
                                        ↓
                                    </span>
                                </button>

                                {isAccountDropdownOpen && (
                                    <div className="account-dropdown-menu">
                                        <div className="dropdown-menu-heading">
                                            <span>
                                                YOUR ACCOUNTS
                                            </span>

                                            <small>
                                                {
                                                    activeAccounts.length
                                                }{" "}
                                                active
                                            </small>
                                        </div>

                                        {activeAccounts.length ===
                                        0 ? (
                                            <div className="dropdown-empty">
                                                No active accounts available.
                                            </div>
                                        ) : (
                                            activeAccounts.map(
                                                (
                                                    account
                                                ) => (
                                                    <button
                                                        key={
                                                            account.id
                                                        }
                                                        type="button"
                                                        className={`account-dropdown-option ${
                                                            sourceAccount ===
                                                            account.id.toString()
                                                                ? "selected"
                                                                : ""
                                                        }`}
                                                        onClick={() =>
                                                            selectAccount(
                                                                account
                                                            )
                                                        }
                                                    >
                                                        <span className="dropdown-option-icon">
                                                            €
                                                        </span>

                                                        <span className="dropdown-option-info">
                                                            <strong>
                                                                Bankly Account
                                                            </strong>

                                                            <small>
                                                                {maskAccountNumber(
                                                                    account.accountNumber
                                                                )}
                                                            </small>
                                                        </span>

                                                        <span className="dropdown-option-balance">
                                                            <strong>
                                                                {formatCurrency(
                                                                    account.balance
                                                                )}
                                                            </strong>

                                                            <small>
                                                                Available
                                                            </small>
                                                        </span>

                                                        {sourceAccount ===
                                                            account.id.toString() && (
                                                            <span className="dropdown-selected-mark">
                                                                ✓
                                                            </span>
                                                        )}
                                                    </button>
                                                )
                                            )
                                        )}
                                    </div>
                                )}
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
                                        {formatCurrency(
                                            selectedSourceAccount.balance
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
                                    type="text"
                                    inputMode="numeric"
                                    value={
                                        destinationAccount
                                    }
                                    onChange={(event) =>
                                        setDestinationAccount(
                                            event.target.value.replace(
                                                /\D/g,
                                                ""
                                            )
                                        )
                                    }
                                    placeholder="Enter recipient account ID"
                                    required
                                    autoComplete="off"
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
                                    type="text"
                                    inputMode="decimal"
                                    value={amount}
                                    onChange={(event) =>
                                        setAmount(
                                            formatAmountInput(
                                                event
                                                    .target
                                                    .value
                                            )
                                        )
                                    }
                                    placeholder="0.00"
                                    required
                                    autoComplete="off"
                                />
                            </div>

                            {validTransferAmount >
                                0 && (
                                <span className="form-hint amount-preview">
                                    Transfer value:{" "}
                                    <strong>
                                        {formatCurrency(
                                            validTransferAmount
                                        )}
                                    </strong>
                                </span>
                            )}
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
                            <div className="route-step">
                                <div className="route-marker source">
                                    €
                                </div>

                                <div className="route-content">
                                    <span>
                                        FROM
                                    </span>

                                    <strong>
                                        {selectedSourceAccount
                                            ? maskAccountNumber(
                                                  selectedSourceAccount.accountNumber
                                              )
                                            : "Select account"}
                                    </strong>

                                    {selectedSourceAccount && (
                                        <small>
                                            {formatCurrency(
                                                selectedSourceAccount.balance
                                            )}{" "}
                                            available
                                        </small>
                                    )}
                                </div>
                            </div>

                            <div className="route-connector">
                                <span />
                            </div>

                            <div className="route-step">
                                <div className="route-marker destination">
                                    ↗
                                </div>

                                <div className="route-content">
                                    <span>
                                        TO
                                    </span>

                                    <strong>
                                        {destinationAccount
                                            ? `Account #${destinationAccount}`
                                            : "Enter recipient"}
                                    </strong>

                                    <small>
                                        Bankly recipient
                                    </small>
                                </div>
                            </div>
                        </div>

                        <div className="summary-divider" />

                        <div className="summary-row">
                            <span>
                                Transfer Amount
                            </span>

                            <strong className="summary-amount">
                                {formatCurrency(
                                    validTransferAmount
                                )}
                            </strong>
                        </div>

                        <div className="summary-row">
                            <span>
                                Available Balance
                            </span>

                            <strong>
                                {selectedSourceAccount
                                    ? formatCurrency(
                                          selectedSourceAccount.balance
                                      )
                                    : formatCurrency(0)}
                            </strong>
                        </div>

                        <div className="summary-row">
                            <span>
                                Balance After Transfer
                            </span>

                            <strong>
                                {formatCurrency(
                                    remainingBalance
                                )}
                            </strong>
                        </div>

                        <div className="summary-divider" />

                        <div className="transfer-total">
                            <span>
                                Total
                            </span>

                            <strong>
                                {formatCurrency(
                                    validTransferAmount
                                )}
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