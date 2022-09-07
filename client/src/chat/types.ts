import { Game } from "../game/types";
import { PartialUser } from "../user/types";

export interface Comment {
  message: string;
  commenter: PartialUser[];
  game: Game;
}
