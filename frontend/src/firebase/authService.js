import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase";

// Sign Up
export const registerUser = async (email, password) => {
  return await createUserWithEmailAndPassword(auth, email, password);
};

// Sign In
export const loginUser = async (email, password) => {
  return await signInWithEmailAndPassword(auth, email, password);
};
