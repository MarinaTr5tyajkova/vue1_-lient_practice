let app = new Vue({
    el: '#app',
    data: {
        product: "Socks",
        brand: 'Vue Mastery',
        altText: "A pair of socks",
        selectedVariant: 0,
        details: ['80% cotton', '20% polyester', 'Gender-neutral'],
        variants: [
            {
                variantId: 2234,
                variantColor: 'green',
                variantImage: "./assets/vmSocks-green-onWhite.jpg",
                variantQuantity: 10
            },
            {
                variantId: 2235,
                variantColor: 'blue',
                variantImage: "./assets/vmSocks-blue-onWhite.jpg",
                variantQuantity: 0
            }
        ],
        cart: 0,
        onSale: true
    },
    computed: {
        title() {
            return this.brand + ' ' + this.product;
        },
        image() {
            return this.variants[this.selectedVariant].variantImage;
        },
        inStock() {
            return this.variants[this.selectedVariant].variantQuantity;
        },
        sale() {
            return this.onSale 
                ? `${this.brand} ${this.product} are on sale!` 
                : `${this.brand} ${this.product} are not on sale`;
        }
    },
    methods: {
        addToCart() {
            this.cart += 1;
        },
        updateProduct(index) {
            this.selectedVariant = index;
        }
    }
});