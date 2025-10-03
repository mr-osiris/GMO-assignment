import React, { useState, useEffect } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import axios from "axios";
import "primeicons/primeicons.css";

const PAGE_SIZE = 12;
const API_URL = "https://api.artic.edu/api/v1/artworks";

interface Artwork {
  id: number;
  title: string;
  place_of_origin: string;
  artist_display: string;
  inscriptions: string;
  date_start: number | null;
  date_end: number | null;
}

function App() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(false);
  const [first, setFirst] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [allSelectedArtworks, setAllSelectedArtworks] = useState<Map<number, Artwork>>(new Map());
  const [currentPageSelection, setCurrentPageSelection] = useState<Artwork[]>([]);
  const [selectCountInput, setSelectCountInput] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const fetchData = (pageNumber: number) => {
    setLoading(true);
    axios
      .get(API_URL, { params: { page: pageNumber, limit: PAGE_SIZE } })
      .then((response) => {
        const fetchedArtworks = response.data.data as Artwork[];
        setArtworks(fetchedArtworks);
        setTotalRecords(response.data.pagination.total);
        
        // Update current page selection based on global selection
        const selectedOnCurrentPage = fetchedArtworks.filter(art => 
          allSelectedArtworks.has(art.id)
        );
        setCurrentPageSelection(selectedOnCurrentPage);
        
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setLoading(false);
      });
  };

  const fetchMultiplePages = async (startPage: number, totalCount: number) => {
    const updatedMap = new Map(allSelectedArtworks);
    let remainingCount = totalCount;
    let page = startPage;
    
    // Clear selections from current page first
    artworks.forEach(art => updatedMap.delete(art.id));
    
    while (remainingCount > 0) {
      try {
        const response = await axios.get(API_URL, { 
          params: { page, limit: PAGE_SIZE } 
        });
        const pageArtworks = response.data.data as Artwork[];
        const countToSelect = Math.min(remainingCount, pageArtworks.length);
        
        // Add selected items from this page
        for (let i = 0; i < countToSelect; i++) {
          updatedMap.set(pageArtworks[i].id, pageArtworks[i]);
        }
        
        remainingCount -= countToSelect;
        page++;
      } catch (error) {
        console.error("Error fetching page:", error);
        break;
      }
    }
    
    setAllSelectedArtworks(updatedMap);
    
    // Update current page selection
    const selectedOnCurrentPage = artworks.filter(art => 
      updatedMap.has(art.id)
    );
    setCurrentPageSelection(selectedOnCurrentPage);
  };

  useEffect(() => {
    fetchData(1);
  }, []);

  const handleSelectionChange = (e: { value: Artwork[] }) => {
    const newSelection = e.value ?? [];
    setCurrentPageSelection(newSelection);
    
    // Update global selection map
    const updatedMap = new Map(allSelectedArtworks);
    
    // Remove all items from current page
    artworks.forEach(art => updatedMap.delete(art.id));
    
    // Add newly selected items from current page
    newSelection.forEach(art => updatedMap.set(art.id, art));
    
    setAllSelectedArtworks(updatedMap);
    setSelectCountInput(`${newSelection.length}`);
  };

  const handleRemove = (id: number) => {
    const updatedMap = new Map(allSelectedArtworks);
    updatedMap.delete(id);
    setAllSelectedArtworks(updatedMap);
    
    // Update current page selection if the item is on current page
    const filtered = currentPageSelection.filter((a) => a.id !== id);
    setCurrentPageSelection(filtered);
    setSelectCountInput(`${filtered.length}`);
  };

  const onPageChange = (event: any) => {
    setFirst(event.first);
    const pageNumber = (event.first / PAGE_SIZE) + 1;
    setCurrentPage(pageNumber);
    fetchData(pageNumber);
  };

  const columnHeaderTemplate = () => (
    <div style={{ display: "flex", alignItems: "center", position: "relative" }}>
      {/* Empty div for selection column */}
    </div>
  );

  const titleHeaderTemplate = () => (
    <div style={{ display: "flex", alignItems: "center", position: "relative" }}>
      <span
        style={{
          cursor: "pointer",
          padding: "4px 8px",
          borderRadius: "4px",
          background: dropdownOpen ? "#e3f2fd" : "transparent",
          transition: "background 0.2s",
          marginRight: "8px",
        }}
        onClick={() => setDropdownOpen((o) => !o)}
      >
        <i
          className={`pi ${dropdownOpen ? "pi-chevron-up" : "pi-chevron-down"}`}
          style={{
            fontSize: "0.9rem",
            color: "#666",
          }}
        />
      </span>
      <span>Title</span>
      {dropdownOpen && (
        <div
          style={{
            position: "absolute",
            left: 0,
            top: "2.5em",
            padding: "1.2em",
            background: "#fff",
            boxShadow: "0 4px 12px rgba(0,0,0,.15)",
            border: "1px solid #e0e0e0",
            borderRadius: "8px",
            zIndex: 10,
            minWidth: 280,
          }}
        >
          <div style={{ marginBottom: "1em" }}>
            <label style={{ display: "block", marginBottom: "0.5em", fontSize: "0.9em", color: "#666" }}>
              Select rows (across pages)...
            </label>
            <input
              type="number"
              min={0}
              max={120}
              value={selectCountInput}
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1px solid #d0d0d0",
                borderRadius: "4px",
                fontSize: "1em",
                boxSizing: "border-box",
              }}
              placeholder="Enter number of rows"
              onChange={(e) => {
                const val = Math.max(0, Math.min(Number(e.target.value), artworks.length * 10));
                setSelectCountInput(e.target.value);
                
                if (val > 0) {
                  fetchMultiplePages(currentPage, val);
                } else {
                  // Clear all selections
                  const updatedMap = new Map(allSelectedArtworks);
                  artworks.forEach(art => updatedMap.delete(art.id));
                  setAllSelectedArtworks(updatedMap);
                  setCurrentPageSelection([]);
                }
              }}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <button
            onClick={() => setDropdownOpen(false)}
            style={{
              width: "100%",
              background: "#1976d2",
              color: "#fff",
              border: "none",
              padding: "10px 16px",
              borderRadius: "6px",
              fontWeight: 500,
              cursor: "pointer",
              fontSize: "1em",
            }}
          >
            Submit
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Artworks Table</h2>
      <div style={{ marginBottom: "1rem", color: "#666" }}>
        <span>Current Page: <strong style={{ color: "#1976d2", fontSize: "1.1em" }}>{currentPage}</strong></span>
        <span style={{ marginLeft: "2rem" }}>
          Total Selected: <strong style={{ color: "#d32f2f", fontSize: "1.1em" }}>{allSelectedArtworks.size}</strong>
        </span>
      </div>
      <DataTable
        value={artworks}
        loading={loading}
        paginator
        rows={PAGE_SIZE}
        first={first}
        totalRecords={totalRecords}
        onPage={onPageChange}
        lazy
        selection={currentPageSelection}
        selectionMode="multiple"
        onSelectionChange={handleSelectionChange}
        dataKey="id"
        tableStyle={{ minWidth: "50rem" }}
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
        currentPageReportTemplate={`Page {currentPage} of {totalPages}`}
      >
        <Column selectionMode="multiple" headerStyle={{ width: "3em" }} header={columnHeaderTemplate} />
        <Column field="title" header={titleHeaderTemplate} />
        <Column field="place_of_origin" header="Place of Origin" />
        <Column field="artist_display" header="Artist" />
        <Column field="inscriptions" header="Inscriptions" />
        <Column field="date_start" header="Date Start" />
        <Column field="date_end" header="Date End" />
      </DataTable>
      <SelectionPanel selectedArtworks={Array.from(allSelectedArtworks.values())} onRemoveId={handleRemove} />
      
      {/* Custom CSS to highlight current page */}
      <style>{`
        .p-paginator .p-paginator-pages .p-paginator-page.p-highlight {
          background: #1976d2 !important;
          border-color: #1976d2 !important;
          color: #ffffff !important;
          font-weight: 600 !important;
        }
        
        .p-paginator .p-paginator-pages .p-paginator-page {
          min-width: 2.5rem;
          height: 2.5rem;
          margin: 0.143rem;
          transition: background-color 0.2s, color 0.2s;
        }
        
        .p-paginator .p-paginator-pages .p-paginator-page:hover {
          background: #e3f2fd;
        }
      `}</style>
    </div>
  );
}

