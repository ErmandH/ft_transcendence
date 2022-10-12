import { Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import '../css/login.css'


export default function Login(){
	const { user} = useAuth()
	if (user)
		return (<Navigate to="/" />)

	const loginHandle = () => {		
		window.location.replace(process.env.REACT_APP_INTRA_URL)
	}
	return (
		<>
			<div className="main-div">
				<button className="btn btn-dark btn-lg p-3" onClick={loginHandle}>
					<div>
						<img src="/42-logo.svg" width={50} height={50} alt="42Logo"></img>
						<h2 className="d-inline-block px-2"><span className=" d-inline-block">Login with Intra</span></h2>
					</div>		
				</button>
			</div>
			
		</>
	)
}