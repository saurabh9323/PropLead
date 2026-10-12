const leadService = require("../services/leadService");
const handleControllerError = require("../utils/controllerError");

const createLead = async (req, res) => {
  try {
    const lead = await leadService.createLead(req.body);

    res.status(201).json({
      message: "Lead created",
      data: lead,
    });
  } catch (error) {
    handleControllerError(res, error);
  }
};

const getAllLeads = async (req, res) => {
  try {
    const leads = await leadService.getAllLeads(req.query);

    res.status(200).json({
      message: "Leads retrieved successfully",
      data: leads,
    });
  } catch (error) {
    handleControllerError(res, error);
  }
};

const getLeadById = async (req, res) => {
  try {
    const lead = await leadService.getLeadById(req.params.id);

    res.status(200).json({
      message: "Lead retrieved successfully",
      data: lead,
    });
  } catch (error) {
    handleControllerError(res, error);
  }
};

const updateLead = async (req, res) => {
  try {
    const lead = await leadService.updateLead(req.params.id, req.body);

    res.status(200).json({
      message: "Lead updated successfully",
      data: lead,
    });
  } catch (error) {
    handleControllerError(res, error);
  }
};

const deleteLead = async (req, res) => {
  try {
    const lead = await leadService.deleteLead(req.params.id);

    res.status(200).json({
      message: "Lead deleted successfully",
      data: lead,
    });
  } catch (error) {
    handleControllerError(res, error);
  }
};

const createLeadNote = async (req, res) => {
  try {
    const note = await leadService.createLeadNote(req.params.id, req.body);

    res.status(201).json({
      message: "Lead note created",
      data: note,
    });
  } catch (error) {
    handleControllerError(res, error);
  }
};

const getLeadNotes = async (req, res) => {
  try {
    const notes = await leadService.getLeadNotes(req.params.id);

    res.status(200).json({
      message: "Lead notes retrieved successfully",
      data: notes,
    });
  } catch (error) {
    handleControllerError(res, error);
  }
};

module.exports = {
  createLead,
  getAllLeads,
  getLeadById,
  updateLead,
  deleteLead,
  createLeadNote,
  getLeadNotes,
};
