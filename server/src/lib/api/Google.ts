import { google } from "googleapis";

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
  }
}