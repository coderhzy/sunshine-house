import merge from "lodash.merge";
import { listingResolvers } from "./Listing"
import { bookingResolvers } from "./Booking";
import { userResolvers } from "./User";
import { viewerResolvers } from "./Viewer";

export const resolvers = merge(
  userResolvers,
  viewerResolvers,
  listingResolvers,
  bookingResolvers
);
