import { ethers } from 'ethers';
import React,{useState,useEffect} from 'react'
import { AgreementAbi } from '../config';
import { POLYGON } from "../network/Network";

export default function Stack(props) {
  const [contractState, setContractState] = useState(null);
  const [mineStatus, setMineStatus] = useState(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = React.useState(false);
  const [canloading, setCanLoading] = React.useState(false);

  const isBuyer = contractState
    ? props.currentAccount.toLowerCase() === contractState.buyer.toLowerCase()
    : null;
  const isLocked = contractState
    ? contractState.buyerStake && contractState.sellerStake
    : null;
  const noCancel = contractState
    ? !contractState.buyerCancel && !contractState.sellerCancel
    : null;

  const getStatus = () => {
    if (contractState.active && isLocked) return "Active";
    else if (contractState.active && !isLocked) return "Unlocked";
    else if (contractState.cancelled) return "Cancelled";
    return "Completed";
  };

  const isStaked = () => {
    if (isBuyer && contractState.buyerStake) return true;
    if (!isBuyer && contractState.sellerStake) return true;
    return false;
  };

  const isCancelled = () => {
    if (isBuyer && contractState.buyerCancel) return true;
    if (!isBuyer && contractState.sellerCancel) return true;
    return false;
  };

//   POLYGON.blockExplorerUrls[0]}/address/${contractState.address}

  const btnConfirm = contractState && isBuyer && isLocked && noCancel;
  const btnStake = contractState && !isLocked && !isStaked();
  const btnRevokeStake = contractState && !isLocked && isStaked();
  const btnCancel = contractState && isLocked && !isCancelled();
  const btnRevokeCancel = contractState && isLocked && isCancelled();

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const agreementContract = new ethers.Contract(
    props.contractAddress,
    AgreementAbi,
    signer
  );

  const stake = async () => { 
    let txn;
    try {
      let per;
      let stake = Number(contractState.price);
      if (isBuyer) {
        per = Number(contractState.statePercent);
      } else {
        per = Number(contractState.sellerPercent);
      }
      stake = (stake * per) / 100;
      const formattedPrice = ethers.utils.parseEther(String(stake));
      txn = await agreementContract.stake({ value: formattedPrice });
      await txn.wait(); 
    } catch (err) { 
    }
  };

  const withdrawStake = async () => {
     
    let txn;
    try {
      txn = await agreementContract.revokeStake();
      await txn.wait(); 
    } catch (err) { 
      console.log(err);
    }
  };

  const cancel = async () => { 
    let txn;

    try {
      txn = await agreementContract.cancel();
      await txn.wait(); 
    } catch (err) { 
        console.log(err);
    }
  };

  const revokeCancel = async () => { 
    let txn;

    try {
      txn = await agreementContract.revokeCancellation();
      await txn.wait();  
    } catch (err) { 
      console.log(err);
    }
  };

  const confirm = async () => { 
    let txn;

    try {
      txn = await agreementContract.confirm();
      await txn.wait(); 
    } catch (err) { 
      console.log(err);
    }
  };

  useEffect(() => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const agreementContract = new ethers.Contract(
      props.contractAddress,
      AgreementAbi,
      signer
    );

    const cleanAgreement = (agreementDetails) => {
      let cleanAgreement = {
        active: agreementDetails.active,
        cancelled: agreementDetails.cancelled,
        buyer: agreementDetails.buyer,
        seller: agreementDetails.seller,
        buyerCancel: agreementDetails.buyerCancel,
        sellerCancel: agreementDetails.sellerCancel,
        buyerStake: agreementDetails.buyerStake,
        sellerStake: agreementDetails.sellerStake,
        address: agreementDetails.agreAddress,
        statePercent: agreementDetails.statePercent,
        sellerPercent: agreementDetails.sellerPercent,
        price: ethers.utils.formatEther(agreementDetails.salePrice),
        title: agreementDetails.title,
        description: agreementDetails.description,
      };
      return cleanAgreement;
    };

    const getLatestData = async () => {
      let agreementDetails = await agreementContract.getStatus(); 
      setContractState(cleanAgreement(agreementDetails));
    };

    getLatestData();

    agreementContract.on("AgreementStateChanged", (buyer, seller, state) => {
      setContractState(cleanAgreement(state));
    });
  }, [props.contractAddress]);

  return {
    getStatus,
    isStaked,
    isCancelled,
    stake,
    withdrawStake,
    revokeCancel,
    cancel,
    confirm,
    contractState,
    cleanAgreement,
  }
} 