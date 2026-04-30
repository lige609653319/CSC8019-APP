import React from 'react'
import { Card, List, SpinLoading, Button, NavBar } from 'antd-mobile'
import { Gift, User, LogOut } from 'lucide-react'
import '../App.css'

function LoyaltyClubSection({ balance, transactions = [], loading, error, onRefresh, username, onLogout }) {
  const displayUsername = username || balance?.username || 'Member';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <NavBar className="nav-bar" back={null}>
        <span style={{ fontWeight: 'bold', color: '#6F4E37', fontSize: '18px' }}>Profile</span>
      </NavBar>
      <div className="content-scroll" style={{ backgroundColor: '#F5F5F7' }}>
        <div style={{ padding: '16px' }}>
          <div className="user-profile-header" style={{ padding: '20px 16px', marginBottom: 12, backgroundColor: '#fff', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <div style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: '#6F4E37', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              <User size={32} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#333' }}>{displayUsername}</div>
              <div style={{ fontSize: 14, color: '#666' }}>Welcome back to Coffee Shop</div>
            </div>
          </div>

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

          <div style={{ padding: '0 16px', marginTop: 30 }}>
            <Button 
              block 
              color='danger' 
              fill='outline' 
              onClick={onLogout}
              style={{ 
                borderRadius: 12, 
                height: 50, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                gap: 8,
                fontSize: 16,
                fontWeight: 600,
                borderWidth: 1.5
              }}
            >
              <LogOut size={20} />
              Logout
            </Button>
          </div>
          <div style={{ height: 40 }} />
        </div>
      </div>
    </div>
  )
}

export default LoyaltyClubSection
