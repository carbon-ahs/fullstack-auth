import { getSession } from "@/lib/session";
import { Role } from "@/lib/type";
import { redirect } from "next/navigation";
import React from "react";

const ProfilePage = async () => {
  // const session = await getSession();
  // if (!session || !session.user) {
  //   redirect("/auth/signin");
  // }
  // // if (session.user.role !== Role.ADMIN) redirect("/auth/signin");
  // console.log({ session });

  return <div>ProfilePage</div>;
};

export default ProfilePage;
