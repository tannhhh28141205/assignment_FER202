import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaStar, FaGasPump, FaCogs, FaChair } from 'react-icons/fa';

function VehicleCard({ vehicle }) {
  const navigate = useNavigate();

  return (
    <div className="card ds-card h-100">
      <div className="card-img-wrapper">
        <img
          src={vehicle.image}
          alt={vehicle.name}
          className="card-img-top"
        />
        <span className={`status-badge ${vehicle.available ? 'available' : 'rented'}`}>
          {vehicle.available ? 'Còn trống' : 'Đã đặt'}
        </span>
        <span className="rating-badge">
          <FaStar className="text-warning" /> {vehicle.rating}
        </span>
      </div>

      <div className="card-body d-flex flex-column">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <span className="brand-label">{vehicle.brand}</span>
          <span className="type-label">
            Loại xe: {vehicle.type === 'Car' ? 'Ô tô' : 'Xe máy'}
          </span>
        </div>

        <h5 className="card-title fw-bold">{vehicle.name}</h5>

        <div className="specs-grid">
          <div className="spec-item">
            <FaCogs className="text-muted" /> Hộp số: {vehicle.transmission}
          </div>
          <div className="spec-item">
            <FaChair className="text-muted" /> Số chỗ: {vehicle.seats} chỗ
          </div>
          <div className="spec-item spec-full">
            <FaGasPump className="text-muted" /> Nhiên liệu: {vehicle.fuel}
          </div>
        </div>

        <hr />

        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <small className="text-muted">Giá thuê</small>
            <p className="price-day mb-0">
              {vehicle.pricePerDay.toLocaleString()}đ
              <small className="text-muted">/ngày</small>
            </p>
          </div>
          <div className="text-end">
            <p className="price-hour mb-0">
              {vehicle.pricePerHour.toLocaleString()}đ
              <small className="text-muted">/giờ</small>
            </p>
          </div>
        </div>

        <button
          className="btn btn-accent w-100 mt-auto"
          onClick={() => navigate(`/detail/${vehicle.id}`)}
        >
          Xem Chi Tiết & Đặt Xe
        </button>
      </div>
    </div>
  );
}

export default VehicleCard;
