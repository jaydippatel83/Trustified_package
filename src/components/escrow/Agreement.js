import { ethers } from 'ethers';
import React from 'react'
import { AgreementAddress, AgreementContractAbi } from '../config';

export default function Agreement(props) {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();

  const agreementContract = new ethers.Contract(
    AgreementAddress,
    AgreementContractAbi,
    signer
  );

  let txn; 
  try {
    const formattedPrice = ethers.utils.parseEther(props.price.toString());
    txn = await agreementContract.agreementCreate(
      props.buyerAddress,
      props.sellerAddress,
      formattedPrice,
      props.stakePercentBuyer.toString(),
      props.stakePercentSeller.toString(),
      props.title,
      props.description
    );
    await txn.wait(); 
    return txn;
  } catch (err) { 
    console.log(err); 
  }
}
