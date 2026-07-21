import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTrash, FaCheckCircle, FaShoppingCart, FaInfoCircle, FaCreditCard, FaQrcode, FaTimesCircle, FaHandHoldingUsd } from 'react-icons/fa';

function Cart({ cart, removeFromCart, clearCart, user, addBooking }) {
  const navigate = useNavigate();
  
  const [customerInfo, setCustomerInfo] = useState({
    fullName: user ? user.fullName : '',
    phone: '',
    address: user ? (user.address || '') : '',
  });

  const [paymentMethod, setPaymentMethod] = useState('cod'); 
  const [showVNPayGateway, setShowVNPayGateway] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const grandTotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCustomerInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckoutSubmit = (e) => {
    e.preventDefault();
    if (cart.length === 0) {
      alert('Giỏ hàng của bạn đang trống!');
      return;
    }

    if (paymentMethod === 'vnpay') {
      setShowVNPayGateway(true);
    } else {
      saveOrder('Thanh toán khi nhận xe (COD)');
    }
  };

  const saveOrder = (paymentDetails) => {
    cart.forEach(item => {
      addBooking({
        vehicleId: item.vehicleId,
        vehicleName: item.vehicleName,
        customerName: customerInfo.fullName,
        phone: customerInfo.phone,
        address: customerInfo.address,
        unit: item.unit,
        duration: item.duration,
        totalPrice: item.totalPrice,
        status: 'pending',
        paymentMethod: paymentMethod === 'vnpay' ? 'VNPay' : 'COD',
        paymentDetails: paymentDetails,
        createdAt: new Date().toISOString(),
      });
    });
    setSubmitted(true);
  };

  const handleNewBooking = () => {
    clearCart();
    setSubmitted(false);
    setShowVNPayGateway(false);
    setCustomerInfo({ fullName: user ? user.fullName : '', phone: '', address: user ? (user.address || '') : '' });
    navigate('/');
  };

  const handleVNPaySuccess = () => {
    saveOrder('Đã thanh toán qua cổng VNPay giả lập (GD: ' + Math.floor(Math.random() * 10000000) + ')');
  };

  const handleVNPayCancel = () => {
    setShowVNPayGateway(false);
    alert('Bạn đã hủy giao dịch thanh toán qua VNPay. Vui lòng thử lại hoặc chọn phương thức khác.');
  };

  if (showVNPayGateway && !submitted) {
    return (
      <div className="container py-5">
        <div className="card mx-auto shadow-lg border-0" style={{ maxWidth: '600px', borderRadius: '1.5rem' }}>
          <div className="text-white text-center py-4" style={{ background: '#005baa', borderRadius: '1.5rem 1.5rem 0 0' }}>
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/d/d0/Logo-vnpay.png" 
              alt="VNPay Logo" 
              style={{ height: '40px', backgroundColor: '#fff', padding: '4px', borderRadius: '6px' }} 
            />
            <h4 className="fw-bold mt-3 mb-0">CỔNG THANH TOÁN VNPAY (GIẢ LẬP)</h4>
          </div>
          
          <div className="card-body p-4 text-center">
            <p className="text-muted mb-3">Vui lòng quét mã QR dưới đây hoặc bấm xác nhận để hoàn tất giao dịch.</p>
            
            <div className="bg-light p-3 rounded-3 mb-4 d-inline-block border">
              <FaQrcode size={180} className="text-dark" />
              <p className="small text-muted mt-2 mb-0">Mã QR Thanh Toán DriveShare</p>
            </div>

            <div className="bg-light p-3 rounded-3 mb-4 text-start">
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Nhà cung cấp dịch vụ:</span>
                <strong className="text-dark">Nền tảng DriveShare Việt Nam</strong>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Khách hàng đặt xe:</span>
                <strong className="text-dark">{customerInfo.fullName}</strong>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Số điện thoại:</span>
                <strong className="text-dark">{customerInfo.phone}</strong>
              </div>
              <hr className="my-2" />
              <div className="d-flex justify-content-between">
                <span className="fw-bold text-dark fs-5">Số tiền cần quét:</span>
                <strong className="text-danger fs-4">{grandTotal.toLocaleString()}đ</strong>
              </div>
            </div>

            <div className="d-grid gap-2">
              <button type="button" className="btn btn-success btn-lg fw-bold d-flex align-items-center justify-content-center gap-2" onClick={handleVNPaySuccess}>
                <FaCheckCircle /> Tôi đã quét mã và thanh toán thành công
              </button>
              <button type="button" className="btn btn-outline-danger d-flex align-items-center justify-content-center gap-2" onClick={handleVNPayCancel}>
                <FaTimesCircle /> Hủy bỏ giao dịch
              </button>
            </div>
          </div>
          
          <div className="card-footer bg-light text-center py-3 text-muted small" style={{ borderRadius: '0 0 1.5rem 1.5rem' }}>
            DriveShare VNPay Integration Simulator. Mọi giao dịch ở đây đều hoàn toàn miễn phí.
          </div>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="container py-5 text-center d-flex justify-content-center align-items-center" style={{ minHeight: '65vh' }}>
        <div className="success-box mx-auto shadow-lg border-0 p-5" style={{ maxWidth: '600px', borderRadius: '2rem' }}>
          <div className="d-inline-flex align-items-center justify-content-center bg-success text-white rounded-circle mb-4" style={{ width: '80px', height: '80px' }}>
            <FaCheckCircle size={45} />
          </div>
          
          <h2 className="fw-bold text-dark mb-3" style={{ fontSize: '2rem' }}>Đặt xe thành công!</h2>
          
          <p className="text-muted fs-5 mb-4 px-2">
            Cảm ơn <strong>{customerInfo.fullName}</strong>, đơn đặt xe của bạn đã được gửi. Nhân viên sẽ liên hệ qua SĐT <strong>{customerInfo.phone}</strong> để xác nhận.
          </p>
          
          <div className="mb-4">
            <h3 className="fw-bold text-success" style={{ fontSize: '1.8rem' }}>
              Tổng thanh toán: {grandTotal.toLocaleString()}đ
            </h3>
            {paymentMethod === 'vnpay' && (
              <span className="badge bg-primary px-3 py-2 mt-2">Đã thanh toán qua VNPay</span>
            )}
          </div>

          <button className="btn btn-success btn-lg px-5 py-3 fw-bold rounded-pill" onClick={handleNewBooking} style={{ fontSize: '1.1rem' }}>
            Đặt xe mới
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <h2 className="fw-bold mb-4 d-flex align-items-center gap-2">
        <FaShoppingCart className="text-accent" /> Đơn Chờ Đặt Xe
      </h2>

      {cart.length === 0 ? (
        <div className="text-center py-5">
          <h4 className="text-muted mb-3">Giỏ hàng của bạn đang trống.</h4>
          <p className="text-muted mb-4">Vui lòng quay lại Trang chủ để chọn chiếc xe phù hợp cho chuyến đi.</p>
          <button className="btn btn-accent px-4 py-2 fw-bold" onClick={() => navigate('/')}>
            Khám phá xe ngay
          </button>
        </div>
      ) : (
        <div className="row g-4">
          <div className="col-lg-7">
            {cart.map((item, index) => (
              <div className="card ds-cart-item mb-3" key={index}>
                <div className="row g-0 align-items-center">
                  <div className="col-3">
                    <img src={item.vehicleImage} alt={item.vehicleName} className="cart-item-img" />
                  </div>
                  <div className="col-7">
                    <div className="p-3">
                      <span className="brand-label small">{item.brand}</span>
                      <h6 className="fw-bold mb-1">{item.vehicleName}</h6>
                      <p className="text-muted small mb-1">
                        {item.duration} {item.unit === 'day' ? 'ngày' : 'giờ'} &times; {item.unitPrice.toLocaleString()}đ
                        {item.discount > 0 && (
                          <span className="text-success ms-1">(-{item.discount}%)</span>
                        )}
                      </p>
                      <p className="fw-bold text-accent mb-0">
                        {item.totalPrice.toLocaleString()}đ
                      </p>
                    </div>
                  </div>
                  <div className="col-2 text-center">
                    <button className="btn btn-outline-danger btn-sm" onClick={() => removeFromCart(index)}>
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <div className="d-flex justify-content-between align-items-center p-3 bg-light rounded">
              <span className="fw-bold fs-5">Tổng cộng:</span>
              <span className="fw-bold fs-4 text-accent">{grandTotal.toLocaleString()}đ</span>
            </div>
            
            <div className="alert alert-info mt-3 d-flex align-items-center gap-2" role="alert">
              <FaInfoCircle />
              <span>💡 Mẹo tiết kiệm: Hệ thống tự động giảm ngay 10% tổng hóa đơn cho các gói thuê có thời hạn từ 3 ngày trở lên!</span>
            </div>
          </div>

          <div className="col-lg-5">
            <div className="card p-4 ds-customer-form">
              <h5 className="fw-bold mb-3">Thông tin người đặt</h5>
              <form onSubmit={handleCheckoutSubmit}>
                <div className="mb-3">
                  <label className="form-label small fw-bold">Họ và tên *</label>
                  <input type="text" className="form-control" name="fullName"
                    value={customerInfo.fullName} onChange={handleChange} required placeholder="Nguyễn Văn A" />
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-bold">Số điện thoại *</label>
                  <input type="tel" className="form-control" name="phone"
                    value={customerInfo.phone} onChange={handleChange} required placeholder="0912 345 678" />
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-bold">Địa chỉ *</label>
                  <input type="text" className="form-control" name="address"
                    value={customerInfo.address} onChange={handleChange} required placeholder="123 Nguyễn Trãi, Hà Nội" />
                </div>
                
                <div className="mb-4">
                  <label className="form-label small fw-bold">Phương thức thanh toán *</label>
                  <div className="d-flex flex-column gap-2">
                    <div className="form-check p-3 border rounded-3 d-flex align-items-center justify-content-between" style={{ cursor: 'pointer' }} onClick={() => setPaymentMethod('cod')}>
                      <div className="d-flex align-items-center gap-2">
                        <input 
                          className="form-check-input ms-0" 
                          type="radio" 
                          name="paymentRadio" 
                          checked={paymentMethod === 'cod'} 
                          onChange={() => setPaymentMethod('cod')} 
                        />
                        <label className="form-check-label fw-semibold" style={{ cursor: 'pointer' }}>
                          Thanh toán trực tiếp khi nhận xe (COD)
                        </label>
                      </div>
                      <FaHandHoldingUsd className="text-muted" size={20} />
                    </div>

                    <div className="form-check p-3 border rounded-3 d-flex align-items-center justify-content-between" style={{ cursor: 'pointer' }} onClick={() => setPaymentMethod('vnpay')}>
                      <div className="d-flex align-items-center gap-2">
                        <input 
                          className="form-check-input ms-0" 
                          type="radio" 
                          name="paymentRadio" 
                          checked={paymentMethod === 'vnpay'} 
                          onChange={() => setPaymentMethod('vnpay')} 
                        />
                        <label className="form-check-label fw-semibold" style={{ cursor: 'pointer' }}>
                          Thanh toán trực tuyến VNPay (Giả lập)
                        </label>
                      </div>
                      <FaCreditCard className="text-primary" size={20} />
                    </div>
                  </div>
                </div>
                
                <div className="mb-3">
                  <div className="p-3 bg-light rounded text-muted border" style={{ maxHeight: '120px', overflowY: 'auto', fontSize: '0.75rem' }}>
                    <strong>Cam kết trách nhiệm:</strong> Bằng việc nhấn nút 'Xác nhận đặt xe', tôi cam kết các thông tin định danh cung cấp là chính xác, sở hữu bằng lái xe hợp pháp tương ứng và chịu hoàn toàn trách nhiệm về tài sản trong suốt thời gian thuê.
                  </div>
                </div>

                <button type="submit" className="btn btn-accent w-100 fw-bold">
                  <FaCheckCircle className="me-2" /> Xác nhận đặt xe
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;
