import { Row, Button, Card, Col, Modal, Form, ListGroup, ListGroupItem } from "react-bootstrap"
import { useEffect, useState } from 'react'
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import '../css/chat.css'
import UserStatus from "../components/UserStatus";
import { NavLink } from "react-router-dom";

const Chat = ({ setActiveChat, activeChatUser, msgArr, setMsgArr, opponent }) => {
	
	const [msg, setMsg] = useState('')
	const {user, socket} = useAuth()

	useEffect(() => {
		const input = document.getElementById('msg-input')
		input.addEventListener("keypress", function(event) {
			if (event.key === "Enter") {
				event.preventDefault();
				document.getElementById("submit-btn").click();
			}
		})
	// eslint-disable-next-line
	}, [])
   	const filterMessage = msgArr.filter((msg) => msg.sender === activeChatUser || (msg.sender === user.id &&  msg.target === activeChatUser));

	const handleBtn = () => {
		if (msg.length < 1){
			alert('Message cannot be empty')
			return
		}
		const pack  = {sender : user.id , target : activeChatUser, data : msg}	
		setMsgArr([...msgArr, pack])
		setMsg('')
		socket.emit('PRIV', JSON.stringify(pack))
	}
	
	return (
		<>
			<div id="chat-box" style={{
				height:'100%'
			}}>
				<div id="chat-div" style={{
					display:'flex',
					flexDirection:'column',
					justifyContent:"space-between",
					height:'100%'
				}}>
					<div>
						<ul id="messages">
							{filterMessage.map((msg, index) => (
								<li key={index}>
									<b>{`${msg.sender === user.id ? user.nick : opponent}: `}</b>{msg.data}
									</li>
							))}
						</ul>
					</div>
					<div>
						<Row>
							<Col className="col-8">
								<Form.Control onChange={(e) => setMsg(e.target.value)} value={msg} id="msg-input" autoComplete="off" />
							</Col>
							<Col className="col-4">
								<Button variant="primary" onClick={handleBtn}  id="submit-btn">Send</Button>
								<Button style={{marginLeft: '5px'}} variant="danger" onClick={() => setActiveChat(false)}>x</Button>
							</Col>
						</Row>					
					</div>
				</div>
			</div>
		</>


	)
}


