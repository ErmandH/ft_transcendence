import {useAuth} from '../context/AuthContext'
import axios from 'axios'

const Dashboard = () => {
	const {user} = useAuth()

	axios.post(`${process.env.REACT_APP_API_URL}/user/set-status`, {
		id: user.id,
		status: 1
	}).then(() => {})
	return (
		<>
			<h1>Welcome to the PONGAME {user.name} {user.surname}</h1>
		</>
	)
}

export default Dashboard;