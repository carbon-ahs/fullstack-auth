import { getSession } from "@/lib/session";
import { Role } from "@/lib/type";
import { redirect } from "next/navigation";
import React from "react";
import { getProfile } from "@/lib/actions";

const ProfilePage = async () => {
  // const session = await getSession();
  // if (!session || !session.user) {
  //   redirect("/auth/signin");
  // }
  // // if (session.user.role !== Role.ADMIN) redirect("/auth/signin");
  // console.log({ session });
  const result = await getProfile();
  return (
    <div>
      ProfilePage
      <p>{JSON.stringify(result)}</p>
    </div>
  );
};

export default ProfilePage;
