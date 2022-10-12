import { Route, Routes } from "react-router-dom";
import PrivateRoute, { PrivateGameRoute } from "./components/PrivateRoute";
import Layout from "./pages/layout/Layout";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import 'bootstrap/dist/css/bootstrap.min.css'
import Authorize from "./pages/Authorize";
import Settings from "./pages/Settings";
import Friends from './pages/Friends'
import Game from './pages/Game'
import WatchGame from './pages/WatchGame'
import Channel from "./pages/Channel";
import NotFound from './pages/NotFound'
import { useState } from 'react'
import Users from './pages/Users'

function App() {
  const [showInvite, setShowInvite] = useState(false);
  const [currentColor, setColor] = useState('black')

  return (
    <>
      <Routes>
        <Route path="/" element={<Layout setShowInvite={setShowInvite} />}>
              <Route index={true} element={<PrivateRoute> <Dashboard/> </PrivateRoute>} />
              <Route path="profile/:id" element={<PrivateRoute> <Profile/> </PrivateRoute>} />
              <Route path="settings" element={<PrivateRoute> <Settings currentColor={currentColor} setColor={setColor} /> </PrivateRoute>} />
              <Route path="users" element={<PrivateRoute> <Users/> </PrivateRoute>} />
              <Route path="friends" element={<PrivateRoute> <Friends/> </PrivateRoute>} />
              <Route path="game" element={<PrivateGameRoute> <Game currentColor={currentColor} /> </PrivateGameRoute>} />
              <Route path="channels" element={<PrivateGameRoute> <Channel showInvite={showInvite}  setShowInvite={setShowInvite} /> </PrivateGameRoute>} />
              <Route path="watch-game/:id" element={<PrivateGameRoute> <WatchGame/> </PrivateGameRoute>} />
        </Route>
        <Route path="/login" element={<Login/>} />
        <Route path="/auth" element={<Authorize/>} />
        <Route path="*"  element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
