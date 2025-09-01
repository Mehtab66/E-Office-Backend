const Client = require("../models/client.model");
const { validateClient } = require("../validators/client.validator");

// Controller to add a new client
const addClient = async (req, res) => {
  try {
    // Validate request body
    const { error } = validateClient(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const {
      name,
      email,
      phone,
      country,
      currency,
      billingAddress,
      shippingAddress,
    } = req.body;

    // Check if client already exists
    const existingClient = await Client.findOne({ email });
    if (existingClient) {
      return res
        .status(400)
        .json({ message: "Client with this email already exists" });
    }

    // Create new client
    const client = new Client({
      name,
      email,
      phone,
      country,
      currency,
      billingAddress,
      shippingAddress,
    });

    await client.save();

    res.status(201).json({ message: "Client added successfully", client });
  } catch (error) {
    console.error("Error adding client:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { addClient };
