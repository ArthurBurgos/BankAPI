import { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import "./Transactions.css";

interface Transaction {
    id: number;
    amount: number;
    date: string;
    type: string;
    accountId: number;
}

function Transactions() {
    const [transactions, setTransactions] =
        useState<Transaction[]>([]);

    const [isLoading, setIsLoading] =
        useState(true);

    const [errorMessage, setErrorMessage] =
        useState("");

    const [searchTerm, setSearchTerm] =
        useState("");

    const [typeFilter, setTypeFilter] =
        useState("all");

    useEffect(() => {
        const fetchTransactions = async () => {
            setIsLoading(true);
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
                    "http://localhost:5000/api/transactions",
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
                        "Unable to load transactions."
                    );
                }

                const data: Transaction[] =
                    await response.json();

                setTransactions(data);
            } catch (error) {
                console.error(
                    "Transactions error:",
                    error
                );

                setErrorMessage(
                    "Unable to load your transactions."
                );
            } finally {
                setIsLoading(false);
            }
        };

        fetchTransactions();
    }, []);

    const isIncomingTransaction = (
        type: string
    ) => {
        return (
            type === "Deposit" ||
            type === "Transfer In"
        );
    };

    const getTransactionDescription = (
        type: string
    ) => {
        switch (type) {
            case "Deposit":
                return "Deposit";

            case "Withdrawal":
                return "Withdrawal";

            case "Transfer In":
                return "Transfer received";

            case "Transfer Out":
                return "Transfer sent";

            default:
                return type;
        }
    };

    const getTransactionClass = (
        type: string
    ) => {
        return type
            .toLowerCase()
            .replaceAll(" ", "-");
    };

    const getTransactionIcon = (
        type: string
    ) => {
        switch (type) {
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

    const filteredTransactions =
        useMemo(() => {
            return transactions.filter(
                (transaction) => {
                    const description =
                        getTransactionDescription(
                            transaction.type
                        ).toLowerCase();

                    const type =
                        transaction.type.toLowerCase();

                    const search =
                        searchTerm
                            .trim()
                            .toLowerCase();

                    const matchesSearch =
                        !search ||
                        description.includes(search) ||
                        type.includes(search) ||
                        transaction.accountId
                            .toString()
                            .includes(search) ||
                        transaction.id
                            .toString()
                            .includes(search);

                    let matchesType = true;

                    if (typeFilter === "deposit") {
                        matchesType =
                            transaction.type ===
                            "Deposit";
                    }

                    if (typeFilter === "withdrawal") {
                        matchesType =
                            transaction.type ===
                            "Withdrawal";
                    }

                    if (typeFilter === "transfer") {
                        matchesType =
                            transaction.type ===
                                "Transfer In" ||
                            transaction.type ===
                                "Transfer Out";
                    }

                    return (
                        matchesSearch &&
                        matchesType
                    );
                }
            );
        }, [
            transactions,
            searchTerm,
            typeFilter,
        ]);

    const totalIncoming =
        transactions
            .filter((transaction) =>
                isIncomingTransaction(
                    transaction.type
                )
            )
            .reduce(
                (total, transaction) =>
                    total + transaction.amount,
                0
            );

    const totalOutgoing =
        transactions
            .filter(
                (transaction) =>
                    !isIncomingTransaction(
                        transaction.type
                    )
            )
            .reduce(
                (total, transaction) =>
                    total + transaction.amount,
                0
            );

    const totalTransfers =
        transactions.filter(
            (transaction) =>
                transaction.type ===
                    "Transfer In" ||
                transaction.type ===
                    "Transfer Out"
        ).length;

    return (
        <div className="transactions-page">
            <Sidebar />

            <main className="transactions-main">
                <Header />

                <div className="transactions-page-header">
                    <div>
                        <span className="transactions-eyebrow">
                            ACTIVITY
                        </span>

                        <h2>
                            Transactions
                        </h2>

                        <p>
                            Review your Bankly account
                            activity and transaction history.
                        </p>
                    </div>
                </div>

                <section className="transactions-summary">
                    <div>
                        <span>
                            Total Transactions
                        </span>

                        <strong>
                            {isLoading
                                ? "..."
                                : transactions.length}
                        </strong>

                        <small>
                            Recorded activity
                        </small>
                    </div>

                    <div>
                        <span>
                            Money In
                        </span>

                        <strong className="summary-positive">
                            {isLoading
                                ? "..."
                                : `+€${totalIncoming.toFixed(
                                      2
                                  )}`}
                        </strong>

                        <small>
                            Deposits and incoming transfers
                        </small>
                    </div>

                    <div>
                        <span>
                            Money Out
                        </span>

                        <strong className="summary-negative">
                            {isLoading
                                ? "..."
                                : `-€${totalOutgoing.toFixed(
                                      2
                                  )}`}
                        </strong>

                        <small>
                            Withdrawals and transfers
                        </small>
                    </div>

                    <div>
                        <span>
                            Transfers
                        </span>

                        <strong className="summary-purple">
                            {isLoading
                                ? "..."
                                : totalTransfers}
                        </strong>

                        <small>
                            Transfer operations
                        </small>
                    </div>
                </section>

                {errorMessage && (
                    <div className="transactions-message error">
                        {errorMessage}
                    </div>
                )}

                <section className="transactions-container">
                    <div className="transactions-toolbar">
                        <div className="transaction-search">
                            <span className="search-icon">
                                ⌕
                            </span>

                            <input
                                type="text"
                                placeholder="Search by type, transaction ID or account..."
                                value={searchTerm}
                                onChange={(event) =>
                                    setSearchTerm(
                                        event.target.value
                                    )
                                }
                            />

                            {searchTerm && (
                                <button
                                    type="button"
                                    className="clear-search"
                                    onClick={() =>
                                        setSearchTerm("")
                                    }
                                >
                                    ×
                                </button>
                            )}
                        </div>

                        <div className="transactions-filter">
                            <span>
                                Filter
                            </span>

                            <select
                                value={typeFilter}
                                onChange={(event) =>
                                    setTypeFilter(
                                        event.target.value
                                    )
                                }
                            >
                                <option value="all">
                                    All transactions
                                </option>

                                <option value="deposit">
                                    Deposits
                                </option>

                                <option value="withdrawal">
                                    Withdrawals
                                </option>

                                <option value="transfer">
                                    Transfers
                                </option>
                            </select>
                        </div>
                    </div>

                    <div className="transactions-table-heading">
                        <div>
                            <strong>
                                Transaction History
                            </strong>

                            <span>
                                {isLoading
                                    ? "Loading..."
                                    : `${filteredTransactions.length} ${
                                          filteredTransactions.length ===
                                          1
                                              ? "result"
                                              : "results"
                                      }`}
                            </span>
                        </div>
                    </div>

                    <div className="transactions-table-wrapper">
                        <table className="transactions-table">
                            <thead>
                                <tr>
                                    <th>
                                        Transaction
                                    </th>

                                    <th>
                                        Account
                                    </th>

                                    <th>
                                        Date
                                    </th>

                                    <th>
                                        Type
                                    </th>

                                    <th className="amount-column">
                                        Amount
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {isLoading ? (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className="transactions-state"
                                        >
                                            Loading transactions...
                                        </td>
                                    </tr>
                                ) : filteredTransactions.length ===
                                  0 ? (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className="transactions-state"
                                        >
                                            <strong>
                                                No transactions found
                                            </strong>

                                            <span>
                                                Try changing your search
                                                or filter.
                                            </span>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredTransactions.map(
                                        (
                                            transaction
                                        ) => {
                                            const incoming =
                                                isIncomingTransaction(
                                                    transaction.type
                                                );

                                            const transactionClass =
                                                getTransactionClass(
                                                    transaction.type
                                                );

                                            return (
                                                <tr
                                                    key={
                                                        transaction.id
                                                    }
                                                >
                                                    <td>
                                                        <div className="transaction-table-info">
                                                            <div
                                                                className={`transaction-table-icon ${transactionClass}`}
                                                            >
                                                                {getTransactionIcon(
                                                                    transaction.type
                                                                )}
                                                            </div>

                                                            <div>
                                                                <strong>
                                                                    {getTransactionDescription(
                                                                        transaction.type
                                                                    )}
                                                                </strong>

                                                                <span>
                                                                    Transaction #
                                                                    {
                                                                        transaction.id
                                                                    }
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td>
                                                        <div className="transaction-account">
                                                            <span className="account-mini-icon">
                                                                €
                                                            </span>

                                                            <span>
                                                                Account #
                                                                {
                                                                    transaction.accountId
                                                                }
                                                            </span>
                                                        </div>
                                                    </td>

                                                    <td>
                                                        <span className="transaction-date">
                                                            {formatDate(
                                                                transaction.date
                                                            )}
                                                        </span>
                                                    </td>

                                                    <td>
                                                        <span
                                                            className={`transaction-type ${transactionClass}`}
                                                        >
                                                            {
                                                                transaction.type
                                                            }
                                                        </span>
                                                    </td>

                                                    <td className="amount-column">
                                                        <strong
                                                            className={
                                                                incoming
                                                                    ? "amount-positive"
                                                                    : "amount-negative"
                                                            }
                                                        >
                                                            {incoming
                                                                ? "+"
                                                                : "-"}
                                                            €
                                                            {transaction.amount.toFixed(
                                                                2
                                                            )}
                                                        </strong>
                                                    </td>
                                                </tr>
                                            );
                                        }
                                    )
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </main>
        </div>
    );
}

export default Transactions;