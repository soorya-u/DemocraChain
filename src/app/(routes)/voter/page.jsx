"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { notifyError, notifySuccess } from "@/lib/toast";
import { useContract } from "@/hooks/use-contract";
import { Preloader } from "@/components";

import Input from "@/components/Global/Input";
import Upload from "@/components/Global/Upload";
import UploadImg from "@/components/Global/UploadImg";
import Preview from "@/components/Global/Preview";
import PreviewImg from "@/components/Global/PreviewImg";
import Loader from "@/components/Global/Loader";
import PopUp from "@/components/Global/PopUp";

export default function VoterPage() {
  const { loader, setLoader, registerVoter, getSingleVoter, publicKey } =
    useContract();

  const [voter, setVoter] = useState();

  const [pdf, setPdf] = useState(null);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const [updateVoter, setUpdateVoter] = useState({
    _name: "",
    _voterAddress: "",
    _photograph: "",
    _parentOrSpouseName: "",
    _gender: "",
    _dobOrAge: "",
    _addressDetails: "",
    _epicNumber: "",
    _partNumberAndName: "",
    _assemblyConstituencyNumberAndName: "",
    _issuingAuthoritySignature: "",
    _hologramAndBarcode: "",
  });

  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      if (!publicKey) return;
      const items = await getSingleVoter(publicKey);
      setVoter(items);
    };

    fetchData().finally(() => setLoading(false));
  }, []);

  return (
    <>
      {loading && <Preloader />}

      <section className="sign nb4-bg h-full flex items-center relative z-0">
        <div className="animation absolute top-0 left-0 w-full h-full -z-[1]">
          <img
            src="assets/images/star.png"
            alt="vector"
            className="absolute push_animat"
          />
        </div>
        <div className="container ">
          <div className="row items-center justify-center justify-content-xl-start">
            <div className="col-12 col-sm-10 col-md-6">
              <div className="welcome alt-color text-center text-md-start pt-120 pb-120 relative z-0">
                <h1 className="display-one">Welcome Back!</h1>
                {image && <PreviewImg image={image} />}
                {pdf && <Preview pdf={pdf} />}
              </div>
            </div>
            <div className="col-12 col-md-6 col-lg-5 col-xxl-5 offset-xxl-1 text-center xl:ml-auto mx-auto">
              <div className="md:ml-5 2xl:ml-0 pt-120 pb-120">
                <div className="head_part">
                  <Link
                    className="flex justify-center items-start gap-4"
                    href="/"
                  >
                    <img src="/logo.png" className="size-[3.2rem]" alt="logo" />
                    <h1 className="text-[3.5rem] font-tiny5 font-normal">
                      DemocraChain
                    </h1>
                  </Link>
                  <h5 className="mt-5 mt-lg-6">Register as a voter </h5>
                </div>

                {voter && voter.address === "" && (
                  <div
                    autoComplete="off"
                    id="frmContactus"
                    className="contact__form mt-8 mt-lg-10 text-start"
                  >
                    <div className="flex flex-col gap-5 gap-lg-6 ">
                      <Input
                        name={"Name"}
                        placeholder={"Name"}
                        type={"text"}
                        handleClick={(e) =>
                          setUpdateVoter({
                            ...updateVoter,
                            _name: e.target.value,
                          })
                        }
                      />
                      <Input
                        name={"Voter Address"}
                        placeholder={"Voter Address"}
                        type={"text"}
                        handleClick={(e) =>
                          setUpdateVoter({
                            ...updateVoter,
                            _voterAddress: e.target.value,
                          })
                        }
                      />
                      <Input
                        name={"Photograph"}
                        placeholder={"Photograph"}
                        type={"text"}
                        handleClick={(e) =>
                          setUpdateVoter({
                            ...updateVoter,
                            _photograph: e.target.value,
                          })
                        }
                      />
                      <Input
                        name={"Parent Or Spouse Name"}
                        placeholder={"Parent Or Spouse Name"}
                        type={"text"}
                        handleClick={(e) =>
                          setUpdateVoter({
                            ...updateVoter,
                            _parentOrSpouseName: e.target.value,
                          })
                        }
                      />
                      <Input
                        name={"Gender"}
                        placeholder={"Gender"}
                        type={"text"}
                        handleClick={(e) =>
                          setUpdateVoter({
                            ...updateVoter,
                            _gender: e.target.value,
                          })
                        }
                      />
                      <Input
                        name={"DOB Or Age"}
                        placeholder={"Dob Or Age"}
                        type={"text"}
                        handleClick={(e) =>
                          setUpdateVoter({
                            ...updateVoter,
                            _dobOrAge: e.target.value,
                          })
                        }
                      />
                      <Input
                        name={"Address Details"}
                        placeholder={"Address Details"}
                        type={"text"}
                        handleClick={(e) =>
                          setUpdateVoter({
                            ...updateVoter,
                            _addressDetails: e.target.value,
                          })
                        }
                      />
                      <Input
                        name={"Epic Number"}
                        placeholder={"Epic Number"}
                        type={"text"}
                        handleClick={(e) =>
                          setUpdateVoter({
                            ...updateVoter,
                            _epicNumber: e.target.value,
                          })
                        }
                      />
                      <Input
                        name={"Part Number And Name"}
                        placeholder={"Part Number And Name"}
                        type={"text"}
                        handleClick={(e) =>
                          setUpdateVoter({
                            ...updateVoter,
                            _partNumberAndName: e.target.value,
                          })
                        }
                      />
                      <Input
                        name={"Assembly Constituency Number And Name"}
                        placeholder={"Assembly Constituency Number And Name"}
                        type={"text"}
                        handleClick={(e) =>
                          setUpdateVoter({
                            ...updateVoter,
                            _assemblyConstituencyNumberAndName: e.target.value,
                          })
                        }
                      />
                      <Input
                        name={"Issuing Authority ignature"}
                        placeholder={"Issuing Authority Signature"}
                        type={"text"}
                        handleClick={(e) =>
                          setUpdateVoter({
                            ...updateVoter,
                            _issuingAuthoritySignature: e.target.value,
                          })
                        }
                      />
                      <Input
                        name={"Hologram And Barcode"}
                        placeholder={"Hologram And Barcode"}
                        type={"text"}
                        handleClick={(e) =>
                          setUpdateVoter({
                            ...updateVoter,
                            _hologramAndBarcode: e.target.value,
                          })
                        }
                      />
                      <UploadImg
                        setLoader={setLoader}
                        notifySuccess={notifySuccess}
                        notifyError={notifyError}
                        setImage={setImage}
                      />
                      <Upload
                        setLoader={setLoader}
                        notifySuccess={notifySuccess}
                        notifyError={notifyError}
                        setPdf={setPdf}
                      />
                    </div>

                    <div className=" mt-7 mt-lg-8">
                      <button
                        className="cmn-btn py-3 px-5 px-lg-6 mt-7 mt-lg-8 w-full flex justify-center items-center"
                        onClick={async () =>
                          await registerVoter(updateVoter, image, pdf)
                        }
                      >
                        Register
                      </button>
                    </div>
                  </div>
                )}

                <div className="mt-8 mt-lg-10">
                  <p>
                    Don’t have an account? <Link href="/">Register Here</Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        {voter && voter.address !== "" && <PopUp candidate={voter} />}
        {loader && <Loader />}
      </section>
    </>
  );
}
