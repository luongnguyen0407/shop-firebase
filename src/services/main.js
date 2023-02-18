import "../style/app.scss";
import "toastify-js/src/toastify.css";
// import { db, auth } from "./connect";
import Bootstrap from "bootstrap";
import Swiper from "swiper";
import jQuery from "jquery";
import { getAuth, signOut } from "firebase/auth";
const btnInfo = document.querySelector(".btn-info");
const logOutBtn = document.querySelector(".logout-btn");
// import Swiper styles
const auth = getAuth();
auth.onAuthStateChanged((data) => {
  if (data && data?.uid) {
    btnInfo.textContent = data.displayName;
  } else {
    if (window.location.pathname != "/index.html")
      window.location.href = "/index.html";
  }
});
if (logOutBtn) {
  logOutBtn.addEventListener("click", () => {
    signOut(auth);
  });
}
