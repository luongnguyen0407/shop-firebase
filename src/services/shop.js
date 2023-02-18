import {
  getDatabase,
  ref,
  startAfter,
  query,
  get,
  orderByChild,
  limitToFirst,
  onValue,
  equalTo,
  set,
  push,
  update,
} from "firebase/database";
import { getAuth } from "firebase/auth";
import { formatPrice, showToast } from "../modules/lib";
const wrapListProduct = document.querySelector(".wrap_list-product");
const btnLoadMore = document.querySelector(".btn-load-more");
const listCategory = document.querySelector(".list-category");
import $ from "jquery";
import { cartUser } from "../models/Cart";
import { User } from "../models/User";
import { Product } from "../models/Product";
const db = getDatabase();
const auth = getAuth();
const starCountRef = ref(db, "products");
const listCart = new cartUser();
const currentUser = new User();
const listProduct = new Product();
let lastKeyObj = {
  key: "",
};
const firstPageQuery = query(
  starCountRef,
  orderByChild("name"),
  limitToFirst(6)
);
const getListUserCart = (uid) => {
  const starCountRef = ref(db, "cart");
  const loadMoreQuery = query(
    starCountRef,
    equalTo(uid),
    orderByChild("user_id")
  );
  // onValue(loadMoreQuery).then((snapshot) => {
  //   if (snapshot.exists()) {
  //     const cartsData = snapshot.val();
  //     // Xử lý thông tin giỏ hàng của khách hàng ở đây
  //     console.log("childData: ", cartsData);
  //   } else {
  //     console.log("Không tìm thấy giỏ hàng của khách hàng");
  //   }
  // });
  onValue(loadMoreQuery, (snapshot) => {
    $("#preloder").show();
    if (snapshot.exists()) {
      snapshot.forEach((item) => {
        console.log("item: ", item);
        let obj = item.val();
        console.log("obj: ", obj);
        $(".total-cart").text(obj.items.length || 0);
        listCart.setCart = { ...obj, key: item.key };
      });
    } else {
      console.log("Không tìm thấy giỏ hàng của khách hàng");
      listCart.setCart = {};
    }
  });
};

//get current user
auth.onAuthStateChanged((data) => {
  currentUser.setUser = data;
  getListUserCart(data.uid);
});
const handleQueryData = (firstPageQuery, delOld = false) => {
  try {
    get(firstPageQuery).then((snapshot) => {
      const products = [];
      snapshot.forEach((childSnapshot) => {
        const childData = childSnapshot.val();
        products.push({
          id: childSnapshot.key,
          ...childData,
        });
      });
      const lastKey = products[products.length - 1]?.name;
      if (delOld) {
        btnLoadMore.style.cssText = "display:none !important";
        wrapListProduct.textContent = "";
        listProduct.setProduct = products;
      } else {
        btnLoadMore.style.display = "block";
        let oldProduct = listProduct.getProduct;
        listProduct.setProduct = oldProduct
          ? [...oldProduct, ...products]
          : products;
      }
      renderData(products);

      lastKeyObj.key = lastKey;
    });
  } catch (error) {}
};
handleQueryData(firstPageQuery);

btnLoadMore.addEventListener("click", () => {
  if (!lastKeyObj.key) {
    btnLoadMore.style.display = "none";
    return;
  }
  const loadMoreQuery = query(
    starCountRef,
    // equalTo("hádhfhas"),
    startAfter(lastKeyObj.key),
    orderByChild("name"),
    limitToFirst(2)
  );
  handleQueryData(loadMoreQuery);
});

