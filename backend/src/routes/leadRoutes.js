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

router.post("/leads", authorizeRoles("admin", "CRM"), createLead);
router.patch("/leads/:id/status", authorizeRoles("admin", "CRM"), updateLeadStatus);
router.get("/leads", authorizeRoles("admin", "CRM"), getAllLeads);
router.post("/leads/:id/notes", authorizeRoles("admin", "CRM"), createLeadNote);
router.get("/leads/:id/notes", authorizeRoles("admin", "CRM"), getLeadNotes);
router.get("/leads/:id", authorizeRoles("admin", "CRM"), getLeadById);
router.put("/leads/:id", authorizeRoles("admin", "CRM"), updateLead);
router.delete("/leads/:id", authorizeRoles("admin"), deleteLead);

module.exports = router;
