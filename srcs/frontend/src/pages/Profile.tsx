import axios from "axios"
import { useEffect, useState } from "react"
import { Card, Col, Row } from "react-bootstrap"
import { useParams } from "react-router"
import { useAuth } from "../context/AuthContext"

const Profile = () => {
	const { user } = useAuth()
	const [userData, setUserData] = useState({
		avatar:'',
		nick:'',
		name:'',
		surname:'',
		win:0,
		lose:0,
		level:0.0,
		id:0
	})
	const [matchData, setMatchData] = useState([])
	const [achievementData, setAchievementData] = useState([])
	const { id } = useParams()

	console.log(id)

	axios.post(`${process.env.REACT_APP_API_URL}/user/set-status`, {
		id: user.id,
		status: 1
	}).then(() => {})

	useEffect(() => {
		axios.get(`${process.env.REACT_APP_API_URL}/user/id/${id}`)
		.then((res) => {
			setUserData(res.data)
		})

		axios.get(`${process.env.REACT_APP_API_URL}/user/get-matches/${id}`)
		.then((res) => {
			setMatchData(res.data)
		})
		axios.get(`${process.env.REACT_APP_API_URL}/user/get-achievements/${id}`)
		.then((res) => {
			console.log(achievementData)
			setAchievementData(res.data)
		})
	// eslint-disable-next-line
	}, [])
	

	return (
		<>
			<Card style={{backgroundImage: `url(${user.coalition_img})`}}>
				<Card.Body>
					<Row>
						<Col className="col-3">
							<img src={`${userData.avatar}`} alt={userData.nick} className="rounded-circle" width="270"  height="270px" />
						</Col>
						<Col className="col-4">
							<Card className="card-dark">
								<Card.Body>
								<Row>
									<Col className="col-12 p-2">
										<b style={{color: `${user.coalition_color}`}}>Nickname: </b>
										<b className="d-inline-block text-white ml-2">{userData.nick}</b>
									</Col>
									<Col className="col-12 p-2">
										<b style={{color: `${user.coalition_color}`}}>Name: </b>
										<b className="d-inline-block text-white ml-2">{userData.name}</b>
									</Col>
									<Col className="col-12 p-2">
										<b style={{color: `${user.coalition_color}`}}>Surname: </b>
										<b className="d-inline-block text-white ml-2">{userData.surname}</b>
									</Col>
									<Col className="col-12 p-2">
										<b style={{color: `${user.coalition_color}`}}>Wins: </b>
										<b className="d-inline-block text-white ml-2">{userData.win}</b>
									</Col>
									<Col className="col-12 p-2">
										<b style={{color: `${user.coalition_color}`}}>Loses: </b>
										<b className="d-inline-block text-white ml-2">{userData.lose}</b>
									</Col>
									<Col className="col-12 p-2">
										<b style={{color: `${user.coalition_color}`}}>Level: </b>
										<b className="d-inline-block text-white ml-2">{userData.level}</b>
									</Col>
								</Row>
								
								</Card.Body>
							</Card>						
						</Col>
						<Col className="col-5" >
								<Card className="card-dark p-2" style={{height:'284.66px', overflowY:'auto', boxSizing:"border-box"}}>
									<h4 className="text-center" style={{color: `${user.coalition_color}`}}>Achievements</h4>
									<Row className="gy-1">
										{achievementData.map((achieve, index) => {
											return (
												<>
												<Col className="col-12" key={index}>
													<Card>
														<Card.Header>
														{achieve.title}
														</Card.Header>
														<Card.Body>
															{achieve.description}
														</Card.Body>
													</Card>
												</Col>
												</>
												
											)										
										})}
									</Row>
								</Card>
						</Col>
						<Col className="col-12 mt-4">
								<Card className="card-dark p-2">
									<h4 className="text-center" style={{color: `${user.coalition_color}`}}>Match History</h4>
									<Row>
										{matchData.map((match, index) =>{
											if (match.user1 === userData.id){
												return (
													<Col className="col-12" style={{padding: '6px'}} key={index}>
														 <Card bg="success">
															 <Card.Header>
															 	<Card.Title><h2 className="text-center">Win</h2></Card.Title>
															 </Card.Header>															
															<Card.Body>
															<h2 className="text-center">
															<span className="px-4">{userData.nick}</span>
																 {match.user1_score} - {match.user2_score} 	<span className="px-4">{match.opponent}</span>
															</h2>
																
															</Card.Body>
														 </Card>
													</Col>
												)
											}
											else{
												return (
													<Col className="col-12" style={{padding: '6px'}} key={index}>
														 <Card bg="danger">
															<Card.Title><h2 className="text-center">Lose</h2></Card.Title>
															<Card.Body>
															<h2 className="text-center">
																<span className="px-4">{match.opponent}</span>
																 {match.user1_score} - {match.user2_score} 	<span className="px-4">{userData.nick}</span>
																</h2>
																
															</Card.Body>
														 </Card>
													</Col>
												)
											}
										}) }
									</Row>
								</Card>
						</Col>
					</Row>
				</Card.Body>
			</Card>
		</>
	)
}


export default Profile