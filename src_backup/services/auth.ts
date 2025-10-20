import { auth, provider } from "./firebase";
import { signInWithPopup, signInWithRedirect } from "firebase/auth";

export async function signInWithGoogleFallback() {
  try {
    await signInWithPopup(auth, provider);
  } catch (err: any) {
    if (String(err.message).includes("popup")) {
      await signInWithRedirect(auth, provider);
    } else {
      throw err;
    }
  }
}
