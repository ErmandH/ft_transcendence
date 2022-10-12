/* eslint-disable jsx-a11y/anchor-is-valid */
import {ListGroup, Modal, Form, Button } from 'react-bootstrap'
import { useAuth } from '../../context/AuthContext'
import { useEffect, useState } from 'react'
export default function AllChannels({ allChannels, myChannels }){
	const channs = allChannels
	const { user, socket } = useAuth()
	const [show, setShow] = useState(false);
	const [joinName, setJoinName] = useState('')

	const handleClose = () => setShow(false)
	const handleShow = () => setShow(true);


	useEffect(() => {
		socket.on('JOIN_STATUS', (stat) => {
			if (stat === true){
				alert(`Joined successfully`)
				handleClose()		
			}
			else{
				alert(`Joining failed`)
			}
		})
	// eslint-disable-next-line
	}, [])

	for (let i = 0; i < channs.length; i++) {
		for (let j = 0; j < myChannels.length; j++) {
			if (myChannels[j].channel_name === channs[i].channel_name){
				channs.splice(i, 1)
				i--
				break
			}			
		}
	}

	const handlePasswordJoin = () => {
		const pass = (document.getElementById('formChannelPassword') as  HTMLInputElement)
		if (pass.value.length === 0){
			alert('bad password')
			return
		}
		const passValue = pass.value
		const payload = {
			user_id: user.id,
			user_nick: user.nick,
			channel_name: joinName,
			password: passValue
		}
		socket.emit('JOIN', JSON.stringify(payload))
	}

	const handleJoin = ({status, channel_name}) => {
	//	
		if (status === 1){
			setJoinName(channel_name)
			handleShow()
		}
		else{
			const payload = {
				user_id: user.id,
				user_nick: user.nick,
				channel_name: channel_name,
				password: null
			}
			socket.emit('JOIN', JSON.stringify(payload))
		}
	}

	return (
		<div>
			{channs.length > 0 ? (
			<>
				<h4>All Channels</h4>
				<ListGroup>
					{channs.map((chann, i) => (
							<ListGroup.Item key={i} >
								<div style={{
										whiteSpace: `nowrap`,
										overflow:`hidden`,
										textOverflow:`ellipsis`,																
									}}  >
									<b > {chann.channel_name}   </b> 								
								</div>						
								 
								 <div className="d-flex justify-content-between">
									
									<span className="text-muted font-weight-lighter" >
										{chann.channel_status === 0 ? 'Private' : (
											chann.channel_status === 1 ? 'Protected' : 'Public'
										)}
									 </span>
									 {chann.channel_status !== 0 ? (
										 	<a  onClick={() => handleJoin({ status: chann.channel_status, channel_name: chann.channel_name})}  style={{cursor: 'pointer'}}  className="text-decoration-none"> Join </a>
									 ) :  ''}
								
								 </div>
							</ListGroup.Item>
						
					))}
				</ListGroup>
			</>
		
		) : '' }

			<Modal show={show} onHide={handleClose}>
				<Modal.Header closeButton>
				<Modal.Title>Join</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<Form.Group className="mb-3" controlId="formChannelPassword">
						<Form.Label>Password of {joinName}</Form.Label>
						<Form.Control type="password" placeholder="Enter channel password" />
					</Form.Group>
					
				</Modal.Body>
				<Modal.Footer>
				<Button variant="secondary" onClick={handleClose}>
					Close
				</Button>
				<Button variant="primary" onClick={handlePasswordJoin}>
					Join
				</Button>
				</Modal.Footer>
			</Modal>

		</div>
		
	)
	
}