import { Request } from "express";
import { Database, User } from "../types";

export const authorize = async (db: Database, req: Request): Promise<User | null> => {
  const token = req.get("X-CSRF-TOKEN");
  // 根据请求cookie和令牌查找返回对象
  const viewer = await db.users.findOne({
    _id: req.signedCookies.viewer,
    token
  });
  return viewer;
};