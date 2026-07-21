import React from 'react';
import { FaCarSide, FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';

function Footer() {
  return (
    <footer className="ds-footer">
      <div className="container">
        <div className="row g-4">
          <div className="col-lg-6">
            <div className="d-flex align-items-center gap-2 mb-3">
              <FaCarSide className="text-accent fs-4" />
              <span className="fw-bold fs-5 text-white">
                Drive<span className="text-accent">Share</span>
              </span>
            </div>
            <p className="text-secondary small">
              DriveShare – Hành Trình Tự Do, Xe Khỏe Giá Tốt. Đồng hành trên mọi cung đường — thuê xe dễ dàng, lái xe an tâm.
            </p>
          </div>
          <div className="col-lg-6">
            <h6 className="text-white fw-bold mb-3">Liên hệ</h6>
            <ul className="list-unstyled text-secondary small">
              <li className="mb-2 d-flex align-items-center gap-2">
                <FaMapMarkerAlt className="text-accent" /> Khu CNC Hòa Lạc, Hà Nội
              </li>
              <li className="mb-2 d-flex align-items-center gap-2">
                <FaPhone className="text-accent" /> 1900 xxxx xx
              </li>
              <li className="d-flex align-items-center gap-2">
                <FaEnvelope className="text-accent" /> support@driveshare.vn
              </li>
            </ul>
          </div>
        </div>
        <hr className="border-secondary mt-4" />
        <p className="text-center text-secondary small mb-0 pb-3">
          Hệ thống Quản trị Đội xe DriveShare - Phiên bản dành cho Bài tập lớn FER202 - Trường Cao đẳng FPT Polytechnic. Mọi quyền truy cập trái phép vào tài nguyên API đều bị ghi lại lịch sử.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
