"use client";

import { useEffect, useState } from "react";
import { Preloader, Footer, Header, Team } from "@/components";
import Loader from "@/components/Global/Loader";
import { useContract } from "@/hooks/use-contract";

export default function AllCandidatesPage() {
  const [candidates, setCandidates] = useState();
  const [votingTime, setVotingTime] = useState();
  const [currentVotingTime, setCurrentVotingTime] = useState();
  const [user, setUser] = useState();
  const [loading, setLoading] = useState(false);

  const {
    loader,
    getRegisteredCandidates,
    giveVote,
    checkVote,
    initContractData,
    getSingleVoter,
    publicKey,
  } = useContract();

  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      const items = await getRegisteredCandidates();
      setCandidates(items);

      const votingStatus = await initContractData();
      setVotingTime(votingStatus);

      const nowInMilliseconds = Date.now();
      const nowInSeconds = Math.floor(nowInMilliseconds / 1000);
      setCurrentVotingTime(nowInSeconds);

      if (!publicKey) return;
      const user = await getSingleVoter(publicKey);
      setUser(user);
    };

    fetchData().finally(() => setLoading(false));
  }, []);
  return (
    <>
      {loading && <Preloader />}
      <Header />
      <Team
        candidates={candidates}
        path={"candidate"}
        giveVote={giveVote}
        checkVote={checkVote}
        votingTime={votingTime}
        currentVotingTime={currentVotingTime}
        user={user}
      />
      {loader && <Loader />}
      <Footer />
    </>
  );
}
