"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Preloader, Footer, Header, TeamDetail } from "@/components";
import Loader from "@/components/Global/Loader";

import { useContract } from "@/hooks/use-contract";

export default function CandidateDetailsPage() {
  const searchParams = useSearchParams();
  const [candidate, setCandidate] = useState();
  const [user, setUser] = useState();
  const [votingTime, setVotingTime] = useState();
  const [loading, setLoading] = useState(false);
  const [currentVotingTime, setCurrentVotingTime] = useState();

  const {
    loader,
    publicKey,
    getSingleCandidate,
    approveCandidate: approveCandidateFn,
    giveVote,

    checkVote,
    rejectCandidate: rejectCandidateFn,
    getSingleVoter,
    initContractData,
  } = useContract();

  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      const items = await getSingleCandidate(searchParams.get("address"));
      setCandidate(items);

      const votingStatus = await initContractData();
      setVotingTime(votingStatus);

      const nowInSeconds = Math.floor(Date.now() / 1000);
      setCurrentVotingTime(nowInSeconds);

      if (!publicKey) return;
      const user = await getSingleVoter(publicKey);
      setUser(user);
    };

    fetchData().finally(() => setLoading(false));
  }, []);

  const approveCandidate = async (address, message) => {
    await approveCandidateFn(address, message);
  };

  const rejectCandidate = async (address, message) => {
    await rejectCandidateFn(address, message);
  };

  return (
    <>
      {loading && <Preloader />}
      <Header />
      <TeamDetail
        candidate={candidate}
        path={"candidate"}
        handleClickApprove={approveCandidate}
        handleClickReject={rejectCandidate}
        giveVote={giveVote}
        checkVote={checkVote}
        user={user}
        votingTime={votingTime}
        currentVotingTime={currentVotingTime}
      />
      {loader && <Loader />}
      <Footer />
    </>
  );
}
