const promoRepo = require('./promo.repository');
const AppError = require('../../utils/AppError');

class PromoService {
  getAll() { return promoRepo.findAll(); }

  async validate(code) {
    const promo = await promoRepo.findByCode(code);
    if (!promo || !promo.isActive || promo.expiresAt < new Date() || promo.usageCount >= promo.usageLimit) {
      throw new AppError('Invalid or expired promo code', 400, 'INVALID_PROMO');
    }
    return promo;
  }

  async create(data) {
    const existing = await promoRepo.findByCode(data.code);
    if (existing) throw new AppError('Promo code already exists', 409, 'PROMO_EXISTS');
    return promoRepo.create(data);
  }

  async update(id, data) {
    const promo = await promoRepo.updateById(id, data);
    if (!promo) throw new AppError('Promo not found', 404, 'PROMO_NOT_FOUND');
    return promo;
  }
}

module.exports = new PromoService();
