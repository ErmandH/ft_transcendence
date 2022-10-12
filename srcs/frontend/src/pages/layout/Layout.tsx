/* eslint-disable jsx-a11y/anchor-is-valid */
import { Outlet, NavLink, useNavigate } from "react-router-dom"
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { useAuth } from "../../context/AuthContext";
import {useState, useEffect} from 'react'
import '../../css/layout.css'
import { Button } from "react-bootstrap";

const Layout = ({ setShowInvite }) => {
	const [opponent, setOpponent] = useState({opponent_id:-1, channel_name:'',  opponent_nick:'' })
	const [showOpponentInvite, setOpponentInvite] = useState(false)
	const navigate = useNavigate()
	const {setUser, user, socket} = useAuth()
	
	const handleCloseOpponentInvite = () => setOpponentInvite(false);
	const handleShowOpponentInvite = () => setOpponentInvite(true);

	const handleBrand = () => {
		navigate('/')
	}

	const handleLogout = () => {
		localStorage.clear()
		setUser(false)
	}

	const handleAcceptInvite = () => {
		const payload = {
			command:'accept_invite',
			user_id: user.id,
			param1:opponent.opponent_id,
			channel_name: opponent.channel_name
		}
		handleCloseOpponentInvite()
		socket.emit('ADMIN', JSON.stringify(payload))	
	}

	useEffect(() => {
		socket.addEventListener('INVITE_RES', (data) => {
			console.log(data)
			if (data){
				setShowInvite(false)
				navigate('/game')
			}
			else{
			 	handleCloseOpponentInvite()
				 console.log('geliyo')
				setShowInvite(false)
			 }
		})

		socket.addEventListener('GET_INVITE', (data) => {		
			const parsed = JSON.parse(data)
			setOpponent({ opponent_id: parsed.user_id, opponent_nick: parsed.user_nick, channel_name: parsed.channel_name })
			//setInviteStatus(true)
			handleShowOpponentInvite()
		})
	// eslint-disable-next-line
	}, [])

	return (
		<>
			<Navbar bg="primary" variant="dark">
				<Container>
				<Navbar.Brand style={{cursor: "pointer"}} onClick={handleBrand}>PONG</Navbar.Brand>
				<Nav className="me-auto">
					<NavLink to="/" className={isActive => "nav-link" + (!isActive.isActive ? "" : " active")}>Home</NavLink>	
					<NavLink to={`/profile/${user.id}`} className={isActive => "nav-link" + (!isActive.isActive ? "" : " active")}>Profile</NavLink>
					<NavLink to="/settings" className={isActive => "nav-link" + (!isActive.isActive ? "" : " active")}>Settings</NavLink>
					<NavLink to="/users" className={isActive => "nav-link" + (!isActive.isActive ? "" : " active")}>Users</NavLink>
					<NavLink to="/friends" className={isActive => "nav-link" + (!isActive.isActive ? "" : " active")}>Friends</NavLink>
					<NavLink to="/channels" className={isActive => "nav-link" + (!isActive.isActive ? "" : " active")}>Channels</NavLink>
					<NavLink to="/game" className={isActive => "nav-link" + (!isActive.isActive ? "" : " active")}>Play</NavLink>
					<a style={{cursor: "pointer"}} onClick={handleLogout} className="nav-link">Log Out</a>
				</Nav>

				{showOpponentInvite ? (
					<div>
						<span  className="text-white font-weight-bold">{opponent.opponent_nick} invites you to a game</span>	
						<Button variant="success" onClick={handleAcceptInvite} style={{marginLeft:'10px'}} >
							Accept
						</Button>
					</div>
				) : ''}
				</Container>
			</Navbar>
			<Container className="mt-3">
				<Outlet />
			</Container>
			
			

		</>
		
	)
}

export default Layout