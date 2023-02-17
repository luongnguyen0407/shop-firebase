import { getAuth } from "firebase/auth";
import { getDatabase, ref, onValue } from "firebase/database";

const db = getDatabase();
const auth = getAuth();
const starCountRef = ref(db, "category");
onValue(starCountRef, (snapshot) => {
  const category = [];
  snapshot.forEach((item) => {
    let obj = item.val();
    console.log(item.key);
    category.push({
      id: item.key,
      ...obj,
    });
  });
  console.log(category);
});
