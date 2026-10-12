// Disposable in-memory API for browser acceptance tests. Never connects to PostgreSQL.
const express = require("express");
const crypto = require("node:crypto");
const { hashPassword } = require("../src/utils/password");
const auth = require("../src/repositories/authRepository");
const leads = require("../src/repositories/leadRepository");
const dashboard = require("../src/repositories/dashboardRepository");
const { authenticateToken } = require("../src/middlewares/authMiddleware");

async function start() {
  process.env.JWT_SECRET = crypto.randomBytes(32).toString("hex");
  const users = ["admin", "CRM"].map((role) => ({
    id: crypto.randomUUID(),
    name: `${role} Test`,
    email: `${role.toLowerCase()}@example.test`,
    role,
  }));
  const password = await hashPassword("Acceptance-test-123");
  auth.getUserByEmail = async (email) => {
    const user = users.find((user) => user.email === email);
    return user && { ...user, password_hash: password };
  };
  auth.getUserById = async (id) => users.find((user) => user.id === id);
  const records = new Map();
  const notes = new Map();
  const now = () => new Date().toISOString();
  leads.createLead = async (data) => {
    const record = {
      ...data,
      id: crypto.randomUUID(),
      created_at: now(),
      updated_at: now(),
    };
    records.set(record.id, record);
    return record;
  };
  leads.getLeadById = async (id) => records.get(id);
  leads.getAllLeads = async (filters) =>
    [...records.values()]
      .filter(
        (lead) =>
          (!filters.search ||
            lead.name.toLowerCase().includes(filters.search.toLowerCase()) ||
            lead.phone.includes(filters.search)) &&
          (!filters.source || lead.source === filters.source) &&
          (!filters.status || lead.status === filters.status),
      )
      .sort((a, b) => {
        const left =
          filters.sortBy === "budget"
            ? Number(a.budget)
            : Date.parse(a.created_at);
        const right =
          filters.sortBy === "budget"
            ? Number(b.budget)
            : Date.parse(b.created_at);
        return (left - right) * (filters.sortOrder === "asc" ? 1 : -1);
      });
  leads.updateLead = async (id, data) => {
    const old = records.get(id);
    if (!old) return undefined;
    const record = {
      ...old,
      ...data,
      id,
      created_at: old.created_at,
      updated_at: now(),
    };
    records.set(id, record);
    return record;
  };
  leads.updateLeadStatus = async (id, status) => {
    const old = records.get(id);
    if (!old) return undefined;
    const record = { ...old, status, updated_at: now() };
    records.set(id, record);
    return record;
  };
  leads.deleteLead = async (id) => {
    const old = records.get(id);
    records.delete(id);
    notes.delete(id);
    return old;
  };
  leads.createLeadNote = async (id, note) => {
    const record = {
      id: crypto.randomUUID(),
      lead_id: id,
      note,
      created_at: now(),
    };
    notes.set(id, [record, ...(notes.get(id) || [])]);
    return record;
  };
  leads.getLeadNotes = async (id) => notes.get(id) || [];
  dashboard.getDashboardCounts = async () => {
    const data = [...records.values()];
    const group = (field) =>
      Object.entries(
        data.reduce((acc, lead) => {
          acc[lead[field]] = (acc[lead[field]] || 0) + 1;
          return acc;
        }, {}),
      ).map(([value, count]) => ({ [field]: value, count }));
    return {
      totalLeads: data.length,
      closedLeads: data.filter((lead) => lead.status === "Closed").length,
      leadsBySource: group("source"),
      statusDistribution: group("status"),
    };
  };
  const app = express();
  app.use(express.json());
  app.use("/api", require("../src/routes/authRoutes"));
  app.use(
    "/api",
    authenticateToken,
    require("../src/routes/leadRoutes"),
    require("../src/routes/dashboardRoutes"),
  );
  app.listen(5000, "127.0.0.1", () =>
    console.log("Disposable acceptance API listening on 127.0.0.1:5000"),
  );
}
start().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
