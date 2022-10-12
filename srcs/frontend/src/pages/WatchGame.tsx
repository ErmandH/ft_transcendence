import { useEffect } from "react";
import { useParams } from "react-router"
import { useAuth } from "../context/AuthContext"
import {drawText, drawRect, drawCircle} from "../game/canvas_functions"
import { useNavigate } from 'react-router-dom'

const Canvas = () => {
	
	return (
		<>
			
		</>
	)
}




export default function WatchGame(){
	const { id } = useParams()

	const { socket } = useAuth()
	const navigate = useNavigate()


useEffect(() => {
	const canvas = document.getElementById("pong") as HTMLCanvasElement;
	const c = canvas.getContext('2d');
	
	const gameUser = { // client gameUser bilgileri
		y : canvas.height/2,
		user_side : "",
		match_id : 0,
		width : 10,
		height : 100,
		color : 'white',
	}

	const net = {
		x : (canvas.width - 2)/2,
		y : 0,
		height : 10,
		width : 2,
		color : "white"
	}

	function drawNet(){
		for(let i = 0; i <= canvas.height; i+=15){
			drawRect(net.x, net.y + i, net.width, net.height, net.color, c);
		}
	}

	const render = (data) => {
		console.log(data)
		console.log("testtt")
		if(data === "stop") {
			socket.off("in_game");
			c.clearRect(0, 0, canvas.width, canvas.height);
			drawText("Game Finished or one of gameUser disconnected!", 40, canvas.height/2, 'black', c , "30px Arial");
			drawText("Press Espace to redirect Friends Page", 40, canvas.height/2 + 100, 'black', c , "30px Arial");
			return
		}
		drawRect(0,0,canvas.width,canvas.height,"black",c);
		drawCircle(data.ball_x, data.ball_y, data.radius, 'white', c);
		drawRect(0, data.user_left_y, gameUser.width, gameUser.height, gameUser.color, c);
		drawRect(canvas.width - gameUser.width, data.user_right_y, gameUser.width, gameUser.height, gameUser.color, c);
		drawText(data.user_left_score.toString(),canvas.width/4,canvas.height/5, 'white',c, "75px Arial");
		drawText(data.user_right_score.toString(),3*canvas.width/4,canvas.height/5, 'white',c, "75px Arial");
		drawNet();
	}

	document.addEventListener('keydown', check);

	function check(e) {
		if(e.keyCode === 27) {
			socket.off("in_game");
			drawRect(0,0, canvas.width, canvas.height, 'white', c )
			navigate('/friends')
		}
	}

	drawRect(0,0, canvas.width, canvas.height, 'white', c );

	socket.on("in_game", render);
	socket.emit("join-room_from_another_page", id)

	
	// eslint-disable-next-line
	}, [])


	return (
		<canvas style={{
			border: `2px solid #FFF`,
            position: `absolute`,
            margin :`auto`,
            top:`0`,
            right:`0`,
            left:`0`,
            bottom:`0`
		}} id="pong" width="800" height="600">
			<Canvas />
		</canvas>
	)
}