import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { Presentation, PresentationFile } from "@oai/artifact-tool";

const workspaceDir = "D:/full-stack-template";
const skillDir = "C:/Users/saurabh/.codex/plugins/cache/openai-primary-runtime/presentations/26.1011.11113/skills/presentations";
const runtimePython = "C:/Users/saurabh/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe";
const buildDir = path.join(workspaceDir, "tmp/pptx-build");
const outDir = path.join(workspaceDir, "deliverables");
const finalPath = path.join(outDir, "PropLead-CRM-Presentation-Future-Upgrades.pptx");

const W = 1280;
const H = 720;
const margin = 72;
const green = "#12352f";
const emerald = "#0f766e";
const mint = "#d1fae5";
const slate = "#334155";
const ink = "#020617";
const soft = "#f6faf7";
const line = "#cbd5e1";

function addText(slide, text, x, y, w, h, opts = {}) {
  const box = slide.shapes.add({
    geometry: "textbox",
    position: { left: x, top: y, width: w, height: h },
    fill: "none",
    line: { style: "solid", fill: "none", width: 0 },
  });
  box.text = text;
  box.text.style = {
    fontFamily: "Aptos",
    fontSize: opts.size ?? 24,
    bold: opts.bold ?? false,
    color: opts.color ?? ink,
    ...(opts.style ?? {}),
  };
  return box;
}

function addLabel(slide, text, x, y, w = 220) {
  return addText(slide, text.toUpperCase(), x, y, w, 24, {
    size: 12,
    bold: true,
    color: emerald,
  });
}

function addTitle(slide, title, subtitle) {
  addLabel(slide, "PropLead CRM", margin, 48, 260);
  addText(slide, title, margin, 86, 760, 58, { size: 36, bold: true, color: ink });
  if (subtitle) addText(slide, subtitle, margin, 150, 880, 54, { size: 18, color: slate });
  slide.shapes.add({
    geometry: "rect",
    position: { left: margin, top: 218, width: W - margin * 2, height: 1 },
    fill: line,
    line: { style: "solid", fill: line, width: 0 },
  });
}

function addFooter(slide, n) {
  addText(slide, `PropLead CRM implementation guide · ${n}`, margin, 670, 480, 24, {
    size: 11,
    color: "#64748b",
  });
}

function addBullets(slide, items, x, y, w, opts = {}) {
  const gap = opts.gap ?? 42;
  items.forEach((item, index) => {
    const cy = y + index * gap;
    slide.shapes.add({
      geometry: "ellipse",
      position: { left: x, top: cy + 8, width: 10, height: 10 },
      fill: opts.dotColor ?? emerald,
      line: { style: "solid", fill: opts.dotColor ?? emerald, width: 0 },
    });
    addText(slide, item, x + 24, cy, w - 24, gap, {
      size: opts.size ?? 18,
      color: opts.color ?? slate,
    });
  });
}

function addCard(slide, title, body, x, y, w, h, accent = emerald) {
  slide.shapes.add({
    geometry: "roundRect",
    position: { left: x, top: y, width: w, height: h },
    fill: "#ffffff",
    line: { style: "solid", fill: "#dbe7df", width: 1 },
    borderRadius: "rounded-xl",
  });
  slide.shapes.add({
    geometry: "rect",
    position: { left: x, top: y, width: 6, height: h },
    fill: accent,
    line: { style: "solid", fill: accent, width: 0 },
  });
  addText(slide, title, x + 24, y + 22, w - 48, 34, { size: 20, bold: true, color: ink });
  addText(slide, body, x + 24, y + 66, w - 48, h - 82, { size: 16, color: slate });
}

function addFlow(slide, labels, x, y, w) {
  const boxW = (w - 40 * (labels.length - 1)) / labels.length;
  labels.forEach((label, index) => {
    const bx = x + index * (boxW + 40);
    slide.shapes.add({
      geometry: "roundRect",
      position: { left: bx, top: y, width: boxW, height: 86 },
      fill: index === 0 ? mint : "#ffffff",
      line: { style: "solid", fill: "#b7e4cf", width: 1 },
      borderRadius: "rounded-lg",
    });
    addText(slide, label, bx + 16, y + 24, boxW - 32, 42, { size: 17, bold: true, color: green });
    if (index < labels.length - 1) {
      addText(slide, ">", bx + boxW + 12, y + 26, 20, 34, { size: 22, bold: true, color: emerald });
    }
  });
}

