import React from "react";
import "./App.css";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { UniswapPairs } from "./components/UniswapPairs/UniswapPairs.jsx";
import { Header } from "./components/Header/Header.jsx";
import { FlashLoan } from "./components/FlashLoans/FlashLoan.jsx";
import ArbitrageOpportunities from "./components/ArbitrageOpportunities/ArbOpp.jsx";
import { ArbitrageCalculator } from "./components/ArbitrageCalculator/ArbitrageCalculator.jsx";
import { Main } from "./components/Main/Main.jsx";

function App() {
  return (
    <Router>
      <div style={{ display: "flex", flexDirection: "Row" }}>
        <Header />
        <div className="body">
          <Routes>
            <Route path="/" element = {<Main/>}/>
            <Route path="/pairs" element={<UniswapPairs />} />
            <Route path="/flash-loan" element={<FlashLoan/>} />
            <Route path="/opportunities" element={<ArbitrageOpportunities/>} />
            <Route path="/calculator" element={<ArbitrageCalculator/>} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
