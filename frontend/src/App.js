import './App.css';
import { useState } from 'react';
import Login from './Login';
import AdminDashboard from './AdminDashboard';
import Recorder from './Recorder';

function App() {
  const [user, setUser] = useState(null);
  return (
    <div className="App">
      <h1>Vedio App</h1>

      {!user ? (
        <Login setUser={setUser} />
      ) : user.role === 'admin' ? (
        <AdminDashboard user={user} />
      ) : (
        <Recorder user={user} />
      )}
    </div>
  );
}

export default App;
