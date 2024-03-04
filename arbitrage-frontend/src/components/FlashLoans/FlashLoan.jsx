import React, { useState, useContext, useEffect } from "react";
import { Form, Select, Input, Button, Alert, Typography } from "antd";
import { usePairsData } from "../../pairsDataContext";
import "./style.css";

const { Text } = Typography;
const stablecoins = ["USDT", "USDC", "DAI"];
export const FlashLoan = () => {
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
        <Button type="primary" >
          Make A Loan
        </Button>
      </Form>
      {error && (
        <Alert type="error" message={error} style={{ margin: "15px 0" }} />
      )}
    </div>
  );
};

