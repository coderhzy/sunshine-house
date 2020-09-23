import React, { useState } from 'react'
import { RouteComponentProps } from "react-router-dom";
import { Col, Layout, Row } from "antd";
import { useQuery } from "@apollo/react-hooks";
import { USER } from "../../lib/graphql/queries";
import {
  User as UserData,
  UserVariables
} from "../../lib/graphql/queries/User/__generated__/User";
import { ErrorBanner, PageSkeleton } from "../../lib/components";
import { Viewer } from "../../lib/types";
import { UserBookings, UserListings, UserProfile } from "./components";

interface Props {
  viewer: Viewer;
  setViewer: (viewer: Viewer) => void;
}

interface MatchParams {
  id: string;
}

const { Content } = Layout;
// 限制用户页面中分页项为4
const PAGE_LIMIT = 4;

export const User = ({
  viewer,
  setViewer,
  match
}: Props & RouteComponentProps<MatchParams>) => {
  const [listingsPage, setListingsPage] = useState(1);
  const [bookingsPage, setBookingsPage] = useState(1);

  const { data, loading, error, refetch } = useQuery<UserData, UserVariables>(USER, {
    variables: {
      id: match.params.id,
      bookingsPage,
      listingsPage,
      limit: PAGE_LIMIT
    }
  });

  // 刷新界面
  const handleUserRefetch = async () => {
    await refetch();
  }


  // 在URL的构造函数中获取stripe_error查询字符串，（React Router不支持在URL路由内访问查询字符串的方法。）
  const stripeError = new URL(window.location.href).searchParams.get("stripe_error");

  const stripeErrorBanner = stripeError ? (
    <ErrorBanner description="与Stripe连接时出现问题。 请稍后再试。" />
  ) : null;


  // 加载中
  if (loading) {
    return (
      <Content className="user">
        <PageSkeleton />
      </Content>
    );
  }

  // 遇到错误
  if (error) {
    return (
      <Content className="user">
        <ErrorBanner description="该用户可能不存在，或者我们遇到了错误。 请稍后再试。" />
        <PageSkeleton />
      </Content>
    );
  }

  // 用户选项卡
  const user = data ? data.user : null;
  // 查看者是用户
  const viewerIsUser = viewer.id === match.params.id;

  // 检查user对象是否存在
  const userListings = user ? user.listings : null;
  const userBookings = user ? user.bookings : null;

  const userProfileElement = user ? <UserProfile
    user={user}
    viewer={viewer}
    viewerIsUser={viewerIsUser}
    setViewer={setViewer}
    handleUserRefetch={handleUserRefetch}
  /> : null;

  // 根据用户存在的有无，创建组件
  const userListingsElement = userListings ? (
    <UserListings
      userListings={userListings}
      listingsPage={listingsPage}
      limit={PAGE_LIMIT}
      setListingsPage={setListingsPage}
    />
  ) : null;

  const userBookingsElement = userBookings ? (
    <UserBookings
      userBookings={userBookings}
      bookingsPage={bookingsPage}
      limit={PAGE_LIMIT}
      setBookingsPage={setBookingsPage}
    />
  ) : null;

  return (
    <Content className="user">
      {stripeErrorBanner}
      <Row gutter={12} type="flex" justify="space-between">
        <Col xs={24}>{userProfileElement}</Col>
        <Col xs={24} >
          {userListingsElement}
          {userBookingsElement}
        </Col>
      </Row>
    </Content>
  );
};