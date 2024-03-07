import React from "react";
import { Link } from "react-router-dom";
import "./style.css";
import {
  useConnectModal,
  useAccountModal,
  useChainModal,
} from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { Button } from "antd";

export const Header = () => {
  const { isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { openAccountModal } = useAccountModal();
  const { openChainModal } = useChainModal();

  return (
    <div className="header">
      <div className="textblock">
        <Link to="/" className="text">
          HomePage
        </Link>
        <Link to="/" className="text">
          Pairs
        </Link>
        <Link to="/flash-loan" className="text">
          Flash Loan Arbitrage
        </Link>
        <Link to="/opportunities" className="text">
          Arbitrage Opportunities
        </Link>
        <Link to="/calculator" className="text">
          Arbitrage Calculator
        </Link>
        <div>
          {isConnected ? (
            <>
              <Button
                style={{
                  margin: "1vh 1vw",
                  width: "7vw",
                  fontSize: "0.85vw",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
                onClick={openAccountModal}
              >
                Account
              </Button>
              <Button
                style={{
                  margin: "1vh 1vw",
                  width: "7vw",
                  fontSize: "0.85vw",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
                onClick={openChainModal}
              >
                Network
              </Button>
            </>
          ) : (
            <Button
              style={{
                margin: "1vh 1vw",
                width: "7vw",
                fontSize: "0.85vw",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
              onClick={openConnectModal}
            >
              Connect Wallet
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
