import React, { useState, useContext, useEffect } from "react";
import { Form, Select, Input, Button, Alert, Typography } from "antd";
import { usePairsData } from "../../pairsDataContext";
import "./style.css";

const { Text } = Typography;
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
      selectedPair1Data !== pair.address &&
      (selectedPair1Data.token0symbol == pair.token0symbol ||
        selectedPair1Data.token0symbol == pair.token1symbol ||
        selectedPair1Data.token1symbol == pair.token0symbol ||
        selectedPair1Data.token1symbol == pair.token1symbol)
  );

  // Automatically select stable pair based on first two selections
  const availableStablePair = pairsData.find((pair) => {
    if (selectedPair1Data && selectedPair2Data) {
      const pair1Tokens = [
        selectedPair1Data.token0symbol,
        selectedPair1Data.token1symbol,
      ];
      const pair2Tokens = [
        selectedPair2Data.token0symbol,
        selectedPair2Data.token1symbol,
      ];

      const notCommonTokens = [...pair1Tokens, ...pair2Tokens].filter(
        (token) => !(pair2Tokens.includes(token) && pair1Tokens.includes(token))
      );
      console.log(notCommonTokens);
      return (
        notCommonTokens.includes(pair.token0symbol) &&
        notCommonTokens.includes(pair.token1symbol)
      );
    } else {
      return false;
    }
  });

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
              <Text type="secondary">{selectedPair1Data.priceToken1String}</Text>
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
              <Text type="secondary">{selectedPair2Data.priceToken1String}</Text>
            )}
          </div>
        </Form.Item>
        <Form.Item label="Stablecoin Conversion Pair" style={{ width: "20vw" }}>
          <Input
            value={availableStablePair?.pair || "Didnt find conversion pair"}
            disabled
          />
          {availableStablePair && (
            <>
              <Text type="secondary">{availableStablePair.address}</Text>
              <Text type="secondary">{availableStablePair.prieToken0String}</Text>
            </>
          )}
        </Form.Item>
        <Form.Item
          label="Loan Amount (in token from first pair)"
          style={{ width: "20vw" }}
        >
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
              Potential Profit {"(if you make arbitrage with loan funds) (Flash loan takes 9% from loan size)"}:{" "}
              {profitWithComission.toFixed(4)} $
            </h3>
          </div>
        </>
      )}
    </div>
  );
};
