import { useEffect } from "react";
import { useAuth } from "../context/AuthContext"
import {drawText, drawRect, welcome_page} from "../game/canvas_functions"
//import GameLogo from '../game/icons8-game-64.png'
import axios from "axios"
import { useNavigate } from 'react-router-dom'
import handleGlobalUnload from '../unload'

const GameLogo = require('../game/icons8-game-64.png')

	// select canvas element
const Canvas = () => {
	
	return (
		<>
			
		</>
	)
}


const Game = ({ currentColor }) => {
	const { user, socket } = useAuth()
	const navigate = useNavigate()
	
	function unloadHandler(){
		axios.post(`${process.env.REACT_APP_API_URL}/user/set-status`, {
			id: user.id,
			status: 0
		}).then(() => {})
		socket.emit('connection', ['disconnect', user.id])
	}

	useEffect(() => {
		const canvas = document.getElementById("pong") as HTMLCanvasElement ;
		const c = canvas.getContext('2d');
		
		socket.emit('connection', ['connected', user.id])
		if (performance.navigation.type === performance.navigation.TYPE_RELOAD) {
			socket.off("status");
			socket.off("lobby");
			socket.off("in_game");
			socket.emit('connection', ['disconnect', user.id])
		}
		var game_Start_flag = 0;

		var lobby_data_local = [];
		var current_observerd_match_id = -1;

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
		
		drawRect(0,0, canvas.width, canvas.height, 'white', c );
		welcome_page(c);
		drawText("Connected", 170, 300, 'green', c , "18px Arial");
		//drawText(socket.id, 170, 320, 'black', c , "18px Arial");
		drawText("Your are in the Waiting Room", 170, 340, 'black', c , "18px Arial");

		const img = new Image();
		img.src = GameLogo

		const statusHandle_function = (status_id) => {
			console.log(status_id);
			if(status_id[0] === 1){
				game_Start_flag = 0;
				//c.clearRect(0, 0, canvas.width, canvas.height);
				drawRect(0,0, canvas.width, canvas.height, 'white', c );
				socket.on("lobby_state", show_lobby);
				welcome_page(c);
				drawText("Connected", 170, 300, 'green', c , "18px Arial");
				drawText(socket.id, 170, 320, 'black', c , "18px Arial");
				drawText("Your are in the Waiting Room", 170, 340, 'black', c , "18px Arial");
				axios.post(`${process.env.REACT_APP_API_URL}/user/set-status`, {
					id: user.id,
					status: 1
				}).then(() => {})
			}
			else if(status_id[0] === 2) {			
				socket.off("lobby_state");
				socket.emit("join-room", status_id[2]);
				if(!status_id[1])
					gameUser.user_side = "left";
				else
					gameUser.user_side = "right";
				gameUser.match_id = status_id[2];

				socket.off("status");
				c.clearRect(0, 0, canvas.width, canvas.height);
				game_Start_flag = 1; //in match mode
				socket.on("in_game", render);
				axios.post(`${process.env.REACT_APP_API_URL}/user/set-status`, {
					id: user.id,
					status: 2
				}).then(() => {})
			}
			else if (status_id[0] === -1){
				socket.off("status");
				socket.off("lobby_state");
				navigate('/')
			}
		}

		function check(e) {
			if(game_Start_flag === 0) {
				if(e.keyCode === 49) {
					if(lobby_data_local[0] > -1) {
						socket.off("lobby_state");
						socket.emit("join-room", lobby_data_local[0]);
						current_observerd_match_id = lobby_data_local[0];
						game_Start_flag = 2; //observer mode
						socket.off("status");
						socket.on("in_game", render);
					}
				}

				if(e.keyCode === 50) {
					if(lobby_data_local[1] > -1) {
						socket.off("lobby_state");
						socket.emit("join-room", lobby_data_local[1]);
						current_observerd_match_id = lobby_data_local[1];
						game_Start_flag = 2; //observer mode
						socket.off("status");
						socket.on("in_game", render);
					}
				}

				if(e.keyCode === 51) {
					if(lobby_data_local[2] > -1) {
						socket.off("lobby_state");
						socket.emit("join-room", lobby_data_local[2]);
						current_observerd_match_id = lobby_data_local[2];
						game_Start_flag = 2; //observer mode
						socket.off("status");
						socket.on("in_game", render);
					}
				}
			}
			if(e.keyCode === 27 && game_Start_flag === 2) {
				game_Start_flag = 0;
				socket.emit("out-room", current_observerd_match_id);
				socket.off("in_game");
				c.clearRect(0, 0, canvas.width, canvas.height);
				drawRect(0,0, canvas.width, canvas.height, 'white', c )
				socket.on("status", statusHandle_function);
			}
			if(e.keyCode === 27 && game_Start_flag === 4) {
				game_Start_flag = 0;
				socket.emit("out-room", current_observerd_match_id);
				socket.off("in_game");
				c.clearRect(0, 0, canvas.width, canvas.height);
				drawRect(0,0, canvas.width, canvas.height, 'white', c )
				socket.on("status", statusHandle_function);
			}
				
		}

		document.addEventListener('keydown', check);

		canvas.addEventListener("mousemove", getMousePos);

		function getMousePos(evt){
			if(game_Start_flag === 1) {
				let rect = canvas.getBoundingClientRect();
				gameUser.y = evt.clientY - rect.top - gameUser.height/2;
				socket.emit('user_move', gameUser.user_side, gameUser.y, gameUser.match_id);
			}
		}

		function drawNet(){
			for(let i = 0; i <= canvas.height; i+=15){
				drawRect(net.x, net.y + i, net.width, net.height, net.color, c);
			}
		}

		const render = (data) => {
			console.log(data);
			if(data === "died") {
				game_Start_flag = 0;
				socket.on("status", statusHandle_function);
				socket.off("in_game");
				navigate('/')
				alert('Your opponent disconnected')
				c.clearRect(0, 0, canvas.width, canvas.height);
				return
			}
			if(data === "stop") {
				socket.emit('FINISH_GAME', user.id)
				socket.off("in_game");			
				c.clearRect(0, 0, canvas.width, canvas.height);
				drawText("Game Finished or one of gameUser disconnected!", 40, canvas.height/2, 'black', c , "30px Arial");
				drawText("Press Espace for Waiting Room", 40, canvas.height/2 + 100, 'black', c , "30px Arial");		
				game_Start_flag = 4;
				return
			}
			if(data === "won") {
				socket.emit('FINISH_GAME', user.id)
				socket.off("in_game");
				axios.post(`${process.env.REACT_APP_API_URL}/user/set-status`, {
					id: user.id,
					status: 1
				}).then(() => {})
				navigate('/')
				alert('You won the game')
				// c.clearRect(0, 0, canvas.width, canvas.height);
				// drawText("You Won !", 40, canvas.height/2, 'black', c , "30px Arial");
				// drawText("Press Espace for Waiting Room", 40, canvas.height/2 + 100, 'black', c , "30px Arial");
				// game_Start_flag = 4; //game finish;
				
				return
			}
			if(data === "loss") {
				socket.emit('FINISH_GAME', user.id)
				socket.off("in_game");
				axios.post(`${process.env.REACT_APP_API_URL}/user/set-status`, {
					id: user.id,
					status: 1
				}).then(() => {})
				navigate('/')
				alert('You lost the game')
				//c.clearRect(0, 0, canvas.width, canvas.height);
				//drawText("You Lost !", 40, canvas.height/2, 'black', c , "30px Arial");
				//drawText("Press Espace for Waiting Room", 40, canvas.height/2 + 100, 'black', c , "30px Arial");
				//game_Start_flag = 4; //game finish;
				
				return
			}
			if(game_Start_flag) {
				drawRect(0,0,canvas.width,canvas.height,currentColor,c);
				// console.log(ball_colors[gameUser.ball_color]);
				drawCircle_2(data.ball_x, data.ball_y, data.radius);
				drawRect(0, data.user_left_y, gameUser.width, gameUser.height, gameUser.color, c);
				drawRect(canvas.width - gameUser.width, data.user_right_y, gameUser.width, gameUser.height, gameUser.color, c);
				drawText(data.user_left_score.toString(),canvas.width/4,canvas.height/5, 'white',c, "75px Arial");
				drawText(data.user_right_score.toString(),3*canvas.width/4,canvas.height/5, 'white',c, "75px Arial");
				drawNet();
				// drawCircle(data.ball_x, data.ball_y, data.radius, ball_colors[gameUser.ball_color], c);
				
			}
			
		}

		function drawCircle_2(x,y,r) {
			// console.log(color);
			
			c.beginPath();
			c.arc(x, y, 10, 0 , 2*Math.PI);
			c.strokeStyle = "green";
			c.stroke();
			c.closePath();

		}

		const show_lobby = (lobby_data) => {
			console.log(lobby_data);
			drawRect(0, 430, canvas.width, canvas.height,'white',c);
			for(var i = 0; i < lobby_data.length; i++){
				lobby_data_local.push(lobby_data[i]);
					c.drawImage(img, 40 + (i*80), 440);
			}
			// c.clearRect(0, 0, canvas.width, canvas.height);
		}

		socket.on("status", statusHandle_function);
		window.removeEventListener('unload', handleGlobalUnload)
		window.addEventListener('unload', unloadHandler)
		return () => {
			console.log('component unmount')
			socket.off("status");
			socket.off("lobby");
			socket.off("in_game");
			socket.emit('connection', ['disconnect', user.id])
			window.removeEventListener('unload', unloadHandler)
			window.addEventListener('unload', handleGlobalUnload)
		}
	// eslint-disable-next-line
	}, [])
	
	return (
		<> 
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
		</>
	
	)
}

export default Game