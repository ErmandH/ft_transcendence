import {io } from 'socket.io-client'
import ReactDOM from 'react-dom/client';
import App from './App';
import {BrowserRouter} from 'react-router-dom'
import { AuthProvider } from './context/AuthContext';
import handleGlobalUnload from './unload'

window.onunload = handleGlobalUnload

localStorage.setItem('game_color', 'black')

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
const socket =  io(`${process.env.REACT_APP_API_URL}`)
console.log(process.env.REACT_APP_API_URL)
console.log('index.tsx')
root.render(
  <BrowserRouter>
    <AuthProvider socket={socket}>
      <App />
    </AuthProvider>
  </BrowserRouter>
    
);