const renderData = (data) => {
  if (!data) return;
  // wrapListProduct.textContent = "";
  data.forEach((product) => {
    const template = `<div class="col-md-4">
    <div class="card mb-4 product-wap rounded-0">
        <div class="card rounded-0">
            <img class="card-img rounded-0 img-fluid img-product-shop" src="${
              product.image
            }">
            <div class="card-img-overlay rounded-0 product-overlay d-flex align-items-center justify-content-center">
                <ul class="list-unstyled">
                    <li><a class="btn btn-success text-white" href="shop-single.html"><i class="far fa-heart"></i></a></li>
                    <li><a class="btn btn-success text-white mt-2" href="./details.html?${
                      product.id
                    }"><i class="far fa-eye"></i></a></li>
                    <li data-id=${
                      product.id
                    } class='btn-add_cart btn btn-success text-white mt-2'><i class="fas fa-cart-plus"></i></li>
                </ul>
            </div>
        </div>
        <div class="card-body">
            <a href="shop-single.html" class="h3 text-decoration-none d-block product-name">${
              product.name
            }</a>
            <ul class="w-100 list-unstyled d-flex justify-content-between mb-0">
                <li class="pt-2">
                    <span class="product-color-dot color-dot-red float-left rounded-circle ml-1"></span>
                    <span class="product-color-dot color-dot-blue float-left rounded-circle ml-1"></span>
                    <span class="product-color-dot color-dot-black float-left rounded-circle ml-1"></span>
                    <span class="product-color-dot color-dot-light float-left rounded-circle ml-1"></span>
                    <span class="product-color-dot color-dot-green float-left rounded-circle ml-1"></span>
                </li>
            </ul>
            <ul class="list-unstyled d-flex justify-content-center mb-1">
                <li>
                    <i class="text-warning fa fa-star"></i>
                    <i class="text-warning fa fa-star"></i>
                    <i class="text-warning fa fa-star"></i>
                    <i class="text-muted fa fa-star"></i>
                    <i class="text-muted fa fa-star"></i>
                </li>
            </ul>
            <p class="text-center mb-0">${formatPrice(product.price)}đ</p>
        </div>
    </div>
</div>`;
    wrapListProduct.insertAdjacentHTML("beforeend", template);
  });
  $("#preloder").hide();
};

//get categories
onValue(ref(db, "category"), (snapshot) => {
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
  listCategory.innerHTML = "<option value=''>Tất cả</option>";
  categories.forEach((category) => {
    const template = `
    <option value="${category.id}">${category.name}</option>
    `;
    listCategory.insertAdjacentHTML("beforeend", template);
  });
});

listCategory.addEventListener("change", (e) => {
  const categoryId = e.target.value;
  if (!categoryId) {
    handleQueryData(firstPageQuery);
    wrapListProduct.textContent = "";
    return;
  }
  const loadMoreQuery = query(
    starCountRef,
    equalTo(categoryId),
    // startAfter(lastKeyObj.key),
    orderByChild("category_id"),
    limitToFirst(10)
  );
  handleQueryData(loadMoreQuery, true);
});

$(document).on("click", ".btn-add_cart", function () {
  const idProduct = $(this).data("id");
  const currentProducts = listProduct.getProduct;
  const [addProduct] = currentProducts.filter(
    (product) => product.id === idProduct
  );
  const currentCart = listCart.getCart;
  if (Object.keys(currentCart).length === 0) {
    addNewCart(addProduct);
  } else {
    const { items, user_id, key } = currentCart;
    const { category_id, detail, ...res } = addProduct;

    const productDup =
      currentCart &&
      currentCart?.items.filter((currentValue) => {
        return currentValue.id === idProduct;
      });
    if (productDup.length > 0) {
      const listProductNew = currentCart.items.map((currentValue) => {
        if (currentValue.id === idProduct) {
          currentValue.quantity += 1;
        }
        return currentValue;
      });
      const newData = {
        items: [...listProductNew],
        user_id,
      };
      updateCart(key, newData);
    } else {
      const newData = {
        items: [...items, { ...res, quantity: 1 }],
        user_id,
      };
      updateCart(key, newData);
    }
  }
});

function addNewCart({ id, image, name, price }) {
  const { uid } = currentUser.getUser;
  if (!uid) return;
  const fakeData = {
    user_id: uid,
    items: [
      {
        id,
        image,
        name,
        price,
        quantity: 1,
      },
    ],
  };
  const cartListRef = ref(db, "cart");
  const newCart = push(cartListRef);
  set(newCart, fakeData);
}

function updateCart(cartId, newData) {
  const cartRef = ref(db, `cart/${cartId}`);
  try {
    update(cartRef, newData);
    showToast("Thêm sản phẩm thành công");
  } catch (error) {
    console.log(error);
    showToast("Có lỗi xảy ra vui lòng kiểm tra lại");
  }
}
