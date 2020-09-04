import { Request } from "express";
import { IResolvers } from "apollo-server-express";
import { Database, User } from "../../../lib/types";
import { authorize } from "../../../lib/utils";
import {
  UserArgs,
  UserBookingsArgs,
  UserBookingsData,
  UserListingsArgs,
  UserListingsData
} from "./types"

export const userResolvers: IResolvers = {
  Query: {
    user: async (
      _root: undefined,
      { id }: UserArgs,
      { db, req }: { db: Database; req: Request }
    ): Promise<User> => {
      try {
        const user = await db.users.findOne({ _id: id });

        // 未查找到用户
        if (!user) {
          throw new Error("未查询到此用户");
        }

        const viewer = await authorize(db, req);
        // 匹配查看者和user_id是否相同
        if (viewer && viewer._id === user._id) {
          user.authorized = true;
        }


        return user;
      } catch (error) {
        // 请求用户错误
        throw new Error(`没有请求到该用户: ${error}`)
      }
    }
  },
  User: {
    id: (user: User): string => {
      return user._id;
    },
    hasWallet: (user: User): boolean => {
      return Boolean(user.walletId);
    },
    income: (user: User): number | null => {
      return user.authorized ? user.income : null;
    },
    bookings: async (
      user: User,
      { limit, page }: UserBookingsArgs,
      { db }: { db: Database }
    ): Promise<UserBookingsData | null> => {
      try {
        // 未经授权的用户
        if (!user.authorized) {
          return null;
        }

        // 初始化UserBookingsData
        const data: UserBookingsData = {
          total: 0,
          result: []
        };

        // 定义游标 分段数据库信息
        let cursor = await db.bookings.find({
          _id: { $in: user.bookings }
        });

        // 游标跳过
        cursor = cursor.skip(page > 0 ? (page - 1) * limit : 0);
        // page =1 ；limit = 10 ; cursor starts at 0
        // page = 2; limit = 10 ; cursor start at 10
        // page =3 ; limit = 10 ; cursr start at 20

        cursor = cursor.limit(limit);

        data.total = await cursor.count();
        data.result = await cursor.toArray();

        return data;
      } catch (error) {
        throw new Error(`不能请求到用户的预订： ${error}`)
      }
    },
    listings: async (
      user: User,
      { limit, page }: UserListingsArgs,
      { db }: { db: Database }
    ): Promise<UserListingsData | null> => {
      try {
        // 初始化UserBookingsData
        const data: UserListingsData = {
          total: 0,
          result: []
        };

        // 定义游标 分段数据库信息
        let cursor = await db.listings.find({
          _id: { $in: user.listings }
        });

        // 游标跳过
        cursor = cursor.skip(page > 0 ? (page - 1) * limit : 0);
        // page =1 ；limit = 10 ; cursor starts at 0
        // page = 2; limit = 10 ; cursor start at 10
        // page =3 ; limit = 10 ; cursr start at 20

        cursor = cursor.limit(limit);

        data.total = await cursor.count();
        data.result = await cursor.toArray();

        return data;
      } catch (error) {
        throw new Error(`不能请求到用户的列表： ${error}`)
      }
    },
  }
};