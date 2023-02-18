import {
  onValue,
  ref,
  getDatabase,
  set,
  push,
  remove,
} from "firebase/database";
import { showToast } from "../../modules/lib";
import $ from "jquery";
import Swal from "sweetalert2";
const tableCategory = document.querySelector(".tb-wrap-category");
const formAdd = document.querySelector(".form_add_category");
const nameCategory = document.querySelector(".name-category");
const db = getDatabase();
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
  tableCategory.textContent = "";
  if (categories.length === 0) return;
  categories.forEach((category) => {
    const template = `
    <tr>
    <td>${category.id}</td>
    <td>${category.name}</td>
    <td>
        <a class="edit" title="Edit" data-toggle="tooltip"><i class="fa-solid fa-pen">&#xE254;</i></a>
        <a class="delete" title="Delete" data-toggle="tooltip"><i class="fa-solid fa-trash btn-delete" data-id =${category.id}></i></a>
    </td>
</tr>
      `;
    tableCategory.insertAdjacentHTML("beforeend", template);
  });
});

formAdd.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = nameCategory.value;
  if (!name) {
    showToast("Vui lòng nhâp tên danh mục");
    return;
  }
  const newCategory = push(starCountRef);
  try {
    set(newCategory, {
      name,
    });
    showToast("Thêm thành công");
    formAdd.reset();
  } catch (error) {
    showToast("Lỗi");
  }
});

$(document).on("click", ".btn-delete", function () {
  const id = $(this).data("id");
  if (!id) return;
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
      const databaseRef = ref(db, `category/${id}`);
      try {
        remove(databaseRef);
        Swal.fire("Deleted!", "Your file has been deleted.", "success");
      } catch (error) {
        Swal.fire("Deleted!", "Server not response.", "error");
      }
    }
  });
});
