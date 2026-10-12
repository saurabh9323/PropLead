const Lead = require("../models/Lead");
const leadRepository = require("../repositories/leadRepository");
const AppError = require("../utils/appError");

const allowedStatuses = ["New", "Contacted", "Site Visit", "Closed"];
const allowedSortFields = ["created_at", "budget"];
const allowedSortOrders = ["asc", "desc"];
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const handleLeadRepositoryError = (error) => {
  if (error.constraint === "leads_budget_non_negative") {
    throw new AppError("Budget cannot be negative", 400);
  }

  if (error.constraint === "leads_status_allowed") {
    throw new AppError("Invalid lead status", 400);
  }

  throw new AppError("Lead operation failed", 500);
};

const createLead = async (leadData) => {
  const lead = new Lead(leadData);

  try {
    return await leadRepository.createLead(lead);
  } catch (error) {
    handleLeadRepositoryError(error);
  }
};

const cleanOptionalString = (value, errorMessage) => {
  if (value === undefined) return undefined;

  if (typeof value !== "string" || value.trim() === "") {
    throw new AppError(errorMessage, 400);
  }

  return value.trim();
};

const validateLeadQueryParams = (queryParams) => {
  const search = cleanOptionalString(queryParams.search, "Search cannot be empty");
  const source = cleanOptionalString(queryParams.source, "Source cannot be empty");
  const status = cleanOptionalString(queryParams.status, "Invalid status");
  const sortBy = cleanOptionalString(queryParams.sortBy, "Invalid sort field") || "created_at";
  const sortOrder =
    (cleanOptionalString(queryParams.sortOrder, "Invalid sort order") || "desc").toLowerCase();

  if (status && !allowedStatuses.includes(status)) {
    throw new AppError("Invalid status", 400);
  }

  if (!allowedSortFields.includes(sortBy)) {
    throw new AppError("Invalid sort field", 400);
  }

  if (!allowedSortOrders.includes(sortOrder)) {
    throw new AppError("Invalid sort order", 400);
  }

  return {
    search,
    source,
    status,
    sortBy,
    sortOrder,
  };
};

const getAllLeads = async (queryParams) => {
  const validQueryParams = validateLeadQueryParams(queryParams);

  try {
    return await leadRepository.getAllLeads(validQueryParams);
  } catch (error) {
    handleLeadRepositoryError(error);
  }
};

const getLeadById = async (leadId) => {
  if (typeof leadId !== "string" || !uuidPattern.test(leadId)) {
    throw new AppError("Invalid lead ID", 400);
  }

  try {
    const lead = await leadRepository.getLeadById(leadId);

    if (!lead) {
      throw new AppError("Lead not found", 404);
    }

    return lead;
  } catch (error) {
    if (error instanceof AppError) throw error;
    handleLeadRepositoryError(error);
  }
};

const updateLead = async (leadId, leadData) => {
  if (typeof leadId !== "string" || !uuidPattern.test(leadId)) {
    throw new AppError("Invalid lead ID", 400);
  }

  const lead = new Lead(leadData);

  try {
    const updatedLead = await leadRepository.updateLead(leadId, lead);

    if (!updatedLead) {
      throw new AppError("Lead not found", 404);
    }

    return updatedLead;
  } catch (error) {
    if (error instanceof AppError) throw error;
    handleLeadRepositoryError(error);
  }
};

const deleteLead = async (leadId) => {
  if (typeof leadId !== "string" || !uuidPattern.test(leadId)) {
    throw new AppError("Invalid lead ID", 400);
  }

  try {
    const deletedLead = await leadRepository.deleteLead(leadId);

    if (!deletedLead) {
      throw new AppError("Lead not found", 404);
    }

    return deletedLead;
  } catch (error) {
    if (error instanceof AppError) throw error;
    handleLeadRepositoryError(error);
  }
};

const validateLeadId = (leadId) => {
  if (typeof leadId !== "string" || !uuidPattern.test(leadId)) {
    throw new AppError("Invalid lead ID", 400);
  }
};

const getExistingLead = async (leadId) => {
  const lead = await leadRepository.getLeadById(leadId);

  if (!lead) {
    throw new AppError("Lead not found", 404);
  }

  return lead;
};

const cleanNoteText = (noteData) => {
  const note = noteData && noteData.note;

  if (typeof note !== "string" || note.trim() === "") {
    throw new AppError("Note is required", 400);
  }

  if (note.trim().length > 5000) throw new AppError("Notes must be 5000 characters or fewer", 400);
  return note.trim();
};

const createLeadNote = async (leadId, noteData) => {
  validateLeadId(leadId);
  const note = cleanNoteText(noteData);

  try {
    await getExistingLead(leadId);
    return await leadRepository.createLeadNote(leadId, note);
  } catch (error) {
    if (error instanceof AppError) throw error;
    handleLeadRepositoryError(error);
  }
};

const getLeadNotes = async (leadId) => {
  validateLeadId(leadId);

  try {
    await getExistingLead(leadId);
    return await leadRepository.getLeadNotes(leadId);
  } catch (error) {
    if (error instanceof AppError) throw error;
    handleLeadRepositoryError(error);
  }
};

const updateLeadStatus = async (id, data) => {
  validateLeadId(id);
  if (!allowedStatuses.includes(data?.status)) throw new AppError("Invalid lead status", 400);
  const lead = await leadRepository.updateLeadStatus(id, data.status);
  if (!lead) throw new AppError("Lead not found", 404);
  return lead;
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
