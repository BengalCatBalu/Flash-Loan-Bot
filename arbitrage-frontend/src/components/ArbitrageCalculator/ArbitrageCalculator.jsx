import React, { useState, useContext, useEffect } from "react";
import {
  Form,
  Select,
  Input,
  Button,
  Alert,
  Typography,
  Space,
  message,
} from "antd";
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
  const [shareTokenY, setShareTokenY] = useState("");
  const [noncommonToken, setCommonToken] = useState("");
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
    if (!validatePairs()) {
      message.error("incorrect pairs");
      return;
    }

    // Extracting detailed data for each pair
    const {
      token0symbol: tokenX1,
      token1symbol: tokenY1,
      priceToken0: priceX1Y1,
      priceToken1: priceY1X1,
    } = selectedPair1Data;
    const {
      token0symbol: tokenY2,
      token1symbol: tokenZ2,
      priceToken0: priceY2Z2,
      priceToken1: priceZ2Y2,
    } = selectedPair2Data;

    // Identify the common token Y between the first two pairs
    const sharedTokenY = [tokenX1, tokenY1].find(
      (token) => token === tokenY2 || token === tokenZ2
    );
    if (!sharedTokenY) {
      setError("Cannot identify shared token Y between the first two pairs.");
      return;
    }
    const nonCommonTokenFirstPair = selectedPair1Data
      ? selectedPair1Data.token0symbol === sharedTokenY
        ? selectedPair1Data.token1symbol
        : selectedPair1Data.token0symbol
      : null;
    setCommonToken(nonCommonTokenFirstPair);
    // Ensure correct price selection based on token order in each pair
    const priceXY = sharedTokenY === tokenY1 ? priceY1X1 : priceX1Y1; // Price from X to Y
    const priceYZ = sharedTokenY === tokenY2 ? priceY2Z2 : priceZ2Y2; // Price from Y to Z

    // For the stablecoin conversion, identify common stablecoin and ensure correct price selection
    const baseTokenX = tokenX1 === sharedTokenY ? tokenY1 : tokenX1; // Base token X
    const finalTokenZ = tokenZ2 === sharedTokenY ? tokenY2 : tokenZ2; // Final token Z

    const availableStablePair = pairsData.find(
      (pair) =>
        (pair.token0symbol === baseTokenX ||
          pair.token1symbol === baseTokenX) &&
        (pair.token0symbol === finalTokenZ || pair.token1symbol === finalTokenZ)
    );

    if (!availableStablePair) {
      setError("Cannot find a stablecoin pair matching the criteria.");
      return;
    }

    const priceZX =
      baseTokenX === availableStablePair.token0symbol
        ? availableStablePair.priceToken1
        : availableStablePair.priceToken0; // Price from Z back to X

    // Calculate the conversion through the pairs
    const initialY = loanAmount / priceXY; // Convert X to Y
    const finalZ = initialY * priceYZ; // Convert Y to Z
    const finalX = finalZ / priceZX; // Convert Z back to X

    // Calculate potential profit
    const potentialProfit = finalX - loanAmount;
    setProfit(potentialProfit);

    // Assuming a 9% commission for the flash loan
    const commission = loanAmount * 0.09;
    const profitAfterCommission = potentialProfit - commission;
    setProfitWithComission(profitAfterCommission);
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
              <Text
                type="secondary"
                style={{ whiteSpace: "nowrap", fontSize: "1.5vh" }}
              >
                {selectedPair1Data.address}
              </Text>
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
              <Text
                type="secondary"
                style={{ whiteSpace: "nowrap", fontSize: "1.5vh" }}
              >
                {selectedPair2Data.address}
              </Text>
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
              <Text
                type="secondary"
                style={{ whiteSpace: "nowrap", fontSize: "1.5vh" }}
              >
                {availableStablePair.address}{" "}
              </Text>
            </>
          )}
        </Form.Item>
        <Form.Item
          label="Arbitrage Size (Number of initial token from first pair)"
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
      <div className="information">
        <div className="block">
          {selectedPair1Data && (
            <Text type="secondary">{selectedPair1Data.priceToken1String}</Text>
          )}
          {selectedPair1Data && (
            <Text type="secondary">{selectedPair1Data.priceToken0String}</Text>
          )}
        </div>
        <div className="block">
          {selectedPair2Data && (
            <Text type="secondary">{selectedPair2Data.priceToken1String}</Text>
          )}
          {selectedPair2Data && (
            <Text type="secondary">{selectedPair2Data.priceToken0String}</Text>
          )}
        </div>
        <div className="block">
          {availableStablePair && (
            <Text type="secondary">
              {availableStablePair.priceToken0String}
            </Text>
          )}
        </div>
        {profit !== null && profitWithComission != null && (
          <>
            <div style={{ marginTop: "1vh", marginLeft: "1vw" , fontSize: "1.5vh" }}>
              <h3>
                Potential Profit {"(if you make arbitrage with your funds)"}:{" "}
                {profit.toFixed(4)} {noncommonToken}
              </h3>
            </div>
            <div style={{ marginTop: "1vh", marginLeft: "1vw" , fontSize: "1.5vh" }}>
              <h3>
                Potential Profit{" "}
                {
                  "(if you make arbitrage with loan funds) (Flash loan takes 9% from loan size)"
                }
                : {profitWithComission.toFixed(4)} {noncommonToken}
              </h3>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