const slides = [
  {
    kind: "cover",
    title: "PropLead CRM",
    subtitle: "Technical implementation and upgrade roadmap",
  },
  {
    title: "Assignment scope",
    subtitle: "The project satisfies the core mini CRM requirements and keeps the original full stack template structure.",
    bullets: [
      "Lead capture, listing, search, filters, sorting, details, notes and status updates",
      "Dashboard metrics from PostgreSQL aggregation functions",
      "JWT login, admin and CRM roles, User Master for admin users",
      "Next.js frontend, Express API, Supabase PostgreSQL and layered backend code",
    ],
  },
  {
    title: "System architecture",
    subtitle: "The implementation keeps the existing separation between UI, API proxy, backend layers and database routines.",
    flow: ["Next.js App Router", "Next API proxy", "Express routes", "Controllers", "Services", "Repositories", "PostgreSQL functions"],
    bullets: [
      "Browser calls same-origin /api routes so the HttpOnly auth cookie stays protected",
      "Express receives Bearer tokens from the proxy and enforces role access",
      "Repositories call stored PostgreSQL functions through a shared pool",
    ],
  },
  {
    title: "Backend request flow",
    subtitle: "Each request moves through a small number of predictable layers.",
    cards: [
      ["Routes", "Define REST paths and attach auth or role middleware.", "#0f766e"],
      ["Controllers", "Read req params/body and return the standard API response.", "#2563eb"],
      ["Services", "Validate input, check permissions, and decide 400/404 behavior.", "#d97706"],
      ["Repositories", "Call parameterized PostgreSQL functions. SQL stays out of controllers.", "#7c3aed"],
    ],
  },
  {
    title: "Database design",
    subtitle: "The schema stores CRM data with constraints, indexes and database functions.",
    cards: [
      ["leads", "Stores contact details, budget, location, property type, source, status and timestamps.", "#0f766e"],
      ["lead_notes", "Stores comments for a lead. Foreign key cascade removes notes when a lead is deleted.", "#2563eb"],
      ["users and roles", "Stores login accounts and role assignment for admin and CRM users.", "#d97706"],
      ["crm_json_* functions", "Return API-ready JSON from PostgreSQL for CRUD, notes, dashboard and users.", "#7c3aed"],
    ],
  },
  {
    title: "REST API coverage",
    subtitle: "The backend now exposes REST-style endpoints while preserving compatibility aliases.",
    bullets: [
      "Leads: POST, GET, GET by ID, PUT, DELETE",
      "Notes: POST and GET under /api/leads/:id/notes",
      "Dashboard: GET /api/dashboard with COUNT and GROUP BY aggregation",
      "Users: admin-only list, view, create, edit and delete",
    ],
  },
  {
    title: "Frontend modules",
    subtitle: "The UI uses App Router pages and small client components for interactive workflows.",
    cards: [
      ["AppShell", "Responsive sidebar, top search and role-aware navigation.", "#0f766e"],
      ["Dashboard", "Live metrics, status distribution and recent lead view.", "#2563eb"],
      ["Leads", "Search, status tabs, source dropdown, sort controls and row actions.", "#d97706"],
      ["User Master", "Admin workspace to create, view, edit and delete users.", "#7c3aed"],
    ],
  },
  {
    title: "Security and validation",
    subtitle: "The app protects authenticated workflows and rejects invalid input before database writes.",
    bullets: [
      "JWT includes user ID, role and expiry, then moves through the Next proxy as a Bearer token",
      "HttpOnly cookies prevent browser JavaScript from reading the token",
      "Lead entity validates required fields, optional email format, allowed status and nonnegative budget",
      "Admin-only routes protect User Master and lead deletion",
    ],
  },
  {
    title: "Deployment model",
    subtitle: "The backend and frontend deploy as separate services with explicit environment configuration.",
    cards: [
      ["Render backend", "Root directory backend, build command npm ci, start command npm start.", "#0f766e"],
      ["Vercel frontend", "Root directory frontend, build command npm run build.", "#2563eb"],
      ["Environment", "API_BASE_URL points Next.js to the Render backend. Secrets stay out of Git.", "#d97706"],
      ["Database setup", "Run db:setup or execute schema.sql and functions.sql in Supabase.", "#7c3aed"],
    ],
  },
  {
    title: "Advanced feature roadmap",
    subtitle: "These upgrades would make PropLead feel closer to a production CRM.",
    bullets: [
      "Lead assignment with owner, priority and SLA due date",
      "Kanban pipeline for New, Contacted, Site Visit and Closed stages",
      "Follow-up reminders with email or WhatsApp notification hooks",
      "Audit log for status, owner and user-management changes",
      "CSV import/export, duplicate detection and bulk actions",
      "Forecasting dashboard with source quality, closure time and budget pipeline",
    ],
  },
  {
    title: "Lead operations upgrades",
    subtitle: "These additions improve daily work for CRM users without changing the current lead CRUD foundation.",
    cards: [
      ["Lead assignment", "Assign each lead to a CRM user, show owner filters and prevent duplicate follow-up.", "#0f766e"],
      ["Follow-up calendar", "Store due dates, reminders and site visit slots for each lead.", "#2563eb"],
      ["Kanban pipeline", "Drag leads across status columns while preserving the existing status API.", "#d97706"],
      ["Duplicate detection", "Warn users when phone or email already exists before creating a new lead.", "#7c3aed"],
    ],
  },
  {
    title: "Upgrade implementation sequence",
    subtitle: "A safe upgrade plan avoids large rewrites and keeps the current assignment features stable.",
    bullets: [
      "Add audit_log, lead_owner and follow_up_due_at columns with migrations",
      "Create service methods and PostgreSQL functions for assignment, reminders and activity history",
      "Add Kanban and calendar views using the existing lead API response shape",
      "Move heavy analytics into read-only dashboard functions or materialized views",
      "Introduce tests for auth, permissions, lead workflows and user management before scaling changes",
    ],
  },
  {
    title: "Automation and communication upgrades",
    subtitle: "These features help the team respond faster and keep a clear history of customer communication.",
    bullets: [
      "Email and WhatsApp templates for first contact, site visit confirmation and closure follow-up",
      "Reminder notifications for leads with no activity after a configured number of days",
      "Activity timeline that combines notes, status changes, owner changes and reminder events",
      "CSV import with validation preview, duplicate warnings and partial success reporting",
      "Export filtered leads for managers without exposing passwords or internal token data",
    ],
  },
  {
    title: "Analytics and governance upgrades",
    subtitle: "These upgrades make the CRM more useful for management reporting and operational control.",
    bullets: [
      "Source quality score based on conversion rate, average budget and time to close",
      "Team performance dashboard with assigned leads, overdue follow-ups and closure rate",
      "Audit log for create, update, delete and login events with admin-only access",
      "Custom fields for property campaigns without changing the lead table every time",
      "Role permission matrix so admins can tune access beyond the fixed admin and CRM roles",
    ],
  },
];

