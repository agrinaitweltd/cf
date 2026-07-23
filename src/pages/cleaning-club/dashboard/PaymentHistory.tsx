import { useMembershipData } from './useMembershipData'
import styles from './Dashboard.module.css'
import tableStyles from './DataTable.module.css'

export default function PaymentHistory() {
  const { loading, payments } = useMembershipData()

  if (loading) return <main style={{ minHeight: '40vh' }} />

  return (
    <>
      <h1 className={styles.welcome}>Payment History</h1>
      <p className={styles.subIntro}>All payments taken for your Clean Club membership.</p>

      {payments.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No payments yet. Your first payment will appear here once your membership is active.</p>
        </div>
      ) : (
        <div className={tableStyles.tableWrap}>
          <table className={tableStyles.table}>
            <thead>
              <tr>
                <th>Payment Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Invoice</th>
                <th>Download</th>
              </tr>
            </thead>
            <tbody>
              {payments.map(payment => (
                <tr key={payment.id}>
                  <td>{payment.paid_at ? new Date(payment.paid_at).toLocaleDateString('en-GB') : new Date(payment.created_at).toLocaleDateString('en-GB')}</td>
                  <td>£{Number(payment.amount).toFixed(2)}</td>
                  <td><span className={tableStyles.badge}>{payment.status}</span></td>
                  <td>{payment.stripe_invoice_id ?? '—'}</td>
                  <td>
                    {payment.invoice_pdf_url ? (
                      <a href={payment.invoice_pdf_url} target="_blank" rel="noreferrer" style={{ color: 'var(--accent)', fontWeight: 600 }}>
                        Download
                      </a>
                    ) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
