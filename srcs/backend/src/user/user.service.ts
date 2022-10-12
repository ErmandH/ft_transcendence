import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom, lastValueFrom, map } from 'rxjs';
import { PrismaService } from 'src/prisma/prisma.service';
import { ChangeNickDto } from './dto/changenick.dto';
import * as speakeasy from "speakeasy";
import * as qrcode from "qrcode";
import { User } from '.prisma/client';

@Injectable()
export class UserService {
	constructor(private context:PrismaService,private config:ConfigService, private readonly httpService: HttpService){}

	async getToken(code:string)
	{
		try {
			const data = {
				grant_type: 'authorization_code',
				client_id: this.config.get('CLIENT_ID'),
				client_secret: this.config.get('CLIENT_SECRET'),
				code:code,
				redirect_uri: this.config.get('REDIRECT_URI')
			}
			const res = await firstValueFrom(this.httpService.post('https://api.intra.42.fr/oauth/token', data))
			return res.data;
		}
		
		catch {
			throw new HttpException('Error occured', 401)
		}
	}

	async getIntraUser(accessObject){
		try {
			const data = await lastValueFrom(
				this.httpService.get('https://api.intra.42.fr/v2/me', {
					headers:{
						'Authorization' : `Bearer ${accessObject.access_token}`
					}
				}).pipe(
				  map(resp => resp.data)
				)
			  );
			const coalitionData = await lastValueFrom(
				this.httpService.get(`https://api.intra.42.fr/v2/users/${data.id}/coalitions`, {
					headers:{
						'Authorization' : `Bearer ${accessObject.access_token}`
					}
				}).pipe(
				  map(resp => resp.data)
				)
			  );
			  data.coalition_img = coalitionData[0].cover_url
			  data.coalition_color = coalitionData[0].color
			  return data
		}
		catch{
			throw new HttpException('Error occured', 402)
		}
	}

	async getUserById(id){
		try
		{
			const userExist = await this.context.user.findUnique({
				where: {
					id: id
				}
			})
			if (userExist)
				return userExist
			return null
		}
		catch
		{
			throw new HttpException('Error occured', HttpStatus.FORBIDDEN)
		}
	}

	async getUserByLogin(login:string){
		try
		{
			const userExist = await this.context.user.findFirst({
				where: {
					login: login
				}
			})
			if (userExist)
				return userExist
			return null
		}
		catch
		{
			throw new HttpException('Error occured', 403)
		}
	}

	async getUserByNick(nick:string){
		try
		{
			const userExist = await this.context.user.findUnique({
				where: {
					nick: nick
				}
			})
			if (userExist)
				return userExist
			return null
		}
		catch
		{
			throw new HttpException('Error occured', HttpStatus.FORBIDDEN)
		}
	}

	addNewUser(userData){
		try{
			const user = this.context.user.create({
				data:{
					nick: userData.login,
					avatar: `${this.config.get('API_URL')}/default.png`,
					email: userData.email,
					name: userData.first_name,
					surname: userData.last_name,
					login: userData.login,
					two_factor_enabled: false,
					status:0,
					win:0,
					lose:0,
					level:0,
				}
			})
			const retUser = Object(user)
			return retUser
		}
		catch{
			throw new HttpException('Error occured', 405)
		}
	}

	async authUser(code:string){
		try
		{
			const accessObject = await this.getToken(code)
			const userData = await this.getIntraUser(accessObject)
			const userExist = await this.getUserByLogin(userData.login)
			let retUser
			if (!userExist){
				retUser = Object(await this.addNewUser(userData))
				retUser.coalition_img = userData.coalition_img
				retUser.coalition_color = userData.coalition_color
				return retUser
			}
			retUser = Object(userExist)
			retUser.coalition_img = userData.coalition_img
			retUser.coalition_color = userData.coalition_color
			return retUser
		}
		catch
		{
			throw new HttpException('Error occured', 400)
		}
	}

	async changeNickName(changeNickDto: ChangeNickDto){
		const {nick, id} = changeNickDto

		const userExist = await this.getUserByNick(nick)
		if (userExist)
			throw new HttpException('Nickname already taken', HttpStatus.FORBIDDEN)
		const user = this.context.user.findUnique({
			where:{
				id:id
			}
		})
		if (!user)
			throw new HttpException('User not found', HttpStatus.FORBIDDEN)
		await this.context.user.update({
			where:{
				id: id
			},
			data:{
				nick: nick
			}
		})
		return {nick: nick}
	}

