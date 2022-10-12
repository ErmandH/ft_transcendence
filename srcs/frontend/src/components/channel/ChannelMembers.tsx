/* eslint-disable jsx-a11y/anchor-is-valid */
import { ListGroup, Button, Modal } from "react-bootstrap";
import { useAuth } from "../../context/AuthContext";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUserEdit, faVolumeMute, faBan, faVolumeUp, faCheck, faRightFromBracket, faX } from '@fortawesome/free-solid-svg-icons'
import { useState } from "react";
import { useNavigate } from 'react-router-dom'
import UserStatus from "../UserStatus";
import axios from "axios";

export default function ChannelMembers({ myChannels, currentChannel, showInvite, setShowInvite}){
	const { user, socket } = useAuth()
	const [filteredUsers, setFilteredUsers] = useState([])
	const navigate = useNavigate()
	//const [showInvite, setShowInvite] = useState(false);
	const handleShowInvite = () => setShowInvite(true);
	
	axios.post(`${process.env.REACT_APP_API_URL}/user/get-blocks`, { id:user.id })
	.then(res => {
		axios.post(`${process.env.REACT_APP_API_URL}/user/get-blocked-bys`, { id:user.id })
		.then(response => {
			const concat = res.data.concat(response.data) 
			const copy = JSON.parse(JSON.stringify(myChannels[currentChannel].users))
			const is_in = (userId) => {
				for (let i = 0; i < concat.length; i++) {
					const block = concat[i];
					if (block.id === userId)
						return true
				}
				return false
			}
			const filtered = copy.filter((value) => !is_in(value.user_id))
			setFilteredUsers(filtered)
		})
	})

	const is_owner = () =>{
		for (let i = 0; i < myChannels[currentChannel].users.length; i++) {
			const channUser = myChannels[currentChannel].users[i];
			if (channUser.user_id === user.id && channUser.is_owner)
			{
				return true
			}
		}
		return false
	}

	const handleBan = (bannedId) => {
		const payload = {
			command:'ban_user',
			user_id: user.id,
			channel_name: myChannels[currentChannel].channel_name,
			param1:bannedId
		}
		socket.emit('ADMIN', JSON.stringify(payload))
		alert('User has been successfully banned')
	}

	const handleUnban = (bannedId) => {
		const payload = {
			command:'unban_user',
			user_id: user.id,
			channel_name: myChannels[currentChannel].channel_name,
			param1:bannedId
		}
		socket.emit('ADMIN', JSON.stringify(payload))
		alert('User has been successfully unbanned')
	}

	const handleAddOwner = (userId) => {
		const payload = {
			command:'add_admin',
			user_id: user.id,
			channel_name: myChannels[currentChannel].channel_name,
			param1:userId
		}
		socket.emit('ADMIN', JSON.stringify(payload))
		alert('User has been successfully authorized as admin')
	}

	const handleMute = (userId) => {
		const payload = {
			command:'mute_user',
			user_id: user.id,
			channel_name: myChannels[currentChannel].channel_name,
			param1:userId
		}
		socket.emit('ADMIN', JSON.stringify(payload))
		alert('User has been successfully muted')
	}

	const handleUnmute = (userId) => {
		const payload = {
			command:'unmute_user',
			user_id: user.id,
			channel_name: myChannels[currentChannel].channel_name,
			param1:userId
		}
		socket.emit('ADMIN', JSON.stringify(payload))
		alert('User has been successfully unmuted')
	}

	const handleProfile = (userId) => { navigate(`/profile/${userId}`) }

	const handleInvite = (userId) => {

		handleShowInvite()
		const payload = {
			command: 'invite_game',
			user_id: user.id,
			param1: userId,
			channel_name: myChannels[currentChannel].channel_name
		}
		socket.emit('ADMIN', JSON.stringify(payload))
	}

	const handleKick = (userId) => {
		const payload = {
			user_id: userId,
			channel_name: myChannels[currentChannel].channel_name
		}
		socket.emit('LEAVE', JSON.stringify(payload))
	}

	const handleBlock = (nick) => {
		const payload = {
			id: user.id,
			nick: nick
		}

		axios.post(`${process.env.REACT_APP_API_URL}/user/block-friend`, payload)
			.then((response) => {
				alert(`${response.data.nick} blocked`)			
			})
			.catch(() => {
				alert(`User with nickname: ${nick} couldnt be blocked`)			
			})
	}

	return (
		<>
			<h4 className="font-weight-light" >Member List</h4>
			<hr/>
			<ListGroup>
				{filteredUsers.map((myuser, index) => (
					<ListGroup.Item key={index}>
						<div>
							<UserStatus userId={myuser.user_id} />
							<b>{myuser.user_nick}</b>  {myuser.is_muted ? <FontAwesomeIcon icon={faVolumeMute} /> : ''}
							{myuser.user_id !== user.id ? <a onClick={() => handleProfile(myuser.user_id)} style={{cursor: 'pointer'}}  className="text-decoration-none text-primary"> Profile </a> : ''}
							
							{myuser.is_online &&  myuser.user_id !== user.id ?  <a onClick={() => handleInvite(myuser.user_id)} style={{cursor: 'pointer'}}  className="text-decoration-none text-secondary"> Invite </a> : ''}
						</div>				
						<div className="mt-1">
						{is_owner() ?	( myuser.is_owner ?  '' : (
							<>
								<Button onClick={() => handleAddOwner(myuser.user_id)} style={{fontSize:'12px'}} variant="success"  > <FontAwesomeIcon icon={faUserEdit} /> </Button>
								<Button onClick={() => handleBan(myuser.user_id)}  style={{fontSize:'12px', marginLeft:'8px'}} variant="danger"  > <FontAwesomeIcon icon={faX} /> </Button>
								<Button onClick={() => handleKick(myuser.user_id)}  style={{fontSize:'12px', marginLeft:'8px'}} variant="danger"  > <FontAwesomeIcon icon={faRightFromBracket} /> </Button>
								{myuser.is_muted 
							? (	<Button onClick={() => handleUnmute(myuser.user_id)}  style={{fontSize:'12px', marginLeft: myuser.is_owner ? '' : '8px'}} variant="primary"  > <FontAwesomeIcon icon={faVolumeUp} /> </Button>)
							: ( <Button onClick={() => handleMute(myuser.user_id)} style={{fontSize:'12px', marginLeft: myuser.is_owner ? '' : '8px'}} variant="warning"  > <FontAwesomeIcon icon={faVolumeMute} /> </Button> )}
							</>		
							)
						) : ""}	
						{myuser.user_id !== user.id ? <Button onClick={() => handleBlock(myuser.user_nick)}  style={{fontSize:'12px', marginLeft:'8px'}} variant="danger"  > <FontAwesomeIcon icon={faBan} /> </Button> : ''}												
						</div>					
					</ListGroup.Item>
				))}
			</ListGroup>
			<h4 className="font-weight-light mt-2" >Banned Users</h4>
			<ListGroup>
				{myChannels[currentChannel].banned_users.map((user, index) => (
					<ListGroup.Item key={index}>
						<b className="d-block">{user.user_nick}</b>
						{is_owner() ? (						
							<Button onClick={() => handleUnban(user.user_id)} style={{fontSize:'8px'}} variant="success"  > <FontAwesomeIcon icon={faCheck} /> </Button>
						) : ''}
					</ListGroup.Item>
				))}
			</ListGroup>

			<Modal show={showInvite}>
				<Modal.Header closeButton>
					<Modal.Title>Waiting for opponent</Modal.Title>
				</Modal.Header>
				<Modal.Body>
						
				</Modal.Body>
			</Modal>
			

		</>
	)
	
}