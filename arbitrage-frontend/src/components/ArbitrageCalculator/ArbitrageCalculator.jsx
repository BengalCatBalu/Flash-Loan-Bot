import React, { useState, useContext, useEffect } from "react";
import { Form, Select, Input, Button, Alert, Typography } from "antd";
import { usePairsData } from "../../pairsDataContext";
import "./style.css";

const { Text } = Typography;
const stablecoins = ["USDT", "USDC", "DAI"];
export const ArbitrageCalculator = () => {
  const { pairsData } = usePairsData();
  const [selectedPair1, setSelectedPair1] = useState(null);
  const [selectedPair2, setSelectedPair2] = useState(null);
  const [loanAmount, setLoanAmount] = useState("");
  const [profit, setProfit] = useState(null);
  const [profitWithComission, setProfitWithComission] = useState(null);
  const [error, setError] = useState("");

  // Derived states for UI
  const selectedPair1Data = pairsData.find(
    (pair) => pair.address === selectedPair1
  );
  const selectedPair2Data = pairsData.find(
    (pair) => pair.address === selectedPair2
  );
  const availableSecondPairs = pairsData.filter(
    (pair) =>
      selectedPair1Data &&
      selectedPair1Data.nonStableSymbol == pair.nonStableSymbol &&
      selectedPair1Data.stableSymbol !== pair.stableSymbol
  );

  // Automatically select stable pair based on first two selections
  const availableStablePair = pairsData.find(
    (pair) =>
      selectedPair1Data &&
      selectedPair2Data &&
      (selectedPair1Data.stableSymbol == pair.stableSymbol ||
        selectedPair1Data.stableSymbol == pair.nonStableSymbol) &&
      (selectedPair2Data.stableSymbol == pair.stableSymbol ||
        selectedPair2Data.stableSymbol == pair.nonStableSymbol)
  );

  const validatePairs = () => {
    if (!selectedPair1Data || !selectedPair2Data || !availableStablePair) {
      setError("Invalid pair selections for arbitrage calculation.");
      setProfit(null);
      return false;
    }

    setError("");
    return true;
  };

  const calculateArbitrage = () => {
    if (!validatePairs()) return;

    // Assuming the validation is passed and pairs are selected correctly
    const initialTokenAmount =
      loanAmount / parseFloat(selectedPair1Data.stablecoinPriceNum); // Amount of token obtained from the loan
    const secondStableAmount =
      initialTokenAmount * parseFloat(selectedPair2Data.stablecoinPriceNum); // Amount of second token obtained from swapping the first token

    const potentialProfit = secondStableAmount - loanAmount;
    const profWithCom = secondStableAmount * 0.97 - loanAmount;
    setProfit(potentialProfit);
    setProfitWithComission(profWithCom);
  };

  return (
    <div className="form">
      <Form layout="vertical">
        <Form.Item label="First Swap Pair" style={{ width: "20vw" }}>
          <Select
            showSearch
            value={selectedPair1}
            onChange={setSelectedPair1}
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
          >
            {pairsData.map((pair) => (
              <Select.Option key={pair.address} value={pair.address}>
                {`${pair.token0symbol}-${pair.token1symbol}`}
              </Select.Option>
            ))}
          </Select>
          <div className="text-block">
            {selectedPair1Data && (
              <Text type="secondary">{selectedPair1Data.address}</Text>
            )}
            {selectedPair1Data && (
              <Text type="secondary">{selectedPair1Data.stablecoinPrice}</Text>
            )}
          </div>
        </Form.Item>
        <Form.Item label="Second Swap Pair" style={{ width: "20vw" }}>
          <Select
            showSearch
            value={selectedPair2}
            onChange={setSelectedPair2}
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
          >
            {availableSecondPairs.map((pair) => (
              <Select.Option key={pair.address} value={pair.address}>
                {`${pair.token0symbol}-${pair.token1symbol}`}
              </Select.Option>
            ))}
          </Select>
          <div className="text-block">
            {selectedPair2Data && (
              <Text type="secondary">{selectedPair2Data.address}</Text>
            )}
            {selectedPair2Data && (
              <Text type="secondary">{selectedPair2Data.stablecoinPrice}</Text>
            )}
          </div>
        </Form.Item>
        <Form.Item label="Stablecoin Conversion Pair" style={{ width: "20vw" }}>
          <Input
            value={availableStablePair?.pair || "Didnt find stable pair"}
            disabled
          />
          {availableStablePair && (
            <Text type="secondary">{availableStablePair.address}</Text>
          )}
        </Form.Item>
        <Form.Item label="Amount in $" style={{ width: "20vw" }}>
          <Input
            type="number"
            value={loanAmount}
            onChange={(e) => setLoanAmount(e.target.value)}
          />
        </Form.Item>
        <Button type="primary" onClick={calculateArbitrage}>
          Calculate Profit
        </Button>
      </Form>
      {error && (
        <Alert type="error" message={error} style={{ margin: "15px 0" }} />
      )}
      {profit !== null && profitWithComission != null && (
        <>
          <div style={{ marginTop: 15 }}>
            <h3>
              Potential Profit {"(if you make arbitrage with your funds)"}:{" "}
              {profit.toFixed(4)} $
            </h3>
          </div>
          <div style={{ marginTop: 15 }}>
            <h3>
              Potential Profit {"(if you make arbitrage with loan funds)"}:{" "}
              {profitWithComission.toFixed(4)} $
            </h3>
          </div>
        </>
      )}
    </div>
  );
};
