import React from 'react'
import { Card, List, SpinLoading } from 'antd-mobile'
import { Gift } from 'lucide-react'
import '../App.css'

function LoyaltyClubSection({ balance, transactions = [], loading, error, onRefresh }) {
  return (
    <>
      <h2 className="section-title">Loyalty Club</h2>
      <Card className="promo-card loyalty-club-card">
        {loading ? (
          <div style={{ padding: 24, textAlign: 'center' }}>
            <SpinLoading style={{ '--size': '32px' }} />
            <div style={{ marginTop: 8, color: '#888' }}>Loading…</div>
          </div>
        ) : error ? (
          <div style={{ padding: 16, color: '#ff4d4f', fontSize: 14 }}>{error}</div>
        ) : (
          <>
            <div className="promo-info" style={{ paddingBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <Gift size={24} color="#6F4E37" />
                <span style={{ fontWeight: 700, fontSize: 18, color: '#333' }}>Points balance</span>
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#6F4E37' }}>
                {balance?.pointsBalance ?? 0} <span style={{ fontSize: 14, fontWeight: 500, color: '#666' }}>pts</span>
              </div>
              <p style={{ margin: '12px 0 0', fontSize: 13, color: '#666' }}>
                Earn points with every order. Redeem for rewards and get your 10th coffee free!
              </p>
            </div>
            {Array.isArray(transactions) && transactions.length > 0 && (
              <div style={{ borderTop: '1px solid #eee', marginTop: 12, paddingTop: 12 }}>
                <div style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>Recent activity</div>
                <List style={{ '--border-inner': 'none', '--border-top': 'none', '--border-bottom': 'none' }}>
                  {transactions.map((tx) => (
                    <List.Item
                      key={tx.id}
                      description={tx.note || (tx.type === 'EARN' ? 'Earned' : tx.type === 'REDEEM' ? 'Redeemed' : 'Adjustment')}
                    >
                      <span style={{ fontWeight: 500 }}>
                        {tx.type === 'EARN' && '+'}
                        {tx.type === 'REDEEM' && '−'}
                        {tx.points} pts
                      </span>
                    </List.Item>
                  ))}
                </List>
              </div>
            )}
          </>
        )}
      </Card>
    </>
  )
}

export default LoyaltyClubSection