	async changeAvatar(id){
		const userExist = await this.getUserById(Number(id))
		if (!userExist)
			throw new HttpException('User not found', HttpStatus.FORBIDDEN)
		const updatedUser = await this.context.user.update({
			where:{
				id: Number(id),
			},
			data:{
				avatar: `${this.config.get('API_URL')}/${userExist.login}.jpeg`
			}
		})
		return updatedUser
	}

	async changeFactor(id){
		const userExist = await this.getUserById(Number(id))
		if (!userExist)
			throw new HttpException('User not found', HttpStatus.FORBIDDEN)
		const updatedUser = await this.context.user.update({
			where:{
				id: Number(id),
			},
			data:{
				two_factor_enabled: !userExist.two_factor_enabled
			}
		})
		return updatedUser
	}

	async generateSecretAndQRCode(id){
		const user = await this.getUserById(Number(id))
		if (!user)
			throw new HttpException('User not exist', HttpStatus.FORBIDDEN)
		const secret = speakeasy.generateSecret({
			name: 'ft_transcendence'
		})
		await this.context.user.update({
			where:{
				id: id
			},
			data:{
				two_factor_secret: secret.ascii
			}
		})
		let qrData = null
		const generateQR = async text => {
			try {
				return await qrcode.toDataURL(text);
			} 
			catch (err) {
				throw new HttpException('Error occured', HttpStatus.FORBIDDEN)
			}
		}
		qrData = await generateQR(secret.otpauth_url)
		return qrData
	}

	async verify2fa(id, token){
		const user = await this.getUserById(Number(id))
		if (!user)
			throw new HttpException('User not exist', HttpStatus.FORBIDDEN)
		const verified = speakeasy.totp.verify({
				secret: user.two_factor_secret,
				encoding: 'ascii',
				token: token
			})
		return verified
	}

	async isBlocked(user, friendId){
		for (let index = 0; index < user.blockeds.length; index++) {
			if (user.blockeds[index] === friendId)
				return true
		}
		return false
	}

	async isAlreadyFriend(user, friendId){
		for (let index = 0; index < user.friends.length; index++) {
			if (user.friends[index] === friendId)
				return true
		}
		return false
	}

	async addFriend(id, nick){
		try{
			const userExist = await this.getUserById(id)
			if (!userExist)
				throw new HttpException('User not exist', HttpStatus.FORBIDDEN)
			const userWithNickExist = await this.getUserByNick(nick)
			if (!userWithNickExist)
				throw new HttpException('User not exist', HttpStatus.FORBIDDEN)
			if (userWithNickExist.id === id)
			throw new HttpException('You cannot add yourself', HttpStatus.FORBIDDEN)
			const isUserAlreadyFriend = await this.isAlreadyFriend(userExist, userWithNickExist.id)
			if (isUserAlreadyFriend)
				throw new HttpException('User is already friend', HttpStatus.FORBIDDEN)
			const isUserBlocked = await this.isBlocked(userExist, userWithNickExist.id)
			 if (isUserBlocked)
			 	throw new HttpException('User is blocked', HttpStatus.FORBIDDEN)
			await this.context.user.update({
				where:{
					id:id
				},
				data:{
					friends:{
						push:userWithNickExist.id
					}
				}
			})
			await this.context.user.update({
				where:{
					id:userWithNickExist.id
				},
				data:{
					friends:{
						push:id
					}
				}
			})
			return {nick: nick}
		}
		catch{
			throw new HttpException('Error Occured', HttpStatus.FORBIDDEN)
		}
	}

	async getFriends(id){
		const userExist = await this.getUserById(id)
		if (!userExist)
			throw new HttpException('User not exist', HttpStatus.FORBIDDEN)
		const friendArray = []
		for (let index = 0; index < userExist.friends.length; index++) {
			const friend = await this.getUserById(userExist.friends[index])
			friendArray.push(friend)
		}
		return friendArray
	}

	async blockFriend(id, nick, isFriend){
		try{
			const userExist = await this.getUserById(id)
			if (!userExist)
				throw new HttpException('User not exist', HttpStatus.FORBIDDEN)
			const userWithNickExist = await this.getUserByNick(nick)
			if (!userWithNickExist)
				throw new HttpException('User not exist', HttpStatus.FORBIDDEN)
			const alreadyBlocked = await this.isBlocked(userExist, userWithNickExist.id)
			if (alreadyBlocked)
				throw new HttpException('User already blocked', HttpStatus.FORBIDDEN)
			await this.context.user.update({
				where:{
					id:id
				},
				data:{
					blockeds:{
						push:userWithNickExist.id
					}
				}
			})
			await this.context.user.update({
				where:{
					id:userWithNickExist.id
				},
				data:{
					blockedBy:{
						push:id
					}
				}
			})
			if (isFriend === true){
				const friendArr = userExist.friends
				friendArr.splice(friendArr.indexOf(userWithNickExist.id), 1)
				await this.context.user.update({
					where:{
						id:userExist.id
					},
					data:{
						friends: friendArr
					}
				})

				const friendArr2 = userWithNickExist.friends
				friendArr2.splice(friendArr2.indexOf(userExist.id), 1)
				await this.context.user.update({
					where:{
						id:userWithNickExist.id
					},
					data:{
						friends: friendArr2
					}
				})
			}
			
			return { nick:nick }
		}
		catch{
			throw new HttpException('Error Occured', HttpStatus.FORBIDDEN)
		}
	}

