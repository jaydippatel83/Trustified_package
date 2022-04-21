import { ethers } from 'ethers';
import React,{useState,useCallback,useEffect} from 'react'
import { AgreementContractAbi, AgreementAddress } from "../config";

export default  function AgreementList(props) {
    const [contractAddressList, setContractAddressList] = useState(null); 
  
    // Get data for all the user's contracts
    const getAllContracts = useCallback(
      async (account) => { 
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const agreementContract = new ethers.Contract(
          AgreementAddress,
          AgreementContractAbi,
          signer
        );
        let agreAddress = await agreementContract.getAgreementByParties(
          account
        );
  
        setContractAddressList(agreAddress.slice().reverse());
  
        // Set up event listener for factory contract
        agreementContract.on("CreateAgreement", (buyer, seller, price, address,title, description) => {
          if (
            props.currentAccount.toLowerCase() === buyer.toLowerCase() ||
            props.currentAccount.toLowerCase() === seller.toLowerCase()
          ) { 
            setContractAddressList((prevState) => { 
              if (!prevState.includes(address)) return [address, ...prevState];
              return prevState;
            });
          }
        }); 
      },
      [props.currentAccount]
    ); 
    
    useEffect(() => {
      getAllContracts(props.currentAccount);
    }, [props.currentAccount, getAllContracts]);

    return contractAddressList;
}  