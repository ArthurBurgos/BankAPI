import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import "./Transactions.css";

interface Transaction {
    id: number;
    type: "Deposit" | "Withdrawal" | "Transfer In" | "Transfer Out";
    description: string;
    account: string;
    date: string;
    amount: number;
}

const mockTransactions: Transaction[] = [
    {
        id: 1,
        type: "Deposit",
        description: "Salary",
        account: "**** 4821",
        date: "Aug 18, 2026",
        amount: 1500,
    },
    {
        id: 2,
        type: "Withdrawal",
        description: "Grocery Store",
        account: "**** 4821",
        date: "Aug 17, 2026",
        amount: -85.50,
    },
    {
        id: 3,
        type: "Transfer Out",
        description: "Transfer to savings",
        account: "**** 4821",
        date: "Aug 16, 2026",
        amount: -250,
    },
    {
        id: 4,
        type: "Deposit",
        description: "Freelance Payment",
        account: "**** 7319",
        date: "Aug 15, 2026",
        amount: 600,
    },
    {
        id: 5,
        type: "Transfer In",
        description: "Transfer received",
        account: "**** 7319",
        date: "Aug 14, 2026",
        amount: 300,
    },
];

function Transactions() {
    return (
        <div className="transactions-page">
            <Sidebar />

            <main className="transactions-main">
                <Header />

                <div className="transactions-page-header">
                    <div>
                        <h2>Transactions</h2>

                        <p>
                            View and manage your recent
                            transactions.
                        </p>
                    </div>
                </div>

                <section className="transactions-container">
                    <div className="transactions-toolbar">
                        <div className="transaction-search">
                            <input
                                type="text"
                                placeholder="Search transactions..."
                            />
                        </div>

                        <select defaultValue="all">
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

                                    <th>
                                        Amount
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {mockTransactions.map(
                                    (transaction) => (
                                        <tr
                                            key={
                                                transaction.id
                                            }
                                        >
                                            <td>
                                                <div className="transaction-table-info">
                                                    <div
                                                        className={`transaction-table-icon ${transaction.type
                                                            .toLowerCase()
                                                            .replace(
                                                                " ",
                                                                "-"
                                                            )}`}
                                                    >
                                                        {transaction.amount >=
                                                        0
                                                            ? "+"
                                                            : "-"}
                                                    </div>

                                                    <div>
                                                        <strong>
                                                            {
                                                                transaction.description
                                                            }
                                                        </strong>
                                                    </div>
                                                </div>
                                            </td>

                                            <td>
                                                {
                                                    transaction.account
                                                }
                                            </td>

                                            <td>
                                                {
                                                    transaction.date
                                                }
                                            </td>

                                            <td>
                                                <span
                                                    className={`transaction-type ${transaction.type
                                                        .toLowerCase()
                                                        .replace(
                                                            " ",
                                                            "-"
                                                        )}`}
                                                >
                                                    {
                                                        transaction.type
                                                    }
                                                </span>
                                            </td>

                                            <td>
                                                <strong
                                                    className={
                                                        transaction.amount >=
                                                        0
                                                            ? "amount-positive"
                                                            : "amount-negative"
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
                                            </td>
                                        </tr>
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