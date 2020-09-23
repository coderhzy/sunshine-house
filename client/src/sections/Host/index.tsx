import React, { useState } from "react";
import { Button, Upload, Form, Icon, Input, InputNumber, Layout, Radio, Typography } from "antd";
import { Viewer } from "../../lib/types";
import { Link } from "react-router-dom";
import { UploadChangeParam } from "antd/lib/upload";
import { ListingType } from "../../lib/graphql/globalTypes";
import { iconColor, displayErrorMessage } from "../../lib/utils";

interface Props {
  viewer: Viewer;
}

const { Content } = Layout;
const { Text, Title } = Typography;
const { Item } = Form;

export const Host = ({ viewer }: Props) => {
  // 加载图片上传时
  const [imageLoading, setImageLoading] = useState(false);
  const [imageBase64Value, setImageBase64Value] = useState<string | null>(null);

  const handleImageUpload = (info: UploadChangeParam) => {
    const { file } = info;

    if (file.status === "uploading") {
      setImageLoading(true);
      return;
    }

    if (file.status === "done" && file.originFileObj) {
      getBase64Value(file.originFileObj, imageBase64Value => {
        setImageBase64Value(imageBase64Value);
        setImageLoading(false);
      });
    }

  };

  if (!viewer.id || !viewer.hasWallet) {
    return (
      <Content className="host-content">
        <div className="host__form-header">
          <Title level={4} className="host__form-title">
            您必须登录并与Stripe连接才能托管列表！
          </Title>
          <Text type="secondary">
            我们仅允许已登录我们的应用程序并已连接的用户
             与Stripe托管新列表。 您可以在登录{" "}
            <Link to="/login">/login</Link> 页面并在不久后与Stripe连接。
          </Text>
        </div>
      </Content>
    );
  }

  return (
    <Content className="host-content">
      <Form layout="vertical">
        <div className="host__form-header">
          <Title level={3} className="host__form-title">
            嗨！ 让我们开始列出您的位置。
        </Title>
          <Text type="secondary">
            通过这种形式，我们将收集有关您的一些基本信息和其他信息
            清单。
        </Text>
        </div>

        <Item label="房屋方式">
          <Radio.Group>
            <Radio.Button value={ListingType.APARTMENT}>
              <Icon type="bank" style={{ color: iconColor }} /> <span>公寓</span>
            </Radio.Button>
            <Radio.Button value={ListingType.HOUSE}>
              <Icon type="home" style={{ color: iconColor }} /> <span>房屋</span>
            </Radio.Button>
          </Radio.Group>
        </Item>

        <Item label="标题" extra="最大字符数为45">
          <Input maxLength={45} placeholder="标志性建筑" />
        </Item>

        <Item label="描述" extra="最多400个字">
          <Input.TextArea
            rows={3}
            maxLength={400}
            placeholder="干净，整洁，舒适"
          />
        </Item>

        <Item label="地址">
          <Input placeholder="田东西路18号" />
        </Item>

        <Item label="城市、乡镇">
          <Input placeholder="成都" />
        </Item>

        <Item label="州/省">
          <Input placeholder="四川" />
        </Item>

        <Item label="邮编/邮政编码">
          <Input placeholder="请输入邮政编码" />
        </Item>

        <Item
          label="图像"
          extra="图片的大小必须小于1MB，且格式为JPG或PNG"
        >
          <div className="host__form-image-upload">
            <Upload
              name="image"
              listType="picture-card"
              showUploadList={false}
              action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
              beforeUpload={beforeImageUpload}
              onChange={handleImageUpload}
            >
              {imageBase64Value ? (
                <img src={imageBase64Value} alt="Listing" />
              ) : (
                  <div>
                    <Icon type={imageLoading ? "loading" : "plus"} />
                    <div className="ant-upload-text">Upload</div>
                  </div>
                )}
            </Upload>
          </div>
        </Item>
        <Item label="Price" extra="所有价格以美元/天为单位">
          <InputNumber min={0} placeholder="200" />
        </Item>

        <Item>
          <Button type="primary">提交</Button>
        </Item>
      </Form>
    </Content >
  );
};

const beforeImageUpload = (file: File) => {
  const fileIsValidImage = file.type === "image/jpeg" || file.type === "image/png";
  const fileIsValidSize = file.size / 1024 / 1024 < 1;

  // 检查图片
  if (!fileIsValidImage) {
    displayErrorMessage("您只能上传有效的JPG或PNG文件！");
    return false;
  }

  // 检查大小
  if (!fileIsValidSize) {
    displayErrorMessage(
      "您只能上传小于1MB的有效图像文件！"
    );
    return false;
  }

  return fileIsValidImage && fileIsValidSize;
};

const getBase64Value = (
  img: File | Blob,
  callback: (imageBase64Value: string) => void
) => {
  const reader = new FileReader();
  reader.readAsDataURL(img);
  reader.onload = () => {
    callback(reader.result as string);
  };
};