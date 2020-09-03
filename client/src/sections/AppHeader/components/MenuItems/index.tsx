import React from "react";
import { Link } from "react-router-dom";
import { useMutation } from "@apollo/react-hooks";
import { Avatar, Button, Menu } from "antd";
import { LOG_OUT } from "../../../../lib/graphql/mutations";
import { HomeOutlined, UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { displaySuccessNotification, displayErrorMessage } from "../../../../lib/utils";
import { LogOut as LogOutData } from "../../../../lib/graphql/mutations/LogOut/__generated__/LogOut";
import { Viewer } from "../../../../lib/types";

interface Props {
  viewer: Viewer;
  setViewer: (viewer: Viewer) => void;
}

const { Item, SubMenu } = Menu;

export const MenuItems = ({ viewer, setViewer }: Props) => {

  const [logOut] = useMutation<LogOutData>(LOG_OUT, {
    // 注销登录的数据
    onCompleted: data => {
      if (data && data.logOut) {
        setViewer(data.logOut);
        // 清除随机生成的令牌
        sessionStorage.removeItem("token");
        displaySuccessNotification("注销成功");
      }
    },
    onError: data => {
      displayErrorMessage("抱歉！ 注销失败，请稍后再试！！！")
    }
  });

  // 注销
  const handleLogOut = () => {
    logOut();
  };


  // 控制显示子菜单项
  const subMenuLogin = viewer.id && viewer.avatar ? (
    // 确保id和avatar都存在
    <SubMenu title={<Avatar src={viewer.avatar} />}>
      <Item key={"/user/"}>
        <Link to={`/user/${viewer.id}`}>
          <UserOutlined translate="user" />
        Profile
        </Link>
      </Item>
      <Item key="/logout">
        <div onClick={handleLogOut}>
          <LogoutOutlined translate="logout" />
        Log out
        </div>
      </Item>
    </SubMenu>
  ) : <Item key="/login">
      <Link to="/login">
        <Button type="primary">Sign In</Button>
      </Link>
    </Item>;



  return (
    <Menu mode="horizontal" selectable={false} className="menu">
      <Item key="/host">
        <Link to="/host">
          <HomeOutlined translate="home" />
          Host
        </Link>
      </Item>
      {subMenuLogin}
    </Menu>
  );
};