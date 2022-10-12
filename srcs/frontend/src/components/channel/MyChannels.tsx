/* eslint-disable jsx-a11y/anchor-is-valid */
import {ListGroup, Modal, Form, Button} from 'react-bootstrap'
import { useAuth } from '../../context/AuthContext'
import { useState } from 'react'

export default function MyChannels({ myChannels, setCurrentChannel }){
	const { user, socket } = useAuth()
	const [show, setShow] = useState(false);
	const [showPass, setShowPass] = useState(false)
	const [editChannel, setEditChannel] = useState('')
	const handleClose = () => {
		setShowPass(false)
		setShow(false)
	}

	const handleEdit = () => {
		let passElem = (document.getElementById('formEditPassword') as HTMLInputElement)
		let passVal = ''
		if (passElem !== null)
			passVal = passElem.value
		if (Number((document.getElementById('formEditType') as HTMLInputElement ).value) !== 2 && passElem.value.length < 1)
		{
			alert('Password needed')
			return
		}
		const payload = {
			command: 'change_status',
			user_id: user.id,
			param1: Number((document.getElementById('formEditType') as HTMLInputElement ).value),
			param2:  passVal ,
			channel_name: editChannel
		}
		console.log(payload)
		socket.emit('ADMIN', JSON.stringify(payload) )
		console.log('test')
		setShowPass(false)
		setShow(false)
	}

	const handleLeave = ( channel_name ) => {
		setCurrentChannel(-1)
		socket.emit('LEAVE', JSON.stringify({ channel_name: channel_name, user_id: user.id }))
	}

	const handleShowChannel = (channel_name) => {
		for (let i = 0; i < myChannels.length; i++) {
			const chann = myChannels[i];
			if (chann.channel_name === channel_name){
				setCurrentChannel(i)
				return
			}
		}
	}
	return (
		<>
			{myChannels.length > 0 ? (
			<div style={{overflowY: 'auto'}}>
				<h4>My Channels</h4>
				<ListGroup>
					{myChannels.map((chann, i) => (
						<ListGroup.Item key={i}>
								<div style={{
											whiteSpace: `nowrap`,
											overflow:`hidden`,
											textOverflow:`ellipsis`,																
										}}  >
										<b > {chann.channel_name}   </b> 								
								</div>
								<div className="d-flex justify-content-between">
									<a onClick={() => handleShowChannel(chann.channel_name)}  style={{cursor: 'pointer'}}  className="text-decoration-none"> Show </a>
									{ chann.owners.map((value, index) => {
											if (value === user.id)
												return (<a key={index} onClick={() => { setEditChannel(chann.channel_name); setShow(true)  }}  style={{cursor: 'pointer'}}  className="text-decoration-none text-success"> Edit </a>)
										return ''
									})  }
									
									<a onClick={() => handleLeave(chann.channel_name)}  style={{cursor: 'pointer'}}  className="text-decoration-none text-danger"> Leave </a>

								
								 </div>	
						 </ListGroup.Item>
					))}
				</ListGroup>
				<hr />

				<Modal show={show} onHide={handleClose}>
				<Modal.Header closeButton>
				<Modal.Title>Edit Channel </Modal.Title>
				</Modal.Header>
				<Modal.Body>
				<Form.Group controlId="formEditPassword">
						{showPass ? (
							<>
								<Form.Label>Channel Password</Form.Label>
								<Form.Control type="password"></Form.Control>
							</>					
						) : ''}
						
					</Form.Group>
					<Form.Group className="mb-3" controlId="formEditType">
							<Form.Label>Channel Type</Form.Label>
							<Form.Select onChange={(e) =>  e.target.value !== 'public' ? setShowPass(true) : setShowPass(false)}>
								<option value="2">Public</option>
								<option value="0">Private</option>
								<option value="1">Protected</option>
							</Form.Select>
					</Form.Group>
				</Modal.Body>
				<Modal.Footer>
				<Button variant="secondary" onClick={handleClose}>
					Close
				</Button>
				<Button variant="primary" onClick={handleEdit}>
					Save Changes
				</Button>
				</Modal.Footer>
			</Modal>
			</div>
		
		) : '' }
			
			

		</>
		
	)

}