import React, { Fragment } from "react";
import { User as UserData } from "../../../../lib/graphql/queries/User/__generated__/User";
import { Avatar, Button, Card, Divider, Typography } from "antd";

// 使用方括号语法将其类型设置为User数据接口内的user属性的类型。
interface Props {
  user: UserData["user"];
  viewerIsUser: boolean;
}


const { Paragraph, Text, Title } = Typography;


export const UserProfile = ({ user, viewerIsUser }: Props) => {

  const additionalDetailsSection = viewerIsUser ? (
    <Fragment>
      <Divider />
      <div className="user-profile__details">
        <Title level={4}>Additional Details</Title>
        <Paragraph>
          有兴趣成为sunshine House房东吗？ 用您的Stripe帐户注册！
        </Paragraph>
        <Button type="primary" className="user-profile__details-cta">
          连接到 Stripe!
        </Button>
        <Paragraph type="secondary">
          sunshine_house 使用{" "}
          <a
            href="https://stripe.com/en-US/connect"
            target="_blank"
            rel="noopener noreferrer"
          >
            Stripe
          </a>{" "}
          以安全可靠的方式帮助您转移收入。
        </Paragraph>
      </div>
    </Fragment>
  ) : null;

  return (
    <div className="user-profile">
      <Card className="user-profile__card">
        <div className="user-profile__avatar">
          <Avatar size={100} src={user.avatar} />
        </div>
        <Divider />
        <div className="user-profile__details">
          <Title level={4}>Details</Title>
          <Paragraph>
            Name: <Text strong>{user.name}</Text>
          </Paragraph>
          <Paragraph>
            Contact: <Text strong>{user.contact}</Text>
          </Paragraph>
        </div>
        {additionalDetailsSection}
      </Card>
    </div>
  );
};