import React, { useEffect, useRef } from "react";
import { Redirect } from "react-router-dom";
import { useApolloClient, useMutation } from "@apollo/react-hooks";
import { Card, Layout, Spin, Typography } from "antd";
import { ErrorBanner } from "../../lib/components";
import { AUTH_URL } from "../../lib/graphql/queries";
import { LOG_IN } from "../../lib/graphql/mutations";
import { AuthUrl as AuthUrlData } from "../../lib/graphql/queries/AuthUrl/__generated__/AuthUrl";
import {
  LogIn as LogInData,
  LogInVariables
} from "../../lib/graphql/mutations/LogIn/__generated__/LogIn";
import {
  displaySuccessNotification, displayErrorMessage
} from "../../lib/utils";
import { Viewer } from "../../lib/types";

// Image Assets
import googleLogo from "./assets/google_logo.jpg";


interface Props {
  setViewer: (viewer: Viewer) => void;
}

const { Content } = Layout;
const { Text, Title } = Typography;

export const Login = ({ setViewer }: Props) => {
  const client = useApolloClient();

  const [
    logIn,
    { data: logInData, loading: logInLoading, error: logInError }
  ] = useMutation<LogInData, LogInVariables>(LOG_IN, {
    // onCompleted 是一个回调属性，一旦成功完成变更，该回调属性便会执行
    onCompleted: data => {
      // 判断data和data login存在，更新setViewer函数
      if (data && data.logIn && data.logIn.token) {
        setViewer(data.logIn);
        sessionStorage.setItem("token", data.logIn.token);
        // data存在正常登录弹窗
        displaySuccessNotification("登录成功");
      }
    }
  });

  // UseRef返回一个可变对象，整个证明周期保持不变
  const logInRef = useRef(logIn);

  useEffect(() => {
    const code = new URL(window.location.href).searchParams.get("code");


    // code可用发请求
    if (code) {
      // 发生多次渲染，属性都将引用原始函数
      logInRef.current({
        variables: {
          input: { code }
        }
      });
    }
  }, [])

  // Google的Button
  const handleAuthorize = async () => {
    try {
      const { data } = await client.query<AuthUrlData>({
        query: AUTH_URL
      });

      // 重定向
      window.location.href = data.authUrl;

    } catch {
      // 登录失败报错信息
      displayErrorMessage("抱歉！登录失败，请稍后再试！！！")
    }
  };

  if (logInLoading) {
    return (
      <Content className="log-in">
        <Spin size="large" tip="Logging you in..." />
      </Content>
    );
  }

  // 登录成功后在此处拦截重定向
  if (logInData && logInData.logIn) {
    const { id: viewerId } = logInData.logIn;
    return <Redirect to={`/user/${viewerId}`} />;
  }


  // 登录卡，错误信息
  const logInErrorBannerElement = logInError ? (
    <ErrorBanner description="抱歉! 我们无法登录。请稍后再试！" />
  ) : null;

  return (
    <Content className="log-in">
      {logInErrorBannerElement}
      <Card className="log-in-card">
        <div className="log-in-card__intro">
          <Title level={3} className="log-in-card__intro-title">
            <span role="img" aria-label="wave">
              👋
          </span>
          </Title>
          <Title level={3} className="log-in-card__intro-title">
            登录sunshine_house
        </Title>
          <Text>使用Google登录以开始预订可用的租金！</Text>
        </div>
        <button className="log-in-card__google-button" onClick={handleAuthorize}>
          <img
            src={googleLogo}
            alt="Google Logo"
            className="log-in-card__google-button-logo"
          />
          <span className="log-in-card__google-button-text">授权Google登录</span>
        </button>
        <Text type="secondary">
          注意：登录后，您将被重定向到Google同意书以登录
          使用您的Google帐户。
      </Text>
      </Card>
    </Content>
  )
}