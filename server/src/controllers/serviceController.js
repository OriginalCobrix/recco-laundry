const Service = require('../models/Service');

exports.getServices = async (req, res) => {
  try {
    const services = await Service.find();
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createService = async (req, res) => {
  try {
    const { name, description, price, priceType, category } = req.body;
    const service = await Service.create({ name, description, price, priceType, category });
    res.status(201).json(service);
  } catch (error) {
    if (error.code === 11000) return res.status(400).json({ message: 'Service with this name already exists' });
    res.status(500).json({ message: error.message });
  }
};

exports.updateService = async (req, res) => {
  try {
    const { name, description, price, priceType, category, isActive } = req.body;
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ message: 'Service not found' });

    service.name = name || service.name;
    service.description = description || service.description;
    service.price = price !== undefined ? Number(price) : service.price;
    service.priceType = priceType || service.priceType;
    service.category = category || service.category;
    if (isActive !== undefined) service.isActive = isActive;

    const updatedService = await service.save();
    res.json(updatedService);
  } catch (error) {
    if (error.code === 11000) return res.status(400).json({ message: 'Service with this name already exists' });
    res.status(500).json({ message: error.message });
  }
};

exports.deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ message: 'Service not found' });
    await service.deleteOne(); 
    res.json({ message: 'Service removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};