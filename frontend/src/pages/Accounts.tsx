import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import "./Accounts.css";

interface Account {
    id: number;
    accountNumber: string;
    balance: number;
    isActive: boolean;
}

const mockAccounts: Account[] = [
    {
        id: 1,
        accountNumber: "**** 4821",
        balance: 2450.50,
        isActive: true,
    },
    {
        id: 2,
        accountNumber: "**** 7319",
        balance: 850.00,
        isActive: true,
    },
];

function Accounts() {
    return (
        <div className="accounts-page">
            <Sidebar />

            <main className="accounts-main">
                <Header />

                <div className="accounts-page-header">
                    <div>
                        <h2>My Accounts</h2>
                        <p>
                            Manage your Bankly accounts.
                        </p>
                    </div>

                    <button className="create-account-button">
                        + Create Account
                    </button>
                </div>

                <section className="accounts-grid">
                    {mockAccounts.map((account) => (
                        <div
                            className="account-card"
                            key={account.id}
                        >
                            <div className="account-card-header">
                                <div>
                                    <span className="account-label">
                                        Bankly Account
                                    </span>

                                    <h3>
                                        {account.accountNumber}
                                    </h3>
                                </div>

                                <span
                                    className={
                                        account.isActive
                                            ? "account-status active"
                                            : "account-status inactive"
                                    }
                                >
                                    {account.isActive
                                        ? "Active"
                                        : "Inactive"}
                                </span>
                            </div>

                            <div className="account-card-balance">
                                <span>Available Balance</span>

                                <strong>
                                    €
                                    {account.balance.toFixed(
                                        2
                                    )}
                                </strong>
                            </div>

                            <div className="account-card-actions">
                                <button>
                                    Deposit
                                </button>

                                <button>
                                    Withdraw
                                </button>

                                <button>
                                    Details
                                </button>
                            </div>
                        </div>
                    ))}
                </section>
            </main>
        </div>
    );
}

export default Accounts;