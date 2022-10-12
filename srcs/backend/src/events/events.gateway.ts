import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';

import { Socket } from 'dgram';
import { Server } from 'socket.io';
import { ChannelService } from './channel.service';
import * as argon from 'argon2'

const channels: ChannelService[] = [];

const onlineUsers = []
const busy = []

@WebSocketGateway({ cors: { origin: '*' } })
export class EventsGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  @WebSocketServer()
  server: Server;

  async handleDisconnect(client: any) {
    for (let i = 0; i < channels.length; i++) {
      await channels[i].setOffline(client);
    }
    for (let i = 0; i < onlineUsers.length; i++) {
      if (client.id === onlineUsers[i].client.id){
        onlineUsers.splice(i, 1)
        break
      }
    }
    await this.handleGetAll(client, {})
  }
  handleConnection(client: any, ...args: any[]) {
    console.log('connected = ' + client.id);
  }
  afterInit(server: any) {
    console.log('init');
  }

  async getRandomInt(): Promise<number> {
    return Math.floor(Math.random() * 10000);
  }
  async isOnChannel(channel_name: string): Promise<boolean> {
    for (let i = 0; i < channels.length; i++) {
      if (channel_name === await channels[i].getChannelName()) return true;
    }
    return false;
  }

  /*
    data {
      user_id: number,
      user_nick: string,
      channel_name: string,
      status: number,
      password: string
    }
    */
  @SubscribeMessage('CHAN')
  async handleChannel(client: any, data: any): Promise<any> {
    let com = JSON.parse(data);
    const check = await this.isOnChannel(com.channel_name)
    if (check) {
      //client.emit() // hata
      return false; // emit yapilacak
    } else {
      let id = await this.getRandomInt();
      channels.push(
        new ChannelService({
          channel_name: com.channel_name,
          channel_id: id,
          users: [],
          channel_status: com.status,
          password:  await argon.hash(com.password),
          owners: [],
          banned_users:[]
        }),
      );
      await this.handleChannelJoin(client, data)
      await this.handleGetAll(client, data)
      return true;
    }
  }

  @SubscribeMessage('JOIN')
  async handleChannelJoin(client: any, data: any): Promise<any> {
    let com = JSON.parse(data);
    let res: boolean;
    for (let i = 0; i < channels.length; i++) {
      // channel varsa
      if (com.channel_name === await channels[i].getChannelName()) {
        res = await channels[i].addUser({
          socket: client,
          user_id: com.user_id,
          user_nick: com.user_nick,
          is_owner: false,
          is_muted: false,
          is_online: true,
          password: com.password,
        });
        if (res === false) {
          client.emit('JOIN_STATUS', false)
          return false;
        } else {
          this.handleGetAll(client, data)
          client.emit('JOIN_STATUS', true)
          return true;
        }
      }
    }
  }

/*
{
  user_id : number,
  channel_name: string;
  commnad: string,
  param1: any,
  param2 : any
}asasdasd
*/

  // checkAlreadyInGame(client:Socket, com) : Boolean{
  //     for (let i = 0; i < channels.length; i++) {
  //       const c = channels[i];
  //       c.checkGameList(com.param1)
  //     }
  // }

  @SubscribeMessage('ADMIN')
  async handleAdmin(client: Socket, data : any) : Promise<boolean>{
    let com : any = JSON.parse(data)
    // if (this.checkAlreadyInGame(client ,com) === false){
    //     client.emit('INVITE_RES', false)
    // }
    for (let i : number = 0; i < channels.length; i++){
      if (com.channel_name === await channels[i].getChannelName()){
        if (com.command === "change_password")
          await channels[i].changePassw(com.user_id, com.param1)
        else if(com.command === "mute_user"){
          await channels[i].muteUser(com.user_id, com.param1);
          setTimeout(async () => {
              await channels[i].unMuteUser(com.user_id, com.param1)
              await this.handleGetAll(client, data)
          }, 20000);
        }     
        else if(com.command === "unmute_user")
          await channels[i].unMuteUser(com.user_id, com.param1);
        else if(com.command === "ban_user")
           await channels[i].banUser(com.user_id, com.param1);
        else if(com.command === "unban_user")
          await channels[i].unBanUser(com.user_id, com.param1);
        else if (com.command === "change_status")
          await channels[i].changeStatus(Number(com.user_id), Number(com.param1), com.param2)
        else if (com.command === "add_admin")
          await channels[i].addOwner(com.user_id, com.param1);
        else if (com.command === "invite_game"){
          for (let i = 0; i < busy.length; i++) {
            const g = busy[i];
            if (g === com.param1){          
              client.emit('FEEDBACK', `Cannot be invited. Player is busy!`)
              client.emit('INVITE_RES', false)
              return false
            }
          }
          busy.push(com.user_id)
          busy.push(com.param1)
          channels[i].inviteGame(com.user_id, com.param1, busy);
        }
          
        else if (com.command === "accept_invite"){
          channels[i].acceptInvite(com.user_id, com.param1);
        }
          
       await this.handleGetAll(client, data)  
        return (true)
      }
    }
    client.emit('FEEDBACK', "Command not found")
    return false;
  }


  @SubscribeMessage('GET_ALL')
  async handleGetAll(client: any, data: any) {
    const all = []
    for (let index = 0; index < channels.length; index++) {
      all.push(await channels[index].getInfoLow())
    }

    for (let i = 0; i < onlineUsers.length; i++) {
      const my = []

      for (let j = 0; j < channels.length; j++) {
        if (await channels[j].isInChannel(onlineUsers[i].user_id)){
          my.push(await channels[j].getInfo())
        }
      }
        onlineUsers[i].client.emit('GET_ALL', JSON.stringify({ my_channels:my, all_channels: all }))    
    }
  }
  

  @SubscribeMessage('ONLINE')
  async handleOnline(client: any, data: any) {
    let com = JSON.parse(data);
    onlineUsers.push({ client:client, user_id: com.user_id })
    for (let i = 0; i < channels.length; i++) {
      if (await channels[i].isInChannel(com.user_id))
        await channels[i].setOnline(com.user_id, client);
    }
    await this.handleGetAll(client, data)
  }


  @SubscribeMessage('LEAVE')
  async handleLeave(client: any, data: any) {
    let com = JSON.parse(data);
    for (let i = 0; i < channels.length; i++) {
      if (com.channel_name === await channels[i].getChannelName()) {
        await channels[i].leaveChannel(com.user_id);
      }
    }
    await this.handleGetAll(client, data)
  }

  @SubscribeMessage('FINISH_GAME')
  async handleFinishGame(client: any, id: any) {
    busy.splice(busy.indexOf(id), 1)
  }

  @SubscribeMessage('PRIV')
  async handleEvent(client: any, data: any): Promise<string> {
    let com = JSON.parse(data);

    if (com.sender != '' && com.target != '') {
      this.server.emit(com.target, data);
      return data;
    }
    return undefined;
  }

  @SubscribeMessage('DM')
  async handlDirectMessage(client: any, data: any): Promise<any> {
    const com = JSON.parse(data);

    if (com.sender != '' && com.target != '') {
      this.server.emit(com.target, data);
      return data;
    }
    return undefined;
  }
}
