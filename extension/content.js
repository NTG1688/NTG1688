// Content script for Nam Trung Logistics (NTG1688) Extension
// Injected into Taobao, 1688, Tmall pages to extract product details and send to NTG1688 Cart

(function() {
  console.log("Nam Trung Logistics Extension loaded on:", window.location.href);

  function createNTGFloatingBar() {
    if (document.getElementById("ntg-floating-bar")) return;

    const bar = document.createElement("div");
    bar.id = "ntg-floating-bar";
    bar.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 999999;
      background: linear-gradient(135deg, #1e3a8a, #312e81);
      color: white;
      padding: 12px 18px;
      border-radius: 16px;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.2);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 13px;
      display: flex;
      align-items: center;
      gap: 12px;
      border: 1px solid rgba(255, 255, 255, 0.2);
    `;

    const titleSpan = document.createElement("span");
    titleSpan.innerHTML = `<strong>NTG1688:</strong> Tỷ giá <strong>4.015 đ</strong>`;

    const addBtn = document.createElement("button");
    addBtn.innerText = "🛒 Thêm Vào Giỏ Hàng Nam Trung";
    addBtn.style.cssText = `
      background: #2563eb;
      color: white;
      border: none;
      padding: 8px 14px;
      border-radius: 10px;
      font-weight: bold;
      cursor: pointer;
      font-size: 12px;
      transition: background 0.2s;
    `;
    addBtn.onmouseover = () => addBtn.style.background = "#1d4ed8";
    addBtn.onmouseout = () => addBtn.style.background = "#2563eb";

    addBtn.onclick = function() {
      // Bóc tách thông tin sản phẩm trên trang hiện tại
      let title = document.title;
      let price = 0;
      let image = "";

      // Tìm giá
      const priceElem = document.querySelector(".price, .tb-rmb-num, .price-text, .discountPrice-price");
      if (priceElem) {
        price = parseFloat(priceElem.innerText.replace(/[^0-9.]/g, "")) || 0;
      }

      // Mở trang giỏ hàng với thông tin đã bóc tách
      const cartUrl = `http://localhost:3000/cart?autoAdd=true&title=${encodeURIComponent(title)}&url=${encodeURIComponent(window.location.href)}&price=${price}`;
      window.open(cartUrl, "_blank");
    };

    bar.appendChild(titleSpan);
    bar.appendChild(addBtn);
    document.body.appendChild(bar);
  }

  // Khởi động sau khi trang load xong
  setTimeout(createNTGFloatingBar, 1500);
})();
