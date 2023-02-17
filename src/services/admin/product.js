import { getDatabase, ref, onValue, remove } from "firebase/database";
import { formatPrice } from "../../modules/lib";
import Swal from "sweetalert2";
const db = getDatabase();
const listProduct = document.querySelector(".list-product");
const handleTemplate = (product) => {
  if (!product) return;
  console.log(product);
  const template = `<div class="row justify-content-center mb-3">
    <div class="col-md-12 col-xl-10">
      <div class="card shadow-0 border rounded-3">
        <div class="card-body">
          <div class="row">
            <div class="col-md-12 col-lg-3 col-xl-3 mb-4 mb-lg-0">
              <div class="bg-image hover-zoom ripple rounded ripple-surface">
                <img src="${product.image}"
                  class="w-100" />
                <a href="#!">
                  <div class="hover-overlay">
                    <div class="mask" style="background-color: rgba(253, 253, 253, 0.15);"></div>
                  </div>
                </a>
              </div>
            </div>
            <div class="col-md-6 col-lg-6 col-xl-6">
              <h5>${product.name}</h5>
              <div class="d-flex flex-row">
                <div class="text-danger mb-1 me-2">
                  <i class="fa fa-star"></i>
                  <i class="fa fa-star"></i>
                  <i class="fa fa-star"></i>
                  <i class="fa fa-star"></i>
                </div>
                <span>310</span>
              </div>
              <div class="mt-1 mb-0 text-muted small">
                <span>${product.category_id}</span>
              </div>
              <p class="text-truncate mb-4 mb-md-0">
                There are many variations of passages of Lorem Ipsum available, but the
                majority have suffered alteration in some form, by injected humour, or
                randomised words which don't look even slightly believable.
              </p>
            </div>
            <div class="col-md-6 col-lg-3 col-xl-3 border-sm-start-none border-start">
              <div class="d-flex flex-row align-items-center mb-1">
                <h4 class="mb-1 me-1">${formatPrice(product.price)}đ</h4>
              </div>
              <div class="d-flex flex-column mt-4">
                <button class="btn btn-danger btn-sm btn-del" type="button" data-id=${
                  product.id
                }>Delete</button>
                <a href="/admin/update-product.html?${product.id}">
                <button class="btn btn-outline-primary btn-sm mt-2 w-100" type="button">
                Update
                </button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>`;
  listProduct.insertAdjacentHTML("beforeend", template);
};
const starCountRef = ref(db, "products");
const handleDeleteProduct = (id) => {
  if (!id) return;
  console.log(id);
  const databaseRef = ref(db, `products/${id}`);
  try {
    remove(databaseRef);
    Swal.fire("Deleted!", "Your file has been deleted.", "success");
  } catch (error) {
    Swal.fire("Deleted!", "Server not response.", "error");
  }
};

onValue(starCountRef, (snapshot) => {
  listProduct.textContent = "";
  snapshot.forEach((item) => {
    let obj = {
      id: item.key,
      ...item.val(),
    };
    handleTemplate(obj);
  });
  const listDeleteBtn = document.querySelectorAll(".btn-del");
  listDeleteBtn.forEach((btn) => {
    btn.addEventListener("click", function () {
      if (!this.dataset.id) return;
      Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!",
      }).then((result) => {
        if (result.isConfirmed) {
          handleDeleteProduct(this.dataset.id);
        }
      });
    });
  });
});
