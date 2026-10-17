"use client";
import { Label } from "@/components/ui/label";
import React, { useActionState } from "react";
import { useFormState } from "react-dom";
import { Input } from "@/components/ui/input";
import SubmitButton from "@/components/submitButton";
import { signIn, signUp } from "@/lib/auth";
import Link from "next/link";

const SigninForm = () => {
  const [state, action, isPending] = useActionState(signIn, undefined); // but here i used useActionState

  return (
    <form action={action}>
      <div className="flex flex-col gap-2">
        {state?.message && (
          <p className="text-sm text-red-500">{state.message}</p>
        )}
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" placeholder="john@example.com" />
        </div>
        {state?.error?.email && (
          <p className="text-sm text-red-500">{state.error.email}</p>
        )}
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" />
        </div>
        {state?.error?.password && (
          <div className="text-sm text-red-500">
            <p>Password must:</p>
            <ul>
              {state.error.password.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          </div>
        )}
        <Link href="#" className="text-sm underline">
          Forget Password?
        </Link>
        <SubmitButton>Sign In</SubmitButton>
        <div className="flex justify-between text-sm ">
          <p className="text-gray-500">Don't have a account? </p>
          <Link href="/auth/signup" className="text-sm underline">
            Sign up!
          </Link>
        </div>
      </div>
    </form>
  );
};

// const SignUpFormOld = () => {
//   // const [state, action] = useFormState(signUp, undefined);
//   return (
//     <form action={action}>
//       <div className="flex flex-col gap-2">
//         {state?.message && (
//           <p className="text-sm text-red-500">{state.message}</p>
//         )}
//         <div>
//           <Label htmlFor="name">Name</Label>
//           <Input id="name" name="name" placeholder="John Doe" />
//         </div>
//         {state?.error?.name && (
//           <p className="text-sm text-red-500">{state.error.name}</p>
//         )}
//
//         <div>
//           <Label htmlFor="email">Email</Label>
//           <Input id="email" name="email" placeholder="john@example.com" />
//         </div>
//         {state?.error?.email && (
//           <p className="text-sm text-red-500">{state.error.email}</p>
//         )}
//         <div>
//           <Label htmlFor="password">Password</Label>
//           <Input id="password" name="password" type="password" />
//         </div>
//         {state?.error?.password && (
//           <div className="text-sm text-red-500">
//             <p>Password must:</p>
//             <ul>
//               {state.error.password.map((error) => (
//                 <li key={error}>{error}</li>
//               ))}
//             </ul>
//           </div>
//         )}
//         <SubmitButton>Sign Up</SubmitButton>
//       </div>
//     </form>
//   );
// };

export default SigninForm;
