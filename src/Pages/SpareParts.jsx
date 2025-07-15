import React from 'react';
import { Button } from 'react-bootstrap';
import { Plus, RotateCw } from 'lucide-react'; // or use react-icons
import emptyBox from '../assets/empty-box.png'; // add your empty icon image here
function SparePartsPage() {
  return (
    <div className="p-4" style={{ background: '#f8f9fa', minHeight: '100vh' }}>
      {/* Top Bar */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h5 className="fw-semibold mb-0">Spare parts <span className="text-muted">(0)</span></h5>
        </div>
        <div className="d-flex align-items-center gap-2">
          <Button variant="light" className="border">
            <RotateCw size={16} />
          </Button>
          <Button variant="success" className="d-flex align-items-center gap-1">
            <Plus size={16} /> Add New
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded shadow-sm p-3">
        <table className="table mb-0">
          <thead className="table-light">
            <tr>
              <th>S.No</th>
              <th>Spare part Name</th>
              <th>Qty Per VCI</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {/* Empty State */}
            <tr>
              <td colSpan="4" className="text-center py-5 text-muted">
                <img
                  src={emptyBox}
                  alt="Empty"
                  style={{ width: 60, opacity: 0.5 }}
                  className="mb-2"
                />
                <div>Empty Data</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default SparePartsPage; // ✅ Export is outside the function
