import { IResolvers } from "apollo-server-express";
import { Request } from "express";
import { ObjectId } from "mongodb";
import { Google } from "../../../lib/api";
import { Database, Listing, User } from "../../../lib/types";
import { authorize } from "../../../lib/utils";
import {
  ListingArgs,
  ListingBookingsArgs,
  ListingBookingsData,
  ListingsArgs,
  ListingsData,
  ListingsFilter,
  ListingsQuery
} from "./types";


// 指定ID的返回解析函数
export const listingResolvers: IResolvers = {
  Query: {
    listing: async (
      _root: undefined,
      { id }: ListingArgs,
      { db, req }: { db: Database; req: Request }
    ): Promise<Listing> => {
      try {
        // mongo查找id
        const listing = await db.listings.findOne({ _id: new ObjectId(id) });
        if (!listing) {
          throw new Error("listing can't be found");
        }

        // 请求数据库，判断查看者和请求者的id
        const viewer = await authorize(db, req);
        if (viewer && viewer._id === listing.host) {
          listing.authorized = true;
        }

        return listing;
      } catch (error) {
        throw new Error(`Failed to query listing: ${error}`);
      }
    },
    listings: async (
      _root: undefined,
      { location, filter, limit, page }: ListingsArgs,
      { db }: { db: Database }
    ): Promise<ListingsData> => {

      try {
        const query: ListingsQuery = {};
        // 初始化ListingsData
        const data: ListingsData = {
          region: null,
          total: 0,
          result: []
        };

        // geocode
        if (location) {
          try {
            const { country, admin, city } = await Google.geocode(location);

            // 筛选geocode返回值，对其做出不同设置
            if (city) query.city = city;
            if (admin) query.admin = admin;
            if (country) {
              query.country = country;
            } else {
              throw new Error("no country found");
            }
            const cityText = city ? `${city}, ` : "";
            const adminText = admin ? `${admin}, ` : "";
            data.region = `${cityText}${adminText}${country}`;
          } catch (e) {
            // TODO: i have use https instead of http , this is Error , server -> 403
            console.log(`错误`, e);
          }
        }

        // 定义游标 分段数据库信息
        let cursor = await db.listings.find(query);

        // 升序
        if (filter && filter === ListingsFilter.PRICE_LOW_TO_HIGH) {
          cursor = cursor.sort({ price: 1 });
        }

        // 降序
        if (filter && filter === ListingsFilter.PRICE_HIGH_TO_LOW) {
          cursor = cursor.sort({ price: -1 });
        }

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
        throw new Error(`请求到用户的列表失败： ${error}`)
      }
    }
  },
  Listing: {
    id: (listing: Listing): string => {
      return listing._id.toString();
    },
    host: async (
      listing: Listing,
      _args: {},
      { db }: { db: Database }
    ): Promise<User> => {
      // 查询mongo
      const host = await db.users.findOne({ _id: listing.host });
      if (!host) {
        throw new Error("不能找到host");
      }
      return host;
    },
    // json中，将bookingIndex对象转换成字符串
    bookingsIndex: (listing: Listing): string => {
      return JSON.stringify(listing.bookingsIndex);
    },
    bookings: async (
      listing: Listing,
      { limit, page }: ListingBookingsArgs,
      { db }: { db: Database }
    ): Promise<ListingBookingsData | null> => {
      try {
        // 未经授权的用户
        if (!listing.authorized) {
          return null;
        }

        // 初始化UserBookingsData
        const data: ListingBookingsData = {
          total: 0,
          result: []
        };

        // 定义游标 分段数据库信息
        let cursor = await db.bookings.find({
          _id: { $in: listing.bookings }
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
        throw new Error(`查询请求预订列表错误 ${error}`)
      }
    },
  }
};