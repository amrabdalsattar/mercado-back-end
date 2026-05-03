const Promo = require('./promo.model');

class PromoRepository {
  findAll() { return Promo.find(); }
  findById(id) { return Promo.findById(id); }
  findByCode(code) { return Promo.findOne({ code: code.toUpperCase() }); }
  create(data) { return Promo.create(data); }
  updateById(id, data) { return Promo.findByIdAndUpdate(id, data, { new: true }); }
  incrementUsage(id) { return Promo.findByIdAndUpdate(id, { $inc: { usageCount: 1 } }); }
}

module.exports = new PromoRepository();
