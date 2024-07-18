import { useEffect, useState, createContext } from "react";
import { useRouter } from "next/navigation";
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
  const [checkVote, setCheckVote] = useState(false);

  const connectWallet = async () =>
    (await checkConnection()) && setPublicKey(await retrievePublicKey());

  const callContract = (funcName, values = null) =>
    callContractFn(funcName, values, publicKey);

  const registerCandidate = async (updateCandidate, image, pdf) => {
    const { _name: name } = updateCandidate;
    const jsonData = { ...updateCandidate, image, pdf };
    if (!validObjectCheck(jsonData)) return notifyError("Data Is Missing");
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
        publicKey,
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

    if (!validObjectCheck(jsonData)) return notifyError("Data Is Missing");
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
      const ownerPk = await stringToAddress();
      const pk = await stringToAddress(address);

      await callContract(ContractFunctions.approveCandidate, [
        pk,
        stringToScValString(message),
        ownerPk,
      ]);

      setLoader(false);
      notifySuccess("Successfully approve Candidate");
      router.push("/approved-candidates");
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

    const ownerPk = await stringToAddress();
    const pk = await stringToAddress(address);

    try {
      await callContract(ContractFunctions.approveVoter, [
        pk,
        stringToScValString(message),
        ownerPk,
      ]);

      setLoader(false);
      notifySuccess("Successfully approved voter");
      router.push("/approved-voters");
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
      const ownerPk = await stringToAddress();
      const pk = await stringToAddress(address);

      await callContract(ContractFunctions.rejectCandidate, [
        pk,
        stringToScValString(message),
        ownerPk,
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
    if (!address || !message) return notifyError("Data Is Missing");
    notifySuccess("kindly wait, approving voter...");
    setLoader(true);

    try {
      const ownerPk = await stringToAddress();
      const pk = await stringToAddress(address);

      await callContract(ContractFunctions.rejectVoter, [
        pk,
        stringToScValString(message),
        ownerPk,
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
    if (!validObjectCheck(voteTime)) return notifyError("Data Is Missing");

    notifySuccess("kindly wait...");
    setLoader(true);

    const { startTime, endTime } = voteTime;

    const startDate = new Date(startTime);
    const endDate = new Date(endTime);

    const startTimeMilliseconds = startDate.getTime();
    const endTimeMilliseconds = endDate.getTime();

    const startTimeSeconds = Math.floor(startTimeMilliseconds / 1000);
    const endTimeSeconds = Math.floor(endTimeMilliseconds / 1000);

    try {
      const pk = await stringToAddress();
      await callContract(ContractFunctions.setVotingPeriod, [
        numberToU64(startTimeSeconds),
        numberToU64(endTimeSeconds),
        pk,
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
    if (!validObjectCheck(jsonData)) return notifyError("Data Is Missing");
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

  const updateCandidate = async (candidate, image, pdf) => {
    const { _name: name } = candidate;
    const jsonData = { ...candidate, image, pdf };
    if (!validObjectCheck(jsonData)) return notifyError("Data Is Missing");
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

    const newPk = await stringToAddress(newOwner);
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
      await callContract(ContractFunctions.resetContract, pk);

      setLoader(false);
      notifySuccess("Successfully RESET");
      router.push("/");
    } catch (error) {
      setLoader(false);
      notifyError("RESET failed, kindly connect the Owner");
      console.log(error);
    }
  };

  const giveVote = async (candidateAddress) => {
    if (!candidateAddress) return notifyError("Data Is Missing");
    notifySuccess("kindly wait...");
    setLoader(true);

    try {
      const candidatePk = await stringToAddress(candidateAddress);
      const pk = await stringToAddress();
      await callContract(ContractFunctions.giveVote, [candidatePk, pk]);
      setCheckVote(true);
      setLoader(false);
      notifySuccess("Successfully voted");
      router.push("/approved-candidates");
    } catch (error) {
      setLoader(false);
      notifyError("vote failed, kindly connect to Owner");
      console.log(error);
    }
  };

  const initContractData = async () => {
    try {
      const data = await callContract(ContractFunctions.getVotingTime);
      if (!data) return;
      const [startDateN, endDateN] = scValToNative(data);

      const timestamp1 = Number(startDateN);
      const timestamp2 = Number(endDateN);

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
        startDateN: timestamp1,
        endDateN: timestamp2,
      };

      return item;
    } catch (error) {
      if (error instanceof TypeError) return;
      notifyError("Something went wrong");
      console.log(error);
    }
  };

  const getRegisteredCandidates = async () => {
    try {
      const data = await callContract(
        ContractFunctions.getAllRegisteredCandidates
      );
      const candidates = await scValToNative(data);

      return await Promise.all(
        candidates.map(
          async ({
            ipfs,
            candidate_address,
            register_id,
            vote_count,
            ...rest
          }) => {
            const { data } = await axios.get(ipfs);
            return {
              ...data,
              ...rest,
              address: candidate_address,
              registerId: Number(register_id),
              voteCount: Number(vote_count),
              ipfs,
            };
          }
        )
      );
    } catch (error) {
      if (error instanceof TypeError) return;
      notifyError("Something went wrong");
      console.log(error);
    }
  };

  const getRegisteredVoters = async () => {
    try {
      const data = await callContract(ContractFunctions.getAllRegisteredVoters);
      const voters = await scValToNative(data);
      return await Promise.all(
        voters.map(
          async ({ ipfs, voter_address, register_id, has_voted, ...rest }) => {
            const { data } = await axios.get(ipfs);
            return {
              ...data,
              ...rest,
              ipfs,
              address: voter_address,
              registerId: Number(register_id),
              hasVoted: has_voted,
            };
          }
        )
      );
    } catch (error) {
      if (error instanceof TypeError) return;
      notifyError("Something went wrong");
      console.log(error);
    }
  };

  const votedVoters = async () => {
    try {
      const data = await callContract(ContractFunctions.getAllVotersWhoVoted);
      const voters = await scValToNative(data);

      const items = await Promise.all(
        voters.map(
          async ({ ipfs, voter_address, register_id, has_voted, ...rest }) => {
            const { data } = await axios.get(ipfs);
            return {
              ...data,
              ...rest,
              ipfs,
              address: voter_address,
              registerId: Number(register_id),
              hasVoted: has_voted,
            };
          }
        )
      );

      items?.filter((user) =>
        user.address === publicKey ? setCheckVote(true) : setCheckVote(false)
      );

      return items;
    } catch (error) {
      if (error instanceof TypeError) return;
      notifyError("Something went wrong");
      console.log(error);
    }
  };

  const highestVotedCandidate = async () => {
    try {
      const pk = await stringToAddress();
      const contractData = await callContract(
        ContractFunctions.getCurrentVotingStatus,
        pk
      );
      if (!contractData) return;
      const { candidate_address, register_id, vote_count, ...rest } =
        await scValToNative(contractData);
      if (rest.ipfs === "NotFound") return;

      const { data } = await axios.get(rest.ipfs);

      return {
        address: candidate_address,
        registerId: Number(register_id),
        voteCount: Number(vote_count),
        ...rest,
        ...data,
      };
    } catch (error) {
      notifyError("Something went wrong");
      console.log(error);
    }
  };

  const getWinner = async () => {
    try {
      const data = await callContract(ContractFunctions.getWinningCandidate);
      const candidates = await scValToNative(data);

      return candidates.map(
        async ({ voter_address, register_id, has_voted, ...rest }) => {
          const { data } = await axios.get(rest.ipfs);
          return {
            ...data,
            ...rest,
            voterAddress: voter_address,
            registerId: Number(register_id),
            hasVoted: has_voted,
          };
        }
      );
    } catch (error) {
      notifyError("Something weng wrong ");
      console.log(error);
    }
  };

  const getSingleVoter = async (address) => {
    try {
      if (!address) return notifyError("Kindly provide address");
      const pk = await stringToAddress(address);
      const contractData = await callContract(ContractFunctions.getVoter, pk);
      const { voter_address, register_id, has_voted, ...rest } =
        scValToNative(contractData);
      if (rest.ipfs === "NotFound")
        return {
          address: "",
        };
      const { data } = await axios.get(rest.ipfs);

      return {
        address: voter_address,
        registerId: Number(register_id),
        hasVoted: has_voted,
        ...rest,
        ...data,
      };
    } catch (error) {
      if (error instanceof TypeError) return;
      notifyError("Failed to get data, kindly reload page");
      console.log(error);
    }
  };

  const getSingleCandidate = async (address) => {
    try {
      if (!address) return notifyError("Kindly provide address");

      const pk = await stringToAddress(address);

      const contractData = await callContract(
        ContractFunctions.getCandidate,
        pk
      );

      const { candidate_address, register_id, vote_count, ...rest } =
        await scValToNative(contractData);
      if (rest.ipfs === "NotFound")
        return {
          address: "",
        };

      const { data } = await axios.get(rest.ipfs);
      return {
        address: candidate_address,
        registerId: Number(register_id),
        voteCount: Number(vote_count),
        ...rest,
        ...data,
      };
    } catch (error) {
      if (error instanceof TypeError) return;
      notifyError("Failed to get data, kindly reload page");
      console.log(error);
    }
  };

  return (
    <VotingDappContext.Provider
      value={{
        publicKey,
        checkVote,
        loader,
        setLoader,
        getSingleCandidate,
        getSingleVoter,
        getRegisteredCandidates,
        getRegisteredVoters,
        highestVotedCandidate,
        initContractData,
        votedVoters,
        getWinner,
        connectWallet,
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
        rejectVoter,
      }}
    >
      {children}
    </VotingDappContext.Provider>
  );
};