const express = require("express");
const {
  authorizeRoles,
} = require("../middlewares/authMiddleware");
const {
  createLead,
  updateLeadStatus,
  getAllLeads,
  getLeadById,
  updateLead,
  deleteLead,
  createLeadNote,
  getLeadNotes,
} = require("../controllers/leadController");

const router = express.Router();

// REST-compatible lead API.
router.post("/leads", authorizeRoles("admin", "CRM"), createLead);
router.get("/leads", authorizeRoles("admin", "CRM"), getAllLeads);
router.post("/leads/:id/notes", authorizeRoles("admin", "CRM"), createLeadNote);
router.get("/leads/:id/notes", authorizeRoles("admin", "CRM"), getLeadNotes);
router.get("/leads/:id", authorizeRoles("admin", "CRM"), getLeadById);
router.put("/leads/:id", authorizeRoles("admin", "CRM"), updateLead);
router.delete("/leads/:id", authorizeRoles("admin"), deleteLead);

// Temporary compatibility aliases for the original action-style API.
router.post("/leads/list", authorizeRoles("admin", "CRM"), getAllLeads);
router.post("/leads/:id/status", authorizeRoles("admin", "CRM"), updateLeadStatus);
router.post("/leads/:id/update", authorizeRoles("admin", "CRM"), updateLead);
router.post("/leads/:id/delete", authorizeRoles("admin"), deleteLead);

module.exports = router;
