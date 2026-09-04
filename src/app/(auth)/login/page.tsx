'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // ✅ CORRIGÉ : Ajout de /api/auth/login
      const response = await fetch('https://floors-amino-steel-nine.trycloudflare.com/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        window.location.href = '/admin/dashboard';
      } else {
        setError(data.message || 'Erreur de connexion');
      }
    } catch (err: any) {
      setError('Erreur de connexion au serveur. Vérifiez que le backend est démarré.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #4f46e5, #7c3aed, #ec4899)',
      padding: '16px'
    }}>
      <div style={{
        maxWidth: '448px',
        width: '100%',
        background: 'white',
        borderRadius: '16px',
        padding: '32px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            fontSize: '40px'
          }}>
            ⚙️
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#0f172a' }}>MEGA COUNT CRM</h1>
          <p style={{ color: '#64748b', marginTop: '4px' }}>Interface d'administration</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
              Nom d'utilisateur
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '16px',
                transition: 'all 0.3s'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#4f46e5';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(79,70,229,0.1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#e2e8f0';
                e.currentTarget.style.boxShadow = 'none';
              }}
              placeholder="Entrez votre nom d'utilisateur"
              required
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '16px',
                transition: 'all 0.3s'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#4f46e5';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(79,70,229,0.1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#e2e8f0';
                e.currentTarget.style.boxShadow = 'none';
              }}
              placeholder="Entrez votre mot de passe"
              required
            />
          </div>

          {error && (
            <div style={{
              padding: '12px',
              background: '#fee2e2',
              borderRadius: '8px',
              color: '#dc2626',
              marginBottom: '16px',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
              color: 'white',
              borderRadius: '8px',
              border: 'none',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s',
              opacity: loading ? 0.5 : 1
            }}
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '12px', marginTop: '16px' }}>
          Version 2.0.0
        </p>
      </div>
    </div>
  );
}