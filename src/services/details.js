import { child, get, getDatabase, ref } from "firebase/database";
import $ from "jquery";
import { formatPrice } from "../modules/lib";
const id = window.location.search.split("?")[1];
if (id) {
  const dbRef = ref(getDatabase());
  get(child(dbRef, `products/${id}`))
    .then((snapshot) => {
      if (snapshot.exists()) {
        const product = snapshot.val();
        $(".img-details").attr("src", product.image);
        $(".product-cost").text(formatPrice(product.price) + "đ");
        $(".name-product").text(product.name);
        $(".description").append(product.detail);
        $("#preloder").hide();
      } else {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Sản phẩm không tồn tại",
          footer: '<a href="/client/shop.html">Quay về trang sản phẩm</a>',
        });
      }
    })
    .catch((error) => {
      console.error(error);
    });
}
