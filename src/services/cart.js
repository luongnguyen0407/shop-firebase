import { getAuth } from "firebase/auth";
import $ from "jquery";
import {
  onValue,
  getDatabase,
  query,
  ref,
  equalTo,
  orderByChild,
  update,
  push,
  set,
  remove,
} from "firebase/database";
import { formatPrice, getCurrentDay, showToast, STATUS } from "../modules/lib";
import axios from "axios";
import { cartUser } from "../models/Cart";
import Swal from "sweetalert2";
const listProvince = document.querySelector(".wrap_list_pr1 .list_province");
const listDistrict = document.querySelector(".wrap_list_pr2 .list_province");
const listWard = document.querySelector(".wrap_list_pr3 .list_province");
const listInput = document.querySelectorAll(".input_province input");
const apiProvince = "https://vapi.vnappmob.com//api/province";
const apiDistrict = "https://vapi.vnappmob.com//api/province/district/";
const apiWard = "https://vapi.vnappmob.com//api/province/ward/";
const db = getDatabase();
const auth = getAuth();
const listCart = new cartUser();
const handleSelectProvince = (node) => {
  const listLi = node.querySelectorAll("li");
  const inputShow = node.previousElementSibling;
  const nodeParent = +node.parentElement.dataset.parent;
  [...listLi].forEach((item) => {
    item.addEventListener("click", (e) => {
      const provinceId = e.target.dataset.province;
      inputShow.value = e.target.textContent;
      node.classList.remove("open");
      switch (nodeParent) {
        case 1:
          console.log("1");
          handleGetData(apiDistrict, listDistrict, provinceId);
          break;
        case 2:
          console.log("2");
          handleGetData(apiWard, listWard, provinceId);
          break;
        default:
          break;
      }
    });
  });
};
const handleGetData = (api = apiProvince, node, search) => {
  let newApi = search ? api + search : api;
  axios
    .get(newApi)
    .then(function (response) {
      // handle success
      const { data } = response;
      if (!data) return;
      insertAdjacentHtml(node, data.results);
    })
    .catch(function (error) {
      // handle error
      console.log(error);
    });
};
handleGetData(apiProvince, listProvince);
listInput.forEach((item) => {
  item.addEventListener("click", (e) => {
    e.target.nextElementSibling.classList.toggle("open");
  });
});
const insertAdjacentHtml = (node, data) => {
  if (!data && data.length < 1) return;
  node.textContent = "";
  data.forEach((element) => {
    let id = element.district_id || element.province_id || element.ward_id;
    let name =
      element.province_name || element.district_name || element.ward_name;
    const template = `<li data-province = ${id}>${name}</li>`;
    node.insertAdjacentHTML("beforeend", template);
  });
  handleSelectProvince(node);
};
auth.onAuthStateChanged((data) => {
  const { uid } = data;
  const starCountRef = ref(db, "cart");
  const loadCartQuery = query(
    starCountRef,
    equalTo(uid),
    orderByChild("user_id")
  );
  onValue(loadCartQuery, (snapshot) => {
    if (snapshot.exists()) {
      snapshot.forEach((item) => {
        const key = item.key;
        let obj = item.val();
        renderListData(obj.items);
        listCart.setCart = [...obj.items, { key, user_id: obj.user_id }];
      });
    } else {
      $(".wrap-list-cart").text("Bạn chưa có sản phẩm nào");
      $(".total_bill").text("0");
      $(".btn-wrap").attr("disabled", true);
      console.log("Không tìm thấy giỏ hàng của khách hàng");
    }
  });
});

const renderListData = (listProduct) => {
  if (!listProduct) return;
  $(".wrap-list-cart").text("");
  $(".total_bill").text("0");
  listProduct.forEach((product) => {
    const totalBill = formatPrice($(".total_bill").text(), true);
    $(".total_bill").text(
      formatPrice(+totalBill + +product.price * +product.quantity) + "đ"
    );
    const template = ` <div class="card mb-3">
    <div class="card-body">
      <div class="d-flex justify-content-between">
        <div class="d-flex flex-row align-items-center">
          <div>
            <img
              src="${product.image}"
              class="img-fluid rounded-3" alt="Shopping item" style="width: 65px;">
          </div>
          <div class="ms-3 product_name_cart">
            <h5 >${product.name}</h5>
            <p class="small mb-0">256GB, Navy Blue</p>
          </div>
        </div>
        <div class="d-flex flex-row align-items-center" style="gap: 5px;">
          <div style="width: 100px;" class='control_quantity' data-id='${
            product.id
          }'>
            <div class='btn-plus'>
            <i class="fa-solid fa-plus"></i>
            </div>
            <h5 class="fw-normal mb-0">${product.quantity}</h5>
            <div class='btn-apart '>
            <i class="fa-solid fa-minus"></i>
            </div>
          </div>
          <div style="width: 100px;">
            <h5 class="mb-0 product-price">${formatPrice(
              +product.price * +product.quantity
            )}đ</h5>
          </div>
          <p class='btn-del' ><i class="fas fa-trash-alt"></i></p>
        </div>
      </div>
    </div>
  </div>`;
    $(".wrap-list-cart").append(template);
  });
};

