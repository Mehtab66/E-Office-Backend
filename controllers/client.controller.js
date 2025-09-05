const Client = require("../models/client.model");

const createClient = async (req, res, next) => {
  try {
    const client = await Client.create({ ...req.body, createdBy: req.user.id });
    res.status(201).json(client);
  } catch (err) {
    console.log(err);
    next(err);
  }
};

const getClients = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const clients = await Client.find()
      .populate("projects")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
    res.json(clients);
  } catch (err) {
    next(err);
  }
};

const getClient = async (req, res, next) => {
  try {
    const client = await Client.findById(req.params.id).populate("projects");
    if (!client) return res.status(404).json({ error: "Client not found" });
    res.json(client);
  } catch (err) {
    next(err);
  }
};

const updateClient = async (req, res, next) => {
  try {
    const client = await Client.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!client) return res.status(404).json({ error: "Client not found" });
    res.json(client);
  } catch (err) {
    next(err);
  }
};

const deleteClient = async (req, res, next) => {
  try {
    const client = await Client.findByIdAndDelete(req.params.id);
    if (!client) return res.status(404).json({ error: "Client not found" });
    res.json({ message: "Client deleted" });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createClient,
  getClients,
  getClient,
  updateClient,
  deleteClient,
};