	async getBlocks(id){
		const userExist = await this.getUserById(id)
		if (!userExist)
			throw new HttpException('User not exist', HttpStatus.FORBIDDEN)
		const blockArray = []
		for (let index = 0; index < userExist.blockeds.length; index++) {
			const block = await this.getUserById(userExist.blockeds[index])
			blockArray.push(block)
		}
		return blockArray
	}

	async getBlockedBys(id){
		const userExist = await this.getUserById(id)
		if (!userExist)
			throw new HttpException('User not exist', HttpStatus.FORBIDDEN)
		const blockArray = []
		for (let index = 0; index < userExist.blockedBy.length; index++) {
			const block = await this.getUserById(userExist.blockedBy[index])
			blockArray.push(block)
		}
		return blockArray
	}

	async removeBlock(id, nick){
		const userExist = await this.getUserById(id)
		if (!userExist)
			throw new HttpException('User not exist', HttpStatus.FORBIDDEN)
		const userWithNickExist = await this.getUserByNick(nick)
		if (!userWithNickExist)
			throw new HttpException('User not exist', HttpStatus.FORBIDDEN)
		const blockArray = userExist.blockeds
		blockArray.splice(blockArray.indexOf(userWithNickExist.id), 1)
		await this.context.user.update({
			where:{
				id:userExist.id
			},
			data:{
				blockeds: blockArray
			}
		})

		const blockedByArray = userWithNickExist.blockedBy
		blockedByArray.splice(blockedByArray.indexOf(userExist.id), 1)
		await this.context.user.update({
			where:{
				id:userWithNickExist.id
			},
			data:{
				blockedBy: blockedByArray
			}
		})
		return { nick:nick }
	}

	async getMatchesById(id){
		const userExist = await this.getUserById(id)
		if (!userExist)
			throw new HttpException('User not exist', HttpStatus.FORBIDDEN)
		const matches = await this.context.matchHistory.findMany({
			where:{
				OR:[
					{
						user1:id,				
					},
					{
						user2:id
					}
				]
			}
		})
		const retData = matches.map(async (value) => {
			let opponent
			if (value.user1 === id)
				opponent = value.user2
			else
				opponent = value.user1
			const opponentData = await this.getUserById(opponent)
			const jsonCopy = JSON.parse(JSON.stringify(value))
			jsonCopy.opponent = opponentData.nick
			return jsonCopy
		})
		return Promise.all(retData)
	}

	async amIBlocked(user: User, id:number){
		for (let i = 0; i < user.blockedBy.length; i++) {
			if (id === user.blockedBy[i])
				return true
		}
		return false
	}

	async getAllUsers(id: number){
		const myself = await this.context.user.findUnique({ where:{ id:id } })
		if (!myself) throw new HttpException('User not exist', HttpStatus.FORBIDDEN)

		const retArr : User[] = []
		const allUsers = await this.context.user.findMany()
		for (let i = 0; i < allUsers.length; i++) {
			if (await this.isAlreadyFriend(myself, allUsers[i].id) === false && await this.isBlocked(myself, allUsers[i].id) === false 
			&& await this.amIBlocked(myself, allUsers[i].id) === false && allUsers[i].id !== myself.id){
				retArr.push(allUsers[i])
			}
		}
		return retArr
	}

	async getAchievementsById(id){
		const userExist = await this.getUserById(id)
		if (!userExist)
			throw new HttpException('User not exist', HttpStatus.FORBIDDEN)
		const achievements = await this.context.achievements.findMany({
			where:{
				userId:id
			}
		})
		return achievements
	}

	async changeStatusById(id, status){
		const userExist = await this.getUserById(id)
		if (!userExist)
			throw new HttpException('User not exist', HttpStatus.FORBIDDEN)
		const updated = await this.context.user.update({
			where:{ id:id },
			data:{ status: status }
		})
		return updated
	}

}
