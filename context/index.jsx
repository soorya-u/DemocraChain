import { useEffect, useState, createContext } from "react";
import { useRouter } from "next/router";
import axios from "axios";

import { scValToNative } from "@stellar/stellar-sdk";

import { headers } from "@/constants/headers";
import { ContractFunctions } from "@/constants/contract";
import {
  numberToU64,
  stringToScValString,
  callContract as callContractFn,
  stringToAddress,
} from "@/lib/stellar";
import { retrievePublicKey, checkConnection } from "@/lib/freighter";
import { notifyError, notifySuccess } from "@/lib/toast";
import { validObjectCheck } from "@/utils";

export const VotingDappContext = createContext();

export const VotingDappProvider = ({ children }) => {
  const router = useRouter();
  const [loader, setLoader] = useState(false);
  const [publicKey, setPublicKey] = useState("");
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [checkVote, setCheckVote] = useState(false);

  useEffect(() => publicKey !== "" && setIsWalletConnected(true), [publicKey]);

  const connectWallet = async () =>
    (await checkConnection()) && setPublicKey(await retrievePublicKey());

  const callContract = (funcName, values = null) =>
    callContractFn(funcName, values, isWalletConnected, publicKey);

  const registerCandidate = async (updateCandidate, image, pdf) => {
    const { _name: name } = updateCandidate;
    const jsonData = { ...updateCandidate, image, pdf };
    if (validObjectCheck(jsonData)) return notifyError("Data Is Missing");
    notifySuccess("Registering Candidate, kindly wait...");
    setLoader(true);

    const data = JSON.stringify(jsonData);

    try {
      const response = await axios({
        method: "POST",
        url: "https://api.pinata.cloud/pinning/pinJSONToIPFS",
        data: data,
        headers,
      });

      const url = `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;

      const publicKey = await stringToAddress();
      await callContract(ContractFunctions.registerCandidate, [
        stringToScValString(name),
        stringToScValString(url),
        publicKey.toScVal(),
      ]);

      notifySuccess("Successfully Registered Candidate");
      setLoader(false);
      router.push("/all-candidates");
    } catch (error) {
      setLoader(false);
      notifyError("Registration failed, Kindly Connect to the Owner");
      console.log(error);
    }
  };

  const registerVoter = async (updateVoter, image, pdf) => {
    const { _name: name } = updateVoter;
    const jsonData = { ...updateVoter, image, pdf };

    if (validObjectCheck(jsonData)) return notifyError("Data Is Missing");
    notifySuccess("Registering Voter, kindly wait...");
    setLoader(true);

    const data = JSON.stringify(jsonData);

    try {
      const response = await axios({
        method: "POST",
        url: "https://api.pinata.cloud/pinning/pinJSONToIPFS",
        data: data,
        headers,
      });

      const url = `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;

      const publicKey = await stringToAddress();
      await callContract(ContractFunctions.registerVoter, [
        stringToScValString(name),
        stringToScValString(url),
        publicKey,
      ]);

      notifySuccess("Successfully Registered Voters");
      setLoader(false);
      router.push("/all-voters");
    } catch (error) {
      setLoader(false);
      notifyError("Registration failed, kindly connect to the Owner");
      console.log(error);
    }
  };

  const approveCandidate = async (address, message) => {
    if (!address || !message) return notifyError("Data Is Missing");
    notifySuccess("kindly wait, approving candidate...");
    setLoader(true);

    try {
      const pk = await stringToAddress(address);

      await callContract(ContractFunctions.approveCandidate, [
        pk,
        stringToScValString(message),
      ]);

      setLoader(false);
      notifySuccess("Successfully approve Candidate");
      router.push("/approve-candidates");
    } catch (error) {
      setLoader(false);
      notifyError("approve failed, kindly connect to the Owner");
      console.log(error);
    }
  };

  const approveVoter = async (address, message) => {
    if (!address || !message) return notifyError("Data Is Missing");
    notifySuccess("kindly wait, approving voter...");
    setLoader(true);

    const pk = await stringToAddress(address);

    try {
      await callContract(ContractFunctions.approveVoter, [
        pk,
        stringToScValString(message),
      ]);

      setLoader(false);
      notifySuccess("Successfully approved voter");
      router.push("/approve-voters");
    } catch (error) {
      setLoader(false);
      notifyError("approving failed, kindly connect to the Owner");
      console.log(error);
    }
  };

  const rejectCandidate = async (address, message) => {
    if (!address || !message) return notifyError("Data Is Missing");
    notifySuccess("kindly wait, approving candidate...");
    setLoader(true);

    try {
      const pk = await stringToAddress(address);

      await callContract(ContractFunctions.rejectCandidate, [
        pk,
        stringToScValString(message),
      ]);

      setLoader(false);
      notifySuccess(" Candidate Rejected");
      router.push("/all-candidates");
    } catch (error) {
      setLoader(false);
      notifyError("approve failed, kindly connect to the Owner");
      console.log(error);
    }
  };

  const rejectVoter = async (address, message) => {
    console.log(address, message);
    if (!address || !message) return notifyError("Data Is Missing");
    notifySuccess("kindly wait, approving voter...");
    setLoader(true);

    try {
      const pk = await stringToAddress(address);

      await callContract(ContractFunctions.rejectVoter, [
        pk,
        stringToScValString(message),
      ]);

      setLoader(false);
      notifySuccess("Successfully Rejected");
      router.push("/all-voters");
    } catch (error) {
      setLoader(false);
      notifyError("approving failed, kindly connect to the Owner");
      console.log(error);
    }
  };

  const setVotingPeriod = async (voteTime) => {
    if (validObjectCheck(voteTime)) return notifyError("Data Is Missing");

    notifySuccess("kindly wait...");
    setLoader(true);

    const { startTime, endTime } = voteTime;

    const startTimeMilliseconds = new Date(startTime).getTime();
    const endTimeMilliseconds = new Date(endTime).getTime();

    const startTimeSeconds = Math.floor(startTimeMilliseconds / 1000);
    const endTimeSeconds = Math.floor(endTimeMilliseconds / 1000);

    try {
      await callContract(ContractFunctions.setVotingPeriod, [
        numberToU64(startTimeSeconds),
        numberToU64(endTimeSeconds),
      ]);

      setLoader(false);
      notifySuccess("Successfully set voting period ");
      router.push("/");
    } catch (error) {
      setLoader(false);
      notifyError("set voting period failed, kindly connect to Owner");
      console.log(error);
    }
  };

  const updateVoter = async (updateVoter, image, pdf) => {
    const { _name: name } = updateVoter;
    const jsonData = { ...updateVoter, image, pdf };
    if (validObjectCheck(jsonData)) return notifyError("Data Is Missing");
    notifySuccess("Updating Voter, kindly wait...");
    setLoader(true);

    const data = JSON.stringify(jsonData);

    try {
      const response = await axios({
        method: "POST",
        url: "https://api.pinata.cloud/pinning/pinJSONToIPFS",
        data,
        headers,
      });

      const url = `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;

      const pk = await stringToAddress();
      await callContract(ContractFunctions.updateVoter, [
        stringToScValString(name),
        stringToScValString(url),
        pk,
      ]);

      notifySuccess("Successfully updated voter");
      setLoader(false);
      router.push("/all-voters");
    } catch (error) {
      setLoader(false);
      notifyError("Update failed, kindly connect to Owner");
      console.log(error);
    }
  };

  const updateCandidate = async (updateCandidate, image, pdf) => {
    const { _name: name } = updateCandidate;
    const jsonData = { ...updateCandidate, image, pdf };
    if (validObjectCheck(jsonData)) return notifyError("Data Is Missing");
    notifySuccess("Updating Candidate, kindly wait...");
    setLoader(true);

    const data = JSON.stringify(jsonData);

    try {
      const response = await axios({
        method: "POST",
        url: "https://api.pinata.cloud/pinning/pinJSONToIPFS",
        data,
        headers,
      });

      const url = `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;

      const pk = await stringToAddress();
      await callContract(ContractFunctions.updateCandidate, [
        stringToScValString(name),
        stringToScValString(url),
        pk,
      ]);

      notifySuccess("Successfully Updated Candidate");
      setLoader(false);
      router.push("/all-candidates");
    } catch (error) {
      setLoader(false);
      notifyError("Update failed, kindly connect to Owner");
      console.log(error);
    }
  };

  const changeOwner = async (newOwner) => {
    if (!newOwner) return notifyError("Data Is Missing");
    notifySuccess("kindly wait...");
    setLoader(true);

    const newPk = await stringToAddress(newOwer);
    const pk = await stringToAddress();

    try {
      await callContract(ContractFunctions.changeOwner, [newPk, pk]);

      setLoader(false);
      notifySuccess("Successfully updated ");
      router.push("/");
    } catch (error) {
      setLoader(false);
      notifyError("updated failed, kindly connect to Owner");
      console.log(error);
    }
  };

  const resetContract = async () => {
    notifySuccess("kindly wait...");
    setLoader(true);

    try {
      const pk = await stringToAddress();
      await callContract("reset_contract", pk);

      setLoader(false);
      notifySuccess("Successfully RESET");
      router.push("/");
    } catch (error) {
      setLoader(false);
      notifyError("RESET failed, kindly connect to ellection commission");
      console.log(error.message);
    }
  };

  const giveVote = async (candidateAddress) => {
    if (!candidateAddress) return notifyError("Data Is Missing");
    notifySuccess("kindly wait...");
    setLoader(true);

    try {
      const candidatePk = await stringToAddress(candidateAddress);
      const pk = stringToAddress();
      await callContract(ContractFunctions.giveVote, [candidatePk, pk]);

      setLoader(false);
      notifySuccess("Successfully voted");
      router.push("/approve-candidates");
    } catch (error) {
      setLoader(false);
      notifySuccess("vote failed, kindly connect to Owner");
      console.log(error);
    }
  };

  // Continue HERE

  const initContractData = async () => {
    try {
      if (isWalletConnected) {
        const [startDateN, endDateN] = await callContract("get_voting_time");

        const timestamp1 = startDateN;
        const timestamp2 = endDateN;

        const date1 = new Date(timestamp1 * 1000);
        const date2 = new Date(timestamp2 * 1000);

        const options = {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        };

        const item = {
          startDate: date1.toLocaleDateString("en-US", options),
          endDate: date2.toLocaleDateString("en-US", options),
          startDateN: startDateN.toNumber(),
          endDateN: endDateN.toNumber(),
        };

        return item;
      }
    } catch (error) {
      notifyError("Something weng wrong ");
      console.log(error);
    }
  };

  const getRegisteredCandidate = async () => {
    try {
      if (isWalletConnected) {
        const candidates = await callContract("get_all_registered_candidates");
        const items = await Promise.all(
          await scValToNative(candidates).map(
            async ({
              ipfs,
              candidate_address,
              registerId,
              status,
              voteCount,
              message,
            }) => {
              const {
                data: {
                  _name,
                  _nominationForm,
                  _affidavit,
                  _criminalAntecedents,
                  _assetsAndLiabilities,
                  _educationalQualifications,
                  _electoralRollEntry,
                  _securityDeposit,
                  _partyAffiliation,
                  _oathOrAffirmation,
                  _photographs,
                  _proofOfAge,
                  _proofOfAddress,
                  _panCardDetails,
                  _voterIdCardDetails,
                  image,
                  pdf,
                },
              } = await axios.get(ipfs, {});

              return {
                address: candidate_address,
                registerId: registerId?.toNumber(),
                status,
                voteCount: voteCount?.toNumber(),
                ipfs,
                message,
                _name,
                _nominationForm,
                _affidavit,
                _criminalAntecedents,
                _assetsAndLiabilities,
                _educationalQualifications,
                _electoralRollEntry,
                _securityDeposit,
                _partyAffiliation,
                _oathOrAffirmation,
                _photographs,
                _proofOfAge,
                _proofOfAddress,
                _panCardDetails,
                _voterIdCardDetails,
                image,
                pdf,
              };
            }
          )
        );

        return items;
      }
    } catch (error) {
      notifyError("Something weng wrong ");
      console.log(error);
    }
  };

  const getRegisteredVoters = async () => {
    try {
      if (isWalletConnected) {
        const voters = await callContract("get_all_registered_voters");
        console.log(voters);

        const items = await Promise.all(
          scValToNative(voters).map(
            async ({
              ipfs,
              voterAddress,
              registerId,
              status,
              hasVoted,
              message,
            }) => {
              const {
                data: {
                  _name,
                  _voterAddress,
                  _photograph,
                  _parentOrSpouseName,
                  _gender,
                  _dobOrAge,
                  _addressDetails,
                  _epicNumber,
                  _partNumberAndName,
                  _assemblyConstituencyNumberAndName,
                  _issuingAuthoritySignature,
                  _hologramAndBarcode,
                  image,
                  pdf,
                },
              } = await axios.get(ipfs, {});

              return {
                address: voterAddress,
                registerId: registerId?.toNumber(),
                status,
                hasVoted,
                message,
                ipfs,
                _name,
                _voterAddress,
                _photograph,
                _parentOrSpouseName,
                _gender,
                _dobOrAge,
                _addressDetails,
                _epicNumber,
                _partNumberAndName,
                _assemblyConstituencyNumberAndName,
                _issuingAuthoritySignature,
                _hologramAndBarcode,
                image,
                pdf,
              };
            }
          )
        );

        return items;
      }
    } catch (error) {
      notifyError("Something weng wrong ");
      console.log(error);
    }
  };

  const votedVoters = async () => {
    try {
      if (isWalletConnected) {
        const voters = callContract("get_all_voters_who_voted");
        console.log(voters);

        const items = await Promise.all(
          voters.map(
            async ({
              ipfs,
              voterAddress,
              registerId,
              status,
              hasVoted,
              message,
            }) => {
              const {
                data: {
                  _name,
                  _voterAddress,
                  _photograph,
                  _parentOrSpouseName,
                  _gender,
                  _dobOrAge,
                  _addressDetails,
                  _epicNumber,
                  _partNumberAndName,
                  _assemblyConstituencyNumberAndName,
                  _issuingAuthoritySignature,
                  _hologramAndBarcode,
                  image,
                  pdf,
                },
              } = await axios.get(ipfs, {});

              return {
                address: voterAddress,
                registerId: registerId?.toNumber(),
                status,
                hasVoted,
                message,
                ipfs,
                _name,
                _voterAddress,
                _photograph,
                _parentOrSpouseName,
                _gender,
                _dobOrAge,
                _addressDetails,
                _epicNumber,
                _partNumberAndName,
                _assemblyConstituencyNumberAndName,
                _issuingAuthoritySignature,
                _hologramAndBarcode,
                image,
                pdf,
              };
            }
          )
        );

        items?.filter((user) =>
          user.address.toLowerCase() === publicKey
            ? setCheckVote(true)
            : setCheckVote(false)
        );

        return items;
      }
    } catch (error) {
      notifyError("Something weng wrong ");
      console.log(error);
    }
  };

  const highestVotedCandidate = async () => {
    try {
      if (isWalletConnected) {
        const candidate = await callContract("get_current_voting_status");

        console.log(candidate);

        if (candidates?.candidateAddress.toLowerCase() === zeroAddress) return;

        const {
          data: {
            _name,
            _nominationForm,
            _affidavit,
            _criminalAntecedents,
            _assetsAndLiabilities,
            _educationalQualifications,
            _electoralRollEntry,
            _securityDeposit,
            _partyAffiliation,
            _oathOrAffirmation,
            _photographs,
            _proofOfAge,
            _proofOfAddress,
            _panCardDetails,
            _voterIdCardDetails,
            image,
            pdf,
          },
        } = await axios.get(candidates?.ipfs);

        const candidateData = {
          address: candidates?.candidateAddress,
          registerId: candidates?.registerId?.toNumber(),
          status: candidates?.status,
          voteCount: candidates?.voteCount?.toNumber(),
          ipfs: candidates?.ipfs,
          message: candidates?.message,
          _name,
          _nominationForm,
          _affidavit,
          _criminalAntecedents,
          _assetsAndLiabilities,
          _educationalQualifications,
          _electoralRollEntry,
          _securityDeposit,
          _partyAffiliation,
          _oathOrAffirmation,
          _photographs,
          _proofOfAge,
          _proofOfAddress,
          _panCardDetails,
          _voterIdCardDetails,
          image,
          pdf,
        };

        return candidateData;
      }
    } catch (error) {
      notifyError("Something went wrong");
      console.log(error);
    }
  };

  const getWinner = async () => {
    try {
      if (isWalletConnected) {
        const candidate = await callContract("get_winning_candidate");
        console.log(candidate);

        const items = await Promise.all(
          candidate.map(
            async ({
              ipfs,
              voterAddress,
              registerId,
              status,
              hasVoted,
              message,
            }) => {
              const {
                data: {
                  _name,
                  _voterAddress,
                  _photograph,
                  _parentOrSpouseName,
                  _gender,
                  _dobOrAge,
                  _addressDetails,
                  _epicNumber,
                  _partNumberAndName,
                  _assemblyConstituencyNumberAndName,
                  _issuingAuthoritySignature,
                  _hologramAndBarcode,
                  image,
                  pdf,
                },
              } = await axios.get(ipfs, {});

              return {
                voterAddress,
                registerId: registerId?.toNumber(),
                status,
                hasVoted,
                message,
                ipfs,
                _name,
                _voterAddress,
                _photograph,
                _parentOrSpouseName,
                _gender,
                _dobOrAge,
                _addressDetails,
                _epicNumber,
                _partNumberAndName,
                _assemblyConstituencyNumberAndName,
                _issuingAuthoritySignature,
                _hologramAndBarcode,
                image,
                pdf,
              };
            }
          )
        );

        return items;
      }
    } catch (error) {
      notifyError("Something weng wrong ");
      console.log(error);
    }
  };

  const getSingleVoter = async (address) => {
    try {
      if (!address) return notifyError("Kindly provide address");
      const pka = new Address(address);
      const data = await callContract("get_voter", pka.toScVal());
      const {
        data: {
          _name,
          _voterAddress,
          _photograph,
          _parentOrSpouseName,
          _gender,
          _dobOrAge,
          _addressDetails,
          _epicNumber,
          _partNumberAndName,
          _assemblyConstituencyNumberAndName,
          _issuingAuthoritySignature,
          _hologramAndBarcode,
          image,
          pdf,
        },
      } = await axios.get(data?.ipfs, {});

      const voter = {
        address: data?.voterAddress,
        registerId: data?.registerId.toNumber(),
        ipfs: data?.ipfs,
        status: data?.status,
        hasVoted: data?.hasVoted,
        message: data?.message,
        _name,
        _voterAddress,
        _photograph,
        _parentOrSpouseName,
        _gender,
        _dobOrAge,
        _addressDetails,
        _epicNumber,
        _partNumberAndName,
        _assemblyConstituencyNumberAndName,
        _issuingAuthoritySignature,
        _hologramAndBarcode,
        image,
        pdf,
      };

      return voter;
    } catch (error) {
      notifySuccess("Failed to get data, kindly reload page");
      console.log(error.message);
    }
  };

  const getSingleCandidate = async (address) => {
    try {
      if (!address) return notifyError("Kindly provide address");

      const pk = await retrievePublicKey();
      const pka = new Address(pk);

      const data = await scValToNative(
        await callContract("get_candidate", pka.toScVal())
      );

      const {
        data: {
          _name,
          _nominationForm,
          _affidavit,
          _criminalAntecedents,
          _assetsAndLiabilities,
          _educationalQualifications,
          _electoralRollEntry,
          _securityDeposit,
          _partyAffiliation,
          _oathOrAffirmation,
          _photographs,
          _proofOfAge,
          _proofOfAddress,
          _panCardDetails,
          _voterIdCardDetails,
          image,
          pdf,
        },
      } = await axios.get(data?.ipfs, {});
      console.log(_name);
      const candidate = {
        address: data?.candidateAddress,
        registerId: data?.registerId.toNumber(),
        ipfs: data?.ipfs,
        status: data?.status,
        voteCount: data?.voteCount.toNumber(),
        message: data?.message,
        _name,
        _nominationForm,
        _affidavit,
        _criminalAntecedents,
        _assetsAndLiabilities,
        _educationalQualifications,
        _electoralRollEntry,
        _securityDeposit,
        _partyAffiliation,
        _oathOrAffirmation,
        _photographs,
        _proofOfAge,
        _proofOfAddress,
        _panCardDetails,
        _voterIdCardDetails,
        image,
        pdf,
      };

      return candidate;
    } catch (error) {
      notifySuccess("Failed to get data, kindly reload page");
      console.log(error);
    }
  };

  return (
    <VotingDappContext.Provider
      value={{
        loader,
        setLoader,
        getSingleCandidate,
        getSingleVoter,
        getRegisteredCandidate,
        getRegisteredVoters,
        highestVotedCandidate,
        initContractData,
        votedVoters,
        getWinner,
        connectWallet,
        publicKey,
        checkVote,
        registerCandidate,
        registerVoter,
        approveVoter,
        approveCandidate,
        giveVote,
        updateCandidate,
        updateVoter,
        changeOwner,
        resetContract,
        setVotingPeriod,
        rejectCandidate,
        registerVoter,
        rejectVoter,
        retrievePublicKey,
      }}
    >
      {children}
    </VotingDappContext.Provider>
  );
};