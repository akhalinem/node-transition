interface Message {
  id: string;
  roomId: string;
  userId: string;
  username: string;
  content: string;
  createdAt: Date;
}

export type ClientMessage =
  | { type: "authenticate"; token: string }
  | { type: "send_message"; roomId: string; content: string }
  | { type: "join_room"; roomId: string }
  | { type: "leave_room"; roomId: string };

export type ServerMessage =
  | { type: "authenticated"; userId: string; username: string }
  | { type: "auth_error"; message: string }
  | { type: "new_message"; message: Message }
  | { type: "user_joined"; roomId: string; userId: string }
  | { type: "user_left"; roomId: string; userId: string }
  | { type: "error"; message: string };
