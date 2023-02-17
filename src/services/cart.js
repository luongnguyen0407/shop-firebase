import { getAuth } from "firebase/auth";
import $ from "jquery";
import {
  onValue,
  getDatabase,
  query,
  ref,
  equalTo,
  orderByChild,
} from "firebase/database";
import { formatPrice } from "../modules/lib";
import axios from "axios";
const listProvince = document.querySelector(".wrap_list_pr1 .list_province");
const listDistrict = document.querySelector(".wrap_list_pr2 .list_province");
const listWard = document.querySelector(".wrap_list_pr3 .list_province");
const listInput = document.querySelectorAll(".input_province input");
console.log("listInput: ", listInput);
const apiProvince = "https://vapi.vnappmob.com//api/province";
const apiDistrict = "https://vapi.vnappmob.com//api/province/district/";
const apiWard = "https://vapi.vnappmob.com//api/province/ward/";
const db = getDatabase();
const auth = getAuth();

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
        let obj = item.val();
        renderListData(obj.items);
      });
    } else {
      console.log("Không tìm thấy giỏ hàng của khách hàng");
    }
  });
});

const renderListData = (listProduct) => {
  console.log("listProduct: ", listProduct);
  console.log($(".total_bill").text());
  listProduct.forEach((product) => {
    const totalBill = formatPrice($(".total_bill").text(), true);
    $(".total_bill").text(
      formatPrice(+totalBill + +product.price * +product.quantity) + "đ"
    );
    console.log(
      'formatPrice($(".total_bill").text(), true): ',
      formatPrice($(".total_bill").text(), true)
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
          <div style="width: 100px;" class='control_quantity'>
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
          <a href="#!" style="color: #cecece;"><i class="fas fa-trash-alt"></i></a>
        </div>
      </div>
    </div>
  </div>`;
    $(".wrap-list-cart").append(template);
  });
};
