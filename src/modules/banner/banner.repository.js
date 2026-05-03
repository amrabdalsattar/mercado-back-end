const Banner = require('./banner.model');

class BannerRepository {
  findAll() { return Banner.find({ isActive: true }).sort({ order: 1 }); }
  findAllAdmin() { return Banner.find().sort({ order: 1 }); }
  findById(id) { return Banner.findById(id); }
  create(data) { return Banner.create(data); }
  updateById(id, data) { return Banner.findByIdAndUpdate(id, data, { new: true }); }
  deleteById(id) { return Banner.findByIdAndDelete(id); }
}

module.exports = new BannerRepository();
