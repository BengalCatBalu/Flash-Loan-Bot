import React, { useContext, useState, useEffect } from "react";
import { Table } from "antd";
import { usePairsData } from "../../pairsDataContext";

const ArbitrageOpportunities = () => {
  const { pairsData } = usePairsData();
  const [arbitrageOpportunities, setArbitrageOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (pairsData.length) {
      setLoading(true);
      const opportunities = [];
      const finalPairs = [];
      for (let pair of pairsData) {
        const secondPairs = [];
        for (let secondpair of pairsData) {
          if (
            secondpair.pair != pair.pair &&
            (secondpair.token0symbol == pair.token0symbol ||
              secondpair.token0symbol == pair.token1symbol ||
              secondpair.token1symbol == pair.token0symbol ||
              secondpair.token1symbol == pair.token1symbol)
          ) {
            secondPairs.push(secondpair);
          }
        }
        for (let secondpair of secondPairs) {
          for (let thirdpair of pairsData) {
            if (pair.token0symbol == secondpair.token0symbol) {
              if (
                thirdpair.token0symbol == pair.token1symbol &&
                thirdpair.token1symbol == secondpair.token1symbol
              ) {
                finalPairs.push({
                  type: "00",
                  token: pair.token0symbol,
                  secondToken: pair.token1symbol,
                  thirdToken: secondpair.token1symbol,
                  firstPair: pair,
                  secondPair: secondpair,
                  thirdPair: thirdpair,
                  firstPrice: pair.priceToken0,
                  secondPrice: secondpair.priceToken0,
                  convertPrice: thirdpair.priceToken0,
                });
              } else if (
                thirdpair.token1symbol == pair.token1symbol &&
                thirdpair.token0symbol == secondpair.token1symbol
              ) {
                finalPairs.push({
                  type: "00",
                  token: pair.token0symbol,
                  secondToken: pair.token1symbol,
                  thirdToken: secondpair.token1symbol,
                  firstPair: pair,
                  secondPair: secondpair,
                  thirdPair: thirdpair,
                  firstPrice: pair.priceToken0,
                  secondPrice: secondpair.priceToken0,
                  converPrice: thirdpair.priceToken1,
                });
              }
            } else if (pair.token0symbol == secondpair.token1symbol) {
              if (
                thirdpair.token0symbol == pair.token1symbol &&
                thirdpair.token1symbol == secondpair.token0symbol
              ) {
                finalPairs.push({
                  type: "01",
                  token: pair.token0symbol,
                  secondToken: pair.token1symbol,
                  thirdToken: secondpair.token0symbol,
                  firstPair: pair,
                  secondPair: secondpair,
                  thirdPair: thirdpair,
                  firstPrice: pair.priceToken0,
                  secondPrice: secondpair.priceToken1,
                  convertPrice: thirdpair.priceToken0,
                });
              } else if (
                thirdpair.token1symbol == pair.token1symbol &&
                thirdpair.token0symbol == secondpair.token0symbol
              ) {
                finalPairs.push({
                  type: "01",
                  token: pair.token0symbol,
                  secondToken: pair.token1symbol,
                  thirdToken: secondpair.token0symbol,
                  firstPair: pair,
                  secondPair: secondpair,
                  thirdPair: thirdpair,
                  firstPrice: pair.priceToken0,
                  secondPrice: secondpair.priceToken1,
                  convertPrice: thirdpair.priceToken1,
                });
              }
            } else if (pair.token1symbol == secondpair.token1symbol) {
              if (
                thirdpair.token0symbol == pair.token0symbol &&
                thirdpair.token1symbol == secondpair.token0symbol
              ) {
                finalPairs.push({
                  type: "11",
                  token: pair.token1symbol,
                  secondToken: pair.token0symbol,
                  thirdToken: secondpair.token0symbol,
                  firstPair: pair,
                  secondPair: secondpair,
                  thirdPair: thirdpair,
                  firstPrice: pair.priceToken1,
                  secondPrice: secondpair.priceToken1,
                  convertPrice: thirdpair.priceToken0,
                });
              } else if (
                thirdpair.token1symbol == pair.token0symbol &&
                thirdpair.token0symbol == secondpair.token0symbol
              ) {
                finalPairs.push({
                  type: "11",
                  token: pair.token1symbol,
                  secondToken: pair.token0symbol,
                  thirdToken: secondpair.token0symbol,
                  firstPair: pair,
                  secondPair: secondpair,
                  thirdPair: thirdpair,
                  firstPrice: pair.priceToken1,
                  secondPrice: secondpair.priceToken1,
                  convertPrice: thirdpair.priceToken1,
                });
              }
            } else if (pair.token1symbol == secondpair.token0symbol) {
              if (
                thirdpair.token0symbol == pair.token0symbol &&
                thirdpair.token1symbol == secondpair.token1symbol
              ) {
                finalPairs.push({
                  type: "10",
                  token: pair.token1symbol,
                  secondToken: pair.token0symbol,
                  thirdToken: secondpair.token1symbol,
                  firstPair: pair,
                  secondPair: secondpair,
                  thirdPair: thirdpair,
                  firstPrice: pair.priceToken1,
                  secondPrice: secondpair.priceToken0,
                  convertPrice: thirdpair.priceToken0,
                });
              } else if (
                thirdpair.token1symbol == pair.token0symbol &&
                thirdpair.token0symbol == secondpair.token1symbol
              ) {
                finalPairs.push({
                  type: "10",
                  token: pair.token1symbol,
                  secondToken: pair.token0symbol,
                  thirdToken: secondpair.token1symbol,
                  firstPair: pair,
                  secondPair: secondpair,
                  thirdPair: thirdpair,
                  firstPrice: pair.priceToken1,
                  secondPrice: secondpair.priceToken0,
                  convertPrice: thirdpair.priceToken1,
                });
              }
            }
          }
        }
      }
      for (let opp of finalPairs) {
        if (Math.abs(opp.firstPrice - opp.secondPrice * opp.convertPrice)) {
          opportunities.push({
            token: opp.token,
            secondtoken: opp.secondToken,
            price1: `1 ${opp.token} = ${opp.firstPrice} ${opp.secondToken}`,
            price2: `1 ${opp.token} = ${opp.secondPrice} ${opp.thirdToken}`,
            price3: `1 ${opp.secondToken} = ${opp.convertPrice} ${opp.thirdToken}`,
            path: `${opp.firstPair.pair} -> ${opp.secondPair.pair} -> ${opp.thirdPair.pair}`,
          });
        }
      }
      setArbitrageOpportunities(opportunities);
      setLoading(false);
    }
  }, [pairsData]);

  const columns = [
    {
      title: "Arbitrage Token",
      dataIndex: "token",
      key: "token",
    },
    {
      title: "Loan Token",
      dataIndex: "secondtoken",
      key: "secondtoken",
    },
    {
      title: "Arbitrage bundle",
      dataIndex: "path",
      key: "path",
    },
    {
      title: "First Pair Price",
      dataIndex: "price1",
      key: "price1",
    },
    {
      title: "Second Pair Price",
      dataIndex: "price2",
      key: "price2",
    },
    {
      title: "Conversion Price",
      dataIndex: "price3",
      key: "price3",
    },
  ];

  return (
    <div className="table-container">
      <Table
        columns={columns}
        dataSource={arbitrageOpportunities}
        loading={loading}
        pagination={{
          pageSize: 9,
          hideOnSinglePage: true,
          showSizeChanger: false,
        }}
        className="centered-pagination"
      />
    </div>
  );
};

export default ArbitrageOpportunities;
