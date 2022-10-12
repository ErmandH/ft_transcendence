import { useNavigate } from "react-router-dom"
import axios from 'axios'
import { useAuth } from "../context/AuthContext"

const Authorize =  () => {
	const searchParams = new URLSearchParams(document.location.search)
	const code = searchParams.get('code')
	const navigate = useNavigate()
	const {user, setUser} = useAuth()
	if (user)
		navigate('/')
	if (!code)
		navigate('/login')
	const url = `${process.env.REACT_APP_API_URL}/user/auth?code=${code}`
	axios.get(url)
		.then(response => {
			console.log(response.data)
			setUser(response.data)
			navigate('/settings')
		})
		.catch(() => navigate('/login'))
	return (
		<>
		
		</>
	)
}

export default Authorize