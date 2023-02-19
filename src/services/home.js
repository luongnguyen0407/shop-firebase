import { getAuth } from "firebase/auth";
import {
  getDatabase,
  ref,
  onValue,
  query,
  orderByChild,
  limitToFirst,
} from "firebase/database";
const listProduct = document.querySelector(".wrap-list_product");
const db = getDatabase();
const starCountRef = ref(db, "products");
const refQuery = query(starCountRef, orderByChild("name"), limitToFirst(6));
onValue(refQuery, (snapshot) => {
  const product = [];
  snapshot.forEach((item) => {
    let obj = item.val();
    console.log(item.key);
    product.push({
      id: item.key,
      ...obj,
    });
  });
  renderData(product);
});

const renderData = (data) => {
  data.forEach((product) => {
    const template = `<div class="col">
  <div class="card shadow-sm">
    <img src=${product.image} />
    <div class="card-body">
      <p class="card-text">${product.name}</p>
      <div class="d-flex justify-content-between align-items-center">
        <div class="btn-group">
          <button type="button" class="btn btn-sm btn-outline-secondary">Chi tiết</button>
        </div>
        <small class="text-muted">9 mins</small>
      </div>
    </div>
  </div>
</div>`;
    listProduct.insertAdjacentHTML("beforeend", template);
  });
};
