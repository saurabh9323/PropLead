const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const express = require("express");
const pool = require("../src/db/db");
const repository = require("../src/repositories/leadRepository");
const { hashPassword, verifyPassword } = require("../src/utils/password");
const { signToken, verifyToken } = require("../src/utils/jwt");
const { authenticateToken } = require("../src/middlewares/authMiddleware");
const Lead = require("../src/models/Lead");

process.env.JWT_SECRET = crypto.randomBytes(32).toString("hex");
const id = "f04018aa-174b-4a98-a0d4-11e868f87e94";
const payload = {
  name: "Test Lead",
  phone: "9876543210",
  email: "test@example.com",
  budget: 5000000,
  location: "Pune",
  property_type: "2 BHK",
  source: "Referral",
  status: "New",
};
let record;
let notes = [];
let server;
let base;
let lastFilters;
const originals = { ...repository };
const originalQuery = pool.query;

before(async () => {
  repository.createLead = async (lead) => (record = { ...lead, id });
  repository.getAllLeads = async (filters) => {
    lastFilters = filters;
    return record ? [record] : [];
  };
  repository.getLeadById = async (key) => (key === id ? record : undefined);
  repository.updateLead = async (key, lead) =>
    key === id && record ? (record = { ...lead, id }) : undefined;
  repository.deleteLead = async (key) => {
    if (key !== id) return undefined;
    const old = record;
    record = undefined;
    notes = [];
    return old;
  };
  repository.createLeadNote = async (key, note) => {
    const item = { id: crypto.randomUUID(), lead_id: key, note };
    notes.push(item);
    return item;
  };
  repository.getLeadNotes = async () => notes;
  pool.query = async (sql, values) => {
    assert.match(
      sql,
      /UPDATE leads SET status = \$2, updated_at = NOW\(\) WHERE id = \$1 RETURNING \*/,
    );
    if (!record || values[0] !== id) return { rows: [] };
    record = { ...record, status: values[1] };
    return { rows: [record] };
  };
  const app = express();
  app.use(express.json());
  app.use("/api", authenticateToken, require("../src/routes/leadRoutes"));
  server = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  base = `http://127.0.0.1:${server.address().port}/api`;
});
after(async () => {
  Object.assign(repository, originals);
  pool.query = originalQuery;
  await new Promise((resolve) => server.close(resolve));
  await pool.end();
});

async function request(path, method = "GET", body, role = "CRM") {
  const response = await fetch(`${base}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(role
        ? { Authorization: `Bearer ${signToken({ userId: id, role })}` }
        : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return { status: response.status, body: await response.json() };
}

test("lead CRUD, filters, notes, status and authorization through HTTP", async () => {
  assert.equal((await request("/leads", "GET", undefined, null)).status, 401);
  assert.equal(
    (await request("/leads", "POST", payload, "unknown")).status,
    403,
  );
  assert.equal(
    (await request("/leads", "POST", { ...payload, name: "" })).status,
    400,
  );
  const created = await request("/leads", "POST", payload);
  assert.equal(created.status, 201);
  assert.equal(created.body.data.property_type, "2 BHK");
  assert.equal((await request(`/leads/${id}`)).body.data.name, payload.name);
  await request(
    "/leads?search=Test&source=Referral&status=New&sortBy=budget&sortOrder=asc",
  );
  assert.deepEqual(lastFilters, {
    search: "Test",
    source: "Referral",
    status: "New",
    sortBy: "budget",
    sortOrder: "asc",
  });
  assert.equal((await request("/leads?sortBy=unsafe")).status, 400);
  assert.equal((await request("/leads/not-a-uuid")).status, 400);
  assert.equal((await request(`/leads/${crypto.randomUUID()}`)).status, 404);
  assert.equal(
    (await request(`/leads/${id}/notes`, "POST", { note: "  " })).status,
    400,
  );
  assert.equal(
    (await request(`/leads/${id}/notes`, "POST", { note: "x".repeat(5001) }))
      .status,
    400,
  );
  assert.equal(
    (await request(`/leads/${id}/notes`, "POST", { note: " Visit on Friday " }))
      .status,
    201,
  );
  assert.equal(
    (await request(`/leads/${id}/notes`)).body.data[0].note,
    "Visit on Friday",
  );
  for (const status of ["Contacted", "Site Visit", "Closed", "New"]) {
    const updated = await request(`/leads/${id}/status`, "PATCH", { status });
    assert.equal(updated.status, 200);
    assert.equal(updated.body.data.status, status);
    assert.equal(updated.body.data.budget, payload.budget);
    assert.equal(updated.body.data.name, payload.name);
  }
  assert.equal(
    (await request(`/leads/${id}/status`, "PATCH", { status: "Invalid" }))
      .status,
    400,
  );
  const edited = await request(`/leads/${id}`, "PUT", {
    ...payload,
    location: "Mumbai",
  });
  assert.equal(edited.body.data.location, "Mumbai");
  assert.equal((await request(`/leads/${id}`, "DELETE")).status, 403);
  assert.equal(
    (await request(`/leads/${id}`, "DELETE", undefined, "admin")).status,
    200,
  );
  assert.equal((await request(`/leads/${id}`)).status, 404);
  assert.equal(
    (await request(`/leads/${id}/status`, "PATCH", { status: "Closed" }))
      .status,
    404,
  );
});

test("budget validation rejects coercions and out-of-range values", () => {
  for (const budget of [true, [], {}, " ", -1, Infinity, 10000000000])
    assert.throws(() => new Lead({ ...payload, budget }));
  assert.equal(new Lead({ ...payload, budget: "0" }).budget, 0);
});

test("salted password hashes, legacy verification, and wrong passwords", async () => {
  const password = " Test password 123 ";
  const first = await hashPassword(password);
  const second = await hashPassword(password);
  assert.notEqual(first, second);
  assert.equal(await verifyPassword(password, first), true);
  assert.equal(await verifyPassword("wrong", first), false);
  assert.equal(await verifyPassword(password, "scrypt$invalid$invalid"), false);
  const legacy = crypto.createHash("sha256").update(password).digest("hex");
  assert.equal(await verifyPassword(password, legacy), true);
});

test("JWT rejects tampering, expired tokens and missing secrets", () => {
  const token = signToken({ userId: id, role: "admin" });
  assert.equal(verifyToken(token).userId, id);
  assert.throws(() => verifyToken(`${token}x`));
  assert.throws(() => verifyToken(signToken({ userId: id }, 0)));
  assert.throws(() => verifyToken("broken"));
  const secret = process.env.JWT_SECRET;
  delete process.env.JWT_SECRET;
  try {
    assert.throws(() => signToken({ userId: id }), /JWT_SECRET/);
  } finally {
    process.env.JWT_SECRET = secret;
  }
});
