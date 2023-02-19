import Toastify from "toastify-js";
import Swal from "sweetalert2";
import axios from "axios";

export const showToast = (mess) => {
  Toastify({
    text: `${mess}`,
    duration: 3000,
    newWindow: true,
    close: true,
    gravity: "top", // `top` or `bottom`
    position: "right", // `left`, `center` or `right`
    stopOnFocus: true, // Prevents dismissing of toast on hover
    style: {
      background: "linear-gradient(to right, #00b09b, #96c93d)",
    },
  }).showToast();
};
export const formatPrice = (price, out) => {
  if (out) {
    return +price.replace(/[^a-zA-Z0-9 ]/g, "");
  } else {
    return price.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");
  }
};

export const toolbarOptions = [
  ["bold", "italic", "underline", "strike"], // toggled buttons
  ["blockquote", "code-block"],

  [{ header: 1 }, { header: 2 }], // custom button values
  [{ list: "ordered" }, { list: "bullet" }],
  [{ script: "sub" }, { script: "super" }], // superscript/subscript
  [{ indent: "-1" }, { indent: "+1" }], // outdent/indent
  [{ direction: "rtl" }], // text direction

  [{ size: ["small", false, "large", "huge"] }], // custom dropdown
  [{ header: [1, 2, 3, 4, 5, 6, false] }],

  [{ color: [] }, { background: [] }], // dropdown with defaults from theme
  [{ font: [] }],
  [{ align: [] }],

  ["clean"], // remove formatting button
];

export const handleLoadImg = async (file) => {
  const bodyFormData = new FormData();
  bodyFormData.append("image", file);
  try {
    const response = await axios({
      method: "post",
      url: `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_KEY}`,
      data: bodyFormData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data.data.url;
  } catch (error) {
    console.log(error);
  }
};

export const STATUS = {
  pending: 0,
  ship: 1,
  success: 2,
  reject: 3,
};
export const STATUS_SHOW = [
  "Đang xử lý",
  "Đang vận chuyển",
  "Đã giao hàng",
  "Từ chối",
];

export const getCurrentDay = () => {
  let today = new Date();
  let year = today.getFullYear();
  let month = ("0" + (today.getMonth() + 1)).slice(-2);
  let day = ("0" + today.getDate()).slice(-2);
  return (date = year + "-" + month + "-" + day);
};
