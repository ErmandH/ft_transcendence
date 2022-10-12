import { BadRequestException, Body, Controller, FileTypeValidator, Get, HttpException, HttpStatus, Param, ParseFilePipe, Post, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import multer, { diskStorage } from 'multer';
import { extname } from 'path';
import { identity, VirtualTimeScheduler } from 'rxjs';
import { ChangeNickDto } from './dto/changenick.dto';
import { UserService } from './user.service';



@Controller('user')
export class UserController {
	constructor(private userService:UserService){ }

	@Get('auth')
	async authUser(@Query('code') code:string){
		return await this.userService.authUser(code)
	}

	@Get('nick/:nick')
	getUserByNick(@Param('nick') nickname){
		return this.userService.getUserByNick(nickname)
	}

	@Get('id/:id')
	async getUserById(@Param('id') id){
		return await this.userService.getUserById(parseInt(id))
	}

	@Post('change-nickname')
	async updateNickanme(@Body() changeNickDto: ChangeNickDto){
		return await this.userService.changeNickName(changeNickDto)
	}

	@Post('change-avatar')
	@UseInterceptors(FileInterceptor('file', {
		storage: diskStorage ({
			destination: './public',
			filename: (req, file, callback) => {
				const ext = extname(file.originalname)
				const filename = `${file.originalname}`
				callback(null, filename)
			}
		}),
		fileFilter: (req: any, file, cb: (error: Error | null, acceptFile: boolean) => void) => {
			console.log(file)
			const ext = extname(file.originalname)
			if (ext === '.jpeg') {
			  	cb(null, true);
			} else {
				console.log('false')
			  cb(new BadRequestException('Only use jpeg files'), false);
			}
		  }
	}))
	async updateAvatar(@UploadedFile() file: Express.Multer.File, @Body('id') id: number){
		return await this.userService.changeAvatar(id)
	}

	@Post('generate')
	async generate2FA(@Body('id') id){
		return await this.userService.generateSecretAndQRCode(Number(id))	
	}

	@Post('verify')
	async verify2fa(@Body('id') id, @Body('token') token ){
		return await this.userService.verify2fa(id, token)
	}

	@Post('change-factor')
	async changeFactor(@Body('id') id){
		return await this.userService.changeFactor(id)
	}

	@Post('add-friend')
	async addFriend(@Body('id') id, @Body('nick') nick){
		return await this.userService.addFriend(Number(id), nick)
	}

	@Post('get-friends')
	async getFriends(@Body('id') id){
		return await this.userService.getFriends(id)
	}

	@Post('block-friend')
	async blockFriend(@Body('id') id, @Body('nick') nick :string, @Body('is_friend') isFriend : Boolean){		
		return await this.userService.blockFriend(Number(id), nick, isFriend)
	}

	@Post('get-blocks')
	async getBlocks(@Body('id') id){
		return await this.userService.getBlocks(id)
	}

	@Get('get-users/:id')
	async getUsers(@Param('id') id){
		return await this.userService.getAllUsers(Number(id))
	}

	@Post('get-blocked-bys')
	async getBlockedBys(@Body('id') id){
		return await this.userService.getBlockedBys(id)
	}

	@Post('remove-block')
	async removeBlock(@Body('id') id, @Body('nick') nick){
		return await this.userService.removeBlock(Number(id), nick)
	}

	@Get('get-matches/:id')
	async getMatchesById(@Param('id') id){
		console.log(id)
		return await this.userService.getMatchesById(Number(id))
	}

	@Get('get-achievements/:id')
	async getAchievementsById(@Param('id') id){
		return await this.userService.getAchievementsById(Number(id))
	}

	@Post('set-status')
	async changeUserStatus(@Body('id') id, @Body('status') status){
		return await this.userService.changeStatusById(Number(id), Number(status))
	}

	@Get('get-hi')
	getHi(){
		return 'Hello from server'
	}
}
