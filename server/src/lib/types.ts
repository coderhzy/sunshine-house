import { Collection, ObjectId } from "mongodb";

export interface Viewer {
  _id?: string;
  token?: string;
  avatar?: string;
  walletId?: string;
  didRequest: boolean;
}

/**
 * 约束房子类型，是别墅还是民宅...
 *
 * @export
 * @enum {number}
 */
export enum ListingType {
  Apartment = "APARTMENT",
  House = "HOUSE"
}

export interface BookingsIndexMonth {
  [key: string]: boolean;
}

export interface BookingsIndexYear {
  [key: string]: BookingsIndexMonth;
}

/**
 * 对每个订单进行约束
 *
 * @export
 * @interface Booking
 */
export interface Booking {
  _id: ObjectId;
  listing: ObjectId;
  tenant: string;
  checkIn: string;
  checkOut: string;
}

/**
 * 对每个房子进行类型约束
 *
 * @export
 * @interface Listing
 */
export interface Listing {
  _id: ObjectId;
  title: string;
  description: string;
  image: string;
  host: string;
  type: ListingType;
  address: string;
  country: string;
  admin: string;
  city: string;
  bookings: ObjectId[];
  bookingsIndex: BookingsIndexYear;
  price: number;
  numOfGuests: number;
  authorized?: boolean;
}

/**
 * 对用户数据进行类型约束
 * 
 * @exports
 * @interface User
 * 
 * bookings： 一个用户可以有多个预定民宿
 *
 * listings： 一个用户可以拥有多个民宿进行出售
 */
export interface User {
  _id: string;
  token: string;
  name: string;
  avatar: string;
  contact: string;
  walletId?: string;
  income: number;
  bookings: ObjectId[];
  listings: ObjectId[];
  authorized?: boolean;
}

export interface Database {
  bookings: Collection<Booking>;
  listings: Collection<Listing>;
  users: Collection<User>;
}

