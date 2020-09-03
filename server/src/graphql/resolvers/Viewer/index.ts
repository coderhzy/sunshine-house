import crypto from "crypto";
import { IResolvers } from "apollo-server-express";
import { Viewer, Database, User } from "../../../lib/types";
import { Google } from '../../../lib/api';
import { LogInArgs } from "./types";


const logInViaGoogle = async (
  code: string,
  token: string,
  db: Database
): Promise<User | undefined> => {
  const { user } = await Google.logIn(code);

  // 用户不存在
  if (!user) {
    throw new Error("google 登录错误");
  }

  // 用户可用
  // Name/Photo/Email Lists
  const userNamesList = user.names && user.names.length ? user.names : null;
  const userPhotosList = user.photos && user.photos.length ? user.photos : null;
  const userEmailsList =
    user.emailAddresses && user.emailAddresses.length
      ? user.emailAddresses
      : null;

  // User Display Name
  const userName = userNamesList ? userNamesList[0].displayName : null;

  // User Id
  const userId =
    userNamesList &&
      userNamesList[0].metadata &&
      userNamesList[0].metadata.source
      ? userNamesList[0].metadata.source.id
      : null;

  // User Avatar
  const userAvatar =
    userPhotosList && userPhotosList[0].url ? userPhotosList[0].url : null;

  // User Email
  const userEmail =
    userEmailsList && userEmailsList[0].value ? userEmailsList[0].value : null;

  if (!userId || !userName || !userAvatar || !userEmail) {
    throw new Error("Google 登录错误");
  }

  // 检查mongo中是否有这个用户
  // TODO: 不懂使用这个函数
  /**
   * 第一个参数：_id过滤 匹配
   * 第二个参数： 更新对象
   * 第三个参数： 返回更新后对象
   */
  const updateRes = await db.users.findOneAndUpdate(
    { _id: userId },
    {
      $set: {
        name: userName,
        avatar: userAvatar,
        contact: userEmail,
        token
      }
    },
    { returnOriginal: false }
  );

  // 在mongo中找不到用户，插入新用户
  let viewer = updateRes.value;

  if (!viewer) {
    const insertResult = await db.users.insertOne({
      _id: userId,
      token,
      name: userName,
      avatar: userAvatar,
      contact: userEmail,
      income: 0,
      bookings: [],
      listings: []
    });

    viewer = insertResult.ops[0];
  }

  return viewer;
}


export const viewerResolvers: IResolvers = {
  Query: {
    authUrl: (): string => {
      try {
        return Google.authUrl;
      } catch (error) {
        throw new Error(`获取不到请求google Auth url: ${error}`)
      }
    }
  },
  Mutation: {
    logIn: async (
      _root: undefined,
      { input }: LogInArgs,
      { db }: { db: Database }
    ): Promise<Viewer> => {
      try {
        const code = input ? input.code : null;

        // 加密数据，令牌随机生成
        const token = crypto.randomBytes(16).toString("hex");

        // code + token
        const viewer: User | undefined = code
          ? await logInViaGoogle(code, token, db)
          : undefined;

        // 检查一个观众是否存在
        if (!viewer) {
          return { didRequest: true }
        }

        // 存在
        return {
          _id: viewer._id,
          token: viewer.token,
          avatar: viewer.avatar,
          walletId: viewer.walletId,
          didRequest: true
        };
      } catch (error) {
        throw new Error(`登录错误: ${error}`);
      }
    },
    logOut: () => {
      try {
        return { didRequest: true };
      } catch (error) {
        throw new Error(`注销错误: ${error}`);
      }
    }
  },
  Viewer: {
    id: (viewer: Viewer): string | undefined => {
      return viewer._id;
    },
    hasWallet: (viewer: Viewer): boolean | undefined => {
      return viewer.walletId ? true : undefined;
    }
  }

};
