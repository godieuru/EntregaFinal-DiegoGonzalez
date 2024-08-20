document.addEventListener("DOMContentLoaded", () => {
  const carousels = document.querySelectorAll(".carousel");

  carousels.forEach((carousel) => {
    const images = carousel.querySelectorAll(".carouselimages img");
    const prev = carousel.querySelector(".prev");
    const next = carousel.querySelector(".next");
    let index = 0;

    const updatecarousel = () => {
      images.forEach((img) => {
        img.classList.remove("active");
      });

      images[index].classList.add("active");
    };

    prev.addEventListener("click", () => {
      index = index === 0 ? images.length - 1 : index - 1;
      updatecarousel();
    });

    next.addEventListener("click", () => {
      index = index === images.length - 1 ? 0 : index + 1;
      updatecarousel();
    });

    updatecarousel();
  });

  let cart = loadlocalstorage();
  const cartitems = document.getElementById("cartitems");
  const carttotal = document.getElementById("carttotal");
  const togglecart = document.getElementById("cartbutton");
  const emptycart = document.getElementById("emptycart");
  const checkoutbutton = document.getElementById("checkout");
  const paymentmodal = document.getElementById("payment");
  const closemodal = document.querySelector(".closemodal");

  togglecart.addEventListener("click", () => {
    const cartcontent = document.getElementById("cartcontent");
    cartcontent.style.display =
      cartcontent.style.display === "none" || cartcontent.style.display === ""
        ? "block"
        : "none";
  });

  document.querySelectorAll(".addtocart").forEach((button) => {
    button.addEventListener("click", () => {
      const product = button.getAttribute("data-product");
      const price = parseFloat(button.getAttribute("data-price"));

      if (cart[product]) {
        cart[product].quantity += 1;
        cart[product].total += price;
      } else {
        cart[product] = { price, quantity: 1, total: price };
      }
      updatecart();
      showalert(`Product added to cart: ${product}`);
    });
  });

  window.increasequantity = (product) => {
    if (cart[product]) {
      cart[product].quantity += 1;
      cart[product].total += cart[product].price;
      updatecart();
    }
  };

  window.decreasequantity = (product) => {
    if (cart[product] && cart[product].quantity > 1) {
      cart[product].quantity -= 1;
      cart[product].total -= cart[product].price;
      updatecart();
    }
  };

  emptycart.addEventListener("click", () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, please!",
    }).then((result) => {
      if (result.isConfirmed) {
        cart = {};
        updatecart();
        showalert("Cart emptied");
      }
    });
  });

  function updatecart() {
    cartitems.innerHTML = "";
    let total = 0;

    for (const product in cart) {
      const item = cart[product];
      const li = document.createElement("li");
      li.innerHTML = `
                ${product}: $${item.price.toFixed(2)} x ${item.quantity}
                <button onclick="increasequantity('${product}')">+</button>
                <button onclick="decreasequantity('${product}')">-</button>
            `;
      cartitems.appendChild(li);
      total += item.total;
    }

    carttotal.textContent = total.toFixed(2);
    document.getElementById("cartcount").textContent = Object.keys(cart).length;

    savelocalstorage();
  }

  function savelocalstorage() {
    localStorage.setItem("cart", JSON.stringify(cart));
  }

  function loadlocalstorage() {
    const savedcart = localStorage.getItem("cart");
    return savedcart ? JSON.parse(savedcart) : {};
  }

  function showalert(message) {
    Swal.fire({
      text: message,
      icon: "success",
      confirmButtonText: "OK",
    });
  }

  checkoutbutton.addEventListener("click", () => {
    document.getElementById("cartcontent").style.display = "none";
    paymentmodal.style.display = "block";
  });

  closemodal.addEventListener("click", () => {
    paymentmodal.style.display = "none";
    document.getElementById("cartcontent").style.display = "block";
  });

  document.getElementById("cancelpayment").addEventListener("click", () => {
    paymentmodal.style.display = "none";
    document.getElementById("cartcontent").style.display = "block";
  });

  window.addEventListener("click", (event) => {
    if (event.target === paymentmodal) {
      paymentmodal.style.display = "none";
      document.getElementById("cartcontent").style.display = "block";
    }
  });

  updatecart();
});
