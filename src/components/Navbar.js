import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { FaCarSide, FaCompass, FaClipboardList, FaUserShield, FaUserCog, FaSignOutAlt, FaSignInAlt, FaUser } from 'react-icons/fa';

function Navbar({ cartCount, user, onLogout }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleBrandClick = (e) => {
    e.preventDefault();
    window.location.href = '/';
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark ds-navbar sticky-top">
      <div className="container">
        <a className="navbar-brand d-flex align-items-center gap-2" href="/" onClick={handleBrandClick}>
          <FaCarSide className="brand-icon" />
          <span className="brand-text">
            Drive<span className="text-accent">Share</span>
          </span>
        </a>

        <button
          className="navbar-toggler"
          type="button"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className={`collapse navbar-collapse ${isOpen ? 'show' : ''}`} id="mainNav">
          <ul className="navbar-nav ms-auto gap-1 align-items-center">
            <li className="nav-item">
              <NavLink className="nav-link d-flex align-items-center gap-1" to="/" onClick={() => setIsOpen(false)}>
                <FaCompass /> Khám Phá Xe
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link d-flex align-items-center gap-1" to="/cart" onClick={() => setIsOpen(false)}>
                <FaClipboardList /> Đơn Chờ Đặt
                {cartCount > 0 && (
                  <span className="badge bg-accent ms-1">{cartCount}</span>
                )}
              </NavLink>
            </li>

            {user && user.role === 'admin' && (
              <li className="nav-item">
                <NavLink className="nav-link d-flex align-items-center gap-1" to="/admin" onClick={() => setIsOpen(false)}>
                  <FaUserShield /> Admin
                </NavLink>
              </li>
            )}

            {user && user.role === 'staff' && (
              <li className="nav-item">
                <NavLink className="nav-link d-flex align-items-center gap-1" to="/staff" onClick={() => setIsOpen(false)}>
                  <FaUserCog /> Staff
                </NavLink>
              </li>
            )}

            {user && (
              <li className="nav-item">
                <NavLink className="nav-link d-flex align-items-center gap-1" to="/profile" onClick={() => setIsOpen(false)}>
                  <FaUser /> Tài Khoản
                </NavLink>
              </li>
            )}

            <li className="nav-item ms-lg-2">
              {user ? (
                <div className="d-flex align-items-center gap-2">
                  <span className="text-light small fw-bold">{user.fullName}</span>
                  <button className="btn btn-sm btn-outline-light d-flex align-items-center gap-1" onClick={onLogout}>
                    <FaSignOutAlt /> Thoát
                  </button>
                </div>
              ) : (
                <NavLink className="btn btn-sm btn-accent d-flex align-items-center gap-1" to="/login" onClick={() => setIsOpen(false)}>
                  <FaSignInAlt /> Đăng Nhập
                </NavLink>
              )}
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
