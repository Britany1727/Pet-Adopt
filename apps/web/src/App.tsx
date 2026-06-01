import UpdatePassword from './pages/UpdatePassword';
import ConfirmAccount from './pages/ConfirmAccount';
import AuthCallback   from './pages/AuthCallback';

export default function App() {
  const path = window.location.pathname;

  if (path === '/update-password') return <UpdatePassword />;
  if (path === '/confirm')         return <ConfirmAccount />;
  if (path === '/auth-callback')   return <AuthCallback />;

  return (
    <div style={{ textAlign: 'center', padding: '80px 24px', fontFamily: 'Arial' }}>
      <p style={{ fontSize: '64px' }}>🐾</p>
      <h1 style={{ color: '#b3006a' }}>PetAdopt</h1>
      <p style={{ color: '#574146' }}>Adopción responsable</p>
    </div>
  );
}