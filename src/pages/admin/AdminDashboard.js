import React, { useState, useMemo } from "react";
import {
  FaPlus, FaEdit, FaTrash, FaToggleOn, FaToggleOff, FaTimes,
  FaCar, FaUserShield, FaUsers, FaUserPlus, FaCalendarAlt, FaUserClock,
  FaChartLine, FaClipboardList, FaCheck
} from "react-icons/fa";
import Pagination from "../../components/Pagination";

const emptyForm = {
  name: "", type: "Car", brand: "", transmission: "Tự động", seats: 5,
  pricePerHour: "", pricePerDay: "", image: "", available: true, rating: 5.0, fuel: "Xăng"
};
const emptyUserForm = {
  username: "", password: "", fullName: "", role: "staff"
};
const ITEMS_PER_PAGE = 5;

function AdminDashboard({
  vehicles = [], users = [], bookings = [],
  addVehicle, updateVehicle, deleteVehicle, toggleAvailable,
  addUser, updateUser, deleteUser, handleApproveBooking, handleAssignStaff
}) {
  const [activeTab, setActiveTab] = useState("vehicles");
  const [currentPage, setCurrentPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [showUserForm, setShowUserForm] = useState(false);
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [userForm, setUserForm] = useState({ ...emptyUserForm });
  const [scheduleFilter, setScheduleFilter] = useState("All");
  const [revenueFrom, setRevenueFrom] = useState("");
  const [revenueTo, setRevenueTo] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };
  const handleUserChange = (e) => {
    const { name, value } = e.target;
    setUserForm(prev => ({ ...prev, [name]: value }));
  };
  const resetForm = () => {
    setForm({ ...emptyForm }); setIsEditing(false); setEditingId(null); setShowForm(false);
  };
  const resetUserForm = () => {
    setUserForm({ ...emptyUserForm }); setIsEditingUser(false); setEditingUserId(null); setShowUserForm(false);
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.brand || !form.pricePerHour || !form.pricePerDay) {
      alert("Vui lòng điền đầy đủ thông tin!"); return;
    }
    const vehicleData = {
      ...form, pricePerHour: Number(form.pricePerHour), pricePerDay: Number(form.pricePerDay),
      seats: Number(form.seats), rating: Number(form.rating),
      image: form.image || "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=600"
    };
    if (isEditing) updateVehicle(editingId, vehicleData);
    else addVehicle(vehicleData);
    resetForm();
  };
  const handleUserSubmit = (e) => {
    e.preventDefault();
    if (!userForm.username || !userForm.password || !userForm.fullName) {
      alert("Vui lòng điền đầy đủ thông tin!"); return;
    }
    const userData = { ...userForm };
    if (isEditingUser) {
      updateUser(editingUserId, userData); resetUserForm();
    } else {
      const exists = users.find(u => u.username.toLowerCase() === userForm.username.toLowerCase());
      if (exists) { alert("Tên đăng nhập này đã tồn tại!"); return; }
      addUser({ ...userData, id: String(Date.now()) }); resetUserForm();
    }
  };
  const startEdit = (vehicle) => {
    setForm({ ...vehicle }); setIsEditing(true); setEditingId(vehicle.id); setShowForm(true);
  };
  const startEditUser = (u) => {
    setUserForm({ ...u }); setIsEditingUser(true); setEditingUserId(u.id); setShowUserForm(true);
  };
  const handleDelete = (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa xe này?")) deleteVehicle(id);
  };
  const handleUserDelete = (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa tài khoản này?")) deleteUser(id);
  };
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const getPaginatedData = (data) => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return data.slice(start, start + ITEMS_PER_PAGE);
  };
  const staffUsers = users.filter(u => u.role === "staff" || u.role === "admin");
  const onlyStaff = users.filter(u => u.role === "staff");
  const assignedBookings = bookings.filter(b => b.assignedStaffId);
  const filteredSchedule = scheduleFilter === "All" ? assignedBookings : assignedBookings.filter(b => b.assignedStaffId === scheduleFilter);
  const revenueBookings = useMemo(() => {
    return bookings.filter(b => {
      if (b.status !== "approved" && b.status !== "renting" && b.status !== "completed") return false;
      if (!b.createdAt) return true;
      const date = new Date(b.createdAt);
      if (revenueFrom && date < new Date(revenueFrom)) return false;
      if (revenueTo && date > new Date(revenueTo + "T23:59:59")) return false;
      return true;
    });
  }, [bookings, revenueFrom, revenueTo]);
  const totalRevenue = revenueBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
  const revenueByStaff = useMemo(() => {
    const map = {};
    revenueBookings.forEach(b => {
      if (!b.assignedStaffId) return;
      if (!map[b.assignedStaffId]) map[b.assignedStaffId] = { name: b.assignedStaffName || "N/A", count: 0, revenue: 0 };
      map[b.assignedStaffId].count += 1;
      map[b.assignedStaffId].revenue += b.totalPrice || 0;
    });
    return Object.entries(map).sort((a, b) => b[1].revenue - a[1].revenue);
  }, [revenueBookings]);
  const getStatusBadge = (status) => {
    switch (status) {
      case "approved": return <span className="badge bg-success">Đã duyệt</span>;
      case "renting": return <span className="badge bg-primary">Đang cho thuê</span>;
      case "completed": return <span className="badge bg-secondary">Hoàn thành</span>;
      case "rejected": return <span className="badge bg-danger">Đã hủy</span>;
      default: return <span className="badge bg-warning text-dark">Chờ duyệt</span>;
    }
  };
  const handleStaffAssignChange = (bookingId, staffId) => {
    const staff = onlyStaff.find(s => s.id == staffId);
    if (!staff) handleAssignStaff(bookingId, "", "");
    else handleAssignStaff(bookingId, staff.id, staff.fullName);
  };
  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div className="d-flex align-items-center gap-2">
          <FaUserShield className="text-accent fs-3" />
          <div>
            <h2 className="fw-bold mb-1">Giao Diện Quản Trị Viên (Admin)</h2>
            <p className="text-muted small mb-0">Quản lý đội xe, nhân sự, đơn đặt xe & thống kê doanh thu</p>
          </div>
        </div>
        {activeTab === "vehicles" && !showForm && (
          <button className="btn btn-accent d-flex align-items-center gap-2" onClick={() => { resetForm(); setShowForm(true); }}><FaPlus /> Thêm xe mới</button>
        )}
        {activeTab === "users" && !showUserForm && (
          <button className="btn btn-accent d-flex align-items-center gap-2" onClick={() => { resetUserForm(); setShowUserForm(true); }}><FaUserPlus /> Thêm nhân viên</button>
        )}
      </div>
      <div className="row g-4 mb-4">
        <div className="col-md-3">
          <div className="card p-3 d-flex flex-row align-items-center justify-content-between shadow-sm">
            <div><h6 className="text-muted mb-1">Tổng Đội Xe</h6><h3 className="fw-bold text-dark mb-0">{vehicles.length} xe</h3></div>
            <FaCar className="text-dark fs-1 opacity-50" />
          </div>
        </div>
        <div className="col-md-3">
          <div className="card p-3 d-flex flex-row align-items-center justify-content-between shadow-sm">
            <div><h6 className="text-muted mb-1">Nhân Viên</h6><h3 className="fw-bold text-success mb-0">{staffUsers.length}</h3></div>
            <FaUsers className="text-success fs-1 opacity-50" />
          </div>
        </div>
        <div className="col-md-3">
          <div className="card p-3 d-flex flex-row align-items-center justify-content-between shadow-sm">
            <div><h6 className="text-muted mb-1">Chờ Duyệt</h6><h3 className="fw-bold text-danger mb-0">{bookings.filter(b => b.status === "pending").length} đơn</h3></div>
            <FaClipboardList className="text-danger fs-1 opacity-50" />
          </div>
        </div>
        <div className="col-md-3">
          <div className="card p-3 d-flex flex-row align-items-center justify-content-between shadow-sm">
            <div><h6 className="text-muted mb-1">Tổng Doanh Thu</h6><h3 className="fw-bold text-accent mb-0">{totalRevenue.toLocaleString()}đ</h3></div>
            <FaChartLine className="text-accent fs-1 opacity-50" />
          </div>
        </div>
      </div>
      <div className="card mb-4">
        <div className="card-header bg-white p-0">
          <ul className="nav nav-tabs border-0 flex-column flex-sm-row">
            <li className="nav-item m-0">
              <button className={`nav-link rounded-0 py-3 px-4 fw-bold border-0 ${activeTab === "vehicles" ? "active border-bottom border-success text-accent" : "text-secondary"}`}
                onClick={() => { setActiveTab("vehicles"); setCurrentPage(1); resetForm(); resetUserForm(); }}><FaCar className="me-2" /> Quản Lý Đội Xe</button>
            </li>
            <li className="nav-item m-0">
              <button className={`nav-link rounded-0 py-3 px-4 fw-bold border-0 ${activeTab === "bookings" ? "active border-bottom border-success text-accent" : "text-secondary"}`}
                onClick={() => { setActiveTab("bookings"); setCurrentPage(1); resetForm(); resetUserForm(); }}><FaClipboardList className="me-2" /> Phê Duyệt Đơn
                {bookings.filter(b => b.status === "pending").length > 0 && (
                  <span className="badge bg-danger ms-1">{bookings.filter(b => b.status === "pending").length}</span>
                )}</button>
            </li>
            <li className="nav-item m-0">
              <button className={`nav-link rounded-0 py-3 px-4 fw-bold border-0 ${activeTab === "users" ? "active border-bottom border-success text-accent" : "text-secondary"}`}
                onClick={() => { setActiveTab("users"); setCurrentPage(1); resetForm(); resetUserForm(); }}><FaUsers className="me-2" /> Quản Lý Nhân Viên</button>
            </li>
            <li className="nav-item m-0">
              <button className={`nav-link rounded-0 py-3 px-4 fw-bold border-0 ${activeTab === "schedule" ? "active border-bottom border-success text-accent" : "text-secondary"}`}
                onClick={() => { setActiveTab("schedule"); setCurrentPage(1); resetForm(); resetUserForm(); }}><FaCalendarAlt className="me-2" /> Lịch Trình Nhân Viên</button>
            </li>
            <li className="nav-item m-0">
              <button className={`nav-link rounded-0 py-3 px-4 fw-bold border-0 ${activeTab === "revenue" ? "active border-bottom border-success text-accent" : "text-secondary"}`}
                onClick={() => { setActiveTab("revenue"); setCurrentPage(1); resetForm(); resetUserForm(); }}><FaChartLine className="me-2" /> Thống Kê Doanh Thu</button>
            </li>
          </ul>
        </div>
        <div className="card-body p-4">
          {activeTab === "vehicles" && (
            <div>
              {showForm && (
                <div className="card p-4 mb-4 ds-admin-form">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="fw-bold mb-0">{isEditing ? "Sửa Thông Tin Xe" : "Thêm Xe Mới"}</h5>
                    <button className="btn btn-sm btn-outline-secondary" onClick={resetForm}><FaTimes /></button>
                  </div>
                  <form onSubmit={handleSubmit}>
                    <div className="row g-3">
                      <div className="col-md-6"><label className="form-label fw-bold">Tên xe *</label><input type="text" className="form-control" name="name" value={form.name} onChange={handleChange} required /></div>
                      <div className="col-md-3"><label className="form-label fw-bold">Loại xe</label><select className="form-select" name="type" value={form.type} onChange={handleChange}><option value="Car">Ô tô</option><option value="Motorbike">Xe máy</option></select></div>
                      <div className="col-md-3"><label className="form-label fw-bold">Hãng *</label><input type="text" className="form-control" name="brand" value={form.brand} onChange={handleChange} required /></div>
                      <div className="col-md-4"><label className="form-label fw-bold">Hộp số</label><select className="form-select" name="transmission" value={form.transmission} onChange={handleChange}><option value="Tự động">Tự động</option><option value="Số sàn">Số sàn</option><option value="Tự động (Điện)">Tự động (Điện)</option><option value="Tay ga">Tay ga</option><option value="Côn tay">Côn tay</option></select></div>
                      <div className="col-md-2"><label className="form-label fw-bold">Số chỗ</label><input type="number" className="form-control" name="seats" value={form.seats} onChange={handleChange} min="1" /></div>
                      <div className="col-md-3"><label className="form-label fw-bold">Giá/giờ (đ) *</label><input type="number" className="form-control" name="pricePerHour" value={form.pricePerHour} onChange={handleChange} required min="0" /></div>
                      <div className="col-md-3"><label className="form-label fw-bold">Giá/ngày (đ) *</label><input type="number" className="form-control" name="pricePerDay" value={form.pricePerDay} onChange={handleChange} required min="0" /></div>
                      <div className="col-md-4"><label className="form-label fw-bold">Nhiên liệu</label><input type="text" className="form-control" name="fuel" value={form.fuel} onChange={handleChange} /></div>
                      <div className="col-md-2"><label className="form-label fw-bold">Đánh giá</label><input type="number" className="form-control" name="rating" value={form.rating} onChange={handleChange} min="0" max="5" step="0.1" /></div>
                      <div className="col-md-6"><label className="form-label fw-bold">Link hình ảnh</label><input type="text" className="form-control" name="image" value={form.image} onChange={handleChange} placeholder="https://..." /></div>
                    </div>
                    <div className="mt-3"><button type="submit" className="btn btn-accent me-2"><FaPlus className="me-1" /> {isEditing ? "Cập Nhật" : "Thêm Mới"}</button><button type="button" className="btn btn-outline-secondary" onClick={resetForm}>Hủy</button></div>
                  </form>
                </div>
              )}
              <div className="table-responsive">
                <table className="table align-middle">
                  <thead className="table-light"><tr><th>Hình ảnh</th><th>Tên xe</th><th>Loại / Hãng</th><th>Giá thuê</th><th className="text-center">Sẵn sàng</th><th className="text-center">Thao tác</th></tr></thead>
                  <tbody>
                    {getPaginatedData(vehicles).map(v => (
                      <tr key={v.id}>
                        <td><img src={v.image} alt={v.name} style={{ width: "80px", height: "50px", objectFit: "cover", borderRadius: "4px" }} /></td>
                        <td><div className="fw-bold">{v.name}</div><small className="text-muted">{v.transmission} | {v.seats} chỗ</small></td>
                        <td><span className="badge bg-light text-dark border me-1">{v.type === "Car" ? "Ô tô" : "Xe máy"}</span><span className="badge bg-secondary">{v.brand}</span></td>
                        <td><div><strong>{v.pricePerHour.toLocaleString()}đ</strong> / giờ</div><small className="text-muted">{v.pricePerDay.toLocaleString()}đ / ngày</small></td>
                        <td className="text-center"><button className="btn btn-link text-decoration-none p-0 fs-4" onClick={() => toggleAvailable(v)}>{v.available ? <FaToggleOn className="text-success" /> : <FaToggleOff className="text-muted" />}</button></td>
                        <td className="text-center"><button className="btn btn-sm btn-outline-primary me-2" onClick={() => startEdit(v)}><FaEdit /></button><button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(v.id)}><FaTrash /></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination itemsPerPage={ITEMS_PER_PAGE} totalItems={vehicles.length} paginate={paginate} currentPage={currentPage} />
            </div>
          )}
          {activeTab === "bookings" && (
            <div>
              {bookings.length === 0 ? (
                <div className="text-center py-5"><FaClipboardList className="text-muted fs-1 mb-3" /><h5 className="text-muted">Chưa có đơn đặt xe nào</h5></div>
              ) : (
                <>
                  <div className="table-responsive">
                    <table className="table align-middle">
                      <thead className="table-light"><tr><th>Khách hàng</th><th>Xe thuê</th><th>Tổng tiền</th><th>Phân công</th><th>Trạng thái</th><th className="text-center">Duyệt đơn</th></tr></thead>
                      <tbody>
                        {getPaginatedData(bookings).map(b => (
                          <tr key={b.id}>
                            <td><div className="fw-bold">{b.customerName}</div><small className="text-muted d-block">SĐT: {b.phone}</small>{b.address && <small className="text-muted d-block text-truncate" style={{ maxWidth: "200px" }}>ĐC: {b.address}</small>}</td>
                            <td><div className="fw-bold">{b.vehicleName}</div><small className="text-muted">{b.duration} {b.unit === "day" ? "ngày" : "giờ"}</small></td>
                            <td className="text-accent fw-bold">{b.totalPrice.toLocaleString()}đ</td>
                            <td>
                              <select className="form-select form-select-sm" value={b.assignedStaffId || ""} onChange={(e) => handleStaffAssignChange(b.id, e.target.value)} disabled={b.status === "rejected" || b.status === "completed"}>
                                <option value="">-- Chọn nhân viên --</option>
                                {onlyStaff.map(s => (<option key={s.id} value={s.id}>{s.fullName}</option>))}
                              </select>
                            </td>
                            <td>{getStatusBadge(b.status)}</td>
                            <td className="text-center">
                              {b.status === "pending" ? (
                                <div className="d-flex justify-content-center gap-1">
                                  <button className="btn btn-sm btn-success d-flex align-items-center gap-1" onClick={() => handleApproveBooking(b.id, "approved")}><FaCheck /> Duyệt</button>
                                  <button className="btn btn-sm btn-danger d-flex align-items-center gap-1" onClick={() => handleApproveBooking(b.id, "rejected")}><FaTimes /> Hủy</button>
                                </div>
                              ) : (<span className="text-muted small">Đã xử lý</span>)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <Pagination itemsPerPage={ITEMS_PER_PAGE} totalItems={bookings.length} paginate={paginate} currentPage={currentPage} />
                </>
              )}
            </div>
          )}
          {activeTab === "users" && (
            <div>
              {showUserForm && (
                <div className="card p-4 mb-4 ds-admin-form">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="fw-bold mb-0">{isEditingUser ? "Sửa Nhân Viên" : "Thêm Nhân Viên Mới"}</h5>
                    <button className="btn btn-sm btn-outline-secondary" onClick={resetUserForm}><FaTimes /></button>
                  </div>
                  <form onSubmit={handleUserSubmit}>
                    <div className="row g-3">
                      <div className="col-md-6"><label className="form-label fw-bold">Họ tên</label><input type="text" className="form-control" name="fullName" value={userForm.fullName} onChange={handleUserChange} required /></div>
                      <div className="col-md-6"><label className="form-label fw-bold">Tên đăng nhập</label><input type="text" className="form-control" name="username" value={userForm.username} onChange={handleUserChange} required /></div>
                      <div className="col-md-6"><label className="form-label fw-bold">Mật khẩu</label><input type="text" className="form-control" name="password" value={userForm.password} onChange={handleUserChange} required /></div>
                      <div className="col-md-6"><label className="form-label fw-bold">Vai trò</label><select className="form-select" name="role" value={userForm.role} onChange={handleUserChange}><option value="staff">Nhân viên (Staff)</option><option value="admin">Quản trị (Admin)</option></select></div>
                    </div>
                    <div className="mt-3"><button type="submit" className="btn btn-accent me-2"><FaPlus className="me-1" /> {isEditingUser ? "Cập Nhật" : "Thêm Mới"}</button><button type="button" className="btn btn-outline-secondary" onClick={resetUserForm}>Hủy</button></div>
                  </form>
                </div>
              )}
              <div className="table-responsive">
                <table className="table align-middle">
                  <thead className="table-light"><tr><th>Họ tên</th><th>Tên đăng nhập</th><th>Mật khẩu</th><th>Vai trò</th><th className="text-center">Thao tác</th></tr></thead>
                  <tbody>
                    {getPaginatedData(staffUsers).map(u => (
                      <tr key={u.id}>
                        <td className="fw-bold">{u.fullName}</td>
                        <td><code>{u.username}</code></td>
                        <td><code>{u.password}</code></td>
                        <td><span className={`badge ${u.role === "admin" ? "bg-danger" : "bg-primary"}`}>{u.role === "admin" ? "Admin" : "Staff"}</span></td>
                        <td className="text-center"><button className="btn btn-sm btn-outline-primary me-2" onClick={() => startEditUser(u)}><FaEdit /></button><button className="btn btn-sm btn-outline-danger" onClick={() => handleUserDelete(u.id)}><FaTrash /></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination itemsPerPage={ITEMS_PER_PAGE} totalItems={staffUsers.length} paginate={paginate} currentPage={currentPage} />
            </div>
          )}
          {activeTab === "schedule" && (
            <div>
              <div className="d-flex align-items-center gap-3 mb-3 flex-wrap">
                <label className="fw-bold mb-0">Lọc theo nhân viên:</label>
                <select className="form-select form-select-sm" style={{ maxWidth: "250px" }} value={scheduleFilter} onChange={e => { setScheduleFilter(e.target.value); setCurrentPage(1); }}>
                  <option value="All">Tất cả nhân viên</option>
                  {staffUsers.filter(u => u.role === "staff").map(u => (<option key={u.id} value={u.id}>{u.fullName} (ID: {u.id})</option>))}
                </select>
              </div>
              {filteredSchedule.length === 0 ? (
                <div className="text-center py-5"><FaCalendarAlt className="text-muted fs-1 mb-3" /><h5 className="text-muted">Chưa có lịch trình nào</h5></div>
              ) : (
                <>
                  <div className="table-responsive">
                    <table className="table align-middle">
                      <thead className="table-light"><tr><th>Nhân viên</th><th>Khách hàng</th><th>Xe</th><th>Thời gian</th><th>Tổng tiền</th><th>Trạng thái</th></tr></thead>
                      <tbody>
                        {getPaginatedData(filteredSchedule).map(b => (
                          <tr key={b.id}>
                            <td><div className="fw-bold">{b.assignedStaffName}</div><small className="text-muted">ID: {b.assignedStaffId}</small></td>
                            <td><div className="fw-bold">{b.customerName}</div><small className="text-muted">SĐT: {b.phone}</small></td>
                            <td className="fw-bold">{b.vehicleName}</td>
                            <td>{b.duration} {b.unit === "day" ? "ngày" : "giờ"}</td>
                            <td className="text-accent fw-bold">{b.totalPrice.toLocaleString()}đ</td>
                            <td>{getStatusBadge(b.status)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <Pagination itemsPerPage={ITEMS_PER_PAGE} totalItems={filteredSchedule.length} paginate={paginate} currentPage={currentPage} />
                </>
              )}
            </div>
          )}
          {activeTab === "revenue" && (
            <div>
              <div className="d-flex align-items-end gap-3 mb-4 flex-wrap">
                <div><label className="form-label fw-bold small mb-1">Từ ngày</label><input type="date" className="form-control form-control-sm" value={revenueFrom} onChange={e => { setRevenueFrom(e.target.value); setCurrentPage(1); }} /></div>
                <div><label className="form-label fw-bold small mb-1">Đến ngày</label><input type="date" className="form-control form-control-sm" value={revenueTo} onChange={e => { setRevenueTo(e.target.value); setCurrentPage(1); }} /></div>
                {(revenueFrom || revenueTo) && (<button className="btn btn-sm btn-outline-secondary" onClick={() => { setRevenueFrom(""); setRevenueTo(""); }}><FaTimes className="me-1" /> Xóa bộ lọc</button>)}
              </div>
              <div className="row g-4 mb-4">
                <div className="col-md-4"><div className="card p-3 text-center shadow-sm border-0 bg-light"><h6 className="text-muted mb-1">Tổng Doanh Thu {revenueFrom || revenueTo ? "(lọc)" : ""}</h6><h2 className="fw-bold text-accent mb-0">{totalRevenue.toLocaleString()}đ</h2></div></div>
                <div className="col-md-4"><div className="card p-3 text-center shadow-sm border-0 bg-light"><h6 className="text-muted mb-1">Số Đơn Hợp Lệ</h6><h2 className="fw-bold text-primary mb-0">{revenueBookings.length} đơn</h2></div></div>
                <div className="col-md-4"><div className="card p-3 text-center shadow-sm border-0 bg-light"><h6 className="text-muted mb-1">Trung Bình / Đơn</h6><h2 className="fw-bold text-success mb-0">{revenueBookings.length > 0 ? Math.round(totalRevenue / revenueBookings.length).toLocaleString() : 0}đ</h2></div></div>
              </div>
              {revenueByStaff.length > 0 && (
                <div className="mb-4">
                  <h6 className="fw-bold mb-3">Doanh Thu Theo Nhân Viên</h6>
                  <div className="table-responsive">
                    <table className="table align-middle">
                      <thead className="table-light"><tr><th>Nhân viên</th><th className="text-center">Số đơn</th><th className="text-end">Doanh thu</th></tr></thead>
                      <tbody>
                        {revenueByStaff.map(([id, data]) => (
                          <tr key={id}><td className="fw-bold">{data.name} <small className="text-muted">(ID: {id})</small></td><td className="text-center">{data.count}</td><td className="text-end text-accent fw-bold">{data.revenue.toLocaleString()}đ</td></tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              <h6 className="fw-bold mb-3">Chi Tiết Đơn Hàng</h6>
              {revenueBookings.length === 0 ? (
                <div className="text-center py-4"><FaChartLine className="text-muted fs-1 mb-3" /><h5 className="text-muted">Không có đơn nào trong khoảng thời gian này</h5></div>
              ) : (
                <>
                  <div className="table-responsive">
                    <table className="table align-middle">
                      <thead className="table-light"><tr><th>Ngày tạo</th><th>Khách hàng</th><th>Xe</th><th>Thời gian</th><th>Nhân viên</th><th>Tổng tiền</th><th>Trạng thái</th></tr></thead>
                      <tbody>
                        {getPaginatedData(revenueBookings).map(b => (
                          <tr key={b.id}>
                            <td className="small">{b.createdAt ? new Date(b.createdAt).toLocaleDateString("vi-VN") : "—"}</td>
                            <td><div className="fw-bold">{b.customerName}</div><small className="text-muted">{b.phone}</small></td>
                            <td>{b.vehicleName}</td>
                            <td>{b.duration} {b.unit === "day" ? "ngày" : "giờ"}</td>
                            <td>{b.assignedStaffName || <span className="text-muted">—</span>}</td>
                            <td className="text-accent fw-bold">{b.totalPrice.toLocaleString()}đ</td>
                            <td>{getStatusBadge(b.status)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <Pagination itemsPerPage={ITEMS_PER_PAGE} totalItems={revenueBookings.length} paginate={paginate} currentPage={currentPage} />
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
export default AdminDashboard;

