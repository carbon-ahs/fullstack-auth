"use client";

// import { getSession } from "@/lib/session";
import Link from "next/link";
import React, { PropsWithChildren } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";

const SignInButton = ({children}: PropsWithChildren) => {
  // const session = await getSession();
  const { pending } = useFormStatus();
  // return (
  //   // <div className="flex items-center gap-2 ml-auto">
  //     {/*{!session || !session.user ? (*/}
  //       // <>
  //       //   <Link href={"/auth/signin"}>Sign In</Link>
  //       //   <Link href={"/auth/signup"}>Sign Up</Link>
  //       // </>
  //     {/*) : (*/}
  //     {/*  <>*/}
  //     {/*    <p>{session.user.name}</p>*/}
  //     {/*    <a href={"/api/auth/signout"}>Sign Out</a>*/}
  //     {/*  </>*/}
  //     {/*)}*/}
  //   // </div>
  //
  // );

  return (
    <Button type={"submit"} aria-disabled={pending} className="w-full mt-2">
      {pending ? "Submitting..." : children}
    </Button>
  );
};

export default SignInButton;
