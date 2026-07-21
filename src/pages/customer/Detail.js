import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FaArrowLeft, FaCogs, FaChair, FaGasPump, FaStar,
  FaCalendarAlt, FaClock, FaCalculator, FaCartPlus,
} from 'react-icons/fa';

function Detail({ vehicles, addToCart }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const vehicle = useMemo(
    () => vehicles.find(v => String(v.id) === id),
    [vehicles, id]
  );

  const [unit, setUnit] = useState('day');
  const [duration, setDuration] = useState(1);

  if (!vehicle) {
    return (
      <div className="container py-5 text-center">
        <h4 className="text-muted">Không tìm thấy xe</h4>
        <button className="btn btn-accent mt-3" onClick={() => navigate('/')}>
          Về trang chủ
        </button>
      </div>
    );
  }

  const price = unit === 'day' ? vehicle.pricePerDay : vehicle.pricePerHour;
  const subtotal = price * duration;
  const discount = unit === 'day' && duration >= 3 ? 0.1 : 0;
  const totalPrice = subtotal * (1 - discount);

  const handleBook = (e) => {
    e.preventDefault();
    if (!vehicle.available) return;
    addToCart({
      vehicleId: vehicle.id,
      vehicleName: vehicle.name,
      vehicleImage: vehicle.image,
      brand: vehicle.brand,
      unit,
      duration,
      unitPrice: price,
      discount: discount * 100,
      totalPrice,
    });
    navigate('/cart');
  };

  return (
    <div className="container py-5">
      <button
        className="btn btn-link text-decoration-none mb-4 p-0 text-muted"
        onClick={() => navigate('/')}
      >
        <FaArrowLeft className="me-2" /> Trở về Khám Phá
      </button>

      <div className="card ds-detail-card overflow-hidden">
        <div className="row g-0">
          <div className="col-md-6">
            <div className="detail-img-wrapper">
              <img src={vehicle.image} alt={vehicle.name} className="w-100 h-100" />
              <span className={`status-badge-lg ${vehicle.available ? 'available' : 'rented'}`}>
                {vehicle.available ? 'Sẵn sàng phục vụ' : 'Đang bận'}
              </span>
            </div>
          </div>

          <div className="col-md-6">
            <div className="p-4 d-flex flex-column h-100">
              <span className="brand-label mb-1">{vehicle.brand}</span>
              <h2 className="fw-bold mb-3">{vehicle.name}</h2>

              <div className="specs-detail mb-4">
                <div className="spec-row">
                  <span><strong>Loại xe:</strong> {vehicle.type === 'Car' ? 'Ô tô' : 'Xe máy'}</span>
                </div>
                <div className="spec-row">
                  <FaCogs className="text-accent" />
                  <span><strong>Hộp số:</strong> {vehicle.transmission}</span>
                </div>
                <div className="spec-row">
                  <FaChair className="text-accent" />
                  <span><strong>Số chỗ:</strong> {vehicle.seats} chỗ</span>
                </div>
                <div className="spec-row">
                  <FaGasPump className="text-accent" />
                  <span><strong>Nhiên liệu:</strong> {vehicle.fuel}</span>
                </div>
                <div className="spec-row">
                  <FaStar className="text-warning" />
                  <span><strong>Đánh giá:</strong> {vehicle.rating} / 5.0</span>
                </div>
              </div>

              <div className="calculator-box">
                <h6 className="fw-bold mb-3 d-flex align-items-center gap-2 text-accent">
                  <FaCalculator /> Tính toán giá thuê xe nhanh
                </h6>
                <form onSubmit={handleBook}>
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-muted text-uppercase">
                      Hình thức thuê
                    </label>
                    <div className="d-flex gap-2">
                      <button
                        type="button"
                        className={`btn flex-fill ${unit === 'day' ? 'btn-accent' : 'btn-outline-secondary'}`}
                        onClick={() => { setUnit('day'); setDuration(1); }}
                      >
                        <FaCalendarAlt className="me-1" /> Theo Ngày
                      </button>
                      <button
                        type="button"
                        className={`btn flex-fill ${unit === 'hour' ? 'btn-accent' : 'btn-outline-secondary'}`}
                        onClick={() => { setUnit('hour'); setDuration(1); }}
                      >
                        <FaClock className="me-1" /> Theo Giờ
                      </button>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold text-muted text-uppercase">
                      Số {unit === 'day' ? 'ngày' : 'giờ'} muốn thuê
                    </label>
                    <input
                      type="number"
                      className="form-control text-center fw-bold"
                      min="1"
                      max={unit === 'day' ? 30 : 24}
                      value={duration}
                      onChange={e => setDuration(Math.max(1, parseInt(e.target.value) || 1))}
                      required
                    />
                  </div>

                  <div className="price-summary mb-3">
                    <div>
                      <small className="text-muted">Đơn giá áp dụng</small>
                      <p className="mb-0 fw-semibold">
                        {price.toLocaleString()}đ/{unit === 'day' ? 'ngày' : 'giờ'}
                      </p>
                    </div>
                    <div className="text-end">
                      <small className="text-muted">TỔNG DỰ TÍNH</small>
                      <p className="total-price mb-0">{totalPrice.toLocaleString()}đ</p>
                      {discount > 0 && (
                        <small className="text-success fw-bold">Giảm 10% (thuê từ 3 ngày trở lên)</small>
                      )}
                    </div>
                  </div>

                  <p className="small text-muted mb-3">
                    💡 Mẹo tiết kiệm: Hệ thống tự động giảm ngay 10% tổng hóa đơn cho các gói thuê có thời hạn từ 3 ngày trở lên!
                  </p>

                  <button
                    type="submit"
                    className={`btn w-100 fw-bold ${vehicle.available ? 'btn-accent' : 'btn-secondary'}`}
                    disabled={!vehicle.available}
                  >
                    <FaCartPlus className="me-2" />
                    {vehicle.available ? 'Xác nhận & Giữ chỗ' : 'Phương tiện tạm hết'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Detail;
