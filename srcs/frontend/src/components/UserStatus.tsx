import axios from "axios"
import { Button } from "react-bootstrap"
import { useEffect, useState } from "react"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye } from '@fortawesome/free-solid-svg-icons'
import { useNavigate } from "react-router"

const UserStatus = ({ userId }) => {
	const [stat, setStat] = useState(-1)
	const navigate = useNavigate()

	const handleWatchGame = () => {
		navigate(`/watch-game/${userId}`)
	}

	useEffect(() => {
		const interval = setInterval( () => {
			axios.get(`${process.env.REACT_APP_API_URL}/user/id/${userId}`)
			.then((res) => setStat(res.data.status))
		}, 200)

		return () => {
			clearInterval(interval)
		}
	// eslint-disable-next-line
	}, [])

	let color = null
	if (stat === 0)
		color = `#bbb`
	else if (stat === 1)
		color = `green`
	else if (stat === 2)
		color = `#FFA500`
	return (
		<div className="d-inline-flex justify-content-between px-4" style={{width:'100px', padding: '0 0 0 8px!important'}}>

			<span style={{
			height: `15px`,
			width: `15px`,
			backgroundColor: color,
			borderRadius: `50%`,
			display: `inline-block`,
			marginTop:'10px',
		}}  className="dot"></span>
		{ stat === 2 ? (
				<Button onClick={handleWatchGame}  style={{
					backgroundColor:`#FFA500`,
					padding:'5px',
					marginLeft:'10px!important',
					marginBottom:'5px!important',
					borderRadius:'40%',
					border: 'none',
				}}>
				<FontAwesomeIcon icon={faEye} />	
			 </Button>
		) : ''}
	
			
		</div>
	
	)
}

export default UserStatus