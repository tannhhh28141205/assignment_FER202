import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCarSide, FaSignInAlt, FaUserPlus } from 'react-icons/fa';

function Login({ users, onLogin, onRegister }) {
  const navigate = useNavigate();
  const [isLoginView, setIsLoginView] = useState(true);

  // State đăng nhập
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // State đăng ký
  const [regFullName, setRegFullName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regAddress, setRegAddress] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const matchedUser = users.find(
      (u) => u.username === loginUsername && u.password === loginPassword
    );

    if (matchedUser) {
      onLogin(matchedUser);
      if (matchedUser.role === 'admin') navigate('/admin');
      else if (matchedUser.role === 'staff') navigate('/staff');
      else navigate('/');
    } else {
      setError('Sai tên đăng nhập hoặc mật khẩu!');
    }
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!regFullName || !regUsername || !regPassword) {
      setError('Vui lòng điền đầy đủ các thông tin đăng ký!');
      return;
    }

    // Kiểm tra trùng username
    const exists = users.find((u) => u.username === regUsername);
    if (exists) {
      setError('Tên đăng nhập này đã tồn tại! Vui lòng chọn tên khác.');
      return;
    }

    const newUser = {
      id: Date.now(),
      username: regUsername,
      password: regPassword,
      fullName: regFullName,
      role: 'customer',
      address: regAddress,
    };

    onRegister(newUser);
    setSuccess('Đăng ký tài khoản khách hàng thành công! Bạn có thể đăng nhập ngay.');
    
    // Chuyển về màn hình đăng nhập và điền sẵn username
    setLoginUsername(regUsername);
    setLoginPassword('');
    setIsLoginView(true);

    // Reset form đăng ký
    setRegFullName('');
    setRegUsername('');
    setRegPassword('');
    setRegAddress('');
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="text-center mb-4">
          <FaCarSide className="text-accent" size={48} />
          <h2 className="fw-bold mt-2">
            Drive<span className="text-accent">Share</span>
          </h2>
          <p className="text-muted small">
            {isLoginView ? 'Đăng nhập để tiếp tục' : 'Đăng ký tài khoản khách hàng mới'}
          </p>
        </div>

        {error && <div className="alert alert-danger py-2 small">{error}</div>}
        {success && <div className="alert alert-success py-2 small">{success}</div>}

        {isLoginView ? (
          /* FORM ĐĂNG NHẬP */
          <form onSubmit={handleLoginSubmit}>
            <div className="mb-3">
              <label className="form-label small fw-bold">Tên đăng nhập</label>
              <input
                type="text"
                className="form-control"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                required
                placeholder="admin / staff / khach"
              />
            </div>
            <div className="mb-3">
              <label className="form-label small fw-bold">Mật khẩu</label>
              <input
                type="password"
                className="form-control"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
                placeholder="Mật khẩu"
              />
            </div>
            <button type="submit" className="btn btn-accent w-100 fw-bold mb-3">
              <FaSignInAlt className="me-2" /> Đăng nhập
            </button>
            <div className="text-center">
              <button
                type="button"
                className="btn btn-link btn-sm text-decoration-none text-accent fw-bold"
                onClick={() => {
                  setIsLoginView(false);
                  setError('');
                  setSuccess('');
                }}
              >
                Chưa có tài khoản? Đăng ký ngay
              </button>
            </div>
          </form>
        ) : (
          /* FORM ĐĂNG KÝ */
          <form onSubmit={handleRegisterSubmit}>
            <div className="mb-3">
              <label className="form-label small fw-bold">Họ và tên *</label>
              <input
                type="text"
                className="form-control"
                value={regFullName}
                onChange={(e) => setRegFullName(e.target.value)}
                required
                placeholder="Nguyễn Văn A"
              />
            </div>
            <div className="mb-3">
              <label className="form-label small fw-bold">Tên đăng nhập *</label>
              <input
                type="text"
                className="form-control"
                value={regUsername}
                onChange={(e) => setRegUsername(e.target.value)}
                required
                placeholder="Tên viết liền không dấu (VD: khach3)"
              />
            </div>
            <div className="mb-3">
              <label className="form-label small fw-bold">Mật khẩu *</label>
              <input
                type="password"
                className="form-control"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                required
                placeholder="Mật khẩu bảo mật"
              />
            </div>
            <div className="mb-3">
              <label className="form-label small fw-bold">Địa chỉ</label>
              <input
                type="text"
                className="form-control"
                value={regAddress}
                onChange={(e) => setRegAddress(e.target.value)}
                placeholder="123 Nguyễn Trãi, Hà Nội"
              />
            </div>
            <button type="submit" className="btn btn-accent w-100 fw-bold mb-3">
              <FaUserPlus className="me-2" /> Đăng ký tài khoản
            </button>
            <div className="text-center">
              <button
                type="button"
                className="btn btn-link btn-sm text-decoration-none text-muted"
                onClick={() => {
                  setIsLoginView(true);
                  setError('');
                  setSuccess('');
                }}
              >
                Đã có tài khoản? Quay lại đăng nhập
              </button>
            </div>
          </form>
        )}

        <div className="mt-4 p-3 bg-light rounded text-start">
          <p className="small fw-bold mb-2">Tài khoản mẫu để Test:</p>
          <table className="table table-sm table-borderless mb-0 small">
            <thead>
              <tr className="border-bottom">
                <th>Role</th>
                <th>Username</th>
                <th>Password</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="fw-bold text-accent">Admin</td>
                <td>admin</td>
                <td>admin123</td>
              </tr>
              <tr>
                <td className="fw-bold text-primary">Staff</td>
                <td>staff</td>
                <td>staff123</td>
              </tr>
              <tr>
                <td className="fw-bold text-success">Customer</td>
                <td>khach</td>
                <td>khach123</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Login;
