import React, { Fragment } from "react";
import { User as UserData } from "../../../../lib/graphql/queries/User/__generated__/User";
import { useMutation } from "@apollo/react-hooks";
import { Viewer } from "../../../../lib/types";
import { Avatar, Button, Card, Divider, Tag, Typography } from "antd";
import {
  formatListingPrice,
  displaySuccessNotification,
  displayErrorMessage
} from "../../../../lib/utils";
import { DISCONNECT_STRIPE } from "../../../../lib/graphql/mutations/";
import { DisconnectStripe as DisconnectStripeData } from "../../../../lib/graphql/mutations/DisconnectStripe/__generated__/DisconnectStripe";

// 使用方括号语法将其类型设置为User数据接口内的user属性的类型。
interface Props {
  user: UserData["user"];
  viewer: Viewer;
  viewerIsUser: boolean;
  setViewer: (viewer: Viewer) => void;
  handleUserRefetch: () => void;
}

// 链接Stripe
const stripeAuthUrl = `https://connect.stripe.com/oauth/authorize?response_type=code&client_id=${process.env.REACT_APP_S_CLIENT_ID}&scope=read_write`;

const { Paragraph, Text, Title } = Typography;

export const UserProfile = ({
  user,
  viewer,
  viewerIsUser,
  setViewer,
  handleUserRefetch
}: Props) => {
  const [disconnectStripe, { loading }] = useMutation<DisconnectStripeData>(
    DISCONNECT_STRIPE,
    {
      onCompleted: data => {
        if (data && data.disconnectStripe) {
          setViewer({ ...viewer, hasWallet: data.disconnectStripe.hasWallet });
          displaySuccessNotification(
            "您已成功与Stripe断开连接！",
            "您必须重新连接Stripe才能继续创建列表。"
          );
          handleUserRefetch();
        }
      },
      onError: () => {
        displayErrorMessage(
          "抱歉! 我们无法使您与Stripe断开连接。 请稍后再试！"
        );
      }
    }
  );

  const redirectToStripe = () => {
    window.location.href = stripeAuthUrl;
  }

  // 断开连接Stripe的UI
  const additionalDetails = user.hasWallet ? (
    <Fragment>
      <Paragraph>
        <Tag color="green">Stripe Registered</Tag>
      </Paragraph>
      <Paragraph>
        所得收入{" "}
        <Text strong>{user.income ? formatListingPrice(user.income) : `$0`}</Text>
      </Paragraph>
      <Button
        type="primary"
        className="user-profile__details-cta"
        loading={loading}
        onClick={() => disconnectStripe()}
      >
        断开连接Stripe
    </Button>
      <Paragraph type="secondary">
        断开连接后，您将无法接收{" "}
        <Text strong>任何进一步的付款</Text>. 这将阻止用户预订
       您可能已经创建的列表。
    </Paragraph>
    </Fragment>
  ) : (
      <Fragment>
        <Paragraph>
          有兴趣成为Tiny House房东吗？ 用您的Stripe帐户注册！
      </Paragraph>
        <Button
          type="primary"
          className="user-profile__details-cta"
          onClick={redirectToStripe}
        >
          连接到Stripe
      </Button>
        <Paragraph type="secondary">
          sunshine_house使用{" "}
          <a
            href="https://stripe.com/en-US/connect"
            target="_blank"
            rel="noopener noreferrer"
          >
            Stripe
        </a>{" "}
        安全可靠的方式帮助您转移收入。
      </Paragraph>
      </Fragment>
    );

  const additionalDetailsSection = viewerIsUser ? (
    <Fragment>
      <Divider />
      <div className="user-profile__details">
        <Title level={4}>Additional Details</Title>
        {additionalDetails}
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