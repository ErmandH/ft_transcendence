import { IsEmail, IsNotEmpty, IsNumber, IsString, MinLength } from "class-validator";

export class ChangeNickDto{
	@IsNotEmpty()
	@IsString()
	nick:string

	@IsNotEmpty()
	@IsNumber()
	id:number
}