import { getDatabase, ref, onValue, remove, update } from "firebase/database";
import { formatPrice, STATUS_SHOW } from "../../modules/lib";
import $ from "jquery";
import { Order } from "../../models/Order";
const oderTable = document.querySelector(".tbody-order");
const modal = document.querySelector("#modal-3");
const listOrders = new Order();
const db = getDatabase();
const starCountRef = ref(db, "orders");
onValue(starCountRef, (snapshot) => {
  let listOrder = [];
  snapshot.forEach((item) => {
    let obj = {
      id: item.key,
      ...item.val(),
    };
    listOrder.push(obj);
  });
  renderData(listOrder);
  listOrders.setOrder = listOrder;
  console.log("listOrder: ", listOrder);
});

const renderData = (data) => {
  if (data.length === 0) return;
  oderTable.textContent = "";
  data.forEach((order) => {
    const template = ` <tr>
        <th scope="row" title="${order.id}">${order.id.slice(0, 6)}...</th>
        <td>${order?.address?.customer_name}</td>
        <td>${order.date_order}</td>
        <td>${STATUS_SHOW[+order.status]}</td>
        <td>
        <button type="button" class="btn btn-primary detail-order" data-id = ${
          order.id
        }>
            Chi tiết
        </button>
      </td>
        
      </tr>`;
    oderTable.insertAdjacentHTML("beforeend", template);
    $(".loading-cart").hide();
  });
};

$(document).on("click", ".detail-order", function () {
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  const id = $(this).data("id");
  const listOrder = listOrders.getOrder;
  const [order] = listOrder.filter((item) => item.id === id);
  renderListProduct(order);
});

const renderListProduct = (data) => {
  const { product, total_bill, status, id, address } = data;
  $(".list-product-bill").text("");
  $(".section-status").text("");
  $(".address").text("");
  product.forEach((item) => {
    const template = `<tr>
                    <th scope="row">${item.name}</th>
                    <td>${item.quantity}</td>
                    <td>${formatPrice(item.price)}đ</td>
                </tr>`;
    $(".total_bill").text(`Tổng hóa đơn: ${formatPrice(total_bill)}đ`);
    $(".list-product-bill").append(template);
    $(".address").text(
      `Địa chỉ : ${address.city}, ${address.district}, ${address.ward}`
    );
    $(".btn_save").data("id", id);
  });
  STATUS_SHOW.forEach((item, index) => {
    const statusTem = `
          <option value="${index}" ${
      index === +status ? "selected" : ""
    }>${item}</option>
          `;
    $(".section-status").append(statusTem);
  });
};

$(".btn_save").on("click", () => {
  const id = $(".btn_save").data("id");
  const status = $(".section-status ").val();
  try {
    const dbRef = ref(db, `orders/${id}`);
    update(dbRef, { status });
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
  } catch (error) {
    console.log(error);
  }
});
$(".modal__close").on("click", () => {
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
});
