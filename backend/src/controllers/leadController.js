const leadService = require("../services/leadService");
const handleControllerError = require("../utils/controllerError");

const createLead = async (req, res) => {
  try {
    const lead = await leadService.createLead(req.body);

    res.status(201).json(lead);
  } catch (error) {
    handleControllerError(res, error);
  }
};

const getAllLeads = async (req, res) => {
  try {
    const leads = await leadService.getAllLeads(req.body);

    res.status(200).json(leads);
  } catch (error) {
    handleControllerError(res, error);
  }
};

const getLeadById = async (req, res) => {
  try {
    const lead = await leadService.getLeadById(req.params.id);

    res.status(200).json(lead);
  } catch (error) {
    handleControllerError(res, error);
  }
};

const updateLead = async (req, res) => {
  try {
    const lead = await leadService.updateLead(req.params.id, req.body);

    res.status(200).json(lead);
  } catch (error) {
    handleControllerError(res, error);
  }
};

const deleteLead = async (req, res) => {
  try {
    const lead = await leadService.deleteLead(req.params.id);

    res.status(200).json(lead);
  } catch (error) {
    handleControllerError(res, error);
  }
};

const createLeadNote = async (req, res) => {
  try {
    const note = await leadService.createLeadNote(req.params.id, req.body);

    res.status(201).json(note);
  } catch (error) {
    handleControllerError(res, error);
  }
};

const getLeadNotes = async (req, res) => {
  try {
    const notes = await leadService.getLeadNotes(req.params.id);

    res.status(200).json(notes);
  } catch (error) {
    handleControllerError(res, error);
  }
};

const updateLeadStatus = async (req, res) => {
  try {
    const lead = await leadService.updateLeadStatus(req.params.id, req.body);
    res.json(lead);
  } catch (error) { handleControllerError(res, error); }
};

module.exports = {
  updateLeadStatus,
  createLead,
  getAllLeads,
  getLeadById,
  updateLead,
  deleteLead,
  createLeadNote,
  getLeadNotes,
};
