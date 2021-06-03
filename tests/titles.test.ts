import { Server } from "http";
import fetch from "node-fetch";
import faker from 'faker';
import { createServer, stopServer } from "../server";

let TARGET_URL = "";
let server: Server;
let titles: { 
  id?: number
  title: string,
  categoryId: number,
  logo: string,
  synopsis: string,
  showInformation: string,
  pg: string,
  trailer: string
}[] = [];
const headers = { "Content-type": "application/json; charset=UTF-8" };

describe("Titles", () => {
  const RESOURCE_PROPERTY_NAMES = [
    'id',
    'title',
    'categoryId',
    'logo',
    'synopsis',
    'showInformation',
    'pg',
    'trailer',
    'createdAt',
    'updatedAt'
  ];

  beforeAll(async () => {
    const result = await createServer();
    if (!result) {
      throw new Error(
        "Error while booting Titles -> beforeAll: Server could not be started"
      );
    }
    server = result.server;
    // @ts-ignore Because the typescript typings for this are incorrect
    const port = server?.address()?.port;
    TARGET_URL = `http://127.0.0.1:${port}`;
  });

  it("create titles", async () => {
    const response = await fetch(TARGET_URL + "/titles/", {
      method: "POST",
      headers,
      body: JSON.stringify({
        title: faker.company.bs(),
        categoryId: 1, // this could break
        logo: faker.image.imageUrl(),
        synopsis: faker.commerce.productDescription(),
        showInformation: faker.commerce.productDescription(),
        pg: "16",
        trailer: faker.image.imageUrl() 
      })
    });
    expect(response.status).toBe(201);
  });

  it("get titles", async () => {
    const response = await fetch(TARGET_URL + "/titles");
    const data = await response.json();
    expect(Array.isArray(data)).toEqual(true);
    expect(response.status).toBe(200);
    titles = data;
    expect(data.length).toBeGreaterThan(0);
    expect(Object.keys(data[0])).toStrictEqual(RESOURCE_PROPERTY_NAMES); // check that we only have the required fields.
  });

  it("get single title", async () => {
    const titleId = titles[titles.length - 1].id;
    const response = await fetch(`${TARGET_URL}/titles/${titleId}`);
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(Object.keys(data)).toStrictEqual(RESOURCE_PROPERTY_NAMES); // check that we only have the required fields.
    expect(data.id).toBe(titleId);
  });

  it("patch titles", async () => {
    const titleId = titles[titles.length - 1].id;
    const response = await fetch(`${TARGET_URL}/titles/${titleId}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ pg: "PEGI-18", title: faker.company.bs() })
    });
    expect(response.status).toBe(200);
  });

  it("delete title", async () => {
    const titleId = titles[titles.length - 1].id;
    const response = await fetch(`${TARGET_URL}/titles/${titleId}`, {
      method: "DELETE",
      headers
    });
    expect(response.status).toBe(204);
  });

  afterAll(async () => {
    stopServer(server);
  });
});
