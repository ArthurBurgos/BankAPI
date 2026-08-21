import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import "./Dashboard.css";

interface Account {
    id: number;
    accountNumber: string;
    balance: number;
    isActive: boolean;
    customerId: number;
}

interface Transaction {
    id: number;
    amount: number;
    date: string;
    type: string;
    accountId: number;
}

function Dashboard() {
    const navigate = useNavigate();

    const [accounts, setAccounts] = useState<Account[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);

    const [isLoadingAccounts, setIsLoadingAccounts] =
        useState(true);

    const [isLoadingTransactions, setIsLoadingTransactions] =
        useState(true);

    const [errorMessage, setErrorMessage] =
        useState("");

    useEffect(() => {
        const loadDashboard = async () => {
            const token =
                localStorage.getItem("token");

            if (!token) {
                setErrorMessage(
                    "Authentication token not found."
                );

                setIsLoadingAccounts(false);
                setIsLoadingTransactions(false);

                return;
            }

            try {
                const [
                    accountsResponse,
                    transactionsResponse,
                ] = await Promise.all([
                    fetch(
                        "http://localhost:5000/api/accounts",
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    ),

                    fetch(
                        "http://localhost:5000/api/transactions",
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    ),
                ]);

                if (
                    accountsResponse.status === 401 ||
                    transactionsResponse.status === 401
                ) {
                    setErrorMessage(
                        "Your session has expired. Please sign in again."
                    );

                    return;
                }

                if (!accountsResponse.ok) {
                    throw new Error(
                        "Unable to load accounts."
                    );
                }

                if (!transactionsResponse.ok) {
                    throw new Error(
                        "Unable to load transactions."
                    );
                }

                const accountsData: Account[] =
                    await accountsResponse.json();

                const transactionsData: Transaction[] =
                    await transactionsResponse.json();

                setAccounts(accountsData);
                setTransactions(transactionsData);
            } catch (error) {
                console.error(
                    "Dashboard error:",
                    error
                );

                setErrorMessage(
                    "Unable to load dashboard data."
                );
            } finally {
                setIsLoadingAccounts(false);
                setIsLoadingTransactions(false);
            }
        };

        loadDashboard();
    }, []);

    const totalBalance = accounts.reduce(
        (total, account) =>
            total + account.balance,
        0
    );

    const activeAccounts =
        accounts.filter(
            (account) => account.isActive
        ).length;

    const income = transactions
        .filter(
            (transaction) =>
                transaction.type === "Deposit" ||
                transaction.type === "Transfer In"
        )
        .reduce(
            (total, transaction) =>
                total + transaction.amount,
            0
        );

    const expenses = transactions
        .filter(
            (transaction) =>
                transaction.type === "Withdrawal" ||
                transaction.type === "Transfer Out"
        )
        .reduce(
            (total, transaction) =>
                total + transaction.amount,
            0
        );

    const recentTransactions =
        transactions.slice(0, 5);

    const maskAccountNumber = (
        accountNumber: string
    ) => {
        if (!accountNumber) {
            return "****";
        }

        const lastFour =
            accountNumber.slice(-4);

        return `**** ${lastFour}`;
    };

    const isIncomingTransaction = (
        transactionType: string
    ) => {
        return (
            transactionType === "Deposit" ||
            transactionType === "Transfer In"
        );
    };

    const getTransactionIcon = (
        transactionType: string
    ) => {
        switch (transactionType) {
            case "Deposit":
                return "↓";

            case "Withdrawal":
                return "↑";

            case "Transfer In":
                return "↙";

            case "Transfer Out":
                return "↗";

            default:
                return "•";
        }
    };

    const getTransactionClass = (
        transactionType: string
    ) => {
        switch (transactionType) {
            case "Deposit":
            case "Transfer In":
                return "deposit";

            case "Withdrawal":
                return "withdrawal";

            case "Transfer Out":
                return "transfer";

            default:
                return "transfer";
        }
    };

    const getTransactionDescription = (
        transaction: Transaction
    ) => {
        switch (transaction.type) {
            case "Deposit":
                return "Deposit";

            case "Withdrawal":
                return "Withdrawal";

            case "Transfer In":
                return "Transfer received";

            case "Transfer Out":
                return "Transfer sent";

            default:
                return transaction.type;
        }
    };

    const formatDate = (
        date: string
    ) => {
        return new Date(date).toLocaleDateString(
            "en-GB",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        );
    };

    return (
        <div className="dashboard">
            <Sidebar />

            <main className="dashboard-main">
                <Header />

                <div className="dashboard-content">
                    {errorMessage && (
                        <div className="dashboard-error">
                            {errorMessage}
                        </div>
                    )}

                    {/* Financial Overview */}
                    <section className="balance-overview">
                        <div className="balance-summary-card">

                            {/* Animated Background */}
                            <div className="balance-wave">
                                <span className="wave-line wave-line-one" />
                                <span className="wave-line wave-line-two" />

                                <span className="wave-particle particle-one" />
                                <span className="wave-particle particle-two" />
                                <span className="wave-particle particle-three" />
                                <span className="wave-particle particle-four" />
                            </div>

                            {/* Main Balance */}
                            <div className="balance-summary-main">
                                <span className="eyebrow">
                                    TOTAL BALANCE
                                </span>

                                <h2>
                                    {isLoadingAccounts
                                        ? "..."
                                        : `€${totalBalance.toFixed(
                                              2
                                          )}`}
                                </h2>

                                <span className="balance-description">
                                    Available balance across
                                    your accounts
                                </span>

                                <div className="balance-account-status">
                                    <span className="status-dot" />

                                    {isLoadingAccounts
                                        ? "Loading accounts"
                                        : `${activeAccounts} active ${
                                              activeAccounts ===
                                              1
                                                  ? "account"
                                                  : "accounts"
                                          }`}
                                </div>
                            </div>

                            {/* Statistics */}
                            <div className="balance-summary-stats">
                                <div className="balance-summary-stat">
                                    <span>
                                        Income
                                    </span>

                                    <strong className="positive">
                                        {isLoadingTransactions
                                            ? "..."
                                            : `+€${income.toFixed(
                                                  2
                                              )}`}
                                    </strong>

                                    <small>
                                        All recorded income
                                    </small>
                                </div>

                                <div className="balance-summary-stat">
                                    <span>
                                        Expenses
                                    </span>

                                    <strong className="negative">
                                        {isLoadingTransactions
                                            ? "..."
                                            : `-€${expenses.toFixed(
                                                  2
                                              )}`}
                                    </strong>

                                    <small>
                                        All recorded expenses
                                    </small>
                                </div>

                                <div className="balance-summary-stat">
                                    <span>
                                        Accounts
                                    </span>

                                    <strong>
                                        {isLoadingAccounts
                                            ? "..."
                                            : activeAccounts}
                                    </strong>

                                    <small>
                                        Active accounts
                                    </small>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Quick Actions */}
                    <section className="dashboard-section-block">
                        <div className="section-title">
                            <div>
                                <span className="eyebrow">
                                    BANKING
                                </span>

                                <h2>
                                    Quick Actions
                                </h2>
                            </div>
                        </div>

                        <div className="quick-actions-grid">
                            <button
                                type="button"
                                className="quick-action"
                                onClick={() =>
                                    navigate("/accounts")
                                }
                            >
                                <span className="quick-action-icon deposit-action">
                                    ↓
                                </span>

                                <span className="quick-action-content">
                                    <strong>
                                        Deposit
                                    </strong>

                                    <small>
                                        Add money to your account
                                    </small>
                                </span>

                                <span className="quick-action-arrow">
                                    →
                                </span>
                            </button>

                            <button
                                type="button"
                                className="quick-action"
                                onClick={() =>
                                    navigate("/accounts")
                                }
                            >
                                <span className="quick-action-icon withdraw-action">
                                    ↑
                                </span>

                                <span className="quick-action-content">
                                    <strong>
                                        Withdraw
                                    </strong>

                                    <small>
                                        Withdraw money from your account
                                    </small>
                                </span>

                                <span className="quick-action-arrow">
                                    →
                                </span>
                            </button>

                            <button
                                type="button"
                                className="quick-action"
                                onClick={() =>
                                    navigate("/transfer")
                                }
                            >
                                <span className="quick-action-icon transfer-action">
                                    ↗
                                </span>

                                <span className="quick-action-content">
                                    <strong>
                                        Transfer
                                    </strong>

                                    <small>
                                        Send money to another account
                                    </small>
                                </span>

                                <span className="quick-action-arrow">
                                    →
                                </span>
                            </button>
                        </div>
                    </section>

                    {/* Dashboard Panels */}
                    <div className="dashboard-grid">

                        {/* Recent Transactions */}
                        <section className="dashboard-panel">
                            <div className="panel-header">
                                <div>
                                    <span className="eyebrow">
                                        ACTIVITY
                                    </span>

                                    <h2>
                                        Recent Transactions
                                    </h2>
                                </div>

                                <button
                                    type="button"
                                    className="panel-link"
                                    onClick={() =>
                                        navigate(
                                            "/transactions"
                                        )
                                    }
                                >
                                    View all
                                </button>
                            </div>

                            <div className="transactions-list">
                                {isLoadingTransactions ? (
                                    <div className="dashboard-loading">
                                        Loading transactions...
                                    </div>
                                ) : recentTransactions.length ===
                                  0 ? (
                                    <div className="dashboard-loading">
                                        No transactions yet.
                                    </div>
                                ) : (
                                    recentTransactions.map(
                                        (transaction) => {
                                            const incoming =
                                                isIncomingTransaction(
                                                    transaction.type
                                                );

                                            return (
                                                <div
                                                    className="transaction-item"
                                                    key={
                                                        transaction.id
                                                    }
                                                >
                                                    <div className="transaction-info">
                                                        <div
                                                            className={`transaction-icon ${getTransactionClass(
                                                                transaction.type
                                                            )}`}
                                                        >
                                                            {getTransactionIcon(
                                                                transaction.type
                                                            )}
                                                        </div>

                                                        <div className="transaction-details">
                                                            <strong>
                                                                {getTransactionDescription(
                                                                    transaction
                                                                )}
                                                            </strong>

                                                            <span>
                                                                Account #
                                                                {
                                                                    transaction.accountId
                                                                }
                                                                {" • "}
                                                                {formatDate(
                                                                    transaction.date
                                                                )}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <strong
                                                        className={
                                                            incoming
                                                                ? "transaction-positive"
                                                                : "transaction-negative"
                                                        }
                                                    >
                                                        {incoming
                                                            ? "+"
                                                            : "-"}
                                                        €
                                                        {Math.abs(
                                                            transaction.amount
                                                        ).toFixed(
                                                            2
                                                        )}
                                                    </strong>
                                                </div>
                                            );
                                        }
                                    )
                                )}
                            </div>
                        </section>

                        {/* Accounts */}
                        <section className="dashboard-panel">
                            <div className="panel-header">
                                <div>
                                    <span className="eyebrow">
                                        ACCOUNTS
                                    </span>

                                    <h2>
                                        Your Accounts
                                    </h2>
                                </div>

                                <button
                                    type="button"
                                    className="panel-link"
                                    onClick={() =>
                                        navigate("/accounts")
                                    }
                                >
                                    View all
                                </button>
                            </div>

                            <div className="accounts-list">
                                {isLoadingAccounts ? (
                                    <div className="dashboard-loading">
                                        Loading accounts...
                                    </div>
                                ) : accounts.length === 0 ? (
                                    <div className="dashboard-loading">
                                        You don't have any
                                        accounts yet.
                                    </div>
                                ) : (
                                    accounts.map(
                                        (account) => (
                                            <div
                                                className="account-item"
                                                key={
                                                    account.id
                                                }
                                            >
                                                <div className="account-main">
                                                    <div className="account-icon">
                                                        €
                                                    </div>

                                                    <div>
                                                        <strong>
                                                            {maskAccountNumber(
                                                                account.accountNumber
                                                            )}
                                                        </strong>

                                                        <span>
                                                            <i
                                                                className={
                                                                    account.isActive
                                                                        ? ""
                                                                        : "inactive"
                                                                }
                                                            />

                                                            {account.isActive
                                                                ? "Active"
                                                                : "Inactive"}
                                                        </span>
                                                    </div>
                                                </div>

                                                <strong className="account-balance">
                                                    €
                                                    {account.balance.toFixed(
                                                        2
                                                    )}
                                                </strong>
                                            </div>
                                        )
                                    )
                                )}
                            </div>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Dashboard;