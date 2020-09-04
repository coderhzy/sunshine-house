import React from 'react'
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
import { UserProfile } from "./components";

interface Props {
  viewer: Viewer;
}

interface MatchParams {
  id: string;
}

const { Content } = Layout;
export const User = ({ viewer, match }: Props & RouteComponentProps<MatchParams>) => {
  const { data, loading, error } = useQuery<UserData, UserVariables>(USER, {
    variables: {
      id: match.params.id
    }
  });

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
  const userProfileElement = user ? <UserProfile user={user} viewerIsUser={viewerIsUser} /> : null;

  return (
    <Content className="user">
      <Row gutter={12} justify="space-between">
        <Col xs={24}>{userProfileElement}</Col>
        <Col flex="1" >
        </Col>
      </Row>
    </Content>
  );
};