import { google } from "googleapis";
import {
  Client,
  AddressComponent,
  AddressType,
  GeocodingAddressComponentType,
} from "@googlemaps/google-maps-services-js";

const maps = new Client({});

const parseAddress = (addressComponents: AddressComponent[]) => {
  // 初始化country admin city
  let country = null;
  let admin = null;
  let city = null;


  // 遍历数组，查找可以映射属性类型值
  for (const component of addressComponents) {
    if (component.types.includes(AddressType.country)) {
      country = component.long_name;
    }


    // 映射admin
    if (component.types.includes(AddressType.administrative_area_level_1)) {
      admin = component.long_name;
    }

    // 映射city
    if (component.types.includes(AddressType.locality) || component.types.includes(GeocodingAddressComponentType.postal_town)) {
      city = component.long_name;
    }
  }

  return { country, admin, city };
};

// https://github.com/googleapis/google-api-nodejs-client
const auth = new google.auth.OAuth2(
    process.env.G_CLIENT_ID,
    process.env.G_CLIENT_SECRET,
    `${process.env.PUBLIC_URL}/login`
);

export const Google = {
  // eslint-disable-next-line @typescript-eslint/camelcase
  authUrl: auth.generateAuthUrl({
    access_type: 'online',
    scope: [
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile"
    ]
  }),
  // 获取令牌
  logIn: async (code: string) => {
    const { tokens } = await auth.getToken(code);

    auth.setCredentials(tokens);

    const { data } = await google.people({ version: "v1", auth }).people.get({
      resourceName: "people/me",
      personFields: "emailAddresses,names,photos"
    });

    return { user: data };
  },
  geocode: async (address: string) => {
    if (!process.env.G_GEOCODE_KEY) throw new Error("missing Google Maps API key");

    const res = await maps.geocode({
      params: { address, key: process.env.G_GEOCODE_KEY },
    });

    // 请求出错
    if (res.status < 200 || res.status > 299) {
      throw new Error("failed to geocode address");
    }

    console.log(`查询结果-`, res.data);

    // 解析Geocoding API的响应，返回响应结果给address_components数组
    return parseAddress(res.data.results[0].address_components);
  }
};
