import axios from "axios"
import { useEffect, useState } from "react"
import { Row, Col, Form, Button, Modal } from "react-bootstrap"
import { useAuth } from "../context/AuthContext"


export default function Settings({ currentColor, setColor }) {
	const { user, setUser } = useAuth()
	const [nickname, setNickname] = useState(user.nick)
	const [show, setShow] = useState(false);
	const [showAvatar, setShowAvatar] = useState(false)
	const [changeSuccess, setChangeSuccess] = useState(false);
	const [avatarValue, setAvatarValue] = useState({file:null})
	const [qrData, setQRData] = useState('')
	const [factorState, setFactorState] = useState(user.two_factor_enabled)

	const handleClose = () => setShow(false);
  	const handleShow = () => setShow(true);
	const handleAvatarClose = () => setShowAvatar(false);
  	const handleAvatarShow = () => setShowAvatar(true);

	axios.post(`${process.env.REACT_APP_API_URL}/user/set-status`, {
		id: user.id,
		status: 1
	}).then(() => {})

	const changeColor = () => {
		const new_color = (document.querySelector('input[name="color"]:checked') as HTMLInputElement).value
		if (currentColor !== new_color)
			setColor(new_color)
	}

	useEffect(() => {
		if (!user.two_factor_enabled){
			const payload = {
				id: user.id,		
			}
			axios.post(`${process.env.REACT_APP_API_URL}/user/generate`, payload)
			.then(res => setQRData(res.data))
		}
	// eslint-disable-next-line
	},[factorState])

	const changeFactorHandle = () => {
		const url = `${process.env.REACT_APP_API_URL}/user/verify`;
		const payload = {
			id: user.id,
			token: (document.getElementById('factor') as HTMLInputElement ).value
		}
		axios.post(url,  payload).then(response => {
			if (!response.data){
				alert('Verification code is wrong')
				return;
			}
			axios.post(`${process.env.REACT_APP_API_URL}/user/change-factor`,{
				id:user.id
			}).then(() => alert('Two-Factor Authantication enabled'))
			user.two_factor_enabled = true
			const newUser = JSON.parse(JSON.stringify(user))
			setFactorState(true)
			setUser(newUser)
		}).catch(() => alert('Error occured'))
	}

	const disableFactorHandle = () => {
		axios.post(`${process.env.REACT_APP_API_URL}/user/change-factor`,{
				id:user.id
			}).then(() => alert('Two-Factor Authantication disabled'))
		user.two_factor_enabled = false
		const newUser = JSON.parse(JSON.stringify(user))
		setFactorState(false)
		setUser(newUser)
	}

	const changeNicknameHandle = () => {
		const data = {
			nick: nickname,
			id: user.id
		}
		axios.post(`${process.env.REACT_APP_API_URL}/user/change-nickname`, data)
		.then(response => {
			user.nick = response.data.nick
			const newUser = JSON.parse(JSON.stringify(user))
			setChangeSuccess(true)
			setUser(newUser)
			handleShow()
		})
		.catch(error => {
			setChangeSuccess(false)
			handleShow()
		})
	}

	const ModalContent = () => {
		if (changeSuccess)
			return (
				<>
					<Modal.Header closeButton>
						<Modal.Title>Success</Modal.Title>
						</Modal.Header>
						<Modal.Body>Nickname has been changed successfully</Modal.Body>
						<Modal.Footer>
							<Button variant="secondary" onClick={handleClose}>
								Close
							</Button>				
					</Modal.Footer>
				</>
				
			)
		else
			return (
				<>
					<Modal.Header closeButton>
						<Modal.Title>Error</Modal.Title>
						</Modal.Header>
						<Modal.Body>Nickname is already taken</Modal.Body>
						<Modal.Footer>
							<Button variant="secondary" onClick={handleClose}>
								Close
							</Button>				
					</Modal.Footer>
				</>
			)
	}

	let isValid = true
	if (nickname.length === 0 || nickname === user.nick)
		isValid = false

	let isAvatarValid = true
	if (avatarValue.file === null)
		isAvatarValid = false

	const changeAvatarHandle = () => {
		const url = `${process.env.REACT_APP_API_URL}/user/change-avatar`;
		const postedFile = avatarValue.file
		const filename = postedFile.name
		const newFileName = user.login + filename.substring(filename.lastIndexOf('.'), filename.length) || filename;
		const willBeUploadedFile = new File([postedFile], newFileName)
		const formData = new FormData()
		formData.append('file', willBeUploadedFile)
		formData.append('id', user.id)
		const config = {
			headers: {
				'Content-Type': 'multipart/form-data'
			}
		}
		axios.post(url,  formData, config).then(respone => {
			const newUser = user
			newUser.avatar = `${process.env.REACT_APP_API_URL}/${user.login}.jpeg`
			setUser(newUser)
			handleAvatarShow()
		}).catch(() => alert('Only .jpg files are accepted'))
	}
	
	return (
		<>
			<Row>
				<Col className="col-8">
				<Form.Group className="mb-3" controlId="formBasicEmail">
					<Form.Label>Nickname</Form.Label>
					<Form.Control type="text" onChange={e => setNickname(e.target.value)} value={nickname} placeholder="Enter nickname" />
				</Form.Group>
				</Col>
				<Col className="col-4">
					<Button disabled={!isValid} onClick={changeNicknameHandle} style={{marginTop: '30px'}} variant="success">
						Change Nickname
					</Button>
				</Col>

				<Col className="col-8">
					<Form.Group onChange={e => {
						const target = e.target as HTMLInputElement;
						setAvatarValue({file:target.files[0]})
					}} controlId="formFile" className="mb-3">
						<Form.Label>Choose your avatar</Form.Label>
						<Form.Control type="file" accept=".jpeg" />
					</Form.Group>
				</Col>
				<Col className="col-4">
					<Button disabled={!isAvatarValid} onClick={changeAvatarHandle} style={{marginTop: '30px'}} variant="success">
						Change Avatar
					</Button>
				</Col>
				<Col className="col-12">
				<div style={{fontSize:'20px'}}>
				<b>Select Background Theme:  </b>
				<Form.Check
					inline 
					checked={currentColor === 'black'} 
					label="Classic"
					name="color"
					type="radio"
					value="black"
					id={`inline-1`}	
					onChange={changeColor}			
				/>
				<Form.Check
					inline
					label="Green"
					checked={currentColor === 'green'} 
					value="green"
					name="color"
					type="radio"
					id={`inline-2`}
					onChange={changeColor}			
				/>
				<Form.Check
					inline
					label="Red"
					checked={currentColor === 'red'} 
					value="red"
					name="color"
					type="radio"
					id={`inline-3`}
					onChange={changeColor}			
				/>
			</div>
				</Col>
				<Col className="col-12">
					{!factorState ? (
						<Row>
						<Col md="2" >
							<img alt="qrcode" className="img-fluid" src={qrData}></img>
						</Col>
						<Col md="10" >
							<p style={{width:'180px'}}>To enable two-factor authantication open your Google Authenticator app, scan the QR code and enter the 6-digit code on screen</p>
						</Col>
						<Col md="3" className="mt-2">
						<Form.Control  id="factor" type="number" min="0" />
						</Col>
						<Col md="4" className="mt-2">
							<Button onClick={changeFactorHandle}  variant="success">Enable</Button>
						</Col>
						</Row>
					) : (
						<Button onClick={disableFactorHandle}  variant="danger">Disable</Button>
					)}						
					
					
					
				</Col>
			</Row>

			<Modal show={show} onHide={handleClose}>
				<ModalContent />
			</Modal>

			<Modal show={showAvatar} onHide={handleAvatarClose}>
						<Modal.Header closeButton>
							<Modal.Title>Success</Modal.Title>
						</Modal.Header>
						<Modal.Body>Avatar has been changed successfully</Modal.Body>
						<Modal.Footer>
							<Button variant="secondary" onClick={handleAvatarClose}>
								Close
							</Button>				
						</Modal.Footer>
			</Modal>

		</>
		
	)
}