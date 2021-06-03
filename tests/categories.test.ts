import { Server } from 'http';
import fetch from "node-fetch";
import faker from 'faker';
import { createServer, stopServer } from '../server'

let TARGET_URL = '';
let server: Server;
let categories: { name: string, id?: number }[] = [];
const headers = { "Content-type": "application/json; charset=UTF-8" };

describe("Categories", () => {
  const RESOURCE_PROPERTY_NAMES = ['id','name', 'createdAt', 'updatedAt'];

  beforeAll(async () => {
    const result = await createServer();
    if (!result) {
      throw new Error('Error while booting Categories -> beforeAll: Server could not be started');
    }
    server = result.server;
    // @ts-ignore Because the typescript typings for this are incorrect
    const port = server?.address()?.port;
    TARGET_URL = `http://127.0.0.1:${port}`;
  });

  it("create categories", async () => {
    const response = await fetch(TARGET_URL + "/categories/", {
      method: "POST",
      headers,
      body: JSON.stringify({ "name": faker.company.bs() }), // don't send ID here!
    });

    expect(response.status).toBe(201);
  });

  it("get categories", async () => {
    const response = await fetch(TARGET_URL + "/categories");
    const data = await response.json();

    expect(Array.isArray(data)).toEqual(true);
    expect(response.status).toBe(200);
    expect(data.length).toBeGreaterThan(0);
    expect(Object.keys(data[0])).toStrictEqual(RESOURCE_PROPERTY_NAMES); // check that we only have the required fields.
    categories = data;
  });

  it("get single category", async () => {
    const response = await fetch(`${TARGET_URL}/categories/${categories[0].id}`);
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(Object.keys(data)).toStrictEqual(RESOURCE_PROPERTY_NAMES); // check that we only have the required fields.
    expect(data.id).toBe(categories[0].id);
  });

  it("patch categories", async () => {
    const response = await fetch(`${TARGET_URL}/categories/${categories[categories.length - 1].id}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({"name": faker.company.bs() }),
    });
    expect(response.status).toBe(200);
  });

  it("delete categories", async () => {
    const response = await fetch(`${TARGET_URL}/categories/${categories[categories.length - 1].id}`, {
      method: "DELETE",
      headers,
    });
    expect(response.status).toBe(204);
  });

  afterAll(async () => {
    stopServer(server);
  });
});