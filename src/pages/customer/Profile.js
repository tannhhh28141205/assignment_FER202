import React, { useState, useMemo } from 'react';
import { FaUser, FaHistory, FaIdCard, FaPhone, FaEnvelope, FaTimes, FaEdit, FaSave, FaMapMarkerAlt } from 'react-icons/fa';
import Pagination from '../../components/Pagination';

const ITEMS_PER_PAGE = 5;

function Profile({ user, bookings = [], updateUser, onUserUpdated }) {
  const [activeTab, setActiveTab] = useState('info');
  const [currentPage, setCurrentPage] = useState(1);
  const [filterDate, setFilterDate] = useState('');

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: user.fullName,
    password: user.password,
    address: user.address || '',
  });
  const [saving, setSaving] = useState(false);

  const myOrders = useMemo(() => {
    return bookings.filter(b => b.customerName === user.fullName);
  }, [bookings, user.fullName]);

  const filteredOrders = useMemo(() => {
    if (!filterDate) return myOrders;
    return myOrders.filter(b => {
      if (!b.createdAt) return false;
      return new Date(b.createdAt).toISOString().split('T')[0] === filterDate;
    });
  }, [myOrders, filterDate]);

  const stats = useMemo(() => {
    const total = myOrders.length;
    const pending = myOrders.filter(b => b.status === 'pending').length;
    const renting = myOrders.filter(b => b.status === 'renting').length;
    const completed = myOrders.filter(b => b.status === 'completed').length;
    const totalSpent = myOrders
      .filter(b => b.status !== 'rejected')
      .reduce((sum, b) => sum + (b.totalPrice || 0), 0);
    return { total, pending, renting, completed, totalSpent };
  }, [myOrders]);

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!editForm.fullName.trim()) {
      alert('Họ tên không được để trống!');
      return;
    }
    if (!editForm.password.trim()) {
      alert('Mật khẩu không được để trống!');
      return;
    }
    setSaving(true);
    try {
      await updateUser(user.id, {
        ...user,
        fullName: editForm.fullName.trim(),
        password: editForm.password.trim(),
        address: editForm.address.trim(),
      });
      const updatedUser = { ...user, fullName: editForm.fullName.trim(), password: editForm.password.trim(), address: editForm.address.trim() };
      localStorage.setItem('ds_user', JSON.stringify(updatedUser));
      if (onUserUpdated) onUserUpdated(updatedUser);
      setIsEditing(false);
      alert('Cập nhật thông tin thành công!');
    } catch (err) {
      alert('Lỗi khi cập nhật. Vui lòng thử lại!');
    }
    setSaving(false);
  };

  const handleCancel = () => {
    setEditForm({ fullName: user.fullName, password: user.password, address: user.address || '' });
    setIsEditing(false);
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const getPaginatedData = (data) => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return data.slice(start, start + ITEMS_PER_PAGE);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved': return <span className="badge bg-success">Đã duyệt</span>;
      case 'renting': return <span className="badge bg-primary">Đang thuê</span>;
      case 'completed': return <span className="badge bg-secondary">Hoàn thành</span>;
      case 'rejected': return <span className="badge bg-danger">Đã hủy</span>;
      default: return <span className="badge bg-warning text-dark">Chờ duyệt</span>;
    }
  };

  return (
    <div className="container py-5">
      {/* Header */}
      <div className="d-flex align-items-center gap-3 mb-4">
        <div className="bg-accent text-white p-3 rounded-3">
          <FaUser size={28} />
        </div>
        <div>
          <h2 className="fw-bold mb-1">Tài Khoản Của Tôi</h2>
          <p className="text-muted small mb-0">Xem & chỉnh sửa thông tin cá nhân, lịch sử đặt xe</p>
        </div>
      </div>

      {/* Stats */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <div className="card p-3 text-center shadow-sm border-0 bg-light">
            <h6 className="text-muted mb-1 small">Tổng đơn</h6>
            <h3 className="fw-bold text-dark mb-0">{stats.total}</h3>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card p-3 text-center shadow-sm border-0 bg-light">
            <h6 className="text-muted mb-1 small">Đang thuê</h6>
            <h3 className="fw-bold text-primary mb-0">{stats.renting}</h3>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card p-3 text-center shadow-sm border-0 bg-light">
            <h6 className="text-muted mb-1 small">Hoàn thành</h6>
            <h3 className="fw-bold text-success mb-0">{stats.completed}</h3>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card p-3 text-center shadow-sm border-0 bg-light">
            <h6 className="text-muted mb-1 small">Tổng chi</h6>
            <h3 className="fw-bold text-accent mb-0">{stats.totalSpent.toLocaleString()}đ</h3>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card">
        <div className="card-header bg-white p-0">
          <ul className="nav nav-tabs border-0 flex-column flex-sm-row">
            <li className="nav-item m-0">
              <button
                className={`nav-link rounded-0 py-3 px-4 fw-bold border-0 d-flex align-items-center gap-2 ${
                  activeTab === 'info' ? 'active border-bottom border-success text-accent' : 'text-secondary'
                }`}
                onClick={() => { setActiveTab('info'); setCurrentPage(1); }}
              >
                <FaIdCard /> Thông Tin Cá Nhân
              </button>
            </li>
            <li className="nav-item m-0">
              <button
                className={`nav-link rounded-0 py-3 px-4 fw-bold border-0 d-flex align-items-center gap-2 ${
                  activeTab === 'orders' ? 'active border-bottom border-success text-accent' : 'text-secondary'
                }`}
                onClick={() => { setActiveTab('orders'); setCurrentPage(1); }}
              >
                <FaHistory /> Lịch Sử Đặt Xe
                {stats.pending + stats.renting > 0 && (
                  <span className="badge bg-warning text-dark rounded-pill">{stats.pending + stats.renting}</span>
                )}
              </button>
            </li>
          </ul>
        </div>

        <div className="card-body p-4">

          {/* TAB 1: THÔNG TIN CÁ NHÂN */}
          {activeTab === 'info' && (
            <div className="row justify-content-center">
              <div className="col-md-8 col-lg-6">
                <div className="text-center mb-4">
                  <div className="bg-accent text-white rounded-circle d-inline-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px', fontSize: '2rem' }}>
                    {user.fullName.charAt(0).toUpperCase()}
                  </div>
                  <h4 className="fw-bold mt-3 mb-0">{user.fullName}</h4>
                  <span className="badge bg-success mt-2">Khách hàng</span>
                </div>

                {!isEditing ? (
                  <>
                    <div className="card bg-light border-0 p-4">
                      <div className="d-flex align-items-center gap-3 mb-3 pb-3 border-bottom">
                        <FaUser className="text-accent" />
                        <div>
                          <small className="text-muted d-block">Họ và tên</small>
                          <strong>{user.fullName}</strong>
                        </div>
                      </div>
                      <div className="d-flex align-items-center gap-3 mb-3 pb-3 border-bottom">
                        <FaIdCard className="text-accent" />
                        <div>
                          <small className="text-muted d-block">Tên đăng nhập</small>
                          <strong>{user.username}</strong>
                        </div>
                      </div>
                      <div className="d-flex align-items-center gap-3 mb-3 pb-3 border-bottom">
                        <FaEnvelope className="text-accent" />
                        <div>
                          <small className="text-muted d-block">Vai trò</small>
                          <strong>Khách hàng (Customer)</strong>
                        </div>
                      </div>
                      <div className="d-flex align-items-center gap-3">
                        <FaPhone className="text-accent" />
                        <div>
                          <small className="text-muted d-block">ID tài khoản</small>
                          <strong>{user.id}</strong>
                        </div>
                      </div>
                      <div className="d-flex align-items-center gap-3 mt-3 pt-3 border-top">
                        <FaMapMarkerAlt className="text-accent" />
                        <div>
                          <small className="text-muted d-block">Địa chỉ</small>
                          <strong>{user.address || <span className="text-muted fst-italic">Chưa cập nhật</span>}</strong>
                        </div>
                      </div>
                    </div>
                    <div className="text-center mt-3">
                      <button className="btn btn-accent d-inline-flex align-items-center gap-2" onClick={() => setIsEditing(true)}>
                        <FaEdit /> Chỉnh sửa thông tin
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="card border-0 shadow-sm p-4">
                    <h5 className="fw-bold mb-3">Chỉnh Sửa Thông Tin</h5>
                    <form onSubmit={handleSave}>
                      <div className="mb-3">
                        <label className="form-label fw-bold">Họ và tên</label>
                        <input type="text" className="form-control" name="fullName" value={editForm.fullName} onChange={handleEditChange} required />
                      </div>
                      <div className="mb-3">
                        <label className="form-label fw-bold">Tên đăng nhập</label>
                        <input type="text" className="form-control" value={user.username} disabled />
                        <small className="text-muted">Không thể thay đổi tên đăng nhập</small>
                      </div>
                      <div className="mb-3">
                        <label className="form-label fw-bold">Mật khẩu</label>
                        <input type="text" className="form-control" name="password" value={editForm.password} onChange={handleEditChange} required />
                      </div>
                      <div className="mb-3">
                        <label className="form-label fw-bold">Địa chỉ</label>
                        <input type="text" className="form-control" name="address" value={editForm.address} onChange={handleEditChange} placeholder="Nhập địa chỉ của bạn" />
                      </div>
                      <div className="d-flex gap-2">
                        <button type="submit" className="btn btn-accent d-flex align-items-center gap-2" disabled={saving}>
                          <FaSave /> {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                        </button>
                        <button type="button" className="btn btn-outline-secondary" onClick={handleCancel} disabled={saving}>
                          Hủy
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: LỊCH SỬ ĐẶT XE */}
          {activeTab === 'orders' && (
            <div>
              <div className="d-flex align-items-end gap-3 mb-4 flex-wrap">
                <div>
                  <label className="form-label fw-bold small mb-1">Lọc theo ngày đặt</label>
                  <input type="date" className="form-control form-control-sm" value={filterDate}
                    onChange={e => { setFilterDate(e.target.value); setCurrentPage(1); }} />
                </div>
                {filterDate && (
                  <button className="btn btn-sm btn-outline-secondary" onClick={() => setFilterDate('')}>
                    <FaTimes className="me-1" /> Xem tất cả
                  </button>
                )}
                <span className="text-muted small ms-auto">Tìm thấy {filteredOrders.length} đơn</span>
              </div>

              {filteredOrders.length === 0 ? (
                <div className="text-center py-5">
                  <FaHistory className="text-muted fs-1 mb-3" />
                  <h5 className="text-muted">{filterDate ? 'Không có đơn nào trong ngày này' : 'Bạn chưa có đơn đặt xe nào'}</h5>
                  <p className="text-muted small">Hãy khám phá và đặt xe ngay!</p>
                </div>
              ) : (
                <>
                  <div className="table-responsive">
                    <table className="table align-middle">
                      <thead className="table-light">
                        <tr>
                          <th>Ngày đặt</th>
                          <th>Xe thuê</th>
                          <th>Thời gian</th>
                          <th>Tổng tiền</th>
                          <th>Thanh toán</th>
                          <th>Trạng thái</th>
                          <th>Nhân viên</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getPaginatedData(filteredOrders).map(b => (
                          <tr key={b.id}>
                            <td className="small">{b.createdAt ? new Date(b.createdAt).toLocaleDateString('vi-VN') : '—'}</td>
                            <td className="fw-bold">{b.vehicleName}</td>
                            <td>{b.duration} {b.unit === 'day' ? 'ngày' : 'giờ'}</td>
                            <td className="text-accent fw-bold">{b.totalPrice.toLocaleString()}đ</td>
                            <td>
                              <span className={`badge ${b.paymentMethod === 'VNPay' ? 'bg-info text-dark' : 'bg-light text-dark border'}`}>
                                {b.paymentMethod || 'COD'}
                              </span>
                            </td>
                            <td>{getStatusBadge(b.status)}</td>
                            <td>
                              {b.assignedStaffName ? (
                                <span className="small">{b.assignedStaffName}</span>
                              ) : (
                                <span className="text-muted small">Chưa phân</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <Pagination itemsPerPage={ITEMS_PER_PAGE} totalItems={filteredOrders.length} paginate={paginate} currentPage={currentPage} />
                </>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default Profile;