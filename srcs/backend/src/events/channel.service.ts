import * as argon from 'argon2'
import { io } from 'socket.io-client';


async function sleep(ms: number) {
  return await new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/*
  {
    channel_name : string
    chanel_id: number
    user: any[];
    cnahel_status : string => priviet, public, protected 
    password: string,
    owner : number[]
  }
*/
/*
    {
      user_id : number,
      user_nick: string,
      is_owner: boolean,
      is_banned: boolean,
      is_muted: boolean,
      begin_time: number,
      end_time: number
    }
  */
export class ChannelService {
  private data: {
    channel_name: string;
    channel_id: number;
    users: {
      socket: any;
      user_id: number;
      user_nick: string;
      is_owner: boolean;
      is_muted: boolean;
      is_online: boolean;
    }[];
    channel_status: number;
    password: string;
    owners: number[];
    banned_users: any[];
  };

  private socket: any;
  private game_list = []
  private socket_flag: any;

  constructor(data: any) {
    this.data = data;

    this.socket = io(`http://localhost:3334`);
    this.socket.addEventListener(this.data.channel_id, async (data) => {
       await this.sendAll(data);
    });
  }

  async sendAll(data: any) {
    let com = JSON.parse(data);
    console.log(com)
    if (await this.isInChannel(com.sender) === false) return false;
    if (await this.isBanned(com.sender)) return false;
    if (await this.isMuted(com.sender)) return false;

    const payload = {
      sender : this.data.channel_id,
      target: 0,
      replier: com.sender,
      replier_nick:com.sender_nick,
      data: com.data
    }
    for (let i = 0; i < this.data.users.length; i++) {
      //if (this.data.users[i].is_online === true) {
        payload.target = this.data.users[i].user_id;
        this.socket.emit("PRIV", JSON.stringify(payload));
      //  this.data.users[i].socket.emit(this.data.users[i].user_id, JSON.stringify(payload));
      //}
    }
  }

  /*
  user {
      user_id: number,
      socket: any
  }
  */
  async getChannelName(): Promise<string> {
    return this.data.channel_name;
  }

  async getChanId(): Promise<number> {
    return this.data.channel_id;
  }
  async join(user: any) {
    if (this.isInChannel(user.user_id)) return false;
    this.data.users.push(user);
  }


  async getInfo() : Promise<any>{
    const mydata = this.data
    const temp = {
        channel_name: mydata.channel_name,
      channel_id: mydata.channel_id,
      users: [],
      channel_status: mydata.channel_status,
      password: mydata.password,
      owners: mydata.owners,
      banned_users: mydata.banned_users
    }
    for (let i = 0; i < this.data.users.length; i++) {
      const elem = this.data.users[i];
      temp.users.push({
        user_id: elem.user_id,
        user_nick: elem.user_nick,
        is_owner: elem.is_owner,
        is_online: elem.is_online,
        is_muted: elem.is_muted
      })
    }
    return temp
  }

  async getInfoLow() : Promise<any>{
    return ({
      channel_name : this.data.channel_name,
      channel_status : this.data.channel_status,
    })
  }

  // checkGameList(invited_id: number) : boolean{
  //   for (let i = 0; i < this.game_list.length; i++) {
  //     const game = this.game_list[i];
  //     if (game.invited_id === invited_id || game.user_id)
  //       return false
  //   }
  //   return true
  // }

   getUserById(id)  {
    for (let i = 0; i < this.data.users.length; i++) {
      const element = this.data.users[i];
      if (element.user_id === id){
        return element
      }
    }
    return undefined
  }

   inviteGame(user_id:number, invited_id:number, busy: number[]){
      // onceden listede olup olmadigini kontrol et

      this.game_list.push({ user_id:user_id, invited_id:invited_id, is_accepted:false })

      const invited_user =  this.getUserById(invited_id)
      const inviter = this.getUserById(user_id)

      invited_user.socket.emit('GET_INVITE', JSON.stringify({ user_id:user_id, user_nick: inviter.user_nick, channel_name: this.data.channel_name }))
      setTimeout(() => {
        for (let h = 0; h < this.game_list.length; h++) {
          const game = this.game_list[h];
          if (game.user_id === inviter.user_id ){
              if (game.is_accepted === false){
                  invited_user.socket.emit('INVITE_RES', false)
                  inviter.socket.emit('INVITE_RES', false)
                  busy.splice(busy.indexOf(invited_user.user_id), 1)
                  busy.splice(busy.indexOf(inviter.user_id), 1)       
              }
          }
        }
     }, 15000);

      // for (let i = 0; i < this.data.users.length; i++) {
      //   const user = this.data.users[i];
      //   if (user.user_id === invited_id){
      //     for (let j = 0; j < this.data.users.length; j++) {
      //       const elem = this.data.users[j];
      //       if (elem.user_id === user_id){
      //         user.socket.emit('GET_INVITE', JSON.stringify({ user_id:user_id, user_nick: elem.user_nick, channel_name: this.data.channel_name }))
      //         setTimeout(() => {
      //            for (let h = 0; h < this.game_list.length; h++) {
      //              const game = this.game_list[h];
      //              if (game.user_id === user_id){
      //                  for (let e = 0; e < this.data.users.length; e++) {
      //                    const u = this.data.users[e];
      //                    if (u.user_id === user_id || u.user_id === invited_id)
      //                         u.socket.emit('INVITE_RES', false)
      //                  }
      //              }
      //            }
      //         }, 15000);

      //       }
      //     }        
      //   }
      // }
      return true
  }

  acceptInvite(user_id:number, opponent_id:number){
    for (let i = 0; i < this.game_list.length; i++) {
      const game = this.game_list[i];
      if (game.invited_id === user_id && game.user_id === opponent_id){
        game.is_accepted = true
        for (let e = 0; e < this.data.users.length; e++) {
            const u = this.data.users[e];
            if (u.user_id === user_id || u.user_id === opponent_id)
              u.socket.emit('INVITE_RES', game.is_accepted)
        }      
        return true
      }
    }
    return false
  }

  async addUser(user: any): Promise<boolean> {
    if (await this.isInChannel(user.user_id)) {
      return true;
    }
    if (await this.isBanned(user.user_id)) {
      return false;
    }
    if (
      (this.data.channel_status === 1 || this.data.channel_status === 0  )&&
      await argon.verify(this.data.password, user.password)
    ) {
      delete user.password;
      if (this.data.users.length === 0){
        user.is_owner = true;
        this.data.owners.push(user.user_id);
      }
      this.data.users.push(user);
      return true;
    }
    if (this.data.channel_status === 2) {
      if (this.data.users.length === 0){
        user.is_owner = true;
        this.data.owners.push(user.user_id);
      }
      delete user.password;
      this.data.users.push(user);
      return true;
    }
    return false;
  }

  async addOwner(prev_owner: number, new_owner: number): Promise<boolean> {
    if (await this.isOwner(prev_owner)) {
      if (await this.isOwner(new_owner) === false) {
        this.data.owners.push(new_owner);
        for (let i = 0; i < this.data.users.length; i++){
          if (this.data.users[i].user_id === new_owner)
            this.data.users[i].is_owner = true;
        }
        return true;
      }
    }
    return false;
  }

  async setOffline(client: any) {
    for (let i = 0; i < this.data.users.length; i++) {  
      if (this.data.users[i].is_online && undefined !== this.data.users[i].socket  && client.id === this.data.users[i].socket.id) {
        this.data.users[i].is_online = false;
        this.data.users[i].socket = undefined;
        return;
      }
    }
  }

  async setOnline(user_id: number, client: any) {
    for (let i = 0; i < this.data.users.length; i++) {
      if (user_id === this.data.users[i].user_id) {
        this.data.users[i].is_online = true;
        this.data.users[i].socket = client;
        return;
      }
    }
  }

  async changeStatus(user_id: number, status: number, pass:string): Promise<boolean> {
    console.log('geldi ', user_id, ' ', status, ' ', pass )
  
    if (await this.isOwner(user_id) && status < 3 && status >= 0) {
      this.data.channel_status = status;
      await this.changePassw(user_id, pass)
      console.log('girdi')
      return true;
    } else {
      return false;
    }
  }

  async isInChannel(user_id: number): Promise<boolean> {
    for (let i: number = 0; i < this.data.users.length; i++) {
      if (user_id === this.data.users[i].user_id) 
        return true;
    }
    return false;
  }

  async isMuted(user_id: number): Promise<boolean> {
    for (let i : number = 0; i < this.data.users.length; i++) {
      if (user_id === this.data.users[i].user_id) return this.data.users[i].is_muted;
    }
    return true;
  }

  async isOwner(user_id: number): Promise<boolean> {
    for (let i : number = 0; i < this.data.owners.length; i++) {
      if (user_id === this.data.owners[i]) return true;
    }
    return false;
  }

  async isBanned(user_id: number): Promise<boolean> {
    for (let i: number = 0; i < this.data.banned_users.length; i++) {
      if (user_id === this.data.banned_users[i].user_id) return true;
    }
    return false;
  }

  async banUser(user_id: number, banned_id: number): Promise<boolean> {
    if (await this.isInChannel(user_id) === false) return false;
    if (await this.isInChannel(banned_id) === false) return false;
    if (await this.isOwner(banned_id)) return false;
    if (await this.isOwner(user_id) === false) return false;

    for (let i = 0; i < this.data.users.length; i++) {
      if (banned_id === this.data.users[i].user_id){
          this.data.banned_users.push({user_id: this.data.users[i].user_id, user_nick: this.data.users[i].user_nick});
          this.data.users.splice(i, 1);
          return true
      }
    }
    return false;
  }

  async unBanUser(user_id: number, banned_id: number): Promise<boolean> {
    if (await this.isInChannel(user_id) === false) return false;
    if (await this.isBanned(banned_id) === false) return false;
    if (await this.isOwner(user_id) === false) return false;

    for (let i = 0; i < this.data.banned_users.length; i++) {
      if (banned_id === this.data.banned_users[i].user_id){
          this.data.banned_users.splice(i, 1);
          return true;
      }
    }
    return false;
  }


  async muteUser(user_id: number, muted_id: number): Promise<boolean> {
    if (await this.isInChannel(user_id) === false) return false;
    if (await this.isInChannel(muted_id) === false) return false;
    if (await this.isOwner(muted_id)) return false;
    if (await this.isOwner(user_id) === false) return false;

    for (let i = 0; i < this.data.users.length; i++) {
      if (muted_id === this.data.users[i].user_id)
        this.data.users[i].is_muted = true;
    }
    //setInterval(() => this.unMuteUser(user_id, muted_id), 10000);
  }



  async unMuteUser(user_id: number, unmuted_id: number) {
    if (await this.isInChannel(user_id) === false) return false;
    if (await this.isOwner(user_id) === false) return false;
    if (await this.isInChannel(unmuted_id) === false) return false;

    for (let i = 0; i < this.data.users.length; i++) {
      if (unmuted_id === this.data.users[i].user_id){
        this.data.users[i].is_muted = false;
        return true;
      } 
    }
    return false;
  }

  async changePassw(user_id: number ,pass: string): Promise<boolean> {
    if (await this.isOwner(user_id)) {
      this.data.password = await argon.hash(pass);
      return true;
    }
    return false;
  }

  async leaveChannel(user_id: number) {
    for (let i = 0; i < this.data.users.length; i++) {
      if (user_id === this.data.users[i].user_id) {
        if (this.data.users[i].is_owner === true){
          for(let j :number = 0; j < this.data.owners.length; j++){
            if (this.data.users[i].user_id === this.data.owners[j]){
                this.data.owners.splice(j, 1);
            }
          }
        }
        this.data.users.splice(i, 1);
      }
    }
    if (this.data.users.length === 0){
      this.data.channel_status = 2;
    }
      else if(this.data.owners.length === 0) {
        this.data.users[0].is_owner = true;
        this.data.owners.push(this.data.users[0].user_id);
      }
  }
}
