import { AuthUser, BetUser, PartialUser } from "../user/types";
import get from "lodash/get";

export const nameOrUsername = (user: BetUser | AuthUser | PartialUser) => {
  const source = get(user, "source", null);
  if (
    (source === null || source === "facebook") &&
    "isFirstEdit" in user &&
    user.isFirstEdit === false
  ) {
    return user.name;
  } else {
    return user.username;
  }
};