//handle plus quantity
$(document).on("click", ".btn-plus", function () {
  const id = $(this).parent().data("id");
  handleUpdate(1, id);
  if (!id) return;
});

//handle apart quantity
$(document).on("click", ".btn-apart", function () {
  const id = $(this).parent().data("id");
  if (!id) return;
  const quantity = $(this).prev().text();
  console.log("quantity: ", quantity);
  if (+quantity === 1) {
    handleUpdate(-1, id, true);
    return;
  }
  handleUpdate(-1, id);
});

//handle delete quantity
$(document).on("click", ".btn-del", function () {
  const id = $(this).prev().prev().data("id");
  if (!id) return;
  handleUpdate(-1, id, true);
});

const handleUpdate = (num, idProduct, deleteField = false) => {
  const newListCart = [...listCart.getCart];
  const { key, user_id } = newListCart.pop();
  const dataUpdate = handleData(newListCart, deleteField, idProduct, num);
  if (dataUpdate.length < 1) {
    const delRef = ref(db, `cart/${key}`);
    remove(delRef);
    return;
  }
  const cartRef = ref(db, `cart/${key}`);
  try {
    update(cartRef, { items: dataUpdate, user_id });
  } catch (error) {
    console.log(error);
  }
};

const handleData = (data, deleteField, idProduct, num = 1) => {
  if (!deleteField) {
    return (dataUpdate = data.map((item) => {
      if (item.id === idProduct) {
        item.quantity += num;
      }
      return item;
    }));
  } else {
    return (dataUpdate = data.filter((item) => item.id != idProduct));
  }
};

(function () {
  "use strict";
  window.addEventListener(
    "load",
    function () {
      // Fetch all the forms we want to apply custom Bootstrap validation styles to
      var forms = document.getElementsByClassName("needs-validation");
      console.log("forms: ", forms);
      // Loop over them and prevent submission
      var validation = Array.prototype.filter.call(forms, function (form) {
        form.addEventListener(
          "submit",
          function (event) {
            if (form.checkValidity() === false) {
              event.preventDefault();
              event.stopPropagation();
            } else {
              event.preventDefault();
              Swal.fire({
                title: "Xác nhận đặt hàng",
                text: "Đơn hàng của bạn đã sẵn sàng, đặt ngay",
                icon: "info",
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                confirmButtonText: "Đặt hàng",
              }).then((result) => {
                if (result.isConfirmed) {
                  handleOrder();
                }
              });
            }
            form.classList.add("was-validated");
          },
          false
        );
      });
    },
    false
  );
})();

const handleOrder = () => {
  const newListCart = [...listCart.getCart];
  const totalBill = formatPrice($(".total_bill").text(), true);
  if (totalBill <= 0) {
    return;
  }
  const { key, user_id } = newListCart.pop();
  const obj = {};
  $(".form-address input").each(function () {
    console.log($(this).value);
    obj[$(this).attr("name")] = $(this).val();
  });
  console.log(obj);
  const dataOrder = {
    product: newListCart,
    address: obj,
    user_id,
    total_bill: totalBill,
    date_order: getCurrentDay(),
    status: STATUS.pending,
  };
  console.log("dataOder: ", dataOrder);
  const orderRef = ref(db, "orders");
  const newOrder = push(orderRef);
  try {
    set(newOrder, dataOrder);
    Swal.fire({
      icon: "success",
      title: "Đặt hàng thành công",
      showConfirmButton: false,
      timer: 1500,
    });
    const delRef = ref(db, `cart/${key}`);
    remove(delRef);
  } catch (error) {
    showToast("Lỗi");
  }
};
