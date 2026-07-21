import React, { useState, useMemo } from 'react';
import VehicleCard from '../../components/VehicleCard';
import Pagination from '../../components/Pagination';
import { FaSearch } from 'react-icons/fa';

function Home({ vehicles, loading }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const brands = useMemo(() => {
    const set = new Set(vehicles.map(v => v.brand));
    return ['All', ...Array.from(set)];
  }, [vehicles]);

  const filteredVehicles = useMemo(() => {
    return vehicles.filter(v => {
      const matchSearch =
        v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.brand.toLowerCase().includes(searchQuery.toLowerCase());
      const matchType = selectedType === 'All' || v.type === selectedType;
      const matchBrand = selectedBrand === 'All' || v.brand === selectedBrand;
      return matchSearch && matchType && matchBrand;
    });
  }, [vehicles, searchQuery, selectedType, selectedBrand]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedType, selectedBrand]);

  const currentVehicles = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredVehicles.slice(start, start + itemsPerPage);
  }, [filteredVehicles, currentPage, itemsPerPage]);

  return (
    <div>
      <section className="hero-section text-center text-white">
        <div className="container py-5">
          <h1 className="hero-title">DriveShare – Hành Trình Tự Do, Xe Khỏe Giá Tốt</h1>
          <p className="hero-subtitle mx-auto">
            Tự do khám phá mọi cung đường với đội xe đời mới, sẵn sàng giao tận nơi. Thủ tục siêu tốc — lái xe trong vài phút, hỗ trợ cứu hộ 24/7.
          </p>
          <div className="search-bar mx-auto mt-4">
            <div className="input-group">
              <span className="input-group-text bg-white border-0">
                <FaSearch className="text-muted" />
              </span>
              <input
                type="text"
                className="form-control border-0"
                placeholder="Nhập tên xe bạn muốn tìm (Ví dụ: VinFast VF8, Honda SH...)"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              <select
                className="form-select border-0 filter-select"
                value={selectedType}
                onChange={e => setSelectedType(e.target.value)}
              >
                <option value="All">Tất cả loại xe</option>
                <option value="Car">Ô tô</option>
                <option value="Motorbike">Xe máy</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      <section className="container py-5">
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
          <div>
            <h2 className="fw-bold mb-1">Danh Sách Đội Xe Sẵn Có</h2>
            <p className="text-muted small mb-0">
              Tìm thấy {filteredVehicles.length} phương tiện phù hợp
            </p>
          </div>
          <div className="d-flex gap-2 flex-wrap">
            {brands.map(brand => (
              <button
                key={brand}
                className={`btn btn-sm ${
                  selectedBrand === brand ? 'btn-accent' : 'btn-outline-secondary'
                }`}
                onClick={() => setSelectedBrand(brand)}
              >
                {brand === 'All' ? 'Tất cả hãng' : brand}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-success" role="status">
              <span className="visually-hidden">Đang tải...</span>
            </div>
            <p className="mt-3 text-muted">Đang tải dữ liệu xe...</p>
          </div>
        ) : filteredVehicles.length === 0 ? (
          <div className="text-center py-5">
            <h4 className="text-muted">Không tìm thấy xe nào</h4>
            <p className="text-muted">Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
          </div>
        ) : (
          <>
            <div className="row g-4">
              {currentVehicles.map(vehicle => (
                <div className="col-sm-6 col-lg-4" key={vehicle.id}>
                  <VehicleCard vehicle={vehicle} />
                </div>
              ))}
            </div>
            <Pagination
              itemsPerPage={itemsPerPage}
              totalItems={filteredVehicles.length}
              paginate={setCurrentPage}
              currentPage={currentPage}
            />
          </>
        )}
      </section>
    </div>
  );
}

export default Home;
