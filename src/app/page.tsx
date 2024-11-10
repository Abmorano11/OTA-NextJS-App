"use client";
import { useState, useEffect } from "react";

export interface CompanyData {
  id: number;
  name: string;
}

export default function PaginatedTable() {
  const [data, setData] = useState(Array<CompanyData>);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalLength, setTotalLength] = useState(0);
  const [selectedRows, setSelectedRows] = useState(Array<number>);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData(currentPage);
  }, [currentPage]);

  async function fetchData(page: number) {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/data?page=${page}&limit=${itemsPerPage}`
      );
      const result = await response.json();
      setData(result.data);
      setTotalPages(result.totalPages);
      setTotalLength(result.totalLength);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  }

  const handleCheckboxChange = (id: number) => {
    setSelectedRows((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((rowId) => rowId !== id)
        : [...prevSelected, id]
    );
  };

  const handleSelectAll = () => {
    let rows = [
      ...selectedRows,
      ...data
        .filter((company) => !selectedRows.includes(company.id))
        .map((company) => company.id),
    ];
    if (rows.length === selectedRows.length)
      rows = [
        ...selectedRows.filter(
          (row) => !data.find((company) => row === company.id)
        ),
      ];
    setSelectedRows(rows);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleDeleteSelected = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/data", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedRows }),
      });

      if (response.ok) {
        setSelectedRows([]);
        setCurrentPage(1);
        fetchData(1);
      } else {
        console.error("Failed to delete selected rows");
        setLoading(false);
      }
    } catch (error) {
      console.error("Error deleting selected rows:", error);
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center w-full min-h-screen px-5 md:px-10 py-2.5 font-[family-name:var(--font-geist-sans)]">
      {loading ? (
        <LoadingScreen />
      ) : (
        <>
          <table className="w-full max-w-[800px] text-center">
            <thead>
              <tr className="border-b">
                <th className="px-5 md:px-10 py-2.5 md:py-5">
                  <button
                    className="border hover:bg-[#888] p-2.5"
                    onClick={handleSelectAll}
                  >
                    Select Items
                  </button>
                </th>
                <th className="px-5 md:px-10 py-2.5 md:py-5">ID</th>
                <th className="px-5 md:px-10 py-2.5 md:py-5">Name</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr
                  className="border-b hover:bg-[#888] cursor-pointer"
                  key={item.id}
                  onClick={() => handleCheckboxChange(item.id)}
                >
                  <td className="px-5 md:px-10 py-2.5 md:py-5">
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(item.id)}
                      readOnly
                    />
                  </td>
                  <td className="px-5 md:px-10 py-2.5 md:py-5">{item.id}</td>
                  <td className="px-5 md:px-10 py-2.5 md:py-5">{item.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex w-full max-w-[800px] justify-around items-center py-5">
            <button
              className="border hover:bg-[#888] p-5"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
            >
              Back
            </button>
            <span className="p-5">
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="border hover:bg-[#888] p-5"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
          <div className="flex">
            <button
              className="border bg-[red] hover:bg-[#888] p-5"
              onClick={handleDeleteSelected}
              disabled={selectedRows.length === 0}
            >
              Delete Selected
            </button>
            <p className="p-5">Selected Rows: {JSON.stringify(selectedRows)}</p>
          </div>
        </>
      )}
    </div>
  );
}

// LoadingScreen Component
function LoadingScreen() {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "2em",
        zIndex: 1000,
      }}
    >
      Loading...
    </div>
  );
}
