const bannerRepo = require('./banner.repository');
const AppError = require('../../utils/AppError');

class BannerService {
  getAll(adminView = false) {
    return adminView ? bannerRepo.findAllAdmin() : bannerRepo.findAll();
  }

  async create(data, imageUrl) {
    return bannerRepo.create({ ...data, image: imageUrl });
  }

  async update(id, data) {
    const banner = await bannerRepo.updateById(id, data);
    if (!banner) throw new AppError('Banner not found', 404, 'BANNER_NOT_FOUND');
    return banner;
  }

  async delete(id) {
    const banner = await bannerRepo.deleteById(id);
    if (!banner) throw new AppError('Banner not found', 404, 'BANNER_NOT_FOUND');
    return { message: 'Banner deleted' };
  }
}

module.exports = new BannerService();
