import "./SummaryCard.css";

interface SummaryCardProps {
    title: string;
    value: string;
}

function SummaryCard({
    title,
    value,
}: SummaryCardProps) {
    return (
        <div className="summary-card">

            <div className="summary-card-header">
                <span>
                    {title}
                </span>

                <div className="summary-card-dot"></div>
            </div>

            <h2>
                {value}
            </h2>

        </div>
    );
}

export default SummaryCard;