const Friends = () => {
	const [show, setShow] = useState(false);
	const [addNick, setNick] = useState('')
	const { user,  msgArr, setMsgArr} = useAuth()
	const [friendArray, setFriendArray] = useState([])
	const [activeChat, setActiveChat] = useState(false)
	const [activeChatUser, setActiveChatUser] = useState({ friend_id:-1, nick:'' })
	const [blockArray, setBlockArray] = useState([])
	const [refresh, setRefresh] = useState(false)

	const handleClose = () => setShow(false);
	const handleShow = () => setShow(true);
	axios.post(`${process.env.REACT_APP_API_URL}/user/set-status`, {
		id: user.id,
		status: 1
	}).then(() => {})

	const handleAddFriend = () => {
		const payload = {
			id: user.id,
			nick: addNick
		}
		axios.post(`${process.env.REACT_APP_API_URL}/user/add-friend`, payload)
			.then((response) => {			
				setRefresh(!refresh)
				alert(`${response.data.nick} added as a friend`)	
			})
			.catch(() => {
				alert(`User with nickname: ${addNick} is not found`)
			})
	}

	const handleBlock = (nick) => {
		const payload = {
			id: user.id,
			nick: nick,
			is_friend:true
		}
		axios.post(`${process.env.REACT_APP_API_URL}/user/block-friend`, payload)
			.then((response) => {
				setRefresh(!refresh)
				alert(`${response.data.nick} blocked`)			
			})
			.catch(() => {
				alert(`User with nickname: ${nick} couldnt be blocked`)			
			})
	}

	const handleRemoveBlock = (nick) => {
		const payload = {
			id: user.id,
			nick: nick
		}
		axios.post(`${process.env.REACT_APP_API_URL}/user/remove-block`, payload)
			.then((response) => {
				alert(`${response.data.nick} is unblocked`)
				setRefresh(!refresh)
			})
			.catch(() => {
				alert(`User with nickname: ${nick}  couldnt be unblocked`)
			})
	}

	useEffect(() => {
		const payload = {
			id: user.id
		}
		axios.post(`${process.env.REACT_APP_API_URL}/user/get-friends`, payload)
			.then(res => {
				const friends = res.data
				setFriendArray(friends)
			})
			.catch(() => console.log('error'))

		axios.post(`${process.env.REACT_APP_API_URL}/user/get-blocks`, payload)
			.then(res => {
				const blocks = res.data
				setBlockArray(blocks)
			})
			.catch(() => console.log('error'))
	// eslint-disable-next-line
	}, [blockArray, refresh])

	return (
		<>
			<div className="text-center">	
				<Button variant="primary" className="mb-2 text-center" onClick={handleShow}>Add Friend</Button>
			</div>
		
			<Row style={{height: '70vh'}}>
				{activeChat ? (
					<Col md={4} >
					<Card style={{height:'100%'}}>
						<Card.Body>
							<Chat msgArr={msgArr} setMsgArr={setMsgArr} setActiveChat={setActiveChat} activeChatUser={activeChatUser.friend_id} opponent={activeChatUser.nick} />
						</Card.Body>
					</Card>
				</Col>
				) : ''}
				
				<Col className={activeChat ? `md="4"` : `md="6"`} >
					<Card>
						<Card.Title>
							<h3 className="text-center">Friends</h3>
							<hr />
						</Card.Title>
						<Card.Body className="mt-0">
							<ListGroup>
								{friendArray.map((friend, index) => (
									<ListGroupItem key={index} className="p-3" style={{overflowX:'auto'}}>
												<Row>
													<Col lg="2">
														<UserStatus userId={friend.id} />
													</Col>
													<Col lg="3">
														<img className="img-fluid"  src={friend.avatar}  alt={friend.nick} />
													</Col>
													<Col lg="3">
														<NavLink to={`/profile/${friend.id}`} className="px-1 text-decoration-none">{friend.nick}</NavLink>														
													</Col>
													<Col lg="4">
														<Row>
															<Col lg="6">
																	<Button onClick={() => {
																setActiveChatUser({nick:friend.nick , friend_id:friend.id})
																setActiveChat(true)
															}}  variant="success">Chat</Button>
															</Col>
															<Col lg="6">
																<Button onClick={() => handleBlock(friend.nick)} variant="danger">Block</Button>
															</Col>
														</Row>						
																												
													</Col>
												</Row>
									</ListGroupItem>
								))}
							</ListGroup>


						</Card.Body>
					</Card>
				</Col>
				<Col className={activeChat ? `md="4"` : `md="6"`}>
					<Card>
						<Card.Title>
							<h3 className="text-center">Blocked Users</h3>
							<hr />
						</Card.Title>
						<Card.Body>
							<ListGroup>
								{blockArray.map((block, index) => (
									<ListGroupItem key={index}>
										<div className={"d-flex justify-content-between"}>
											<div>
												<h3 className="d-inline-block">{block.nick}</h3>
											</div>
											<Button onClick={() => handleRemoveBlock(block.nick)} variant="success">Unblock</Button>
										</div>
									</ListGroupItem>
								))}
							</ListGroup>
						</Card.Body>
					</Card>
				</Col>
			</Row>

			<Modal show={show} onHide={handleClose}>
				<Modal.Header closeButton>
					<Modal.Title>Add Friend</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<Form.Control onChange={(e) => setNick(e.target.value)} type="text"></Form.Control>
					<Button onClick={handleAddFriend} className="mt-2" variant="success">Add</Button>
				</Modal.Body>
			</Modal>

			

		</>
	)
}

export default Friends