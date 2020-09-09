import React from 'react';
import { Link, RouteComponentProps } from "react-router-dom";
import { Col, Row, Layout, Typography } from "antd";
import { HomeHero, HomeListings, HomeListingsSkeleton } from "./components";
import { useQuery } from "@apollo/react-hooks";
import { LISTINGS } from "../../lib/graphql/queries";
import {
  Listings as ListingsData,
  ListingsVariables
} from "../../lib/graphql/queries/Listings/__generated__/Listings";
import { ListingsFilter } from "../../lib/graphql/globalTypes";
import { displayErrorMessage } from "../../lib/utils";

import mapBackground from "./assets/map-background.jpg";
import sanFransiscoImage from "./assets/san-fransisco.jpg";
import cancunImage from "./assets/cancun.jpg";


const { Content } = Layout;
const { Paragraph, Title } = Typography;

const PAGE_LIMIT = 4;
const PAGE_NUMBER = 1;

export const Home = ({ history }: RouteComponentProps) => {
  const { loading, data } = useQuery<ListingsData, ListingsVariables>(LISTINGS, {
    variables: {
      filter: ListingsFilter.PRICE_HIGH_TO_LOW,
      limit: PAGE_LIMIT,
      page: PAGE_NUMBER
    }
  });

  const renderListingsSection = () => {
    // 加载中
    if (loading) {
      return <HomeListingsSkeleton />
    }

    // 获取到数据
    if (data) {
      return <HomeListings title="Premium Listings" listings={data.listings.result} />;
    }

    return null;
  }

  // 搜索功能
  const onSearch = (value: string) => {
    // 去除空格
    const trimmedValue = value.trim();
    if (trimmedValue) {
      history.push(`/listings/${trimmedValue}`);
    } else {
      displayErrorMessage("请输入要搜索值")
    }
  };

  return (
    <Content className="home" style={{ backgroundImage: `url(${mapBackground})` }}>
      <HomeHero onSearch={onSearch} />

      <div className="home__cta-section">
        <Title level={2} className="home__cta-section-title">
          所有物品租赁的指南
        </Title>
        <Paragraph>帮助您在租用最后一分钟的地点时做出最佳决定</Paragraph>
        <Link to="/listings/united%20states" className="ant-btn ant-btn-primary ant-btn-lg home__cta-section-button">
          美国的热门房源
        </Link>
      </div>

      {renderListingsSection()};

      <div className="home__listings">
        <Title level={4} className="home__listings-title">
          任何种类的清单
        </Title>
        <Row gutter={12}>
          <Col xs={24} sm={12}>
            <Link to="/listings/san%20fransisco">
              <div className="home__listings-img-cover">
                <img src={sanFransiscoImage} alt="San Fransisco" className="home__listings-img" />
              </div>
            </Link>
          </Col>
          <Col xs={24} sm={12}>
            <Link to="/listings/cancún">
              <div className="home__listings-img-cover">
                <img src={cancunImage} alt="Cancún" className="home__listings-img" />
              </div>
            </Link>
          </Col>
        </Row>
      </div>
    </Content>
  );
};