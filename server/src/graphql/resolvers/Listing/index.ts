import { IResolvers } from "apollo-server-express";
import { Request } from "express";
import { ObjectId } from "mongodb";
import { Cloudinary, Google } from "../../../lib/api";
import { Database, Listing, User, ListingType } from "../../../lib/types";
import { authorize } from "../../../lib/utils";
import {
  ListingArgs,
  ListingBookingsArgs,
  ListingBookingsData,
  ListingsArgs,
  ListingsData,
  ListingsFilter,
  ListingsQuery,
  HostListingInput,
  HostListingArgs
} from "./types";

/**
 * @verifyHostListingInput
 * 检查并限制用户的输入
 */
const verifyHostListingInput = ({
  title,
  description,
  type,
  price
}: HostListingInput) => {
  if (title.length > 100) {
    throw new Error("列表标题必须少于100个字符");
  }
  if (description.length > 5000) {
    throw new Error("列表说明必须少于5000个字符");
  }
  if (type !== ListingType.Apartment && type !== ListingType.House) {
    throw new Error("列表类型必须是公寓或房屋");
  }
  if (price < 0) {
    throw new Error("价格必须大于0");
  }
};

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
  Mutation: {
    hostListing: async (
      _root: undefined,
      { input }: HostListingArgs,
      { db, req }: { db: Database; req: Request }
    ): Promise<Listing> => {
      //  1. 对前端传递过来的form数据进行校验
      verifyHostListingInput(input);

      let viewer = await authorize(db, req);
      // 如果用户不存在直接抛出异常
      if (!viewer) {
        throw new Error("viewer cannot be found");
      }

      // const { country, admin, city } = await Google.geocode(input.address);
      // if (!country || !admin || !city) {
      //   throw new Error("invalid address input");
      // }

      //  3. 向数据库存储内容
      console.log(`开始向数据库写入房子信息`)

      const imageUrl = await Cloudinary.upload(input.image);

      const insertResult = await db.listings.insertOne({
        _id: new ObjectId(),
        ...input,
        image: imageUrl,
        bookings: [],
        bookingsIndex: {},
        country: 'mock',
        admin: 'mock',
        city: 'mock',
        host: viewer._id
      });

      // 4. 向数据库中对应的用户信息中插入房子内容
      const insertedListing: Listing = insertResult.ops[0];

      await db.users.updateOne(
        { _id: viewer._id },
        { $push: { listings: insertedListing._id } }
      );

      // 5. 将处理完毕的房子信息返回
      return insertedListing;
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