async function build() {
  await fs.mkdir(buildDir, { recursive: true });
  await fs.mkdir(outDir, { recursive: true });

  const presentation = Presentation.create({ slideSize: { width: W, height: H } });

  slides.forEach((spec, index) => {
    const slide = presentation.slides.add();
    slide.background.fill = index === 0 ? green : soft;

    if (spec.kind === "cover") {
      addText(slide, "PROP", margin, 58, 120, 28, { size: 13, bold: true, color: "#a7f3d0" });
      addText(slide, spec.title, margin, 180, 680, 82, { size: 56, bold: true, color: "#ffffff" });
      addText(slide, spec.subtitle, margin, 276, 720, 42, { size: 24, color: "#d1fae5" });
      addText(slide, "Next.js · Express.js · Supabase PostgreSQL · JWT RBAC", margin, 430, 780, 34, { size: 20, color: "#ffffff" });
      slide.shapes.add({
        geometry: "roundRect",
        position: { left: 860, top: 160, width: 270, height: 270 },
        fill: "#ffffff",
        line: { style: "solid", fill: "#ffffff", width: 0 },
        borderRadius: "rounded-2xl",
      });
      addText(slide, "P", 945, 220, 110, 92, { size: 76, bold: true, color: green });
      addText(slide, "Lead management mini CRM", 890, 340, 220, 58, { size: 20, bold: true, color: green });
      addFooter(slide, index + 1);
      return;
    }

    addTitle(slide, spec.title, spec.subtitle);

    if (spec.flow) {
      addFlow(slide, spec.flow, margin, 266, W - margin * 2);
      addBullets(slide, spec.bullets, margin, 416, W - margin * 2, { gap: 48 });
    } else if (spec.cards) {
      const x1 = margin;
      const x2 = W / 2 + 12;
      const y1 = 270;
      const y2 = 456;
      const cardW = 532;
      const cardH = 142;
      spec.cards.forEach(([title, body, color], i) => {
        addCard(slide, title, body, i % 2 === 0 ? x1 : x2, i < 2 ? y1 : y2, cardW, cardH, color);
      });
    } else {
      addBullets(slide, spec.bullets, margin + 10, 276, W - margin * 2 - 20, { gap: 58, size: 20 });
    }

    addFooter(slide, index + 1);
  });

  const draftPath = path.join(buildDir, "PropLead-CRM-Presentation-draft.pptx");
  await (await PresentationFile.exportPptx(presentation)).save(draftPath);

  const { finalizePresentation } = await import(pathToFileURL(path.join(skillDir, "container_tools/artifact_tool_utils.mjs")).href);
  await finalizePresentation({
    workspaceDir,
    candidatePath: draftPath,
    finalPath,
    pythonExecutable: runtimePython,
    integrityValidatorPath: path.join(skillDir, "container_tools/inspect_presentation_package_integrity.py"),
    layoutValidatorPath: path.join(skillDir, "container_tools/inspect_presentation_layout_geometry.py"),
    layoutArgs: ["--expected-slide-size-emu", "12192000,6858000", "--validate-heading-fit"],
    requiredNativeTableOwnerSlides: [],
    requiredNativeChartOwnerSlides: [],
    fontPolicy: { basis: "design", families: ["Aptos"] },
    verifyArtifactToolImport: true,
    receiptPath: path.join(buildDir, "PropLead-CRM-Presentation-Future-Upgrades.validation.json"),
  });

  for (const [i, slide] of presentation.slides.items.entries()) {
    const png = await presentation.export({ slide, format: "png", scale: 1 });
    const bytes = new Uint8Array(await png.arrayBuffer());
    await fs.writeFile(path.join(buildDir, `slide-${String(i + 1).padStart(2, "0")}.png`), bytes);
  }

  const montage = await presentation.export({ format: "webp", montage: true });
  await fs.writeFile(path.join(buildDir, "montage.webp"), new Uint8Array(await montage.arrayBuffer()));
}

build().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
