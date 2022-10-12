import axios from 'axios'
import { useEffect, useState } from 'react'
import { Table, Button } from 'react-bootstrap'
import { useAuth } from '../context/AuthContext'
import { NavLink } from 'react-router-dom'

const Users = () => {
	const [users, setUsers] = useState([])
	const [refresh, setRefresh] = useState(false)
	const { user } = useAuth()

	useEffect(() => {
		axios.get(`${process.env.REACT_APP_API_URL}/user/get-users/${user.id}`)
		.then(res => {
			setUsers(res.data)		
		})
	// eslint-disable-next-line
	}, [refresh])

	const handleBlock = (nick) => {
		const payload = {
			id: user.id,
			nick: nick,
			is_friend:false
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

	const handleAddFriend = (nick) => {
		const payload = {
			id: user.id,
			nick: nick
		}
		axios.post(`${process.env.REACT_APP_API_URL}/user/add-friend`, payload)
			.then((response) => {			
				setRefresh(!refresh)
				alert(`${response.data.nick} added as a friend`)	
			})
			.catch(() => {
				alert(`User with nickname: ${nick} is not found`)
			})
	}

	return (
		<>
			<Table className="bg-white table-responsive" bordered hover>
				<thead className="bg-primary">
					<tr className="text-white">
					<th>Username</th>
					<th>Avatar</th>
					<th>ADD</th>
					<th>BLOCK</th>
					</tr>
				</thead>
				<tbody>
					{users.map((user, index) => (
						<tr>
							<td className="text-center"><NavLink to={`/profile/${user.id}`} style={{fontSize:'24px'}} className="text-decoration-none">{user.nick}</NavLink></td>
							<td className="text-center"><img src={user.avatar} alt={user.nick} width="100px" height="100px" /></td>
							<td className="text-center">
								<Button onClick={() => handleAddFriend(user.nick)} variant="success">Add</Button>
							</td>
							<td className="text-center">
								<Button onClick={() => handleBlock(user.nick)} variant="danger">Block</Button>
							</td>
						</tr>
					) )}
				</tbody>
			</Table>
		</>
	)
}

export default Users