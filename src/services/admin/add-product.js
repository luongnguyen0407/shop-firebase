import Quill from "quill";
import { handleLoadImg, showToast, toolbarOptions } from "../../modules/lib";
import { getDatabase, ref, onValue, push, set } from "firebase/database";
const productPrice = document.querySelector(".price-product");
const productName = document.querySelector(".name-product");
const productImg = document.querySelector(".img-product");
const listCategory = document.querySelector(".list-category");
const imagePreView = document.querySelector(".img-preview");
const formAdd = document.querySelector(".form_add_product");
const containerQuill = document.querySelector(".container-quill");
const db = getDatabase();
const starCountRef = ref(db, "category");

const quill = new Quill(containerQuill, {
  modules: {
    toolbar: toolbarOptions,
  },
  placeholder: "Detail product",
  theme: "snow", // or 'bubble'
});

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
              handleFormSubmit(event);
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

const handleFormSubmit = async (e) => {
  const name = productName.value;
  const price = productPrice.value;
  const detail = quill.container.firstChild.innerHTML;
  const category = listCategory.value;
  if (!detail) {
    showToast("Vui lòng nhập chi tiết sản phẩm");
    return;
  }
  showToast("Đang thêm sản phẩm vui lòng chờ");
  const urlImg = await handleLoadImg(productImg.files[0]);
  const productListRef = ref(db, "products");
  const newProduct = push(productListRef);
  try {
    await set(newProduct, {
      category_id: category,
      detail,
      image: urlImg,
      name,
      price,
    });
    showToast("Thêm thành công");
    quill.setContents("");
    formAdd.reset();
  } catch (error) {
    showToast("Lỗi");
  }
};

productImg.addEventListener("change", () => {
  const [file] = productImg.files;
  if (file) {
    imagePreView.src = URL.createObjectURL(file);
    imagePreView.style.display = "block";
  } else {
    imagePreView.style.display = "none";
  }
});
