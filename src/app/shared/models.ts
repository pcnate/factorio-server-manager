import { Subject } from 'rxjs';

export interface Chat {
  user: string;
  message: string;
  type: string;
  date: number;
}

export interface OnlineUserCount {
  message: string;
  body: number;
}

export interface MessageBody {
  [ key: string ]: any;
}

export interface QueuedMessage {
  message: string;
  body: MessageBody;
  sent: boolean;
}

export interface Message {
  message: string;
  body: MessageBody;
}

export interface Subjects {
  [ key: string ]: Subject<Message>;
}

export interface User {
  user: string;
  joined: number;
  left?: number;
  admin?: boolean;
  online?: boolean;
  banlisted?: boolean;
  whitelisted?: boolean;
}

export interface UserBody {
  user: User;
}

export interface UsersList {
  body: User[];
  message: string;
}

export interface UserJoin {
  body: UserBody;
  message: string;
}

export interface UserLeft {
  body: UserBody;
  message: string;
}