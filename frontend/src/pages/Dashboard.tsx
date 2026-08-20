import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import "./Dashboard.css";

interface Transaction {
    id: number;
    type: "Deposit" | "Withdrawal" | "Transfer";
    description: string;
    date: string;
    amount: number;
}

interface Account {
    id: number;
    accountNumber: string;
    balance: number;
    isActive: boolean;
}

const mockTransactions: Transaction[] = [
    {
        id: 1,
        type: "Deposit",
        description: "Salary",
        date: "Aug 18, 2026",
        amount: 1500,
    },
    {
        id: 2,
        type: "Withdrawal",
        description: "Grocery Store",
        date: "Aug 17, 2026",
        amount: -85.5,
    },
    {
        id: 3,
        type: "Transfer",
        description: "Transfer to savings",
        date: "Aug 16, 2026",
        amount: -250,
    },
];

const mockAccounts: Account[] = [
    {
        id: 1,
        accountNumber: "**** 4821",
        balance: 2450.5,
        isActive: true,
    },
    {
        id: 2,
        accountNumber: "**** 7319",
        balance: 850,
        isActive: true,
    },
];

function Dashboard() {
    const totalBalance = mockAccounts.reduce(
        (total, account) =>
            total + account.balance,
        0
    );

    const income = mockTransactions
        .filter(
            (transaction) =>
                transaction.amount > 0
        )
        .reduce(
            (total, transaction) =>
                total + transaction.amount,
            0
        );

    const expenses = mockTransactions
        .filter(
            (transaction) =>
                transaction.amount < 0
        )
        .reduce(
            (total, transaction) =>
                total +
                Math.abs(transaction.amount),
            0
        );

    const activeAccounts =
        mockAccounts.filter(
            (account) => account.isActive
        ).length;

    return (
        <div className="dashboard">
            <Sidebar />

            <main className="dashboard-main">
                <Header />

                <div className="dashboard-content">
                    <section className="balance-overview">
                        <div className="balance-card">
                            <div className="balance-card-top">
                                <div>
                                    <span className="eyebrow">
                                        TOTAL BALANCE
                                    </span>

                                    <h2>
                                        €
                                        {totalBalance.toFixed(
                                            2
                                        )}
                                    </h2>
                                </div>

                                <div className="balance-status">
                                    <span className="status-dot" />

                                    All accounts active
                                </div>
                            </div>

                            <div className="balance-card-bottom">
                                <span>
                                    Available balance across your accounts
                                </span>

                                <strong>
                                    Bankly
                                </strong>
                            </div>
                        </div>

                        <div className="overview-stat">
                            <span>
                                Income
                            </span>

                            <strong className="positive">
                                +€
                                {income.toFixed(2)}
                            </strong>

                            <small>
                                This period
                            </small>
                        </div>

                        <div className="overview-stat">
                            <span>
                                Expenses
                            </span>

                            <strong className="negative">
                                -€
                                {expenses.toFixed(2)}
                            </strong>

                            <small>
                                This period
                            </small>
                        </div>

                        <div className="overview-stat">
                            <span>
                                Accounts
                            </span>

                            <strong>
                                {activeAccounts}
                            </strong>

                            <small>
                                Active accounts
                            </small>
                        </div>
                    </section>

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
                            <button className="quick-action">
                                <span className="quick-action-icon">
                                    +
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

                            <button className="quick-action">
                                <span className="quick-action-icon">
                                    ↓
                                </span>

                                <span className="quick-action-content">
                                    <strong>
                                        Withdraw
                                    </strong>

                                    <small>
                                        Withdraw funds
                                    </small>
                                </span>

                                <span className="quick-action-arrow">
                                    →
                                </span>
                            </button>

                            <button className="quick-action">
                                <span className="quick-action-icon">
                                    →
                                </span>

                                <span className="quick-action-content">
                                    <strong>
                                        Transfer
                                    </strong>

                                    <small>
                                        Send money to an account
                                    </small>
                                </span>

                                <span className="quick-action-arrow">
                                    →
                                </span>
                            </button>
                        </div>
                    </section>

                    <div className="dashboard-grid">
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

                                <button className="panel-link">
                                    View all
                                </button>
                            </div>

                            <div className="transactions-list">
                                {mockTransactions.map(
                                    (transaction) => (
                                        <div
                                            className="transaction-item"
                                            key={
                                                transaction.id
                                            }
                                        >
                                            <div className="transaction-info">
                                                <div
                                                    className={`transaction-icon ${transaction.type.toLowerCase()}`}
                                                >
                                                    {transaction.type ===
                                                    "Deposit"
                                                        ? "+"
                                                        : transaction.type ===
                                                            "Withdrawal"
                                                          ? "-"
                                                          : "→"}
                                                </div>

                                                <div className="transaction-details">
                                                    <strong>
                                                        {
                                                            transaction.description
                                                        }
                                                    </strong>

                                                    <span>
                                                        {
                                                            transaction.date
                                                        }
                                                    </span>
                                                </div>
                                            </div>

                                            <strong
                                                className={
                                                    transaction.amount >=
                                                    0
                                                        ? "transaction-positive"
                                                        : "transaction-negative"
                                                }
                                            >
                                                {transaction.amount >=
                                                0
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
                                    )
                                )}
                            </div>
                        </section>

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

                                <button className="panel-link">
                                    View all
                                </button>
                            </div>

                            <div className="accounts-list">
                                {mockAccounts.map(
                                    (account) => (
                                        <div
                                            className="account-item"
                                            key={account.id}
                                        >
                                            <div className="account-main">
                                                <div className="account-icon">
                                                    €
                                                </div>

                                                <div>
                                                    <strong>
                                                        {
                                                            account.accountNumber
                                                        }
                                                    </strong>

                                                    <span>
                                                        <i />

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