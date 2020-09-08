import React, { useState } from "react";
import { RouteComponentProps } from "react-router-dom";
import { Moment } from "moment";
import { useQuery } from "@apollo/react-hooks";
import { ErrorBanner, PageSkeleton } from "../../lib/components";
import { Col, Layout, Row } from "antd";
import { LISTING } from "../../lib/graphql/queries";
import {
  Listing as ListingData,
  ListingVariables
} from "../../lib/graphql/queries/Listing/__generated__/Listing";
import { ListingCreateBooking, ListingBookings, ListingDetails } from "./components";

interface MatchParams {
  id: string;
}

const { Content } = Layout;
const PAGE_LIMIT = 3;

export const Listing = ({ match }: RouteComponentProps<MatchParams>) => {
  const [bookingsPage, setBookingsPage] = useState(1);
  const [checkInDate, setCheckInDate] = useState<Moment | null>(null);
  const [checkOutDate, setCheckOutDate] = useState<Moment | null>(null);

  //  发起GraphQL查询
  const { loading, data, error } = useQuery<ListingData, ListingVariables>(LISTING, {
    variables: {
      id: match.params.id,
      bookingsPage,
      limit: PAGE_LIMIT
    }
  });


  if (loading) {
    return (
      <Content className="listings">
        <PageSkeleton />
      </Content>
    );
  }

  if (error) {
    return (
      <Content className="listings">
        <ErrorBanner description="此列表可能不存在，或者我们遇到了错误,请稍后再试!" />
        <PageSkeleton />
      </Content>
    );
  }

  // 判断是否存在数据，以便确定 ListingDetails 和 ListingBookings 组件的渲染；
  const listing = data ? data.listing : null;
  const listingBookings = {
    total: 4,
    result: [
      {
        id: "5daa530eefc64b001767247c",
        tenant: {
          id: "117422637055829818290",
          name: "User X",
          avatar:
            "https://lh3.googleusercontent.com/a-/AAuE7mBL9NpzsFA6mGSC8xIIJfeK4oTeOJpYvL-gAyaB=s100",
          __typename: "User"
        },
        checkIn: "2019-10-29",
        checkOut: "2019-10-31",
        __typename: "Booking"
      },
    ]
  } as any;

  const listingDetailsElement = listing ? <ListingDetails listing={listing} /> : null;

  // 通过listing检查是否有价格存在
  const listingCreateBookingElement = listing ? (
    <ListingCreateBooking
      price={listing.price}
      checkInDate={checkInDate}
      checkOutDate={checkOutDate}
      setCheckInDate={setCheckInDate}
      setCheckOutDate={setCheckOutDate}
    />
  ) : null;

  // listingBookingsElement组件
  const listingBookingsElement = listingBookings ? (
    <ListingBookings
      listingBookings={listingBookings}
      bookingsPage={bookingsPage}
      limit={PAGE_LIMIT}
      setBookingsPage={setBookingsPage}
    />
  ) : null;

  // TODO: Bookings的flex自适应布局
  return (
    <Content className="listings">
      <Row gutter={24} justify="space-between">
        <Col xs={24} lg={14}>
          {listingDetailsElement}
          {listingBookingsElement}
        </Col>
        <Col xs={24} lg={10}>
          {listingCreateBookingElement}
        </Col>
      </Row>
    </Content>
  );
};