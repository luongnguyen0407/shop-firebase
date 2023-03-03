import {
  getDatabase,
  ref,
  child,
  get,
  onValue,
  update,
} from "firebase/database";
import Quill from "quill";
import Swal from "sweetalert2";
import { handleLoadImg, showToast, toolbarOptions } from "../../modules/lib";
const containerQuill = document.querySelector(".container-quill");
const listCategory = document.querySelector(".list-category");
const productName = document.querySelector(".name-product");
const productPrice = document.querySelector(".price-product");
const imgOld = document.querySelector(".img-old");
const dataOld = [];
const id = window.location.search.split("?")[1];
const db = getDatabase();
if (!id) {
  window.location.href("/admin/product.html");
}

const quill = new Quill(containerQuill, {
  modules: {
    toolbar: toolbarOptions,
  },
  placeholder: "Detail product",
  theme: "snow", // or 'bubble'
});
const starCountRef = ref(db, "category");
onValue(starCountRef, (snapshot) => {
  const categories = [];
  snapshot.forEach((item) => {
    let obj = item.val();
    categories.push({
      id: item.key,
      ...obj,
    });
  });
  if (categories.length === 0) return;
  listCategory.textContent = "";
  categories.forEach((category) => {
    const template = `
      <option value="${category.id}">${category.name}</option>
      `;
    listCategory.insertAdjacentHTML("beforeend", template);
  });
});

if (id) {
  const dbRef = ref(getDatabase());
  get(child(dbRef, `products/${id}`))
    .then((snapshot) => {
      if (snapshot.exists()) {
        const product = snapshot.val();
        dataOld.push(product);
        const newContent = quill.clipboard.convert(product.detail);
        quill.setContents(newContent);
        productName.value = product.name;
        productPrice.value = product.price;
        listCategory.value = product.category_id;
        imgOld.setAttribute("src", product.image);
      } else {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Sản phẩm không tồn tại",
          footer: '<a href="/admin/product.html">Quay về trang quản lý</a>',
        });
      }
    })
    .catch((error) => {
      console.error(error);
    });
}
onValue(starCountRef, (snapshot) => {
  const categories = [];
  snapshot.forEach((item) => {
    let obj = item.val();
    categories.push({
      id: item.key,
      ...obj,
    });
  });
  if (categories.length === 0) return;
  listCategory.textContent = "";
  categories.forEach((category) => {
    const template = `
    <option value="${category.id}">${category.name}</option>
    `;
    listCategory.insertAdjacentHTML("beforeend", template);
  });
});

(function () {
  "use strict";
  window.addEventListener(
    "load",
    function () {
      // Fetch all the forms we want to apply custom Bootstrap validation styles to
      var forms = document.getElementsByClassName("needs-validation");
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
              handleFormUpdate(event);
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

const handleFormUpdate = async () => {
  showToast("Đang cập nhật sản phẩm");
  const productRef = ref(db, `products/${id}`);
  const category = document.querySelector(".list-category").value;
  const name = document.querySelector(".name-product").value;
  const price = document.querySelector(".price-product").value;
  const detail = quill.container.firstChild.innerHTML;
  const productImg = document.querySelector(".img-product");
  const data = {
    category_id: category,
    detail,
    image: "",
    name,
    price,
  };
  if (productImg.files[0]) {
    data.image = await handleLoadImg(productImg.files[0]);
  } else {
    data.image = dataOld[0].image;
  }
  try {
    update(productRef, data);
    Swal.fire("Cập nhật sản phẩm thành công").then((result) => {
      window.location.href = "./product.html";
    });
  } catch (error) {
    showToast("Có lỗi xảy ra vui lòng kiểm tra lại");
  }
};
