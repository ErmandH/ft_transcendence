import { useEffect, useState } from 'react'
import { Row, Col, Button, Form } from 'react-bootstrap'
import { useAuth } from '../../context/AuthContext'
import axios from 'axios'

export default function ChannelChat({ myChannels, currentChannel }){
	const { user, socket, msgArr} = useAuth()
	const [filteredMessage, setFilteredMessage] = useState([])
	const [msg, setMsg] = useState('')

	axios.post(`${process.env.REACT_APP_API_URL}/user/get-blocks`, { id:user.id })
	.then(res => {
		axios.post(`${process.env.REACT_APP_API_URL}/user/get-blocked-bys`, { id:user.id })
		.then(response => {
			const concat = res.data.concat(response.data) 
			const copy = JSON.parse(JSON.stringify(msgArr))
			const filterMessage = copy.filter((msg) => msg.sender === myChannels[currentChannel].channel_id);
			const is_in = (userId) => {
				for (let i = 0; i < concat.length; i++) {
					const block = concat[i];
					if (block.id === userId)
						return true
				}
				return false
			}
			const filtered = filterMessage.filter((value) => !is_in(value.replier))
			setFilteredMessage(filtered)
		})
	})

	const handleSend = () => {
		if (msg.length < 1){
			alert('Your message is empty!')
			return
		}

		const payload = {
			target: myChannels[currentChannel].channel_id,
			sender: user.id,
			sender_nick:user.nick,
			data: msg
		}
		socket.emit('PRIV', JSON.stringify(payload))
		setMsg('')
	}

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



	
	return (
		<>
			<div id="chat-div" style={{
					display:'flex',
					flexDirection:'column',
					justifyContent:"space-between",
					height:'100%'
				}}>
					<div>
						<ul id="messages">
						{filteredMessage.map((msg, index) => (
								<li key={index}>
									<b>{`${msg.replier_nick}: `} </b>{msg.data}
								</li>
							))}
						</ul>
					</div>
					<div>
						<Row>
							<Col className="col-10">
								<Form.Control value={msg} onChange={(e) => setMsg(e.target.value)} id="msg-input" autoComplete="off" />
							</Col>
							<Col className="col-2">
								<Button variant="primary" onClick={handleSend}  id="submit-btn">Send</Button>
							</Col>
						</Row>					
					</div>
				</div>
		</>
	)
}