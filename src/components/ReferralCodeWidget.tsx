import React, { useState, useEffect } from 'react';
import { Copy, Check, UserPlus } from 'lucide-react';
import axios from 'axios';

interface ReferralCodeWidgetProps {
  className?: string;
}

const ReferralCodeWidget: React.FC<ReferralCodeWidgetProps> = ({
  className,
}) => {
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadReferralCode();
  }, []);

  const loadReferralCode = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/referral/my-code');

      if (response.data.success && response.data.stats?.current_code) {
        setReferralCode(response.data.stats.current_code);
      }
    } catch (err) {
      console.error('Error loading referral code:', err);
    } finally {
      setLoading(false);
    }
  };

  const createReferralCode = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.post('/api/referral/create-code');

      if (response.data.success) {
        setReferralCode(response.data.code);
      }
    } catch (err) {
      setError('Ошибка создания кода');
      console.error('Error creating referral code:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (loading && !referralCode) {
    return (
      <div
        className={className}
        style={{
          background: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(240, 240, 240, 0.24)',
        borderRight: '1px solid rgba(200, 200, 200, 0.322)',
        borderLeft: '1px solid rgba(200, 200, 200, 0.233)',
        borderBottom: '1px solid rgba(100, 100, 100, 0.486)',
          borderRadius: 'var(--main-border-radius)',
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60px',
        }}
      >
        <div
          style={{
            width: '20px',
            height: '20px',
            border: '2px solid rgba(255, 255, 255, 0.1)',
            borderTop: '2px solid #D0BCFF',
            borderRadius: 'var(--avatar-border-radius)',
            animation: 'spin 1s linear infinite',
          }}
        />
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div
      className={className}
      style={{
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(240, 240, 240, 0.24)',
        borderRight: '1px solid rgba(200, 200, 200, 0.322)',
        borderLeft: '1px solid rgba(200, 200, 200, 0.233)',
        borderBottom: '1px solid rgba(100, 100, 100, 0.486)',
        borderRadius: 'var(--main-border-radius)',
        padding: '16px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '12px',
        }}
      >
        <div
          style={{
            background: 'linear-gradient(135deg, #D0BCFF 0%, #b388ff 100%)',
            borderRadius: 'var(--small-border-radius)',
            padding: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <UserPlus size={16} color='#000000' />
        </div>
        <div
          style={{
            fontSize: '14px',
            fontWeight: '600',
            color: 'var(--theme-text-primary)',
          }}
        >
          Реферальный код
        </div>
      </div>

      {error && (
        <div
          style={{
            fontSize: '12px',
            color: '#f44336',
            marginBottom: '8px',
          }}
        >
          {error}
        </div>
      )}

      {referralCode ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: 'var(--small-border-radius)',
            padding: '12px',
            borderTop: '1px solid rgba(240, 240, 240, 0.24)',
        borderRight: '1px solid rgba(200, 200, 200, 0.322)',
        borderLeft: '1px solid rgba(200, 200, 200, 0.233)',
        borderBottom: '1px solid rgba(100, 100, 100, 0.486)',
          }}
        >
          <div
            style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#D0BCFF',
              fontFamily: 'monospace',
              letterSpacing: '0.5px',
              flex: 1,
            }}
          >
            {referralCode}
          </div>
          <button
            onClick={() => copyToClipboard(referralCode)}
            style={{
              background: copied ? '#4caf50' : 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              borderRadius: 'var(--small-border-radius)',
              padding: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
            }}
          >
            {copied ? (
              <Check size={14} color='var(--theme-text-primary)' />
            ) : (
              <Copy size={14} color='var(--theme-text-primary)' />
            )}
          </button>
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div
            style={{
              fontSize: '13px',
              color: 'rgba(255, 255, 255, 0.7)',
              flex: 1,
            }}
          >
            Создайте код для приглашения друзей
          </div>
          <button
            onClick={createReferralCode}
            disabled={loading}
            style={{
              background: 'linear-gradient(135deg, #D0BCFF 0%, #b388ff 100%)',
              border: 'none',
              borderRadius: 'var(--small-border-radius)',
              padding: '8px 12px',
              color: '#000000',
              fontSize: '12px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              transition: 'all 0.2s ease',
            }}
          >
            {loading ? 'Создание...' : 'Создать'}
          </button>
        </div>
      )}
    </div>
  );
};

export default ReferralCodeWidget;
