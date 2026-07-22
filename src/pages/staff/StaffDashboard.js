import React, { useState, useMemo } from 'react';
import {
  FaUserCheck, FaCar, FaHandHoldingUsd,
  FaToggleOn, FaToggleOff, FaHistory,
  FaKey, FaUndoAlt, FaTimes
} from 'react-icons/fa';
import Pagination from '../../components/Pagination';

const ITEMS_PER_PAGE = 5;

function StaffDashboard({
  vehicles,
  bookings,
  toggleAvailable,
  handleAssignStaff,
  handleDeliverVehicle,
  handleReceiveVehicle,
  user
}) {
  const [activeTab, setActiveTab] = useState('my-tasks');
  const [vehicleFilter, setVehicleFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);

  const [showDeliverModal, setShowDeliverModal] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const [checkoutCondition, setCheckoutCondition] = useState('Xe sạch sẽ, không trầy xước, đầy đủ gương kính.');
  const [checkoutFuel, setCheckoutFuel] = useState('100% Pin / Đầy bình xăng');
  const [checkinCondition, setCheckinCondition] = useState('Xe bình thường, không va đập.');
  const [checkinFuel, setCheckinFuel] = useState('95% Pin / Gần đầy bình xăng');
  const [surcharge, setSurcharge] = useState(0);
  const [surchargeReason, setSurchargeReason] = useState('');

  const [historyDate, setHistoryDate] = useState('');

  // eslint-disable-next-line eqeqeq
  const myBookings = bookings.filter(b => b.assignedStaffId == user.id);

  const filteredVehicles = vehicles.filter(v => {
    if (vehicleFilter === 'Available') return v.available;
    if (vehicleFilter === 'Rented') return !v.available;
    return true;
  });

  const historyBookings = useMemo(() => {
    return myBookings.filter(b => {
      if (!historyDate) return true;
      if (!b.createdAt) return false;
      const bookingDate = new Date(b.createdAt).toISOString().split('T')[0];
      return bookingDate === historyDate;
    });
  }, [myBookings, historyDate]);

  const historyStats = useMemo(() => {
    const delivered = historyBookings.filter(b => b.status === 'renting' || b.status === 'completed').length;
    const completed = historyBookings.filter(b => b.status === 'completed').length;
    const totalRevenue = historyBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
    return { delivered, completed, totalRevenue, total: historyBookings.length };
  }, [historyBookings]);

  const openDeliver = (booking) => {
    setSelectedBooking(booking);
    setShowDeliverModal(true);
  };

  const openReceive = (booking) => {
    setSelectedBooking(booking);
    setShowReceiveModal(true);
  };

  const submitDeliver = (e) => {
    e.preventDefault();
    handleDeliverVehicle(selectedBooking.id, selectedBooking.vehicleId, {
      condition: checkoutCondition,
      fuel: checkoutFuel,
      time: new Date().toISOString()
    });
    setShowDeliverModal(false);
    setSelectedBooking(null);
  };

  const submitReceive = (e) => {
    e.preventDefault();
    handleReceiveVehicle(selectedBooking.id, selectedBooking.vehicleId, {
      condition: checkinCondition,
      fuel: checkinFuel,
      surcharge: Number(surcharge),
      surchargeReason: surchargeReason || 'Không có',
      time: new Date().toISOString()
    });
    setShowReceiveModal(false);
    setSelectedBooking(null);
    setSurcharge(0);
    setSurchargeReason('');
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const getPaginatedData = (data) => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return data.slice(start, start + ITEMS_PER_PAGE);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved': return <span className="badge bg-success">Đã duyệt</span>;
      case 'renting': return <span className="badge bg-primary">Đang cho thuê</span>;
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
          <FaUserCheck size={28} />
        </div>
        <div>
          <h2 className="fw-bold mb-1">Giao Diện Nhân Viên (Staff)</h2>
          <p className="text-muted small mb-0">
            Nhân viên: <strong className="text-dark">{user.fullName}</strong> (ID: {user.id})
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="card mb-4">
        <div className="card-header bg-white p-0">
          <ul className="nav nav-tabs border-0 flex-column flex-sm-row">
            <li className="nav-item m-0">
              <button
                className={`nav-link rounded-0 py-3 px-4 fw-bold border-0 d-flex align-items-center gap-2 ${
                  activeTab === 'my-tasks' ? 'active border-bottom border-success text-accent' : 'text-secondary'
                }`}
                onClick={() => {setActiveTab('my-tasks'); setCurrentPage(1);}}
              >
                <FaHandHoldingUsd /> Công Việc Của Tôi
                {myBookings.filter(b => b.status === 'pending' || b.status === 'approved' || b.status === 'renting').length > 0 && (
                  <span className="badge bg-warning text-dark rounded-pill">
                    {myBookings.filter(b => b.status === 'pending' || b.status === 'approved' || b.status === 'renting').length}
                  </span>
                )}
              </button>
            </li>
            <li className="nav-item m-0">
              <button
                className={`nav-link rounded-0 py-3 px-4 fw-bold border-0 d-flex align-items-center gap-2 ${
                  activeTab === 'history' ? 'active border-bottom border-success text-accent' : 'text-secondary'
                }`}
                onClick={() => {setActiveTab('history'); setCurrentPage(1);}}
              >
                <FaHistory /> Lịch Sử Công Việc
              </button>
            </li>
            <li className="nav-item m-0">
              <button
                className={`nav-link rounded-0 py-3 px-4 fw-bold border-0 d-flex align-items-center gap-2 ${
                  activeTab === 'vehicles' ? 'active border-bottom border-success text-accent' : 'text-secondary'
                }`}
                onClick={() => {setActiveTab('vehicles'); setCurrentPage(1);}}
              >
                <FaCar /> Quản Lý Đội Xe
              </button>
            </li>
          </ul>
        </div>
        <div className="card-body p-4">

          {/* TAB 1: CÔNG VIỆC CỦA TÔI */}
          {activeTab === 'my-tasks' && (
            <div>
              {myBookings.length === 0 ? (
                <div className="text-center py-5">
                  <FaHandHoldingUsd className="text-muted fs-1 mb-3" />
                  <h5 className="text-muted">Chưa có công việc nào</h5>
                </div>
              ) : (
                <>
                  <div className="table-responsive">
                    <table className="table align-middle">
                      <thead className="table-light">
                        <tr>
                          <th>Khách hàng</th>
                          <th>Xe thuê</th>
                          <th>Thời gian</th>
                          <th>Tổng tiền</th>
                          <th>Trạng thái</th>
                          <th className="text-center">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getPaginatedData(myBookings).map(b => (
                          <tr key={b.id}>
                            <td>
                              <div className="fw-bold">{b.customerName}</div>
                              <small className="text-muted">SĐT: {b.phone}</small>
                            </td>
                            <td className="fw-bold">{b.vehicleName}</td>
                            <td>{b.duration} {b.unit === 'day' ? 'ngày' : 'giờ'}</td>
                            <td className="text-accent fw-bold">{b.totalPrice.toLocaleString()}đ</td>
                            <td>{getStatusBadge(b.status)}</td>
                            <td className="text-center">
                              {b.status === 'approved' && (
                                <button className="btn btn-sm btn-success d-flex align-items-center gap-1 mx-auto" onClick={() => openDeliver(b)}>
                                  <FaKey /> Giao xe
                                </button>
                              )}
                              {b.status === 'renting' && (
                                <button className="btn btn-sm btn-primary d-flex align-items-center gap-1 mx-auto" onClick={() => openReceive(b)}>
                                  <FaUndoAlt /> Thu hồi
                                </button>
                              )}
                              {(b.status === 'completed' || b.status === 'rejected' || b.status === 'pending') && (
                                <span className="text-muted small">—</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <Pagination itemsPerPage={ITEMS_PER_PAGE} totalItems={myBookings.length} paginate={paginate} currentPage={currentPage} />
                </>
              )}
            </div>
          )}

          {/* TAB 2: LỊCH SỬ CÔNG VIỆC */}
          {activeTab === 'history' && (
            <div>
              <div className="d-flex align-items-end gap-3 mb-4 flex-wrap">
                <div>
                  <label className="form-label fw-bold small mb-1">Xem theo ngày</label>
                  <input type="date" className="form-control form-control-sm" value={historyDate}
                    onChange={e => { setHistoryDate(e.target.value); setCurrentPage(1); }} />
                </div>
                {historyDate && (
                  <button className="btn btn-sm btn-outline-secondary" onClick={() => setHistoryDate('')}>
                    <FaTimes className="me-1" /> Xem tất cả
                  </button>
                )}
              </div>

              <div className="row g-3 mb-4">
                <div className="col-md-3">
                  <div className="card p-3 text-center shadow-sm border-0 bg-light">
                    <h6 className="text-muted mb-1">Tổng đơn</h6>
                    <h3 className="fw-bold text-dark mb-0">{historyStats.total}</h3>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card p-3 text-center shadow-sm border-0 bg-light">
                    <h6 className="text-muted mb-1">Đã giao xe</h6>
                    <h3 className="fw-bold text-primary mb-0">{historyStats.delivered}</h3>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card p-3 text-center shadow-sm border-0 bg-light">
                    <h6 className="text-muted mb-1">Hoàn thành</h6>
                    <h3 className="fw-bold text-success mb-0">{historyStats.completed}</h3>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card p-3 text-center shadow-sm border-0 bg-light">
                    <h6 className="text-muted mb-1">Tổng giá trị</h6>
                    <h3 className="fw-bold text-accent mb-0">{historyStats.totalRevenue.toLocaleString()}đ</h3>
                  </div>
                </div>
              </div>

              {historyBookings.length === 0 ? (
                <div className="text-center py-4">
                  <FaHistory className="text-muted fs-1 mb-3" />
                  <h5 className="text-muted">{historyDate ? 'Không có đơn nào trong ngày này' : 'Chưa có lịch sử công việc'}</h5>
                </div>
              ) : (
                <>
                  <div className="table-responsive">
                    <table className="table align-middle">
                      <thead className="table-light">
                        <tr>
                          <th>Ngày tạo</th>
                          <th>Khách hàng</th>
                          <th>Xe</th>
                          <th>Thời gian thuê</th>
                          <th>Tổng tiền</th>
                          <th>Trạng thái</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getPaginatedData(historyBookings).map(b => (
                          <tr key={b.id}>
                            <td className="small">{b.createdAt ? new Date(b.createdAt).toLocaleDateString('vi-VN') : '—'}</td>
                            <td>
                              <div className="fw-bold">{b.customerName}</div>
                              <small className="text-muted">SĐT: {b.phone}</small>
                            </td>
                            <td className="fw-bold">{b.vehicleName}</td>
                            <td>{b.duration} {b.unit === 'day' ? 'ngày' : 'giờ'}</td>
                            <td className="text-accent fw-bold">{b.totalPrice.toLocaleString()}đ</td>
                            <td>{getStatusBadge(b.status)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <Pagination itemsPerPage={ITEMS_PER_PAGE} totalItems={historyBookings.length} paginate={paginate} currentPage={currentPage} />
                </>
              )}
            </div>
          )}

          {/* TAB 3: QUẢN LÝ ĐỘI XE */}
          {activeTab === 'vehicles' && (
            <div>
              <div className="d-flex align-items-center gap-3 mb-3 flex-wrap">
                <label className="fw-bold mb-0">Lọc:</label>
                <div className="btn-group btn-group-sm">
                  {['All', 'Available', 'Rented'].map(f => (
                    <button key={f}
                      className={`btn ${vehicleFilter === f ? 'btn-accent' : 'btn-outline-secondary'}`}
                      onClick={() => { setVehicleFilter(f); setCurrentPage(1); }}>
                      {f === 'All' ? 'Tất cả' : f === 'Available' ? 'Sẵn sàng' : 'Đang thuê'}
                    </button>
                  ))}
                </div>
                <span className="text-muted small">Tìm thấy {filteredVehicles.length} xe</span>
              </div>
              <div className="table-responsive">
                <table className="table align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Hình ảnh</th>
                      <th>Tên xe</th>
                      <th>Loại / Hãng</th>
                      <th>Giá thuê</th>
                      <th className="text-center">Trạng thái</th>
                      <th className="text-center">Bật/Tắt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getPaginatedData(filteredVehicles).map(v => (
                      <tr key={v.id}>
                        <td><img src={v.image} alt={v.name} style={{ width: '80px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} /></td>
                        <td>
                          <div className="fw-bold">{v.name}</div>
                          <small className="text-muted">{v.transmission} | {v.seats} chỗ</small>
                        </td>
                        <td>
                          <span className="badge bg-light text-dark border me-1">{v.type === 'Car' ? 'Ô tô' : 'Xe máy'}</span>
                          <span className="badge bg-secondary">{v.brand}</span>
                        </td>
                        <td>
                          <div><strong>{v.pricePerHour.toLocaleString()}đ</strong> / giờ</div>
                          <small className="text-muted">{v.pricePerDay.toLocaleString()}đ / ngày</small>
                        </td>
                        <td className="text-center">
                          {v.available ? <span className="badge bg-success">Sẵn sàng</span> : <span className="badge bg-danger">Đang thuê</span>}
                        </td>
                        <td className="text-center">
                          <button className="btn btn-link text-decoration-none p-0 fs-4" onClick={() => toggleAvailable(v)}>
                            {v.available ? <FaToggleOn className="text-success" /> : <FaToggleOff className="text-muted" />}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination itemsPerPage={ITEMS_PER_PAGE} totalItems={filteredVehicles.length} paginate={paginate} currentPage={currentPage} />
            </div>
          )}

        </div>
      </div>

      {/* Modal Giao Xe */}
      {showDeliverModal && selectedBooking && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Giao Xe — {selectedBooking.vehicleName}</h5>
                <button className="btn-close" onClick={() => setShowDeliverModal(false)}></button>
              </div>
              <form onSubmit={submitDeliver}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label fw-bold">Tình trạng xe</label>
                    <textarea className="form-control" rows="2" value={checkoutCondition} onChange={e => setCheckoutCondition(e.target.value)} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold">Nhiên liệu</label>
                    <input type="text" className="form-control" value={checkoutFuel} onChange={e => setCheckoutFuel(e.target.value)} />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setShowDeliverModal(false)}>Hủy</button>
                  <button type="submit" className="btn btn-success"><FaKey className="me-1" /> Xác nhận giao xe</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Thu Hồi Xe */}
      {showReceiveModal && selectedBooking && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Thu Hồi Xe — {selectedBooking.vehicleName}</h5>
                <button className="btn-close" onClick={() => setShowReceiveModal(false)}></button>
              </div>
              <form onSubmit={submitReceive}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label fw-bold">Tình trạng xe khi nhận lại</label>
                    <textarea className="form-control" rows="2" value={checkinCondition} onChange={e => setCheckinCondition(e.target.value)} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold">Nhiên liệu</label>
                    <input type="text" className="form-control" value={checkinFuel} onChange={e => setCheckinFuel(e.target.value)} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold">Phụ thu (nếu có)</label>
                    <input type="number" className="form-control" value={surcharge} onChange={e => setSurcharge(e.target.value)} min="0" />
                  </div>
                  {Number(surcharge) > 0 && (
                    <div className="mb-3">
                      <label className="form-label fw-bold">Lý do phụ thu</label>
                      <input type="text" className="form-control" value={surchargeReason} onChange={e => setSurchargeReason(e.target.value)} placeholder="Trầy xước, hư hỏng..." />
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setShowReceiveModal(false)}>Hủy</button>
                  <button type="submit" className="btn btn-primary"><FaUndoAlt className="me-1" /> Xác nhận thu hồi</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StaffDashboard;