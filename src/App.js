import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/customer/Home';
import Detail from './pages/customer/Detail';
import Cart from './pages/customer/Cart';
import StaffDashboard from './pages/staff/StaffDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import Login from './pages/Login';
import Profile from './pages/customer/Profile';

const API_URL = 'http://localhost:9999';

function App() {
  const [vehicles, setVehicles] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('ds_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  // Tải danh sách xe từ server
  const fetchVehicles = () => {
    fetch(`${API_URL}/vehicles`)
      .then(res => res.json())
      .then(data => setVehicles(data))
      .catch(err => console.error('Lỗi tải xe:', err));
  };

  // Tải danh sách đơn đặt xe từ server
  const fetchBookings = () => {
    fetch(`${API_URL}/bookings`)
      .then(res => res.json())
      .then(data => setBookings(data))
      .catch(err => console.error('Lỗi tải đơn đặt:', err));
  };

  // Tải danh sách người dùng từ server
  const fetchUsers = () => {
    fetch(`${API_URL}/users`)
      .then(res => res.json())
      .then(data => setUsers(data))
      .catch(err => console.error('Lỗi tải users:', err));
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchVehicles(), fetchBookings(), fetchUsers()]).finally(() => {
      setLoading(false);
    });


  }, []);

  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser);
    localStorage.setItem('ds_user', JSON.stringify(loggedInUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('ds_user');
    window.location.href = '/login';
  };

  // Đăng ký lưu trực tiếp xuống file db.json qua API POST
  const handleRegister = (newUser) => {
    return fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser),
    })
      .then(res => res.json())
      .then(() => fetchUsers());
  };

  const addUser = (newUser) => {
    return fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser),
    })
      .then(res => res.json())
      .then(() => fetchUsers());
  };

  const updateUser = (id, updatedUser) => {
    return fetch(`${API_URL}/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedUser),
    })
      .then(res => res.json())
      .then(() => fetchUsers());
  };

  const deleteUser = (id) => {
    return fetch(`${API_URL}/users/${id}`, {
      method: 'DELETE',
    }).then(() => fetchUsers());
  };

  const addToCart = (bookingItem) => {
    setCart(prev => [...prev, bookingItem]);
  };

  const removeFromCart = (index) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  const clearCart = () => {
    setCart([]);
  };

  const addVehicle = (vehicle) => {
    return fetch(`${API_URL}/vehicles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(vehicle),
    })
      .then(res => res.json())
      .then(() => fetchVehicles());
  };

  const updateVehicle = (id, updatedVehicle) => {
    return fetch(`${API_URL}/vehicles/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedVehicle),
    })
      .then(res => res.json())
      .then(() => fetchVehicles());
  };

  const deleteVehicle = (id) => {
    return fetch(`${API_URL}/vehicles/${id}`, {
      method: 'DELETE',
    }).then(() => fetchVehicles());
  };

  const toggleAvailable = (vehicle) => {
    return updateVehicle(vehicle.id, {
      ...vehicle,
      available: !vehicle.available,
    });
  };

  // Thêm đơn hàng mới lưu trực tiếp vào db.json qua API POST
  const addBooking = (newBooking) => {
    return fetch(`${API_URL}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newBooking),
    })
      .then(res => res.json())
      .then(() => fetchBookings());
  };

  // Phê duyệt cập nhật trạng thái đơn
  const handleApproveBooking = (bookingId, status) => {
    const booking = bookings.find(b => b.id == bookingId);
    if (!booking) return;
    
    const bookingPromise = fetch(`${API_URL}/bookings/${bookingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...booking, status }),
    });

    let vehiclePromise = Promise.resolve();
    const vehicle = vehicles.find(v => v.id == booking.vehicleId);
    if (vehicle) {
      const isAvailable = status === "rejected" ? true : false;
      vehiclePromise = fetch(`${API_URL}/vehicles/${booking.vehicleId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...vehicle, available: isAvailable }),
      });
    }

    return Promise.all([bookingPromise, vehiclePromise]).then(() => {
      fetchBookings();
      fetchVehicles();
    });
  };

  // Gán việc cho Staff
  const handleAssignStaff = (bookingId, staffId, staffName) => {
    const booking = bookings.find(b => b.id == bookingId);
    if (!booking) return;

    return fetch(`${API_URL}/bookings/${bookingId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...booking, assignedStaffId: staffId, assignedStaffName: staffName }),
    })
      .then(res => res.json())
      .then(() => fetchBookings());
  };

  // Bàn giao xe (Check-out)
  const handleDeliverVehicle = (bookingId, vehicleId, checkOutDetails) => {
    const booking = bookings.find(b => b.id == bookingId);
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (!booking || !vehicle) return;

    const bookingPromise = fetch(`${API_URL}/bookings/${bookingId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...booking, status: 'renting', checkOutDetails }),
    });

    const vehiclePromise = fetch(`${API_URL}/vehicles/${vehicleId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...vehicle, available: false }),
    });

    return Promise.all([bookingPromise, vehiclePromise]).then(() => {
      fetchBookings();
      fetchVehicles();
    });
  };

  // Thu hồi xe (Check-in)
  const handleReceiveVehicle = (bookingId, vehicleId, checkInDetails) => {
    const booking = bookings.find(b => b.id == bookingId);
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (!booking || !vehicle) return;

    const bookingPromise = fetch(`${API_URL}/bookings/${bookingId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...booking, status: 'completed', checkInDetails }),
    });

    const vehiclePromise = fetch(`${API_URL}/vehicles/${vehicleId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...vehicle, available: true }),
    });

    return Promise.all([bookingPromise, vehiclePromise]).then(() => {
      fetchBookings();
      fetchVehicles();
    });
  };

  return (
    <div className="app-wrapper">
      <Navbar cartCount={cart.length} user={user} onLogout={handleLogout} />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home vehicles={vehicles} loading={loading} />} />
          <Route path="/detail/:id" element={<Detail vehicles={vehicles} addToCart={addToCart} />} />
          <Route path="/cart" element={
            <Cart
              cart={cart}
              removeFromCart={removeFromCart}
              clearCart={clearCart}
              user={user}
              addBooking={addBooking}
            />
          } />
          <Route path="/login" element={
            <Login
              users={users}
              onLogin={handleLogin}
              onRegister={handleRegister}
            />
          } />
          
          {/* Profile Route */}
          <Route
            path="/profile"
            element={
              user && user.role === 'customer' ? (
                <Profile
                  user={user}
                  bookings={bookings}
                  updateUser={updateUser}
                  onUserUpdated={(updatedUser) => setUser(updatedUser)}
                />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          
          {/* Admin Route */}
          <Route
            path="/admin"
            element={
              user && user.role === 'admin' ? (
                <AdminDashboard
                  vehicles={vehicles}
                  users={users}
                  bookings={bookings}
                  addVehicle={addVehicle}
                  updateVehicle={updateVehicle}
                  deleteVehicle={deleteVehicle}
                  toggleAvailable={toggleAvailable}
                  addUser={addUser}
                  updateUser={updateUser}
                  deleteUser={deleteUser}
                  handleApproveBooking={handleApproveBooking}
                  handleAssignStaff={handleAssignStaff}
                />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* Staff Route */}
          <Route
            path="/staff"
            element={
              user && user.role === 'staff' ? (
                <StaffDashboard
                  vehicles={vehicles}
                  bookings={bookings}
                  toggleAvailable={toggleAvailable}
                  handleAssignStaff={handleAssignStaff}
                  handleDeliverVehicle={handleDeliverVehicle}
                  handleReceiveVehicle={handleReceiveVehicle}
                  user={user}
                />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;