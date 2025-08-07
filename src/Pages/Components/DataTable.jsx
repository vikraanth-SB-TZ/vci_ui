import React from "react";
import Breadcrumb from "./Breadcrumb";

const DataTable = ({ data, columns }) => {
  return (
    <>
      <Breadcrumb
        title="Healthcare Data Table"
        subtitle="Welcome to the Healthcare Data Table"
      />

      <div>
        <>
          {/* App body starts */}
          <div className="app-body">
            {/* Row starts */}
            <div className="row gx-3">
              <div className="col-sm-12">
                <div className="card">
                  <div className="card-header d-flex align-items-center justify-content-between">
                    <h5 className="card-title">Doctors List</h5>
                    <a
                      href="add-doctors.html"
                      className="btn btn-primary ms-auto"
                    >
                      Add Doctor
                    </a>
                  </div>
                  <div className="card-body pt-0">
                    {/* Table starts */}
                    <div className="table-responsive">
                      <table
                        id="scrollVertical"
                        className="table truncate m-0 align-middle"
                      >
                        <thead>
                          <tr >
                            <th>ID</th>
                            <th>Doctor Name</th>
                            <th>Designation</th>
                            <th className="text-center">Sun</th>
                            <th className="text-center">Mon</th>
                            <th className="text-center">Tue</th>
                            <th className="text-center">Wed</th>
                            <th className="text-center">Thu</th>
                            <th className="text-center">Fri</th>
                            <th className="text-center">Sat</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody></tbody>
                      </table>
                    </div>
                    {/* Table ends */}
                    {/* Modal Delete Row */}
                    <div
                      className="modal fade"
                      id="delRow"
                      tabIndex={-1}
                      aria-labelledby="delRowLabel"
                      aria-hidden="true"
                    >
                      <div className="modal-dialog modal-sm">
                        <div className="modal-content">
                          <div className="modal-header">
                            <h5 className="modal-title" id="delRowLabel">
                              Confirm
                            </h5>
                            <button
                              type="button"
                              className="btn-close"
                              data-bs-dismiss="modal"
                              aria-label="Close"
                            />
                          </div>
                          <div className="modal-body">
                            Are you sure you want to delete the doctor from
                            list?
                          </div>
                          <div className="modal-footer">
                            <div className="d-flex justify-content-end gap-2">
                              <button
                                className="btn btn-outline-secondary"
                                data-bs-dismiss="modal"
                                aria-label="Close"
                              >
                                No
                              </button>
                              <button
                                className="btn btn-danger"
                                data-bs-dismiss="modal"
                                aria-label="Close"
                              >
                                Yes
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Row ends */}
          </div>
          {/* App body ends */}
        </>
      </div>
    </>
  );
};

export default DataTable;
