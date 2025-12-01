"use client"

const payouts = [
  { amount: "$500.00", date: "10 Aug 2024, 10:12 AM", status: "Paid" },
  { amount: "$250.00", date: "10 Aug 2024, 08:20 AM", status: "Pending" },
  { amount: "$1,250.00", date: "09 Aug 2024, 08:00 PM", status: "Paid" },
  { amount: "$250.00", date: "10 Aug 2024, 08:20 AM", status: "Pending" },
  { amount: "$1,250.00", date: "09 Aug 2024, 08:00 PM", status: "Paid" },
]

export default function PayoutHistory() {
  return (
    <div className="bg-card border border-border rounded-lg p-6 h-full flex flex-col">
      <h3 className="text-lg font-bold text-foreground mb-4">Payout History</h3>

      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 text-muted-foreground font-medium">Amount</th>
              <th className="text-left py-2 text-muted-foreground font-medium">Date</th>
              <th className="text-left py-2 text-muted-foreground font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {payouts.map((payout, idx) => (
              <tr key={idx} className="hover:bg-muted/30 transition-colors">
                <td className="py-3 font-semibold text-foreground">{payout.amount}</td>
                <td className="py-3 text-muted-foreground text-xs">{payout.date}</td>
                <td className="py-3">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      payout.status === "Paid"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                    }`}
                  >
                    {payout.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
