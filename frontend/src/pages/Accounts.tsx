import {
    useEffect,
    useState,
    type FormEvent,
} from "react";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import "./Accounts.css";

interface Account {
    id: number;
    accountNumber: string;
    balance: number;
    isActive: boolean;
    customerId: number;
}

type AccountAction =
    | "deposit"
    | "withdraw"
    | null;

function Accounts() {
    const [accounts, setAccounts] =
        useState<Account[]>([]);

    const [isLoading, setIsLoading] =
        useState(true);

    const [errorMessage, setErrorMessage] =
        useState("");

    const [successMessage, setSuccessMessage] =
        useState("");

    const [showCreateForm, setShowCreateForm] =
        useState(false);

    const [newAccountNumber, setNewAccountNumber] =
        useState("");

    const [isCreating, setIsCreating] =
        useState(false);

    const [selectedAccountId, setSelectedAccountId] =
        useState<number | null>(null);

    const [accountAction, setAccountAction] =
        useState<AccountAction>(null);

    const [operationAmount, setOperationAmount] =
        useState("");

    const [isProcessing, setIsProcessing] =
        useState(false);

    const [detailsAccountId, setDetailsAccountId] =
        useState<number | null>(null);

    const [updatingAccountId, setUpdatingAccountId] =
        useState<number | null>(null);

    const fetchAccounts = async () => {
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
                "Accounts error:",
                error
            );

            setErrorMessage(
                "Unable to load your accounts."
            );
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAccounts();
    }, []);

    const handleCreateAccount = async (
        event: FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        setErrorMessage("");
        setSuccessMessage("");

        if (!newAccountNumber.trim()) {
            setErrorMessage(
                "Please enter an account number."
            );
            return;
        }

        setIsCreating(true);

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
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        accountNumber:
                            newAccountNumber.trim(),
                    }),
                }
            );

            if (!response.ok) {
                const errorText =
                    await response.text();

                setErrorMessage(
                    errorText ||
                        "Unable to create account."
                );
                return;
            }

            const createdAccount: Account =
                await response.json();

            setAccounts((currentAccounts) => [
                ...currentAccounts,
                createdAccount,
            ]);

            setNewAccountNumber("");
            setShowCreateForm(false);

            setSuccessMessage(
                "Account created successfully."
            );
        } catch (error) {
            console.error(
                "Create account error:",
                error
            );

            setErrorMessage(
                "Unable to create account."
            );
        } finally {
            setIsCreating(false);
        }
    };

    const openAccountAction = (
        accountId: number,
        action: AccountAction
    ) => {
        setSelectedAccountId(accountId);
        setAccountAction(action);
        setOperationAmount("");

        setDetailsAccountId(null);

        setErrorMessage("");
        setSuccessMessage("");
    };

    const closeAccountAction = () => {
        setSelectedAccountId(null);
        setAccountAction(null);
        setOperationAmount("");
    };

    const toggleDetails = (
        accountId: number
    ) => {
        closeAccountAction();

        setDetailsAccountId(
            (currentAccountId) =>
                currentAccountId === accountId
                    ? null
                    : accountId
        );
    };

    const handleAccountOperation = async (
        event: FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        setErrorMessage("");
        setSuccessMessage("");

        if (
            selectedAccountId === null ||
            accountAction === null
        ) {
            return;
        }

        const amount =
            Number(operationAmount);

        if (
            !Number.isFinite(amount) ||
            amount <= 0
        ) {
            setErrorMessage(
                "Amount must be greater than zero."
            );
            return;
        }

        setIsProcessing(true);

        try {
            const token =
                localStorage.getItem("token");

            if (!token) {
                setErrorMessage(
                    "Authentication token not found."
                );
                return;
            }

            const endpoint =
                accountAction === "deposit"
                    ? "deposit"
                    : "withdraw";

            const response = await fetch(
                `http://localhost:5000/api/accounts/${selectedAccountId}/${endpoint}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        amount,
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
                        `Unable to ${accountAction}.`
                );

                return;
            }

            const updatedAccount: Account =
                await response.json();

            setAccounts((currentAccounts) =>
                currentAccounts.map(
                    (account) =>
                        account.id ===
                        updatedAccount.id
                            ? updatedAccount
                            : account
                )
            );

            setSuccessMessage(
                accountAction === "deposit"
                    ? `Deposit of €${amount.toFixed(
                          2
                      )} completed successfully.`
                    : `Withdrawal of €${amount.toFixed(
                          2
                      )} completed successfully.`
            );

            closeAccountAction();
        } catch (error) {
            console.error(
                "Account operation error:",
                error
            );

            setErrorMessage(
                "Unable to complete the operation."
            );
        } finally {
            setIsProcessing(false);
        }
    };

    const handleToggleAccountStatus = async (
        account: Account
    ) => {
        setErrorMessage("");
        setSuccessMessage("");

        setUpdatingAccountId(account.id);

        try {
            const token =
                localStorage.getItem("token");

            if (!token) {
                setErrorMessage(
                    "Authentication token not found."
                );
                return;
            }

            const newStatus =
                !account.isActive;

            const response = await fetch(
                `http://localhost:5000/api/accounts/${account.id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        isActive: newStatus,
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
                        "Unable to update account status."
                );
                return;
            }

            setAccounts((currentAccounts) =>
                currentAccounts.map(
                    (currentAccount) =>
                        currentAccount.id ===
                        account.id
                            ? {
                                  ...currentAccount,
                                  isActive:
                                      newStatus,
                              }
                            : currentAccount
                )
            );

            setSuccessMessage(
                newStatus
                    ? "Account activated successfully."
                    : "Account deactivated successfully."
            );

            closeAccountAction();
        } catch (error) {
            console.error(
                "Account status error:",
                error
            );

            setErrorMessage(
                "Unable to update account status."
            );
        } finally {
            setUpdatingAccountId(null);
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

    const totalBalance = accounts.reduce(
        (total, account) =>
            total + account.balance,
        0
    );

    const activeAccounts =
        accounts.filter(
            (account) => account.isActive
        ).length;

    return (
        <div className="accounts-page">
            <Sidebar />

            <main className="accounts-main">
                <Header />

                <div className="accounts-page-header">
                    <div>
                        <span className="accounts-eyebrow">
                            BANKING
                        </span>

                        <h2>
                            My Accounts
                        </h2>

                        <p>
                            Manage your Bankly accounts,
                            balances and account status.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="create-account-button"
                        onClick={() =>
                            setShowCreateForm(
                                !showCreateForm
                            )
                        }
                    >
                        {showCreateForm
                            ? "Cancel"
                            : "+ Create Account"}
                    </button>
                </div>

                <section className="accounts-summary">
                    <div>
                        <span>
                            Total Balance
                        </span>

                        <strong>
                            {isLoading
                                ? "..."
                                : `€${totalBalance.toFixed(
                                      2
                                  )}`}
                        </strong>
                    </div>

                    <div>
                        <span>
                            Total Accounts
                        </span>

                        <strong>
                            {isLoading
                                ? "..."
                                : accounts.length}
                        </strong>
                    </div>

                    <div>
                        <span>
                            Active Accounts
                        </span>

                        <strong className="summary-active">
                            {isLoading
                                ? "..."
                                : activeAccounts}
                        </strong>
                    </div>
                </section>

                {errorMessage && (
                    <div className="accounts-message error">
                        {errorMessage}
                    </div>
                )}

                {successMessage && (
                    <div className="accounts-message success">
                        {successMessage}
                    </div>
                )}

                {showCreateForm && (
                    <form
                        className="create-account-panel"
                        onSubmit={
                            handleCreateAccount
                        }
                    >
                        <div>
                            <span className="accounts-eyebrow">
                                NEW ACCOUNT
                            </span>

                            <h3>
                                Create Bankly Account
                            </h3>

                            <p>
                                Choose an account number for
                                your new account.
                            </p>
                        </div>

                        <div className="create-account-fields">
                            <input
                                id="new-account-number"
                                type="text"
                                value={
                                    newAccountNumber
                                }
                                onChange={(event) =>
                                    setNewAccountNumber(
                                        event.target
                                            .value
                                    )
                                }
                                placeholder="Example: BKLY-0003"
                            />

                            <button
                                type="submit"
                                className="create-account-button"
                                disabled={
                                    isCreating
                                }
                            >
                                {isCreating
                                    ? "Creating..."
                                    : "Create Account"}
                            </button>
                        </div>
                    </form>
                )}

                <section className="accounts-grid">
                    {isLoading ? (
                        <div className="accounts-empty">
                            Loading accounts...
                        </div>
                    ) : accounts.length === 0 ? (
                        <div className="accounts-empty">
                            <strong>
                                No accounts yet
                            </strong>

                            <span>
                                Create your first Bankly
                                account to get started.
                            </span>
                        </div>
                    ) : (
                        accounts.map((account) => (
                            <article
                                className={`account-card ${
                                    account.isActive
                                        ? ""
                                        : "account-card-inactive"
                                }`}
                                key={account.id}
                            >
                                <div className="account-card-accent" />

                                <div className="account-card-header">
                                    <div className="account-identity">
                                        <div className="account-symbol">
                                            €
                                        </div>

                                        <div>
                                            <span className="account-label">
                                                Bankly Account
                                            </span>

                                            <h3>
                                                {maskAccountNumber(
                                                    account.accountNumber
                                                )}
                                            </h3>
                                        </div>
                                    </div>

                                    <span
                                        className={
                                            account.isActive
                                                ? "account-status active"
                                                : "account-status inactive"
                                        }
                                    >
                                        <i />

                                        {account.isActive
                                            ? "Active"
                                            : "Inactive"}
                                    </span>
                                </div>

                                <div className="account-card-balance">
                                    <span>
                                        Available Balance
                                    </span>

                                    <strong>
                                        €
                                        {account.balance.toFixed(
                                            2
                                        )}
                                    </strong>

                                    <small>
                                        Account ID #{account.id}
                                    </small>
                                </div>

                                <div className="account-card-actions">
                                    <button
                                        type="button"
                                        className="account-action deposit"
                                        onClick={() =>
                                            openAccountAction(
                                                account.id,
                                                "deposit"
                                            )
                                        }
                                        disabled={
                                            !account.isActive
                                        }
                                    >
                                        <span>↓</span>

                                        Deposit
                                    </button>

                                    <button
                                        type="button"
                                        className="account-action withdraw"
                                        onClick={() =>
                                            openAccountAction(
                                                account.id,
                                                "withdraw"
                                            )
                                        }
                                        disabled={
                                            !account.isActive
                                        }
                                    >
                                        <span>↑</span>

                                        Withdraw
                                    </button>

                                    <button
                                        type="button"
                                        className="account-action details"
                                        onClick={() =>
                                            toggleDetails(
                                                account.id
                                            )
                                        }
                                    >
                                        <span>•••</span>

                                        {detailsAccountId ===
                                        account.id
                                            ? "Hide"
                                            : "Details"}
                                    </button>
                                </div>

                                {selectedAccountId ===
                                    account.id &&
                                    accountAction && (
                                        <form
                                            className="account-operation-panel"
                                            onSubmit={
                                                handleAccountOperation
                                            }
                                        >
                                            <div className="operation-title">
                                                <span
                                                    className={`operation-icon ${
                                                        accountAction ===
                                                        "deposit"
                                                            ? "deposit"
                                                            : "withdraw"
                                                    }`}
                                                >
                                                    {accountAction ===
                                                    "deposit"
                                                        ? "↓"
                                                        : "↑"}
                                                </span>

                                                <div>
                                                    <strong>
                                                        {accountAction ===
                                                        "deposit"
                                                            ? "Deposit Money"
                                                            : "Withdraw Money"}
                                                    </strong>

                                                    <span>
                                                        Current balance:
                                                        {" "}
                                                        €
                                                        {account.balance.toFixed(
                                                            2
                                                        )}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="operation-fields">
                                                <div className="operation-amount">
                                                    <span>
                                                        €
                                                    </span>

                                                    <input
                                                        id={`operation-${account.id}`}
                                                        type="number"
                                                        min="0.01"
                                                        step="0.01"
                                                        value={
                                                            operationAmount
                                                        }
                                                        onChange={(
                                                            event
                                                        ) =>
                                                            setOperationAmount(
                                                                event
                                                                    .target
                                                                    .value
                                                            )
                                                        }
                                                        placeholder="0.00"
                                                    />
                                                </div>

                                                <button
                                                    type="submit"
                                                    className="operation-confirm"
                                                    disabled={
                                                        isProcessing
                                                    }
                                                >
                                                    {isProcessing
                                                        ? "Processing..."
                                                        : "Confirm"}
                                                </button>

                                                <button
                                                    type="button"
                                                    className="operation-cancel"
                                                    onClick={
                                                        closeAccountAction
                                                    }
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </form>
                                    )}

                                {detailsAccountId ===
                                    account.id && (
                                    <div className="account-details-panel">
                                        <div className="details-heading">
                                            <div>
                                                <span className="accounts-eyebrow">
                                                    ACCOUNT
                                                </span>

                                                <h4>
                                                    Account Details
                                                </h4>
                                            </div>

                                            <span
                                                className={
                                                    account.isActive
                                                        ? "details-status active"
                                                        : "details-status inactive"
                                                }
                                            >
                                                {account.isActive
                                                    ? "Active"
                                                    : "Inactive"}
                                            </span>
                                        </div>

                                        <div className="details-grid">
                                            <div>
                                                <span>
                                                    Account ID
                                                </span>

                                                <strong>
                                                    #
                                                    {
                                                        account.id
                                                    }
                                                </strong>
                                            </div>

                                            <div>
                                                <span>
                                                    Customer ID
                                                </span>

                                                <strong>
                                                    #
                                                    {
                                                        account.customerId
                                                    }
                                                </strong>
                                            </div>

                                            <div>
                                                <span>
                                                    Account Number
                                                </span>

                                                <strong>
                                                    {
                                                        account.accountNumber
                                                    }
                                                </strong>
                                            </div>

                                            <div>
                                                <span>
                                                    Available Balance
                                                </span>

                                                <strong>
                                                    €
                                                    {account.balance.toFixed(
                                                        2
                                                    )}
                                                </strong>
                                            </div>
                                        </div>

                                        <div className="details-footer">
                                            <div>
                                                <strong>
                                                    Account Status
                                                </strong>

                                                <span>
                                                    {account.isActive
                                                        ? "This account can perform banking operations."
                                                        : "Banking operations are disabled for this account."}
                                                </span>
                                            </div>

                                            <button
                                                type="button"
                                                className={
                                                    account.isActive
                                                        ? "status-button deactivate"
                                                        : "status-button activate"
                                                }
                                                onClick={() =>
                                                    handleToggleAccountStatus(
                                                        account
                                                    )
                                                }
                                                disabled={
                                                    updatingAccountId ===
                                                    account.id
                                                }
                                            >
                                                {updatingAccountId ===
                                                account.id
                                                    ? "Updating..."
                                                    : account.isActive
                                                      ? "Deactivate"
                                                      : "Activate"}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </article>
                        ))
                    )}
                </section>
            </main>
        </div>
    );
}

export default Accounts;