interface SelectionPanelProps {
  selectedArtworks: Artwork[];
  onRemoveId: (id: number) => void;
}

function SelectionPanel({ selectedArtworks, onRemoveId }: SelectionPanelProps) {
  if (!selectedArtworks.length) return null;
  return (
    <div style={{ marginTop: "2rem", border: "1px solid #ccc", padding: "1rem" }}>
      <h3>
        Selected Artworks (All Pages)
        <span
          style={{
            marginLeft: "1em",
            background: "#1976d2",
            color: "#fff",
            borderRadius: "12px",
            padding: "0 12px",
            fontWeight: 600,
            fontSize: "1.1em",
          }}
        >
          {selectedArtworks.length}
        </span>
      </h3>
      <ul style={{ maxHeight: "150px", overflowY: "auto" }}>
        {selectedArtworks.map((art) => (
          <li key={art.id} style={{ marginBottom: "0.5rem" }}>
            <strong>{art.title || "Untitled"}</strong> (ID: {art.id})
            <button
              style={{
                marginLeft: "1rem",
                backgroundColor: "#d32f2f",
                color: "#fff",
                borderRadius: "6px",
                padding: "6px 12px",
                border: "none",
                cursor: "pointer",
              }}
              onClick={() => onRemoveId(art.id)}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;