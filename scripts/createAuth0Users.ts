import "dotenv/config";

import { request } from "undici";
import { requireEnv } from "require-env-variable";

const { AUTH0_DOMAIN, AUTH0_MANAGEMENT_API_TOKEN } = requireEnv(
  "AUTH0_DOMAIN",
  "AUTH0_MANAGEMENT_API_TOKEN"
);

export async function createUser({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  try {
    const data = {
      connection: "Username-Password-Authentication",
      email,
      password,
    };
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${AUTH0_MANAGEMENT_API_TOKEN}`,
    };

    const response = await request(`https://${AUTH0_DOMAIN}/api/v2/users`, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });

    console.log(await response.body.json());
  } catch (error) {
    console.error(error);
  }
}
