import { IResolvers } from "apollo-server-express";
import { Listing } from "../../../lib/types";

// 指定ID的返回解析函数
export const listingResolvers: IResolvers = {
  Listing: {
    id: (listing: Listing): string => {
      return listing._id.toString();
    }
  }
};