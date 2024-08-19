document.addEventListener("DOMContentLoaded", () => {
  const carousels = document.querySelectorAll(".carousel");

  carousels.forEach((carousel) => {
    const images = carousel.querySelectorAll(".carouselimages img");
    const prev = carousel.querySelector(".prev");
    const next = carousel.querySelector(".next");
    let index = 0;

    const updateCarousel = () => {
      images.forEach((img) => {
        img.classList.remove("active");
      });

      images[index].classList.add("active");
    };

    prev.addEventListener("click", () => {
      index = index === 0 ? images.length - 1 : index - 1;
      updateCarousel();
    });

    next.addEventListener("click", () => {
      index = index === images.length - 1 ? 0 : index + 1;
      updateCarousel();
    });

    updateCarousel();
  });

  let cart = loadCartFromLocalStorage();
  const cartItems = document.getElementById("cartitems");
  const cartTotal = document.getElementById("carttotal");
  const toggleCart = document.getElementById("cartbutton");
  const emptyCartButton = document.getElementById("emptycart");
  const checkoutButton = document.getElementById("checkout");
  const paymentModal = document.getElementById("payment");
  const closeModal = document.querySelector(".closemodal");

  toggleCart.addEventListener("click", () => {
    const cartContent = document.getElementById("cartcontent");
    cartContent.style.display =
      cartContent.style.display === "none" || cartContent.style.display === ""
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
      updateCart();
      showAlert(`Product added to cart: ${product}`);
    });
  });

  window.increaseQuantity = (product) => {
    if (cart[product]) {
      cart[product].quantity += 1;
      cart[product].total += cart[product].price;
      updateCart();
    }
  };

  window.decreaseQuantity = (product) => {
    if (cart[product] && cart[product].quantity > 1) {
      cart[product].quantity -= 1;
      cart[product].total -= cart[product].price;
      updateCart();
    }
  };

  emptyCartButton.addEventListener("click", () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, please!",
    }).then((result) => {
      if (result.isConfirmed) {
        cart = {};
        updateCart();
        showAlert("Cart emptied");
      }
    });
  });

  function updateCart() {
    cartItems.innerHTML = "";
    let total = 0;

    for (const product in cart) {
      const item = cart[product];
      const li = document.createElement("li");
      li.innerHTML = `
                ${product}: $${item.price.toFixed(2)} x ${item.quantity}
                <button onclick="increaseQuantity('${product}')">+</button>
                <button onclick="decreaseQuantity('${product}')">-</button>
            `;
      cartItems.appendChild(li);
      total += item.total;
    }

    cartTotal.textContent = total.toFixed(2);
    document.getElementById("cartcount").textContent = Object.keys(cart).length;

    saveCartToLocalStorage();
  }

  function saveCartToLocalStorage() {
    localStorage.setItem("cart", JSON.stringify(cart));
  }

  function loadCartFromLocalStorage() {
    const savedCart = localStorage.getItem("cart");
    return savedCart ? JSON.parse(savedCart) : {};
  }

  function showAlert(message) {
    Swal.fire({
      text: message,
      icon: "success",
      confirmButtonText: "OK",
    });
  }

  checkoutButton.addEventListener("click", () => {
    document.getElementById("cartcontent").style.display = "none";
    paymentModal.style.display = "block";
  });

  closeModal.addEventListener("click", () => {
    paymentModal.style.display = "none";
    document.getElementById("cartcontent").style.display = "block";
  });

  document.getElementById("cancelpayment").addEventListener("click", () => {
    paymentModal.style.display = "none";
    document.getElementById("cartcontent").style.display = "block";
  });

  window.addEventListener("click", (event) => {
    if (event.target === paymentModal) {
      paymentModal.style.display = "none";
      document.getElementById("cartcontent").style.display = "block";
    }
  });

  updateCart();
});
